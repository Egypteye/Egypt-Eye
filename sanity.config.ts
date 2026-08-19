"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

export default defineConfig({
  name: "egypt-eye",
  title: "Egypt Eye Travel and Tours",
  basePath: "/studio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({ structure }),
    // "Vision" lets you run raw test queries inside the Studio — handy for
    // debugging, safe to leave in.
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
