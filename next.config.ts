import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: produces plain HTML/CSS/JS in out/, deployable to any
  // shared host (e.g. Hostinger) with no Node.js server required. Remove
  // this block if the site ever moves to a Node-capable host and needs
  // server features (API routes, image optimization, etc).
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
