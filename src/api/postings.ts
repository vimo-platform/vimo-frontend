import { initialPostings } from "@/data/mock-postings";
import type { Posting } from "@/types";

let postings: Posting[] = [...initialPostings];

export async function fetchMyPostings(): Promise<Posting[]> {
  return [...postings].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function fetchPosting(id: string): Promise<Posting | undefined> {
  return postings.find((p) => p.id === id);
}

export async function createPosting(
  input: Omit<Posting, "id" | "applicants" | "status" | "createdAt">,
): Promise<Posting> {
  const posting: Posting = {
    ...input,
    id: `p${Date.now()}`,
    applicants: 0,
    status: "open",
    createdAt: new Date().toISOString().slice(0, 10),
  };
  postings = [posting, ...postings];
  return posting;
}

export async function closePosting(id: string): Promise<void> {
  postings = postings.map((p) => (p.id === id ? { ...p, status: "closed" } : p));
}

export async function generatePostingDraft(
  memo: string,
): Promise<{ title: string; description: string }> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const summary = memo.trim().split("\n")[0].slice(0, 24);
  return {
    title: `[모집] ${summary}`,
    description: `안녕하세요, 봉사자 여러분!\n\n${memo.trim()}\n\n관심 있는 분들의 많은 지원 바랍니다.`,
  };
}
