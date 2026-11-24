const { serwist } = require("@serwist/next/config");

module.exports = serwist.withNextConfig(() => ({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  precachePrerendered: true,
  globIgnores: ["audio/**", "**/[*]*"],
  manifestTransforms: [
    async (manifestEntries) => {
      const manifest = manifestEntries.filter((entry) => {
        const url = typeof entry === "string" ? entry : entry.url;
        return (
          !url.includes("[") &&
          !url.includes("]") &&
          !url.includes("%5B") &&
          !url.includes("%5D")
        );
      });
      return { manifest, warnings: [] };
    },
  ],
}));
