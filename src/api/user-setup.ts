import { apiRequest } from './client';

export type TimetableScheduleItem = {
  time: string;
  title: string;
};

export type TimetableAnalysisResponse = {
  scheduleItems?: TimetableScheduleItem[];
  interestKeywords: string[];
  recommendedKeywords: string[];
  selectedRecommendationKeywords?: string[];
};

export type UserSetupPayload = {
  scheduleItems: TimetableScheduleItem[];
  interestKeywords: string[];
  selectedRecommendationKeywords: string[];
};

export function analyzeTimetableOcr(formData: FormData) {
  return apiRequest<TimetableAnalysisResponse>('/api/v1/timetables/ocr', {
    method: 'POST',
    body: formData,
  });
}

export function fetchRecommendedKeywords() {
  return apiRequest<{ keywords: string[] }>('/api/v1/keyword/recommended');
}

export function saveUserSetup(payload: UserSetupPayload) {
  return apiRequest<void>('/api/v1/users/setup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function reanalyzeMyTimetable(formData: FormData) {
  return apiRequest<TimetableAnalysisResponse>('/api/v1/users/me/timetables/re-ocr', {
    method: 'POST',
    body: formData,
  });
}

export function updateMyKeywords(keywords: string[]) {
  return apiRequest<void>('/api/v1/users/me/keywords', {
    method: 'PATCH',
    body: JSON.stringify({ keywords }),
  });
}
