import { apiRequest } from '@/api/client';
import { getCurrentUser } from '@/storage/auth-storage';
import type { Posting, PostingStatus, RecruitType } from '@/features/admin/types';

type ApiLocalTime =
  | string
  | {
      hour?: number;
      minute?: number;
      second?: number;
      nano?: number;
    };

type ApiAdminVolunteer = {
  id?: number;
  studentId?: string;
  departmentName?: string;
  title?: string;
  content?: string;
  category?: string;
  selectedCategories?: string[];
  summaryTags?: string[];
  startAt?: string;
  endAt?: string;
  volunteerDate?: string;
  startDate?: string;
  endDate?: string;
  dayOfWeek?: number;
  startTime?: ApiLocalTime;
  endTime?: ApiLocalTime;
  location?: string;
  maxParticipants?: number;
  rewardHours?: number;
  status?: string;
  applicantCount?: number;
  recruitType?: string;
  recruitmentType?: string;
  applicationType?: string;
  targetGender?: string;
};

type ApiAiDraftResponse = {
  titleDraft?: string;
  contentDraft?: string;
  categoryDraft?: string;
  summaryTagsDraft?: string[];
};

let postings: Posting[] = [];
let workingPosting: Posting | null = null;

export function setWorkingPosting(posting: Posting): void {
  workingPosting = posting;
}

export function getWorkingPosting(): Posting | null {
  return workingPosting;
}

export function newPostingId(): string {
  return `p${Date.now()}`;
}

