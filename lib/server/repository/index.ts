import { memoryStore } from "@/lib/server/repository/memory-store";

export function getRepository() {
  return memoryStore;
}
