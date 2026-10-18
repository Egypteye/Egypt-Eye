import Link from "next/link";
import {
  type ExperienceCategory,
  experiencesInCategory,
} from "@/content/flyingDressExperiences";
import { fdPath } from "../_lib/seo";

/**
 * The card grid for a section of the catalogue.
 *
 * ONE CARD PER CATEGORY, not one per experience. Each category currently holds
 * a single experience, so a card per experience plus a category page per
 * category would be two pages saying the same thing in different words, which
 * is how a small site ends up competing with itself in search. The category
 * page IS the experience page until a category genuinely has more than one.
 */
export function ExperienceHub({
  categories,
  section,
}: {
  categories: ExperienceCategory[];
  section: "celebrations" | "creative";
}) {
  return (
    <div className="fd-card-grid fd-reveal-group">
      {categories.map((category) => {
        const count = experiencesInCategory(category.id).length;
        return (
          <Link
            key={category.id}
            className="fd-tile fd-experience-card"
            href={fdPath(`/${section}/${category.slug}`)}
          >
            <span className="fd-tile-body">
              <span className="fd-tile-title fd-display">{category.title}</span>
              <span className="fd-tile-meta">{category.intro}</span>
              <span className="fd-arrow-link" aria-hidden="true">
                {count === 1 ? "See the experience" : `See ${count} experiences`}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
