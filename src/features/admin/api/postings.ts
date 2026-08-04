import { apiRequest } from '@/api/client';
import { getCurrentUser } from '@/storage/auth-storage';
import { initialPostings } from '@/features/admin/data/mock-postings';
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
  summaryTags?: string[];
  startAt?: string;
  endAt?: string;
  volunteerDate?: string;
  startDate?: string;
  endDate?: string;
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

const USE_MOCK_ADMIN_API = process.env.EXPO_PUBLIC_USE_MOCK_ADMIN_API === 'true';

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
  if (USE_MOCK_ADMIN_API) {
    postings = [...initialPostings];
    return [...postings].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

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

    postings = detailedData.map(normalizePosting);
  } catch {
    postings = [];
  }

  return [...postings].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function fetchPosting(id: string): Promise<Posting | undefined> {
  if (USE_MOCK_ADMIN_API) {
    return initialPostings.find((p) => p.id === id);
  }

  if (isNumericId(id)) {
    const data = await apiRequest<ApiAdminVolunteer>(`/api/v1/admin/volunteers/${id}`);
    const posting = normalizePosting(data);
    postings = upsertLocalPosting(postings, posting);
    return posting;
  }

  return postings.find((p) => p.id === id);
}

export async function upsertPosting(posting: Posting): Promise<void> {
  if (USE_MOCK_ADMIN_API) {
    postings = upsertLocalPosting(postings, posting);
    return;
  }

  const savedPosting = await savePostingToApi(posting);
  postings = upsertLocalPosting(postings, savedPosting);
  workingPosting = savedPosting;
}

export async function closePosting(id: string): Promise<void> {
  if (USE_MOCK_ADMIN_API || !isNumericId(id)) {
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
  if (USE_MOCK_ADMIN_API || !isNumericId(id)) {
    postings = postings.filter((p) => p.id !== id);
    return;
  }

  await apiRequest<void>(`/api/v1/admin/volunteers/${id}`, { method: 'DELETE' });
  postings = postings.filter((p) => p.id !== id);
}

export async function generatePostingDraft(
  memo: string,
): Promise<{ title: string; description: string; keywords: string[] }> {
  if (!USE_MOCK_ADMIN_API) {
    const data = await apiRequest<ApiAiDraftResponse>('/api/v1/admin/volunteers/ai', {
      method: 'POST',
      body: JSON.stringify({ content: memo }),
    });

    return {
      title: data.titleDraft ?? memo.trim().split('\n')[0].slice(0, 24),
      description: data.contentDraft ?? memo.trim(),
      keywords: data.summaryTagsDraft ?? (data.categoryDraft ? [data.categoryDraft] : []),
    };
  }

  await new Promise((resolve) => setTimeout(resolve, 1800));
  const summary = memo.trim().split('\n')[0].slice(0, 24);

  return {
    title: summary,
    description: `${memo.trim()}\n\n전문적인 활동 경험이 없어도 참여 가능하며, 책임감 있게 활동 가능한 재학생의 많은 지원 바랍니다.`,
    keywords: ['정기 참여 가능자 우대', '성실 근무자 우대'],
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

  const path = getSavePath(posting);
  const method = getSaveMethod(posting);
  const data = await apiRequest<ApiAdminVolunteer>(path, {
    method,
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
  const category = getValidCategory(posting.tags);

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

// 앱 값 -> 백엔드 enum (백엔드는 SELECTION / FIRST_COME 만 허용)
function toApiRecruitType(type?: RecruitType) {
  return type === 'fcfs' ? 'FIRST_COME' : 'SELECTION';
}

// 앱 값 -> 백엔드 enum (ALL / MALE / FEMALE)
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
    recruitType: normalizeRecruitType(
      data.recruitType ?? data.recruitmentType ?? data.applicationType,
    ),
    tags: data.summaryTags ?? (data.category ? [data.category] : []),
    gender: normalizeGender(data.targetGender),
    createdAt: start.date || new Date().toISOString().slice(0, 10),
  };
}

function normalizePostingStatus(status?: string, endDate?: string): PostingStatus {
  if (status === 'DRAFT') {
    return 'draft';
  }

  if (status === 'CLOSED' || status === 'COMPLETED') {
    return 'closed';
  }

  if (isPastDate(endDate)) {
    return 'closed';
  }

  return 'open';
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

function normalizeRecruitType(type?: string) {
  if (
    type === 'fcfs' ||
    type === 'FCFS' ||
    type === 'FIRST_COME' ||
    type === 'FIRST_COME_FIRST_SERVED'
  ) {
    return 'fcfs';
  }

  return 'selection';
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

  // 회차(하루) 기준 인정 시간: 여러 날에 걸친 공고여도 시작일의 시작~종료 시간으로 계산
  const start = new Date(`${startDate}T${startTime}:00`).getTime();
  const end = new Date(`${startDate}T${endTime}:00`).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }

  return Math.round((end - start) / (1000 * 60 * 60));
}

const VALID_CATEGORIES = new Set([
  '행사운영',
  '현장 관리',
  '행정지원',
  '디자인',
  '멘토링',
  '환경보호',
  'IT',
  '미디어',
  '수업 보조',
]);

function getValidCategory(tags: string[]) {
  return tags.find((tag) => VALID_CATEGORIES.has(tag.trim()))?.trim();
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

function isNumericId(id: string) {
  return /^\d+$/.test(id);
}

function upsertLocalPosting(items: Posting[], posting: Posting) {
  return items.some((p) => p.id === posting.id)
    ? items.map((p) => (p.id === posting.id ? posting : p))
    : [posting, ...items];
}
