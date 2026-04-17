"use client";

import { useEffect, useRef, useState } from "react";

export function RecordingPanel({
  transcript,
  setTranscript
}: {
  transcript: string;
  setTranscript: (value: string) => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [message, setMessage] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const interval = window.setInterval(() => {
      setSecondsElapsed((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function transcribeAudio(blob: Blob) {
    setIsTranscribing(true);
    setMessage("Transcribing your answer...");

    try {
      const formData = new FormData();
      formData.append("audio", blob, `practice-answer-${Date.now()}.webm`);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData
      });

      const data = (await response.json()) as { transcript?: string; message?: string };
      if (!response.ok || !data.transcript) {
        throw new Error(data.message ?? "We could not transcribe that recording.");
      }

      setTranscript(data.transcript.trim());
      setMessage("Transcript ready. Review it below before scoring.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Transcription failed. Type your answer below instead.");
    } finally {
      setIsTranscribing(false);
    }
  }

  async function startRecording() {
    setMessage("");
    setSecondsElapsed(0);

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMessage("Recording is not available in this browser. Type your answer below instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (blob.size > 0) {
          void transcribeAudio(blob);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setMessage("Microphone access was blocked. Allow the microphone or type your answer below.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
  }

  function handlePrimaryAction() {
    if (isRecording) {
      stopRecording();
      return;
    }

    void startRecording();
  }

  return (
    <section className="glass-panel recording-card">
      <span className="eyebrow">Say your answer</span>
      <div className="score-footer">
        <strong>{isRecording ? "Recording..." : isTranscribing ? "Working on transcript..." : "Ready when you are"}</strong>
        <span className="pill">{secondsElapsed}s</span>
      </div>
      <p className="muted">
        Record your answer, then review the transcript before scoring. If recording fails, type your answer below.
      </p>
      <div className="recording-actions">
        <button
          className={`button ${isRecording ? "button-secondary" : "button-primary"}`}
          disabled={isTranscribing}
          onClick={handlePrimaryAction}
        >
          {isRecording ? "Stop and transcribe" : isTranscribing ? "Transcribing..." : "Start recording"}
        </button>
        {transcript ? <span className="pill">Transcript ready</span> : null}
      </div>
      {message ? <p className="recording-message">{message}</p> : null}
    </section>
  );
}
