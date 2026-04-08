import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyOtp } from "@/lib/server/auth-otp-store";

const bodySchema = z.object({
  email: z.string().email(),
  code: z.string().min(4)
});

export async function POST(request: Request) {
  const payload = bodySchema.parse(await request.json());
  const result = verifyOtp(payload.email, payload.code);

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
