import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Kantumruy_Pro, Noto_Sans_Khmer } from "next/font/google";
import { LearnerProvider } from "@/components/providers/LearnerProvider";
import { AppNavigation } from "@/components/ui/AppNavigation";
import "./globals.css";

const kantumruyPro = Kantumruy_Pro({
  subsets: ["khmer", "latin"],
  display: "swap",
  variable: "--font-kantumruy-pro",
});

const notoSansKhmer = Noto_Sans_Khmer({
  subsets: ["khmer", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-sans-khmer",
});

export const metadata: Metadata = {
  title: "សួនគណិត — Soun Kanit",
  description:
    "កម្មវិធីរៀនគណិតវិទ្យាដោយរូបភាពអន្តរកម្មជាភាសាខ្មែរសម្រាប់កុមារអាយុ ៦ ដល់ ១២ ឆ្នាំ",
  applicationName: "សួនគណិត",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "សួនគណិត",
  },
};

export const viewport: Viewport = {
  themeColor: "#fcfaf5",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="km"
      className={`${kantumruyPro.variable} ${notoSansKhmer.variable} h-full`}
    >
      <body className="min-h-full bg-canvas text-ink antialiased flex flex-col">
        <LearnerProvider>
          {children}
          <Suspense fallback={null}>
            <AppNavigation />
          </Suspense>
        </LearnerProvider>
      </body>
    </html>
  );
}
