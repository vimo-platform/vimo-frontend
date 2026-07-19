import { mockApplicants } from "@/features/admin/data/mock-applicants";
import type { Applicant } from "@/features/admin/types";

export async function fetchApplicants(_postingId: string): Promise<Applicant[]> {
  return mockApplicants;
}
