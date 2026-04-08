import { cookies } from "next/headers";

const GUEST_COOKIE = "care_guest_key";

export async function readGuestKeyFromCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(GUEST_COOKIE)?.value;
}

export async function writeGuestKeyCookie(guestKey: string) {
  const cookieStore = await cookies();
  cookieStore.set(GUEST_COOKIE, guestKey, {
    httpOnly: false,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}
