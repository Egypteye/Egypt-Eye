import { ratingObject, priceObject, itineraryDayObject } from "./objects";
import { tour } from "./tour";
import { experience } from "./experience";
import { photoshoot } from "./photoshoot";
import { testimonial } from "./testimonial";
import { story } from "./story";
import { faqItem } from "./faqItem";
import { siteSettings } from "./siteSettings";
import { customizePage } from "./customizePage";
import { aboutPage } from "./aboutPage";
import { contactPage } from "./contactPage";
import { signatureExperience } from "./signatureExperience";
import { host } from "./host";

export const schemaTypes = [
  // Reusable object types first.
  ratingObject,
  priceObject,
  itineraryDayObject,
  // Document types shown in the Studio's content list.
  tour,
  experience,
  photoshoot,
  signatureExperience,
  host,
  testimonial,
  story,
  faqItem,
  siteSettings,
  customizePage,
  aboutPage,
  contactPage,
];
