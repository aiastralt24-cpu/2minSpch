import { NextResponse } from "next/server";
import { z } from "zod";

import { evaluateTranscript } from "@/lib/evaluation";

const bodySchema = z.object({
  guestKey: z.string().optional(),
  topicId: z.string(),
  topicTitle: z.string().optional(),
  framework: z.enum(["CARE", "PREP", "STAR"]),
  transcript: z.string().min(10)
});

export async function POST(request: Request) {
  const payload = bodySchema.parse(await request.json());
  const result = await evaluateTranscript(payload.transcript, payload.framework, payload.topicTitle);

  return NextResponse.json({ result });
}
