import type { Metadata } from "next";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import { brand } from "@/data/brand";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const title = `${brand.name} — AI Builder`;
const description = `${brand.tagline}. ${brand.name} (${brand.handle}) is an AI builder, software engineer, mentor, and team leader specializing in agentic programming, vibe coding, and AI-native development. Expert in JavaScript, TypeScript, React, and Node.js.`;
const shortDescription = `${brand.tagline}. Agentic programming, vibe coding, and AI-native development. ${brand.subtitle}`;

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title,
  description,
  keywords: [...brand.keywords],
  authors: [{ name: brand.name }],
  creator: brand.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: brand.url,
    siteName: brand.name,
    title,
    description: shortDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: shortDescription,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="canonical" href={brand.url} />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
