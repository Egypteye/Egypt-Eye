import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Published content only, cached at the CDN edge — fast reads for the
  // public site. Freshness is controlled per-query via Next.js `revalidate`.
  useCdn: true,
});
