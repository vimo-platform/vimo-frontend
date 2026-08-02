import { Platform } from 'react-native';

import {
  analyzeTimetableOcr,
  getMySetup,
  saveUserSetup,
  type ApiLocalTime,
  type ClassSlot,
  type FreeTimeSlot,
  type TimetableSetupResponse,
  type TimetableAnalysisResponse,
} from '@/api/user-setup';

export type ScheduleAnalysisResult = {
  classes: ClassSlot[];
  scheduleItems?: {
    time: string;
    title: string;
  }[];
  freeTimeSlots: FreeTimeSlot[];
  recommendedKeywords: string[];
  timetableImageUrl?: string | null;
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

export async function getSavedScheduleAnalysis(): Promise<ScheduleAnalysisResult | null> {
  if (USE_MOCK_SCHEDULE_ANALYSIS) {
    return null;
  }

  try {
    const setup = await getMySetup();
    const hasSavedSetup =
      Boolean(setup.timetableImageUrl) ||
      Boolean(setup.classes?.length) ||
      Boolean(setup.freeTimeSlots?.length) ||
      Boolean(setup.keywords?.length);

    if (!hasSavedSetup) {
      return null;
    }

    return normalizeTimetableSetup(setup);
  } catch {
    return null;
  }
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
    classes: analysis.classes ?? [],
    scheduleItems: analysis.scheduleItems ?? mapClassesToScheduleItems(analysis.classes ?? []),
    freeTimeSlots: analysis.freeTimeSlots ?? [],
    recommendedKeywords: TIMETABLE_KEYWORD_OPTIONS,
  };
}

function normalizeTimetableSetup(setup: TimetableSetupResponse): ScheduleAnalysisResult {
  const classes = setup.classes ?? [];

  return {
    classes,
    scheduleItems: mapClassesToScheduleItems(classes),
    freeTimeSlots: setup.freeTimeSlots ?? [],
    recommendedKeywords: setup.keywords ?? [],
    timetableImageUrl: setup.timetableImageUrl ?? null,
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
    classes: [
      {
        dayOfWeek: 'MONDAY',
        subjectName: '골프',
        startTime: '12:00:00',
        endTime: '15:00:00',
      },
      {
        dayOfWeek: 'TUESDAY',
        subjectName: '서비스리더디자인',
        startTime: '12:00:00',
        endTime: '14:00:00',
      },
      {
        dayOfWeek: 'TUESDAY',
        subjectName: '서비스디자인',
        startTime: '15:00:00',
        endTime: '17:00:00',
      },
      {
        dayOfWeek: 'WEDNESDAY',
        subjectName: '비주얼콘텐츠디자인',
        startTime: '12:00:00',
        endTime: '14:00:00',
      },
      {
        dayOfWeek: 'THURSDAY',
        subjectName: '국제비즈니스영어',
        startTime: '09:00:00',
        endTime: '11:50:00',
      },
      {
        dayOfWeek: 'THURSDAY',
        subjectName: '알바',
        startTime: '12:00:00',
        endTime: '17:00:00',
      },
      {
        dayOfWeek: 'FRIDAY',
        subjectName: '알바',
        startTime: '09:00:00',
        endTime: '17:00:00',
      },
      {
        dayOfWeek: 'SATURDAY',
        subjectName: '알바',
        startTime: '09:00:00',
        endTime: '17:00:00',
      },
    ],
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
    classes: [],
    scheduleItems: [],
    freeTimeSlots: [],
    recommendedKeywords: TIMETABLE_KEYWORD_OPTIONS,
  };
}
