import { TimetableError } from './schedule-analysis-errors';
import { createTimetableFormData } from './timetable-image-upload';

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

export async function analyzeScheduleImage(imageUri?: string, signal?: AbortSignal): Promise<ScheduleAnalysisResult> {
  if (!imageUri) {
    throw new TimetableError('학교 시간표 사진을 먼저 선택해 주세요.');
  }

  const formData = await createTimetableFormData(imageUri, signal);
  const analysis = await analyzeTimetableOcr(formData, signal);

  return normalizeScheduleAnalysisResult(analysis);
}

export async function saveScheduleAnalysisSelection(
  analysis: ScheduleAnalysisResult | null,
  selectedKeywords: string[],
) {
  if (!analysis?.classes.length) {
    throw new TimetableError('시간표 분석을 완료한 뒤 저장해 주세요.');
  }
  if (!selectedKeywords.length) {
    throw new TimetableError('1개 이상의 키워드를 선택해 주세요.');
  }

  await saveUserSetup({
    freeTimeSlots: analysis.freeTimeSlots,
    keywords: selectedKeywords,
  });
}

export async function getSavedScheduleAnalysis(
  { throwOnError = false, signal }: { throwOnError?: boolean; signal?: AbortSignal } = {},
): Promise<ScheduleAnalysisResult | null> {
  try {
    const setup = await getMySetup(signal);
    const hasSavedSetup =
      Boolean(setup.timetableImageUrl) ||
      Boolean(setup.classes?.length) ||
      Boolean(setup.freeTimeSlots?.length) ||
      Boolean(setup.keywords?.length);

    if (!hasSavedSetup) {
      return null;
    }

    return normalizeTimetableSetup(setup);
  } catch (error) {
    if (throwOnError) throw error;
    return null;
  }
}

function normalizeScheduleAnalysisResult(
  analysis: TimetableAnalysisResponse,
): ScheduleAnalysisResult {
  if (!analysis || !Array.isArray(analysis.classes) || !Array.isArray(analysis.freeTimeSlots)) {
    throw new TimetableError('시간표 분석 결과를 확인하지 못했어요. 다시 시도해 주세요.');
  }
  if (!analysis.classes.length) {
    throw new TimetableError('사진에서 수업 정보를 찾지 못했어요. 시간표가 선명하게 보이는 사진을 다시 선택해 주세요.');
  }
  if (!analysis.classes.every((item) => isValidSlot(item) && typeof item.subjectName === 'string') ||
      !analysis.freeTimeSlots.every(isValidSlot)) {
    throw new TimetableError('시간표 분석 결과의 형식이 올바르지 않아요. 다시 시도해 주세요.');
  }
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
    const [hour = '0', minute = '0'] = time.split(':');
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  }

  const hour = String(time.hour ?? 0).padStart(2, '0');
  const minute = String(time.minute ?? 0).padStart(2, '0');

  return `${hour}:${minute}`;
}
function isValidSlot(slot: ClassSlot | FreeTimeSlot) {
  return Boolean(slot && typeof slot.dayOfWeek === 'string' && slot.dayOfWeek.trim() &&
    isValidTime(slot.startTime) && isValidTime(slot.endTime));
}

function isValidTime(time: ApiLocalTime) {
  if (typeof time === 'string') {
    const match = /^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/.exec(time);
    return Boolean(match && Number(match[1]) < 24 && Number(match[2]) < 60);
  }
  if (!time) return false;
  const { hour, minute } = time;
  return typeof hour === 'number' && typeof minute === 'number' &&
    Number.isInteger(hour) && Number.isInteger(minute) &&
    hour >= 0 && hour < 24 && minute >= 0 && minute < 60;
}
