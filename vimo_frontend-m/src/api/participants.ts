import { mockParticipants } from "@/data/mock-participants";
import type { Participant } from "@/types";

export async function fetchParticipants(_postingId: string): Promise<Participant[]> {
  return mockParticipants;
}
