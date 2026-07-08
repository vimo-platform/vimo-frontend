import { initialPostings } from "@/data/mock-postings";
import type { Posting } from "@/types";

let postings: Posting[] = [...initialPostings];

// 작성/수정 중인 공고를 화면 간에 들고 다니기 위한 임시 저장소 (백엔드 연동 전 mock)
let workingPosting: Posting | null = null;

export function setWorkingPosting(posting: Posting): void {
  workingPosting = posting;
}

export function getWorkingPosting(): Posting | null {
  return workingPosting;
}

export function newPostingId(): string {
  return `p${Date.now()}`;
}

export async function fetchMyPostings(): Promise<Posting[]> {
  return [...postings].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function fetchPosting(id: string): Promise<Posting | undefined> {
  return postings.find((p) => p.id === id);
}

// 새 공고면 추가, 이미 있으면(임시저장 수정 등) 교체
export async function upsertPosting(posting: Posting): Promise<void> {
  const exists = postings.some((p) => p.id === posting.id);
  postings = exists
    ? postings.map((p) => (p.id === posting.id ? posting : p))
    : [posting, ...postings];
}

export async function closePosting(id: string): Promise<void> {
  postings = postings.map((p) => (p.id === id ? { ...p, status: "closed" } : p));
}

export async function generatePostingDraft(
  memo: string,
): Promise<{ title: string; description: string; keywords: string[] }> {
  await new Promise((resolve) => setTimeout(resolve, 1800));
  const summary = memo.trim().split("\n")[0].slice(0, 24);
  return {
    title: summary,
    description: `${memo.trim()}\n\n전문적인 활동 경험이 없어도 참여 가능하며, 책임감 있게 활동 가능한 재학생의 많은 지원 바랍니다.`,
    keywords: ["정기 참여 가능자 우대", "성실 근무자 우대"],
  };
}
