// Its own module, with no imports at all, for two reasons: it is pure
// string work with nothing to do with the rest of seo.ts, and seo.ts
// transitively reaches @/sanity/env, which throws without the Sanity
// environment variables set. That put this function out of reach of
// scripts/check-security.mts — and an escaping function nothing can test
// is an escaping function nobody should trust.

// Serialises a JSON-LD object for embedding in a <script> tag. Every
// structured-data block on this site goes through here.
//
// WHY THIS EXISTS
//
// All 33 of them were written as:
//
//     <script type="application/ld+json"
//             dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
//
// JSON.stringify escapes what JSON needs escaped. It does not escape what
// HTML needs escaped, because it does not know it is about to be written
// inside a <script> element — and in there the browser's HTML parser is
// still scanning for the string "</script" to end the block. So a tour
// title, FAQ answer or story excerpt containing
//
//     </script><script>…</script>
//
// closes the JSON-LD early and runs. The text does not have to arrive in a
// URL: it arrives from a Sanity field, which makes the injection stored,
// served from this origin to every visitor of that page, and immune to a
// cache purge because it is the content.
//
// WHAT IT ESCAPES, AND WHY EACH ONE
//
//   < and >      ends the "</script" problem without reasoning about
//                casing, whitespace or partial matches, and takes "<!--"
//                (also significant in the HTML spec's script-data states)
//                with it.
//   &            stops an HTML entity in the source text decoding into one
//                of the above before the script is parsed.
//   U+2028/2029  LINE SEPARATOR and PARAGRAPH SEPARATOR are valid inside a
//                JSON string but are line terminators in JavaScript. This
//                one is not a security fix: it stops a page silently
//                losing its structured data. (Both are matched here as
//                real characters rather than as escape sequences, because
//                an escape sequence in this file is exactly the thing that
//                can get decoded back into the character it stands for.)
//
// Each replacement emits a \uXXXX escape inside a JSON string, so the value a
// parser reads back is byte-for-byte what went in: Google sees the same
// title the visitor does. Nothing is removed or rewritten — this is
// encoding for the context, not sanitising the content.
export function jsonLdScript(schema: unknown): string {
  return JSON.stringify(schema)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replaceAll(" ", "\\u2028")
    .replaceAll(" ", "\\u2029");
}
