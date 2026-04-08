import { NextResponse } from "next/server";
import { z } from "zod";

import { createOtp } from "@/lib/server/auth-otp-store";

const bodySchema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  const payload = bodySchema.parse(await request.json());
  const result = createOtp(payload.email);

  if (!result.ok) {
    return NextResponse.json(result, { status: 429 });
  }

  return NextResponse.json({
    ok: true,
    delivery: "preview",
    message: "Verification code created.",
    previewCode: result.code,
    expiresInSeconds: result.expiresInSeconds,
    retryAfterSeconds: result.retryAfterSeconds
  });
}
