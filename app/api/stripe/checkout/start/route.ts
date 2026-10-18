import { NextRequest, NextResponse } from "next/server";
import { getUser, getTeamForUser } from "@/lib/db/queries";
import { createCheckoutSession } from "@/lib/payments/stripe";

export async function GET(request: NextRequest) {
  const priceId = request.nextUrl.searchParams.get("priceId");
  if (!priceId) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  const user = await getUser();
  if (!user) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set(
      "redirect",
      "checkout",
    );
    signInUrl.searchParams.set("priceId", priceId);
    return NextResponse.redirect(signInUrl);
  }

  await createCheckoutSession({
    team: await getTeamForUser(),
    priceId,
  });
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
