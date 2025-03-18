import { NextPage } from "next";
import { ReactElement, ReactNode } from "react";

declare module "next" {
  export interface PageProps {
    params?: { [key: string]: string };
    searchParams?: Record<string, string | string[] | undefined>;
  }
}
