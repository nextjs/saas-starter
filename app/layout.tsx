import "@/app/globals.css";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { getUser, getTeamForUser } from "@/lib/db/queries";
import { SWRConfig } from "swr";

export const metadata: Metadata = {
  metadataBase: new URL("https://lastlayer.ca"),
  applicationName: "Last Layer",
  title: {
    default: "Last Layer | 3D Printing & Design Services",
    template: "%s | Last Layer",
  },
  description:
    "Last Layer designs and manufactures custom 3D printed products, rapid prototypes, and tailored product solutions for brands, creators, and businesses.",
  keywords: [
    "3D printing",
    "3D printing services",
    "custom product design",
    "prototype development",
    "rapid prototyping",
    "product manufacturing",
    "design studio",
    "Last Layer",
  ],
  alternates: {
    canonical: "/",
  },
  authors: [{ name: "Last Layer" }],
  creator: "Last Layer",
  publisher: "Last Layer",
  openGraph: {
    title: "Last Layer | 3D Printing & Design Services",
    description:
      "Custom 3D printed products, rapid prototyping, and product design services built for modern brands and makers.",
    url: "https://lastlayer.ca",
    siteName: "Last Layer",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Last Layer | 3D Printing & Design Services",
    description:
      "Custom 3D printed products, rapid prototyping, and product design services built for modern brands and makers.",
  },
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
      // Optional fallback
      {
        url: "/favicon.ico",
        sizes: "any",
      },
    ],
  },
};

export const viewport: Viewport = {
  maximumScale: 1,
};

const manrope = Manrope({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <SWRConfig
          value={{
            fallback: {
              // We do NOT await here
              // Only components that read this data will suspend
              "/api/user": getUser(),
              "/api/team": getTeamForUser(),
            },
          }}
        >
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
