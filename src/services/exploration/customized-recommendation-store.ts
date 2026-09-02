import type { FreeTimeSlot } from '@/services/common/user-setup';

import type { VolunteerPost } from '@/types/exploration/types';

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
        !isVolunteerPostOverlappingTodayClass(item.post, state.scheduleItems) &&
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

function isVolunteerPostOverlappingTodayClass(
  post: VolunteerPost,
  scheduleItems: ScheduleRecommendationState['scheduleItems'],
) {
  const todayIndex = new Date().getDay();
  const volunteerStart = toMinutes(post.startTime);
  const volunteerEnd = toMinutes(post.endTime);

  if (volunteerStart === null || volunteerEnd === null || volunteerEnd <= volunteerStart) {
    return true;
  }

  return scheduleItems.some((item) => {
    if (getDayIndex(item.dayOfWeek) !== todayIndex) {
      return false;
    }

    const classTime = parseTimeRange(item.time);

    if (!classTime) {
      return false;
    }

    return volunteerStart < classTime.end && classTime.start < volunteerEnd;
  });
}

function getTodayDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getDayIndex(dayOfWeek?: string) {
  const key = dayOfWeek?.toUpperCase();
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  return days.indexOf(key ?? '');
}

function toMinutes(time: FreeTimeSlot['startTime'] | string) {
  if (!time) {
    return null;
  }

  if (typeof time === 'string') {
    const [hourText, minuteText] = time.split(':');
    const hour = Number(hourText);
    const minute = Number(minuteText);

    return Number.isFinite(hour) && Number.isFinite(minute) ? hour * 60 + minute : null;
  }

  const hour = time.hour ?? 0;
  const minute = time.minute ?? 0;

  return hour * 60 + minute;
}

function parseTimeRange(timeRange: string) {
  const [startText, endText] = timeRange.split(/\s*[-~]\s*/);
  const start = toMinutes(startText);
  const end = toMinutes(endText);

  if (start === null || end === null || end <= start) {
    return null;
  }

  return { start, end };
}

function getPostCreatedAt(post: VolunteerPost, fallbackIndex: number) {
  const createdAt = post.createdAt ? new Date(post.createdAt).getTime() : Number.NaN;

  return Number.isFinite(createdAt) ? createdAt : fallbackIndex;
}
