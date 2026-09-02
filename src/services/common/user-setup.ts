import { apiRequest } from './client';

export type TimetableScheduleItem = {
  time: string;
  title: string;
};

export type ApiLocalTime =
  | string
  | {
      hour?: number;
      minute?: number;
      second?: number;
      nano?: number;
    };

export type FreeTimeSlot = {
  dayOfWeek: string;
  startTime: ApiLocalTime;
  endTime: ApiLocalTime;
};

export type ClassSlot = FreeTimeSlot & {
  subjectName: string;
};

export type TimetableSetupResponse = {
  freeTimeSlots?: FreeTimeSlot[];
  classes?: ClassSlot[];
  keywords?: string[];
  timetableImageUrl?: string | null;
};

export type TimetableAnalysisResponse = {
  freeTimeSlots?: FreeTimeSlot[];
  classes?: ClassSlot[];
  keywords?: string[];
};

export type UserSetupPayload = {
  freeTimeSlots: FreeTimeSlot[];
  keywords: string[];
};

export function analyzeTimetableOcr(formData: FormData) {
  return apiRequest<TimetableAnalysisResponse>('/api/v1/timetables/ocr', {
    method: 'POST',
    body: formData,
  });
}

export function saveUserSetup(payload: UserSetupPayload) {
  return apiRequest<void>('/api/v1/users/setup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getMySetup() {
  return apiRequest<TimetableSetupResponse>('/api/v1/users/me/setup');
}
