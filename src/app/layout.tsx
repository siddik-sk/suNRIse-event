import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/providers/providers";
import { Loader } from "@/components/layout/loader";
import { CustomCursor } from "@/components/layout/custom-cursor";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { FEST } from "@/lib/fest";
import { absoluteUrl } from "@/lib/utils";
import "./globals.css";

const display = localFont({
  src: "./fonts/Orbitron-Variable.ttf",
  weight: "400 900",
  variable: "--font-display",
  display: "swap",
});

const body = localFont({
  src: "./fonts/SpaceGrotesk-Variable.ttf",
  weight: "300 700",
  variable: "--font-body",
  display: "swap",
});

const mono = localFont({
  src: "./fonts/JetBrainsMono-Variable.ttf",
  weight: "100 800",
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: `${FEST.fullName} — ${FEST.tagline} | ${FEST.college}`,
    template: `%s · ${FEST.fullName}`,
  },
  description: FEST.description,
  applicationName: FEST.fullName,
  keywords: [
    "suNRIseevent",
    "college fest",
    "NRI Vijayawada",
    "tech fest",
    "hackathon",
    "cultural fest",
    "student fest 2027",
    "Vijayawada events",
  ],
  authors: [{ name: FEST.college }],
  creator: "suNRIseevent Tech Team",
  publisher: FEST.college,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: absoluteUrl("/"),
    siteName: FEST.fullName,
    title: `${FEST.fullName} — ${FEST.tagline}`,
    description: FEST.description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${FEST.fullName} — ${FEST.tagline}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${FEST.fullName} — ${FEST.tagline}`,
    description: FEST.description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  category: "education",
};

export const viewport: Viewport = {
  themeColor: "#05010d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="grain min-h-screen">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Providers>
          <Loader />
          <CustomCursor />
          <ScrollProgress />
          {children}
        </Providers>
      </body>
    </html>
  );
}
