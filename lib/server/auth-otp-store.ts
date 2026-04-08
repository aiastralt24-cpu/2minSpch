type PendingOtp = {
  code: string;
  expiresAt: number;
  resendAvailableAt: number;
};

const pendingOtps = new Map<string, PendingOtp>();
const OTP_TTL_MS = 1000 * 60 * 10;
const OTP_RESEND_COOLDOWN_MS = 1000 * 45;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function createOtp(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const existing = pendingOtps.get(normalizedEmail);
  const now = Date.now();

  if (existing && existing.resendAvailableAt > now) {
    return {
      ok: false as const,
      message: "A code was already sent recently. Please wait before requesting another one.",
      retryAfterSeconds: Math.ceil((existing.resendAvailableAt - now) / 1000)
    };
  }

  const code = `${Math.floor(100000 + Math.random() * 900000)}`;
  pendingOtps.set(normalizedEmail, {
    code,
    expiresAt: now + OTP_TTL_MS,
    resendAvailableAt: now + OTP_RESEND_COOLDOWN_MS
  });

  return {
    ok: true as const,
    code,
    expiresInSeconds: Math.ceil(OTP_TTL_MS / 1000),
    retryAfterSeconds: Math.ceil(OTP_RESEND_COOLDOWN_MS / 1000)
  };
}

export function verifyOtp(email: string, code: string) {
  const normalizedEmail = normalizeEmail(email);
  const pending = pendingOtps.get(normalizedEmail);

  if (!pending) {
    return { ok: false as const, message: "No code was requested for this email." };
  }

  if (pending.expiresAt < Date.now()) {
    pendingOtps.delete(normalizedEmail);
    return { ok: false as const, message: "That code expired. Request a new one." };
  }

  if (pending.code !== code.trim()) {
    return { ok: false as const, message: "That code did not match." };
  }

  pendingOtps.delete(normalizedEmail);
  return { ok: true as const };
}
