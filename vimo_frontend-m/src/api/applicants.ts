import { mockApplicants, mockFcfsApplicants } from "@/data/mock-applicants";
import type { Applicant } from "@/types";

export async function fetchApplicants(_postingId: string): Promise<Applicant[]> {
  return mockApplicants;
}

export async function fetchFcfsApplicants(_postingId: string): Promise<Applicant[]> {
  return mockFcfsApplicants;
}
