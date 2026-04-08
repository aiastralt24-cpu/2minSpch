import { NextResponse } from "next/server";
import { z } from "zod";

import { selectTopic } from "@/lib/topics";

const bodySchema = z.object({
  mode: z.enum(["auto", "general", "opinion", "interview", "manual_framework"]),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  category: z.enum(["general_thinking", "opinion", "interview"]).optional(),
  frameworkOverride: z.enum(["CARE", "PREP", "STAR"]).optional(),
  priorTopicIds: z.array(z.string()).optional()
});

export async function POST(request: Request) {
  const payload = bodySchema.parse(await request.json());
  const topic = selectTopic(payload);

  return NextResponse.json({
    topic
  });
}
