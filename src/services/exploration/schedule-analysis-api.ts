import { Platform } from 'react-native';

import {
  analyzeTimetableOcr,
  getMySetup,
  saveUserSetup,
  type ApiLocalTime,
  type ClassSlot,
  type FreeTimeSlot,
  type TimetableAnalysisResponse,
  type TimetableSetupResponse,
} from '@/services/common/user-setup';

export type ScheduleAnalysisResult = {
  classes: ClassSlot[];
  scheduleItems?: {
    dayOfWeek?: string;
    time: string;
    title: string;
  }[];
  freeTimeSlots: FreeTimeSlot[];
  recommendedKeywords: string[];
  timetableImageUrl?: string | null;
};

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
  if (!analysis) {
    return;
  }

  await saveUserSetup({
    freeTimeSlots: analysis.freeTimeSlots,
    keywords: selectedKeywords,
  }).catch(() => undefined);
}

export async function getSavedScheduleAnalysis(): Promise<ScheduleAnalysisResult | null> {
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
  const classes = analysis.classes ?? [];
  const freeTimeSlots = analysis.freeTimeSlots ?? [];

  return {
    classes,
    scheduleItems: mapClassesToScheduleItems(classes),
    freeTimeSlots,
    recommendedKeywords: TIMETABLE_KEYWORD_OPTIONS,
  };
}

function normalizeTimetableSetup(setup: TimetableSetupResponse): ScheduleAnalysisResult {
  const classes = setup.classes ?? [];
  const freeTimeSlots = setup.freeTimeSlots ?? [];

  return {
    classes,
    scheduleItems: mapClassesToScheduleItems(classes),
    freeTimeSlots,
    recommendedKeywords: setup.keywords ?? [],
    timetableImageUrl: setup.timetableImageUrl ?? null,
  };
}

function mapClassesToScheduleItems(classes: ClassSlot[]) {
  return classes.map((item) => ({
    dayOfWeek: item.dayOfWeek,
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

function getEmptyScheduleAnalysisResult(): ScheduleAnalysisResult {
  return {
    classes: [],
    scheduleItems: [],
    freeTimeSlots: [],
    recommendedKeywords: TIMETABLE_KEYWORD_OPTIONS,
  };
}
