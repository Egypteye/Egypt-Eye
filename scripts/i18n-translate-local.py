#!/usr/bin/env python3
"""
Fills missing translations using a fully offline Argos Translate model
(no API, no network, no cost) instead of the Gemini-based pipeline in
i18n-translate.mts.

Run: python3 scripts/i18n-translate-local.py [locale]
     (omit locale to run all five: ar fr es it ru)

Requires the five en->{ar,fr,es,it,ru} .argosmodel packages to already be
installed (argostranslate.package.install_from_path), and
ARGOS_CHUNK_TYPE=MINISBD so sentence-boundary detection uses the bundled
ONNX models instead of Stanza's huggingface.co-hosted ones.

Incremental and resumable, mirroring i18n-translate.mts: reads the
manifest, translates only what a locale is missing, and writes after
every batch so an interrupted run loses nothing.
"""
import json
import os
import re
import sys
import time
from pathlib import Path

os.environ.setdefault("ARGOS_CHUNK_TYPE", "MINISBD")
import argostranslate.translate as translate  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
LOCALES = ["ar", "fr", "es", "it", "ru"]
WRITE_EVERY = 25

CORPORA = [
    {
        "name": "catalogue",
        "manifest": ROOT / "src/i18n/generated/manifest.json",
        "out": lambda locale: ROOT / f"src/i18n/generated/{locale}.json",
    },
    {
        "name": "interface",
        "manifest": ROOT / "src/i18n/generated/ui-manifest.json",
        "out": lambda locale: ROOT / f"src/i18n/generated/ui/{locale}.json",
    },
]

# Names that must not be translated, protected by sentinel substitution since
# a raw NMT model has no way to take an instruction — it will happily mangle
# "Flying Dress" into nonsense otherwise. {word} interpolation tokens get the
# same treatment.
#
# Read out of src/i18n/protectedTerms.ts rather than repeated here. The two
# lists drifting apart is not a theoretical risk: this script and the Gemini
# one each had their own copy, the TypeScript check script would have had a
# third, and a name added to one of them protects nothing in the others.
PROTECTED_TERMS_SOURCE = ROOT / "src/i18n/protectedTerms.ts"


def load_protected_terms() -> list[str]:
    """Every term from BRAND_TERMS and GLOSSARY_PREFERENCE_TERMS, longest first.

    Longest first matters: protecting "Egypt Eye" before "Egypt Eye Travel"
    would leave a half-substituted string behind.
    """
    source = PROTECTED_TERMS_SOURCE.read_text(encoding="utf-8")
    terms: list[str] = []
    for const in ("BRAND_TERMS", "GLOSSARY_PREFERENCE_TERMS"):
        match = re.search(rf"export const {const} = \[(.*?)\] as const;", source, re.S)
        if not match:
            raise SystemExit(
                f"{PROTECTED_TERMS_SOURCE}: could not find {const}. The protected-term list is the "
                "only thing standing between the offline model and a mistranslated brand name, so "
                "this refuses to run rather than translate without it."
            )
        # json.loads, not `unicode_escape`: the latter round-trips through
        # latin-1 and turns the real "’" in "Pharaoh’s Challenge" into
        # mojibake, so the term would never match the English text and would
        # silently stop being protected. JSON string syntax covers both forms
        # the TypeScript file may hold — a literal character or a \uXXXX
        # escape — and is exact for either.
        terms += [
            json.loads(f'"{item}"') for item in re.findall(r'"((?:[^"\\]|\\.)*)"', match.group(1))
        ]
    if not terms:
        raise SystemExit(f"{PROTECTED_TERMS_SOURCE}: the protected-term lists are empty.")
    return sorted(set(terms), key=len, reverse=True)


PROTECT_TERMS = load_protected_terms()
PLACEHOLDER_RE = re.compile(r"\{[a-zA-Z_]+\}")


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}


def write_json(path: Path, data: dict) -> None:
    # Byte-identical to what i18n-translate.mts writes — same key order, same
    # separators, no escaping of non-ASCII. The two pipelines write the same
    # ten files, and with different separators every run reformatted whatever
    # the other had written, so `git diff` showed a changed dictionary whether
    # or not a single translation had moved.
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(dict(sorted(data.items())), ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )


