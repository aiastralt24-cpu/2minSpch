export function TranscriptPanel({
  transcript,
  onChange
}: {
  transcript: string;
  onChange?: (value: string) => void;
}) {
  return (
    <section className="glass-panel">
      <span className="eyebrow">Transcript</span>
      {onChange ? (
        <>
          <label className="label" htmlFor="transcript">
            Speak using browser dictation or paste your transcript here
          </label>
          <textarea
            id="transcript"
            className="textarea"
            value={transcript}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Your spoken answer will appear here."
          />
        </>
      ) : (
        <p className="muted">{transcript}</p>
      )}
    </section>
  );
}
