import {
  getFlyingDressAddOns,
  getFlyingDressOutfits,
  getFlyingDressPackages,
  getFlyingDressRentals,
  getFlyingDressSettings,
} from "@/sanity/fetchers";
import {
  mergeAddOns,
  mergePackages,
  mergeRentals,
  mergeSettings,
  mergeWardrobe,
  type FdSettings,
  type FdWardrobe,
} from "./contentMerge";
import type { AddOn, FlyingDressPackage, RentalService } from "@/content/flyingDresses";

/**
 * THE FETCH HALF.
 *
 * Every page on this brand reads its content through here. The rules that
 * decide what wins — Studio over content file, a cleared list staying cleared,
 * a price of 0 being a price — are NOT here: they are in contentMerge.ts,
 * which imports nothing from the Sanity client so the check scripts can reach
 * them. This module is only "ask Sanity, hand the answer to the rules".
 *
 * That split is CLAUDE.md §6, and it is the difference between merge rules
 * that are tested and merge rules that are hoped for.
 *
 * Next dedupes identical fetches within a render pass, so a page awaiting
 * four of these costs four requests, not four per component.
 */

export async function fdSettings(): Promise<FdSettings> {
  return mergeSettings(await getFlyingDressSettings());
}

export async function fdPackages(): Promise<FlyingDressPackage[]> {
  return mergePackages(await getFlyingDressPackages());
}

export async function fdPackageBySlug(slug: string): Promise<FlyingDressPackage | undefined> {
  return (await fdPackages()).find((p) => p.slug === slug);
}

export async function fdAddOns(): Promise<AddOn[]> {
  return mergeAddOns(await getFlyingDressAddOns());
}

export async function fdRentals(): Promise<RentalService[]> {
  return mergeRentals(await getFlyingDressRentals());
}

export async function fdRentalBySlug(slug: string): Promise<RentalService | undefined> {
  return (await fdRentals()).find((s) => s.slug === slug);
}

export async function fdWardrobe(): Promise<FdWardrobe> {
  return mergeWardrobe(await getFlyingDressOutfits());
}

export type { FdSettings, FdWardrobe };
export type { AddOn, FlyingDressPackage, RentalService };
