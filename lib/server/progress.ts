import { getRepository } from "@/lib/server/repository";

export async function getProgressSummaryForScope(scope: { guestKey?: string; userId?: string }) {
  return getRepository().getProgressSummary(scope);
}
