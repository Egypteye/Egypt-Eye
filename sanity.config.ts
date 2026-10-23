"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

/**
 * THE SINGLETONS.
 *
 * Each of these is ONE document that the site reads by a fixed id. The desk
 * pins them so you open the one that exists rather than a list you could add
 * to — but pinning is only navigation. Until now nothing stopped someone
 * creating a second "Site Settings" from the global + menu, or deleting the
 * only one.
 *
 * Neither failure is loud. A duplicate is simply never read, so an editor can
 * spend an afternoon filling in a document that has no effect on the website
 * and no error anywhere says so. A deletion takes the page's entire copy back
 * to whatever the content file says, silently, at the next revalidation.
 *
 * So these types lose Delete and Duplicate, and are removed from the global
 * create menu. Everything else in the Studio keeps both.
 */
const SINGLETONS = new Set([
  "siteSettings",
  "homepage",
  "listingPages",
  "customizePage",
  "aboutPage",
  "contactPage",
  "takeEgyptHomePage",
  "flyingDressSettings",
]);

export default defineConfig({
  name: "egypt-eye",
  title: "Egypt Eye Travel and Tours",
  basePath: "/studio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  document: {
    actions: (prev, { schemaType }) =>
      SINGLETONS.has(schemaType)
        ? prev.filter((action) => !["delete", "duplicate"].includes(String(action.action)))
        : prev,
    newDocumentOptions: (prev) =>
      prev.filter((item) => !SINGLETONS.has(item.templateId)),
  },
  plugins: [
    structureTool({ structure }),
    // "Vision" lets you run raw test queries inside the Studio — handy for
    // debugging, safe to leave in.
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
