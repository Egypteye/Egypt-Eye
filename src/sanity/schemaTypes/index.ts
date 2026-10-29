import {
  ratingObject,
  priceObject,
  itineraryDayObject,
  physicalLevelObject,
  bookingExtraObject, outfitObject,
} from "./objects";
import { tour } from "./tour";
import { experience } from "./experience";
import { photoshoot } from "./photoshoot";
import { destinationHub } from "./destinationHub";
import { testimonial } from "./testimonial";
import { story } from "./story";
import { faqItem } from "./faqItem";
import { siteSettings } from "./siteSettings";
import { homepage } from "./homepage";
import { listingPages } from "./listingPages";
import { customizePage } from "./customizePage";
import { aboutPage } from "./aboutPage";
import { contactPage } from "./contactPage";
import { signatureExperience } from "./signatureExperience";
import { host } from "./host";
import { author } from "./author";
import { event } from "./event";
import {
  flyingDressFrameObject,
  flyingDressGallery,
} from "./flyingDressGallery";
import {
  fdFaqObject,
  fdInclusionObject,
  fdSocialObject,
  flyingDressSettings,
} from "./flyingDressSettings";
import {
  flyingDressAddOn,
  flyingDressPackage,
  flyingDressRental,
} from "./flyingDressCommerce";
import { flyingDressOutfit } from "./flyingDressWardrobe";
import { flyingDressRateCard } from "./flyingDressRates";
import {
  takeEgyptHomePage,
  treasureCategory,
  treasureOption,
  treasureProduct,
  treasureSpec,
  treasureStep,
  treasureVariant,
} from "./treasure";

export const schemaTypes = [
  // Reusable object types first.
  ratingObject,
  priceObject,
  itineraryDayObject,
  physicalLevelObject,
  bookingExtraObject, outfitObject,
  treasureSpec,
  treasureVariant,
  treasureOption,
  treasureStep,
  flyingDressFrameObject,
  fdFaqObject,
  fdInclusionObject,
  fdSocialObject,
  // Document types shown in the Studio's content list.
  tour,
  experience,
  photoshoot,
  destinationHub,
  signatureExperience,
  host,
  testimonial,
  story,
  author,
  event,
  treasureCategory,
  treasureProduct,
  flyingDressGallery,
  // Flying Dresses Egypt. Until these existed the brand had one schema
  // and zero documents of it, so every price, photograph and sentence on
  // that site needed a developer and a deploy.
  flyingDressSettings,
  flyingDressRateCard,
  flyingDressPackage,
  flyingDressAddOn,
  flyingDressRental,
  flyingDressOutfit,
  takeEgyptHomePage,
  faqItem,
  siteSettings,
  homepage,
  listingPages,
  customizePage,
  aboutPage,
  contactPage,
];
