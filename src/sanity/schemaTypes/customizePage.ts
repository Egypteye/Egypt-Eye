import { defineField, defineType } from "sanity";
import { imageCreditField, imageTones } from "./objects";

const FIELD_TYPES = [
  { title: "Short text", value: "text" },
  { title: "Email", value: "email" },
  { title: "Phone", value: "tel" },
  { title: "Number", value: "number" },
  { title: "Long text (textarea)", value: "textarea" },
  { title: "Dropdown (custom choices)", value: "select" },
  { title: "Multiple-choice chips (custom choices)", value: "chips" },
  { title: "City chips (auto-filled from your Destinations list)", value: "chips-destinations" },
  { title: "Activity chips (auto-filled from your Interests list)", value: "chips-interests" },
];

// Singleton document — powers the entire /customize page: hero copy and
// banner photo, the "How it works" steps, and the enquiry form itself. The
// form is fully rebuildable here: add, remove, reorder sections and
// questions without touching code. Submissions are emailed automatically
// (see src/app/api/customize-request/route.ts) using each question's Field
// Key as its label in that email.
export const customizePage = defineType({
  name: "customizePage",
  title: "Customize Page",
  type: "document",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow text", type: "string" }),
    defineField({ name: "headline", title: "Headline", type: "string" }),
    defineField({ name: "subtext", title: "Subtext", type: "text" }),
    defineField({
      name: "bannerImage",
      title: "Banner photo",
      type: "object",
      fields: [
        defineField({ name: "image", title: "Photo", type: "image", options: { hotspot: true }, fields: [imageCreditField()] }),
        defineField({
          name: "tone",
          title: "Placeholder color (used until a photo is uploaded)",
          type: "string",
          options: { list: imageTones },
          initialValue: "nile",
        }),
      ],
    }),
    defineField({
      name: "steps",
      title: '"How it works" steps',
      type: "array",
      of: [
        {
          type: "object",
          name: "step",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "body", title: "Description", type: "text" }),
          ],
          preview: { select: { title: "title" } },
        },
      ],
    }),
    defineField({ name: "formIntroEyebrow", title: "Form section eyebrow", type: "string" }),
    defineField({ name: "formIntroTitle", title: "Form section title", type: "string" }),
    defineField({ name: "formIntroDescription", title: "Form section description", type: "text" }),
    defineField({
      name: "formSections",
      title: "Form sections & questions",
      description:
        "Build the Customize Your Tour form here. Each question needs a unique Field Key (no spaces, e.g. fullName) — that's what labels it in the email you receive when someone submits.",
      type: "array",
      of: [
        {
          type: "object",
          name: "formSection",
          fields: [
            defineField({ name: "title", title: "Section title", type: "string" }),
            defineField({
              name: "fields",
              title: "Questions",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "formField",
                  fields: [
                    defineField({
                      name: "label",
                      title: "Question label",
                      type: "string",
                      validation: (r) => r.required(),
                    }),
                    defineField({
                      name: "fieldKey",
                      title: "Field key (unique, no spaces — e.g. fullName)",
                      type: "string",
                      validation: (r) =>
                        r
                          .required()
                          .regex(/^[a-zA-Z0-9_-]+$/, { name: "no spaces or symbols" }),
                    }),
                    defineField({
                      name: "fieldType",
                      title: "Question type",
                      type: "string",
                      options: { list: FIELD_TYPES },
                      initialValue: "text",
                    }),
                    defineField({ name: "required", title: "Required", type: "boolean", initialValue: false }),
                    defineField({ name: "placeholder", title: "Placeholder text", type: "string" }),
                    defineField({
                      name: "options",
                      title: "Choices (Dropdown / Multiple-choice chips only)",
                      type: "array",
                      of: [{ type: "string" }],
                    }),
                    defineField({
                      name: "width",
                      title: "Width",
                      type: "string",
                      options: {
                        list: [
                          { title: "Half", value: "half" },
                          { title: "Full", value: "full" },
                        ],
                      },
                      initialValue: "half",
                    }),
                  ],
                  preview: { select: { title: "label", subtitle: "fieldType" } },
                },
              ],
            }),
          ],
          preview: { select: { title: "title" } },
        },
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Customize Page" }),
  },
});
