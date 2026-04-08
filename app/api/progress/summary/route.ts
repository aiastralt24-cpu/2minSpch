import { NextResponse } from "next/server";

import { readGuestKeyFromCookie } from "@/lib/server/guest-key";
import { getProgressSummaryForScope } from "@/lib/server/progress";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const guestKey = searchParams.get("guestKey") ?? (await readGuestKeyFromCookie());
  const userId = searchParams.get("userId") ?? undefined;
  const summary = await getProgressSummaryForScope({ guestKey: guestKey ?? undefined, userId });

  return NextResponse.json(summary);
}
