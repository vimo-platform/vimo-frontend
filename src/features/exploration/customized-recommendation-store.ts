import type { FreeTimeSlot } from '@/api/user-setup';

import type { VolunteerPost } from './types';

type Listener = () => void;

export type ScheduleRecommendationState = {
  hasAnalyzedSchedule: boolean;
  selectedKeywords: string[];
  scheduleItems: {
    dayOfWeek?: string;
    time: string;
    title: string;
  }[];
  freeTimeSlots: FreeTimeSlot[];
  timetableImageUrl?: string | null;
};

let state: ScheduleRecommendationState = {
  hasAnalyzedSchedule: false,
  selectedKeywords: [],
  scheduleItems: [],
  freeTimeSlots: [],
  timetableImageUrl: null,
};

const listeners = new Set<Listener>();

export function subscribeScheduleRecommendation(listener: Listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getScheduleRecommendationSnapshot() {
  return state;
}

export function setCustomizedScheduleRecommendation(selectedKeywords: string[]) {
  setScheduleRecommendationFromAnalysis({
    selectedKeywords,
  });
}

export function setScheduleRecommendationFromAnalysis({
  scheduleItems,
  freeTimeSlots,
  selectedKeywords,
  timetableImageUrl,
}: {
  scheduleItems?: ScheduleRecommendationState['scheduleItems'];
  freeTimeSlots?: FreeTimeSlot[];
  selectedKeywords: string[];
  timetableImageUrl?: string | null;
}) {
  const normalizedKeywords = selectedKeywords.map((keyword) => keyword.trim()).filter(Boolean);

  state = {
    hasAnalyzedSchedule: true,
    selectedKeywords: normalizedKeywords,
    scheduleItems: scheduleItems ?? state.scheduleItems,
    freeTimeSlots: freeTimeSlots ?? state.freeTimeSlots,
    timetableImageUrl: timetableImageUrl ?? state.timetableImageUrl ?? null,
  };
  notify();
}

export function getCustomizedVolunteerPosts(posts: VolunteerPost[]) {
  const selectedKeywordSet = new Set(state.selectedKeywords);

  if (selectedKeywordSet.size === 0) {
    return [];
  }

  return posts
    .map((post, index) => ({
      index,
      matchedKeywordCount: getMatchedKeywordCount(post, selectedKeywordSet),
      post,
    }))
    .filter(
      (item) =>
        item.post.status === 'RECRUITING' &&
        isVolunteerPostAvailableToday(item.post) &&
        item.matchedKeywordCount > 0,
    )
    .sort((a, b) => {
      if (b.matchedKeywordCount !== a.matchedKeywordCount) {
        return b.matchedKeywordCount - a.matchedKeywordCount;
      }

      return getPostCreatedAt(a.post, a.index) - getPostCreatedAt(b.post, b.index);
    })
    .slice(0, 2)
    .map((item) => item.post);
}

function notify() {
  listeners.forEach((listener) => listener());
}

function getMatchedKeywordCount(post: VolunteerPost, selectedKeywordSet: Set<string>) {
  const postKeywords = post.keywords ?? [];

  return postKeywords.filter((keyword) => selectedKeywordSet.has(keyword)).length;
}

function isVolunteerPostAvailableToday(post: VolunteerPost) {
  const todayKey = getTodayDateKey();

  return post.startDate <= todayKey && todayKey <= post.endDate;
}

function getTodayDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getPostCreatedAt(post: VolunteerPost, fallbackIndex: number) {
  const createdAt = post.createdAt ? new Date(post.createdAt).getTime() : Number.NaN;

  return Number.isFinite(createdAt) ? createdAt : fallbackIndex;
}
