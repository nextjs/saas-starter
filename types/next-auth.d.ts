import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      provider?: "google" | "facebook" | "email";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    provider?: "google" | "facebook" | "email";
  }
}
