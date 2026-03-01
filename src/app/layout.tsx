import type { Metadata } from "next";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://franleplant.com"),
  title: "Fran Leplant — AI Builder",
  description:
    "Building the future of software with AI. Fran Leplant is an AI builder, software engineer, mentor, and team leader specializing in agentic programming, vibe coding, and AI-native development. Expert in JavaScript, TypeScript, React, and Node.js.",
  keywords: [
    "Fran Leplant",
    "franleplant",
    "AI builder",
    "AI-native developer",
    "agentic programming",
    "vibe coding",
    "ralph wiggum loop",
    "autonomous coding",
    "AI-assisted development",
    "prompt engineering",
    "software engineer",
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "mentor",
    "team lead",
    "LLM engineering",
    "AI pair programming",
  ],
  authors: [{ name: "Fran Leplant" }],
  creator: "Fran Leplant",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://franleplant.com",
    siteName: "Fran Leplant",
    title: "Fran Leplant — AI Builder",
    description:
      "Building the future of software with AI. Agentic programming, vibe coding, and AI-native development. Engineer, mentor & team leader.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fran Leplant — AI Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fran Leplant — AI Builder",
    description:
      "Building the future of software with AI. Agentic programming, vibe coding, and AI-native development. Engineer, mentor & team leader.",
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
        <link rel="canonical" href="https://franleplant.com" />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
