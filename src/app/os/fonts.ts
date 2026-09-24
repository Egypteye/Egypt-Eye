import { Inter } from "next/font/google";

// The OS uses a UI sans rather than the marketing site's Cormorant. A display
// serif is the right choice for a hero image and the wrong one for a table of
// forty trips with times, money and status in every row.
export const osFont = Inter({
  variable: "--font-os",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});
