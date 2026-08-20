import { ratingObject, priceObject, itineraryDayObject } from "./objects";
import { tour } from "./tour";
import { experience } from "./experience";
import { photoshoot } from "./photoshoot";
import { testimonial } from "./testimonial";
import { story } from "./story";
import { faqItem } from "./faqItem";
import { siteSettings } from "./siteSettings";
import { customizePage } from "./customizePage";

export const schemaTypes = [
  // Reusable object types first.
  ratingObject,
  priceObject,
  itineraryDayObject,
  // Document types shown in the Studio's content list.
  tour,
  experience,
  photoshoot,
  testimonial,
  story,
  faqItem,
  siteSettings,
  customizePage,
];
