import type { NextConfig } from "next";

const extraDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const private172Origins = Array.from(
  { length: 16 },
  (_, idx) => `172.${16 + idx}.*.*`
);

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "*.local",
    "192.168.*.*",
    "10.*.*.*",
    ...private172Origins,
    "**.ngrok-free.app",
    "**.ngrok-free.dev",
    "**.ngrok.app",
    "**.ngrok.io",
    ...extraDevOrigins,
  ],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
