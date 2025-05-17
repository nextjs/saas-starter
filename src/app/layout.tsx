import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SWRConfig } from "swr";
import { ThemeProvider } from "../context/theme-context";
import { getTeamForUser, getUser } from "../lib/db/queries";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaaS Stack",
  description: "Build and Launch a SaaS in a Weekend",
};

export const viewport: Viewport = {
  maximumScale: 1,
};

const inter = Inter({ subsets: ["latin"], weight: ["400", "800"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className}`} suppressHydrationWarning>
      <body className="min-h-[100dvh] bg-background text-foreground">
        <SWRConfig
          value={{
            fallback: {
              "/api/user": getUser(),
              "/api/team": getTeamForUser(),
            },
          }}
        >
          <ThemeProvider>{children}</ThemeProvider>
        </SWRConfig>
      </body>
    </html>
  );
}
