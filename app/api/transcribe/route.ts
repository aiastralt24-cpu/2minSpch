import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: "Audio transcription needs OPENAI_API_KEY. You can still type your answer below." },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const audio = formData.get("audio");

  if (!(audio instanceof File)) {
    return NextResponse.json({ message: "No audio file was received." }, { status: 400 });
  }

  const client = new OpenAI({ apiKey });
  const transcription = await client.audio.transcriptions.create({
    file: audio,
    model: process.env.OPENAI_TRANSCRIPTION_MODEL ?? "whisper-1"
  });

  return NextResponse.json({
    transcript: transcription.text,
    audio: {
      name: audio.name,
      type: audio.type,
      size: audio.size
    }
  });
}
