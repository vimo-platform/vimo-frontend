import { mockVolunteerPosts } from './mock';
import type { VolunteerPost } from './types';

type Listener = () => void;

export type ScheduleRecommendationState = {
  hasAnalyzedSchedule: boolean;
  selectedKeywords: string[];
  scheduleItems: {
    time: string;
    title: string;
  }[];
  availableRecommendationIds: number[];
};

let state: ScheduleRecommendationState = {
  hasAnalyzedSchedule: false,
  selectedKeywords: [],
  scheduleItems: [],
  availableRecommendationIds: [],
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
  availableRecommendationIds,
  scheduleItems,
  selectedKeywords,
}: {
  availableRecommendationIds?: number[];
  scheduleItems?: ScheduleRecommendationState['scheduleItems'];
  selectedKeywords: string[];
}) {
  const normalizedKeywords = selectedKeywords.map((keyword) => keyword.trim()).filter(Boolean);

  state = {
    hasAnalyzedSchedule: true,
    selectedKeywords: normalizedKeywords,
    scheduleItems: scheduleItems ?? [
      { time: '09:00 - 11:50', title: '국제비즈니스영어' },
      { time: '15:30 - 16:30', title: '인성과 학문 III' },
    ],
    availableRecommendationIds:
      availableRecommendationIds ?? (normalizedKeywords.length > 0 ? [101, 102] : []),
  };
  notify();
}

export function getCustomizedVolunteerPosts(posts: VolunteerPost[]) {
  const sourcePosts = posts.length > 0 ? posts : mockVolunteerPosts;
  const ids = new Set(state.availableRecommendationIds);

  return sourcePosts.filter((post) => ids.has(post.id));
}

function notify() {
  listeners.forEach((listener) => listener());
}