def protect(text: str) -> tuple[str, dict]:
    mapping: dict[str, str] = {}
    counter = 0
    for term in PROTECT_TERMS:
        if term in text:
            token = f"Zqxvw{counter}"
            text = text.replace(term, token)
            mapping[token] = term
            counter += 1
    for match in PLACEHOLDER_RE.findall(text):
        token = f"Zqxvw{counter}"
        text = text.replace(match, token, 1)
        mapping[token] = match
        counter += 1
    return text, mapping


def unrestored(text: str, mapping: dict) -> list[str]:
    """The sentinels the model did not hand back, which is the whole problem.

    The model does not leave "Zqxvw0" alone. The Arabic one TRANSLITERATES it
    — "Zqxvw0" came back as "زكسوف" — and the Italian one, handed a string
    that was nothing but a sentinel, answered "Traduzione:". `restore()` then
    searched for an ASCII token that was no longer in the text, found nothing,
    changed nothing, and returned a sentence with gibberish where the brand
    name belonged. It reported success, and so "Egypt Eye" read as "زكسوف" on
    every Arabic page and "Traduzione:" on every Italian page, in the navbar,
    for months.

    There is no sentinel an NMT model is guaranteed to pass through, so the
    only reliable mechanism is to check and throw the result away — which is
    the rule src/i18n/fingerprint.ts already states: a wrong translation is
    worse than an untranslated one. A rejected string stays missing from the
    dictionary, so the next run simply tries it again.
    """
    return [token for token in mapping if token.lower() not in text.lower()]


def restore(text: str, mapping: dict) -> str:
    # Longest token first. "Zqxvw1" is a prefix of "Zqxvw10", and dicts keep
    # insertion order, so restoring in insertion order would rewrite
    # "Zqxvw10" as "<term 1>0" and leave a stray digit in the sentence. No
    # string in the corpus carries eleven protected tokens today, so this is
    # unreachable rather than broken — but it is one line, and the corpus is
    # the thing that grows.
    for token in sorted(mapping, key=len, reverse=True):
        original = mapping[token]
        text = re.sub(re.escape(token), lambda _m: original, text, flags=re.IGNORECASE)
    return text


def translate_one(text: str, locale: str) -> tuple[bool, str]:
    if not text.strip():
        return False, text
    protected, mapping = protect(text)
    try:
        out = translate.translate(protected, "en", locale)
    except Exception as exc:  # noqa: BLE001
        print(f"    error translating ({exc}) — left in English", file=sys.stderr)
        return False, text

    missing_sentinel = unrestored(out, mapping)
    if missing_sentinel:
        lost = ", ".join(sorted(mapping[t] for t in missing_sentinel))
        print(
            f"    dropped ({lost} did not survive translation) — left in English: {text[:70]!r}",
            file=sys.stderr,
        )
        return False, text

    return True, restore(out, mapping)


def main() -> None:
    targets = [sys.argv[1]] if len(sys.argv) > 1 else LOCALES

    for corpus in CORPORA:
        manifest = read_json(corpus["manifest"])
        if not manifest:
            print(f"{corpus['manifest']} is empty — run npm run i18n:extract first. Skipping.")
            continue

        for locale in targets:
            out_path = corpus["out"](locale)
            existing = read_json(out_path)
            missing_keys = [k for k in manifest if not existing.get(k)]

            print(f"\n{locale} / {corpus['name']}: {len(existing)}/{len(manifest)} done, {len(missing_keys)} missing")
            if not missing_keys:
                continue

            start = time.time()
            for i, key in enumerate(missing_keys):
                ok, translated = translate_one(manifest[key], locale)
                if ok:
                    existing[key] = translated

                done = i + 1
                if done % WRITE_EVERY == 0 or done == len(missing_keys):
                    write_json(out_path, existing)
                    elapsed = time.time() - start
                    rate = done / elapsed if elapsed > 0 else 0
                    eta = (len(missing_keys) - done) / rate if rate > 0 else 0
                    pct = round(done / len(missing_keys) * 100)
                    print(f"  {done}/{len(missing_keys)} ({pct}%) — eta {eta / 60:.1f}min", end="\r")

            print()
            have = len(read_json(out_path))
            print(f"  -> {out_path}: {have}/{len(manifest)} ({round(have / len(manifest) * 100)}%)")


if __name__ == "__main__":
    main()
