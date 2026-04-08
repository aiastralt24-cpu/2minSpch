export function clampScore(score: number): number {
  return Math.max(1, Math.min(10, Math.round(score)));
}

export function average(numbers: number[]): number {
  if (numbers.length === 0) {
    return 0;
  }

  return Math.round((numbers.reduce((sum, value) => sum + value, 0) / numbers.length) * 10) / 10;
}

export function sentenceCount(text: string): number {
  return text
    .split(/[.!?]/)
    .map((sentence) => sentence.trim())
    .filter(Boolean).length;
}

export function containsAny(text: string, patterns: string[]): boolean {
  const lower = text.toLowerCase();
  return patterns.some((pattern) => lower.includes(pattern));
}

export function excerpt(text: string): string {
  if (text.length <= 140) {
    return text;
  }

  return `${text.slice(0, 137)}...`;
}
