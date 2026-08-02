import { Platform } from 'react-native';

import {
  analyzeTimetableOcr,
  saveUserSetup,
  type ApiLocalTime,
  type ClassSlot,
  type FreeTimeSlot,
  type TimetableAnalysisResponse,
} from '@/api/user-setup';

export type ScheduleAnalysisResult = {
  scheduleItems?: {
    time: string;
    title: string;
  }[];
  freeTimeSlots: FreeTimeSlot[];
  recommendedKeywords: string[];
};

const USE_MOCK_SCHEDULE_ANALYSIS =
  process.env.EXPO_PUBLIC_USE_MOCK_SCHEDULE_ANALYSIS === 'true';

export const TIMETABLE_KEYWORD_OPTIONS = [
  '행사운영',
  '현장 관리',
  '행정지원',
  '디자인',
  '멘토링',
  '환경보호',
  '미디어',
  'IT',
  '수업 보조',
];

export async function analyzeScheduleImage(imageUri?: string): Promise<ScheduleAnalysisResult> {
  if (USE_MOCK_SCHEDULE_ANALYSIS) {
    return getMockScheduleAnalysisResult();
  }

  if (!imageUri) {
    return getEmptyScheduleAnalysisResult();
  }

  try {
    const formData = await createTimetableFormData(imageUri);
    const analysis = await analyzeTimetableOcr(formData);

    return normalizeScheduleAnalysisResult(analysis);
  } catch {
    return getEmptyScheduleAnalysisResult();
  }
}

export async function saveScheduleAnalysisSelection(
  analysis: ScheduleAnalysisResult | null,
  selectedKeywords: string[],
) {
  if (USE_MOCK_SCHEDULE_ANALYSIS || !analysis) {
    return;
  }

  await saveUserSetup({
    freeTimeSlots: analysis.freeTimeSlots,
    keywords: selectedKeywords,
  }).catch(() => undefined);
}

async function createTimetableFormData(imageUri: string) {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    formData.append('file', blob, 'timetable.jpg');
    return formData;
  }

  formData.append('file', {
    uri: imageUri,
    name: 'timetable.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  return formData;
}

function normalizeScheduleAnalysisResult(
  analysis: TimetableAnalysisResponse,
): ScheduleAnalysisResult {
  return {
    scheduleItems: analysis.scheduleItems ?? mapClassesToScheduleItems(analysis.classes ?? []),
    freeTimeSlots: analysis.freeTimeSlots ?? [],
    recommendedKeywords: TIMETABLE_KEYWORD_OPTIONS,
  };
}

function mapClassesToScheduleItems(classes: ClassSlot[]) {
  return classes.map((item) => ({
    time: `${formatApiTime(item.startTime)} - ${formatApiTime(item.endTime)}`,
    title: item.subjectName,
  }));
}

function formatApiTime(time: ApiLocalTime) {
  if (typeof time === 'string') {
    return time.slice(0, 5);
  }

  const hour = String(time.hour ?? 0).padStart(2, '0');
  const minute = String(time.minute ?? 0).padStart(2, '0');

  return `${hour}:${minute}`;
}

async function getMockScheduleAnalysisResult(): Promise<ScheduleAnalysisResult> {
  await new Promise((resolve) => setTimeout(resolve, 2200));

  return {
    scheduleItems: [
      { time: '09:00 - 11:50', title: '국제비즈니스영어' },
      { time: '15:30 - 16:30', title: '인성과 학문 III' },
    ],
    freeTimeSlots: [
      { dayOfWeek: 'MONDAY', startTime: '11:50:00', endTime: '15:30:00' },
    ],
    recommendedKeywords: TIMETABLE_KEYWORD_OPTIONS,
  };
}

function getEmptyScheduleAnalysisResult(): ScheduleAnalysisResult {
  return {
    scheduleItems: [],
    freeTimeSlots: [],
    recommendedKeywords: TIMETABLE_KEYWORD_OPTIONS,
  };
}
