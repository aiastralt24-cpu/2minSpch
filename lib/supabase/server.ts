import { createClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "@/lib/supabase/config";

export function getSupabaseServerClient(accessToken?: string) {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  return createClient(config.url, config.anonKey, {
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      : undefined
  });
}

export async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return { user: null, token: undefined };
  }

  const supabase = getSupabaseServerClient(token);
  if (!supabase) {
    return { user: null, token };
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return { user: null, token };
  }

  return { user: data.user, token };
}
