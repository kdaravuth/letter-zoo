import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "សួនគណិត — Soun Kanit",
    short_name: "សួនគណិត",
    description:
      "កម្មវិធីរៀនគណិតវិទ្យាដោយរូបភាពអន្តរកម្មជាភាសាខ្មែរសម្រាប់កុមារអាយុ ៦ ដល់ ១២ ឆ្នាំ",
    start_url: "/learn",
    display: "standalone",
    background_color: "#fcfaf5",
    theme_color: "#fcfaf5",
    lang: "km",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
