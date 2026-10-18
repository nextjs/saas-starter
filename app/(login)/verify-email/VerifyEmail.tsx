"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function VerifyEmail({ token }: { token: string }) {
  const [status, setStatus] = useState<"idle" | "verifying" | "verified" | "error">("idle");
  const [message, setMessage] = useState("");

  async function verify() {
    setStatus("verifying");
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const body = (await response.json()) as { error?: string; verified?: boolean };
      if (!response.ok || !body.verified) {
        throw new Error(body.error ?? "Unable to verify this email address.");
      }
      setStatus("verified");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Unable to verify this email address.",
      );
    }
  }

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Verify your email address</h1>
      {status === "verified" ? (
        <>
          <p>Your email is verified. You can now sign in.</p>
          <Button asChild>
            <Link href="/sign-in?verified=1">Continue to sign in</Link>
          </Button>
        </>
      ) : (
        <>
          <p>Confirm your email address to finish creating your account.</p>
          {status === "error" && (
            <p className="text-sm text-destructive" role="alert">{message}</p>
          )}
          {token ? (
            <Button onClick={() => void verify()} disabled={status === "verifying"}>
              {status === "verifying" ? "Verifying…" : "Verify email"}
            </Button>
          ) : (
            <p className="text-sm text-destructive" role="alert">
              This verification link is missing its token. Request a new signup link.
            </p>
          )}
        </>
      )}
    </main>
  );
}
