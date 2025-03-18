import { NextPage } from "next";
import { ReactElement, ReactNode } from "react";

// Simplemente definimos nuestros propios tipos sin intentar extender los de Next.js
declare global {
  namespace App {
    interface PageProps {
      params?: { [key: string]: string };
      searchParams?: Record<string, string | string[] | undefined>;
    }
  }
}