export async function fetchMyPostings(): Promise<Posting[]> {
  try {
    const data = await apiRequest<ApiAdminVolunteer[]>('/api/v1/admin/volunteers');
    const detailedData = await Promise.all(
      data.map(async (item) => {
        if (typeof item.id !== 'number') {
          return item;
        }

        try {
          const detail = await apiRequest<ApiAdminVolunteer>(`/api/v1/admin/volunteers/${item.id}`);
          return { ...item, ...detail };
        } catch {
          return item;
        }
      }),
    );

    postings = detailedData.filter((item) => item.status !== 'DELETED').map(normalizePosting);
  } catch {
    postings = [];
  }

  return [...postings].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function fetchPosting(id: string): Promise<Posting | undefined> {
  if (isNumericId(id)) {
    const data = await apiRequest<ApiAdminVolunteer>(`/api/v1/admin/volunteers/${id}`);
    const posting = normalizePosting(data);
    postings = upsertLocalPosting(postings, posting);
    return posting;
  }

  return postings.find((p) => p.id === id);
}

export async function upsertPosting(posting: Posting): Promise<void> {
  const savedPosting = await savePostingToApi(posting);
  postings = upsertLocalPosting(postings, savedPosting);
  workingPosting = savedPosting;
}

export async function closePosting(id: string): Promise<void> {
  if (!isNumericId(id)) {
    postings = postings.map((p) => (p.id === id ? { ...p, status: 'closed' } : p));
    return;
  }

  await apiRequest<void>(`/api/v1/admin/volunteers/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'CLOSED' }),
  });
  postings = postings.map((p) => (p.id === id ? { ...p, status: 'closed' } : p));
}

export async function deletePosting(id: string): Promise<void> {
  if (!isNumericId(id)) {
    postings = postings.filter((p) => p.id !== id);
    return;
  }

  await apiRequest<void>(`/api/v1/admin/volunteers/${id}`, { method: 'DELETE' });
  postings = postings.filter((p) => p.id !== id);
}

export async function generatePostingDraft(
  memo: string,
): Promise<{ title: string; description: string; keywords: string[]; category?: string }> {
  const data = await apiRequest<ApiAiDraftResponse>('/api/v1/admin/volunteers/ai', {
    method: 'POST',
    body: JSON.stringify({ content: memo }),
  });

  return {
    title: data.titleDraft ?? memo.trim().split('\n')[0].slice(0, 24),
    description: data.contentDraft ?? memo.trim(),
    keywords: data.summaryTagsDraft ?? [],
    category: data.categoryDraft,
  };
}

async function savePostingToApi(posting: Posting) {
  if (shouldPublishExistingDraft(posting)) {
    await apiRequest<ApiAdminVolunteer>(`/api/v1/admin/volunteers/${posting.id}/draft`, {
      method: 'PATCH',
      body: JSON.stringify(await toApiVolunteerPayload({ ...posting, status: 'draft' })),
    });

    const published = await apiRequest<ApiAdminVolunteer>(
      `/api/v1/admin/volunteers/${posting.id}/publish`,
      { method: 'PATCH' },
    );

    return normalizePosting(published);
  }

  const data = await apiRequest<ApiAdminVolunteer>(getSavePath(posting), {
    method: getSaveMethod(posting),
    body: JSON.stringify(await toApiVolunteerPayload(posting)),
  });

  if (posting.status === 'open' && normalizePostingStatus(data.status) === 'draft') {
    const published = await apiRequest<ApiAdminVolunteer>(
      `/api/v1/admin/volunteers/${data.id}/publish`,
      { method: 'PATCH' },
    );

    return normalizePosting(published);
  }

  return normalizePosting(data);
}

function shouldPublishExistingDraft(posting: Posting) {
  if (!isNumericId(posting.id) || posting.status !== 'open') {
    return false;
  }

  return (
    workingPosting?.id === posting.id && workingPosting.status === 'draft'
  ) || postings.some((item) => item.id === posting.id && item.status === 'draft');
}

function getSavePath(posting: Posting) {
  if (!isNumericId(posting.id)) {
    return posting.status === 'draft'
      ? '/api/v1/admin/volunteers/draft'
      : '/api/v1/admin/volunteers';
  }

  return posting.status === 'draft'
    ? `/api/v1/admin/volunteers/${posting.id}/draft`
    : `/api/v1/admin/volunteers/${posting.id}`;
}

function getSaveMethod(posting: Posting) {
  if (!isNumericId(posting.id)) {
    return 'POST';
  }

  return posting.status === 'draft' ? 'PATCH' : 'PUT';
}

async function toApiVolunteerPayload(posting: Posting) {
  const currentUser = await getCurrentUser();
  const category = toApiCategory(posting.category) ?? toApiCategory(posting.tags[0]);

  return {
    studentId: currentUser?.studentId ?? 'admin01',
    title: posting.title,
    content: posting.description,
    category,
    summaryTags: posting.tags,
    volunteerDate: parsePostingDate(posting.period),
    endDate: parsePostingEndDate(posting.period),
    startTime: normalizeTime(posting.startTime),
    endTime: normalizeTime(posting.endTime),
    location: posting.location,
    maxParticipants: posting.capacity,
    rewardHours: posting.hoursPerSession,
    recruitType: toApiRecruitType(posting.recruitType),
    targetGender: toApiGender(posting.gender),
    timeOrderValid: isTimeOrderValid(posting.startTime, posting.endTime),
  };
}

function toApiRecruitType(type?: RecruitType) {
  return type === 'fcfs' ? 'FIRST_COME' : 'SELECTION';
}

function toApiGender(gender?: string) {
  if (gender === '남성') {
    return 'MALE';
  }

  if (gender === '여성') {
    return 'FEMALE';
  }

  return 'ALL';
}

function normalizePosting(data: ApiAdminVolunteer): Posting {
  const start = getDateTimeParts(data.startAt, data.volunteerDate ?? data.startDate, data.startTime);
  const end = getDateTimeParts(data.endAt, data.endDate ?? data.volunteerDate, data.endTime);
  const period =
    start.date && end.date && start.date !== end.date
      ? `${start.date} ~ ${end.date}`
      : start.date || end.date;
  const hoursPerSession =
    data.rewardHours ?? getCreditHoursFromParts(start.date, start.time, end.date, end.time);

  return {
    id: String(data.id ?? newPostingId()),
    title: data.title ?? '',
    description: data.content ?? '',
    location: data.location ?? '',
    period,
    startTime: start.time,
    endTime: end.time,
    capacity: data.maxParticipants ?? 0,
    applicants: data.applicantCount ?? 0,
    hoursPerSession,
    status: normalizePostingStatus(data.status, end.date),
    recruitType: normalizeRecruitType(data.recruitType ?? data.recruitmentType ?? data.applicationType),
    category: categoryToLabel(data.category),
    tags: data.summaryTags ?? [],
    gender: normalizeGender(data.targetGender),
    createdAt: start.date || new Date().toISOString().slice(0, 10),
  };
}

function normalizePostingStatus(status?: string, endDate?: string): PostingStatus {
  if (status === 'DRAFT') {
    return 'draft';
  }

  if (status === 'CLOSED' || status === 'COMPLETED' || status === 'DELETED') {
    return 'closed';
  }

  if (isPastDate(endDate)) {
    return 'closed';
  }

  return 'open';
}

function normalizeRecruitType(type?: string) {
  return type === 'FIRST_COME' || type === 'fcfs' || type === 'FCFS' ? 'fcfs' : 'selection';
}

function normalizeGender(gender?: string) {
  if (gender === 'MALE') {
    return '남성';
  }

  if (gender === 'FEMALE') {
    return '여성';
  }

  if (gender === 'ALL') {
    return '전체';
  }

  return undefined;
}

const CATEGORY_TO_API: Record<string, string> = {
  행사운영: 'EVENT_OPERATION',
  '현장 관리': 'FIELD_MANAGEMENT',
  행정지원: 'ADMIN_SUPPORT',
  디자인: 'DESIGN',
  멘토링: 'MENTORING',
  환경보호: 'ENVIRONMENT',
  미디어: 'MEDIA',
  IT: 'IT',
  '수업 보조': 'CLASS_SUPPORT',
};

const CATEGORY_LABELS: Record<string, string> = {
  EVENT_OPERATION: '행사운영',
  FIELD_MANAGEMENT: '현장 관리',
  ADMIN_SUPPORT: '행정지원',
  ADMINISTRATIVE_SUPPORT: '행정지원',
  DESIGN: '디자인',
  MENTORING: '멘토링',
  ENVIRONMENT: '환경보호',
  MEDIA: '미디어',
  IT: 'IT',
  CLASS_SUPPORT: '수업 보조',
  CLASS_ASSISTANCE: '수업 보조',
};

function toApiCategory(category?: string) {
  if (!category) {
    return undefined;
  }

  return CATEGORY_TO_API[category] ?? (CATEGORY_LABELS[category] ? category : undefined);
}

function categoryToLabel(category?: string) {
  if (!category) {
    return undefined;
  }

  return CATEGORY_LABELS[category] ?? category;
}

function parsePostingDate(period: string) {
  const rawDate = period.split('~')[0]?.trim() ?? period.trim();

  return toIsoDate(rawDate);
}

function parsePostingEndDate(period: string) {
  const parts = period.split('~');
  const rawDate = (parts[1] ?? parts[0])?.trim() ?? period.trim();

  return toIsoDate(rawDate);
}

function toIsoDate(rawDate: string) {
  const [year, month, day] = rawDate.match(/\d+/g) ?? [];

  if (!year || !month || !day) {
    return rawDate;
  }

  return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function normalizeTime(time: string) {
  const [hour, minute, second] = time.match(/\d+/g) ?? [];

  if (!hour || !minute) {
    return time.trim();
  }

  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${(second ?? '00').padStart(2, '0')}`;
}

function isTimeOrderValid(startTime: string, endTime: string) {
  const startMinutes = getMinutes(startTime);
  const endMinutes = getMinutes(endTime);

  if (startMinutes === null || endMinutes === null) {
    return false;
  }

  return startMinutes < endMinutes;
}

function getMinutes(time: string) {
  const [hour, minute] = time.match(/\d+/g) ?? [];

  if (!hour || !minute) {
    return null;
  }

  return Number(hour) * 60 + Number(minute);
}

function getDateTimeParts(dateTime?: string, date?: string, time?: ApiLocalTime) {
  if (dateTime) {
    const [datePart = '', timePart = ''] = dateTime.split('T');

    return {
      date: datePart,
      time: timePart.slice(0, 5),
    };
  }

  return {
    date: date ?? '',
    time: formatApiTime(time),
  };
}

function getCreditHoursFromParts(
  startDate?: string,
  startTime?: string,
  endDate?: string,
  endTime?: string,
) {
  if (!startDate || !startTime || !endDate || !endTime) {
    return 0;
  }

  // 회차 기준 인정 시간: 여러 날짜에 걸친 공고도 하루의 시작~종료 시간으로 계산한다.
  const start = new Date(`${startDate}T${startTime}:00`).getTime();
  const end = new Date(`${startDate}T${endTime}:00`).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }

  return Math.round((end - start) / (1000 * 60 * 60));
}

function formatApiTime(time?: ApiLocalTime) {
  if (!time) {
    return '';
  }

  if (typeof time === 'string') {
    return time.slice(0, 5);
  }

  const hour = String(time.hour ?? 0).padStart(2, '0');
  const minute = String(time.minute ?? 0).padStart(2, '0');

  return `${hour}:${minute}`;
}

function isPastDate(date?: string) {
  if (!date) {
    return false;
  }

  const today = new Date();
  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  return date < todayKey;
}

function isNumericId(id: string) {
  return /^\d+$/.test(id);
}

function upsertLocalPosting(items: Posting[], posting: Posting) {
  return items.some((p) => p.id === posting.id)
    ? items.map((p) => (p.id === posting.id ? posting : p))
    : [posting, ...items];
}
