import withSerwistInit from "@serwist/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["xlsx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.bunnycdn.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // Le service worker n'est genere/actif qu'en production (build Vercel).
  // En dev, on reste sur Turbopack (par defaut) sans PWA - comportement inchange.
  disable: process.env.NODE_ENV !== "production",
});

export default withSerwist(nextConfig);
