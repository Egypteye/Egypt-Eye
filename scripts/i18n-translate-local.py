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

# Same "never translate" list as the Gemini pipeline's GLOSSARY, protected
# by placeholder substitution since a raw NMT model has no way to take an
# instruction — it will happily mangle "Flying Dress" into nonsense
# otherwise. {word} interpolation tokens get the same treatment.
PROTECT_TERMS = sorted(
    [
        "Egypt Eye Travel & Tours",
        "Egypt Eye",
        "Flying Dress",
        "My Journey",
        "Pharaoh's Challenge",
        "Signature Experience",
        "Nine Pyramids View",
    ],
    key=len,
    reverse=True,
)
PLACEHOLDER_RE = re.compile(r"\{[a-zA-Z_]+\}")


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}


def write_json(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(dict(sorted(data.items())), ensure_ascii=False) + "\n", encoding="utf-8")


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


def restore(text: str, mapping: dict) -> str:
    for token, original in mapping.items():
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
