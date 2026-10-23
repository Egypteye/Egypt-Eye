/**
 * The FAQ accordion.
 *
 * Native <details>/<summary>. No state, no client component, no JavaScript.
 *
 * That is not minimalism for its own sake: <details> is keyboard-operable,
 * announced correctly by screen readers, searchable by the browser's own
 * find-in-page (Chrome and Safari expand a closed <details> to reveal a
 * match), and it works before hydration — so the answers are readable on a
 * slow phone the instant the HTML arrives. A hand-rolled accordion has to
 * re-earn every one of those and usually gets one of them wrong.
 *
 * The open/closed affordance is a +/– glyph rather than a rotating chevron,
 * so the state does not depend on perceiving a rotation.
 */
export function FaqList({
  faqs,
  headingLevel = 3,
}: {
  faqs: { question: string; answer: string }[];
  /** Keeps the page's heading outline correct wherever this is dropped in. */
  headingLevel?: 2 | 3 | 4;
}) {
  if (faqs.length === 0) return null;
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";

  return (
    <div className="fd-faq">
      {faqs.map((faq) => (
        <details key={faq.question} name="fd-faq">
          <summary>
            {/* The heading is inside the summary so the question is both the
                control and a landmark in the heading outline. */}
            <Heading
              style={{
                font: "inherit",
                margin: 0,
                fontWeight: 400,
              }}
            >
              {faq.question}
            </Heading>
          </summary>
          <div className="fd-faq-answer">
            <p>{faq.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
