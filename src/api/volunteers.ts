import { apiRequest } from './client';

import type {
  VolunteerApplicationStatus,
  VolunteerPost,
  VolunteerStatus,
} from '@/features/exploration/types';

type ApiLocalTime =
  | string
  | {
      hour?: number;
      minute?: number;
      second?: number;
      nano?: number;
    };

export type ApiVolunteer = {
  id?: number;
  volunteerId?: number;
  title?: string;
  organization?: string;
  category?: string;
  selectedCategories?: string[];
  keywords?: string[];
  summaryTags?: string[];
  content?: string;
  description?: string;
  departmentName?: string;
  location?: string;
  startAt?: string;
  endAt?: string;
  volunteerDate?: string;
  startDate?: string;
  endDate?: string;
  startTime?: ApiLocalTime;
  endTime?: ApiLocalTime;
  capacity?: number;
  maxParticipants?: number;
  neededCount?: number;
  applicantCount?: number;
  appliedCount?: number;
  applicationCount?: number;
  currentApplicants?: number;
  currentParticipants?: number;
  rewardHours?: number;
  creditHours?: number;
  status?: VolunteerStatus | 'DELETED' | string;
  recruitType?: 'SELECTION' | 'FIRST_COME' | string;
  recruitmentType?: 'SELECTION' | 'FIRST_COME' | string;
  applicationType?: 'SELECTION' | 'FIRST_COME' | string;
  createdAt?: string;
  isFavorite?: boolean;
  isApplied?: boolean;
  applicationStatus?: VolunteerApplicationStatus;
};

export type ApiApplication = {
  volunteerId: number;
  title?: string;
  category?: string;
  location?: string;
  startAt?: string;
  endAt?: string;
  status?: VolunteerApplicationStatus;
  applicationStatus?: VolunteerApplicationStatus;
  rejectReason?: string;
  certificationRejectReason?: string;
  rejectedAt?: string;
};

export type ApiCertificationStatus =
  | 'PENDING'
  | 'REJECTED'
  | 'APPROVED'
  | 'COMPLETED'
  | string;

export type ApiCertification = {
  volunteerId: number;
  status?: ApiCertificationStatus;
  applicationStatus?: ApiCertificationStatus;
  rejectedAt?: string;
  rejectReason?: string;
  certificationRejectReason?: string;
};

function isDeletedVolunteer(data: ApiVolunteer) {
  return data.status === 'DELETED';
}

export async function fetchVolunteers() {
  const data = await apiRequest<ApiVolunteer[]>('/api/v1/volunteers');
  const detailedData = await enrichVolunteerDetails(data);

  return detailedData.filter((item) => !isDeletedVolunteer(item)).map(normalizeVolunteerPost);
}

export async function searchVolunteers(query: string) {
  const params = new URLSearchParams({ keyword: query });
  const data = await apiRequest<ApiVolunteer[]>(`/api/v1/volunteers/search?${params.toString()}`);
  const detailedData = await enrichVolunteerDetails(data);

  return detailedData.filter((item) => !isDeletedVolunteer(item)).map(normalizeVolunteerPost);
}

export async function fetchVolunteerDetail(volunteerId: number) {
  const data = await apiRequest<ApiVolunteer>(`/api/v1/volunteers/${volunteerId}`);

  return normalizeVolunteerPost(data);
}

export function favoriteVolunteer(volunteerId: number) {
  return apiRequest<void>(`/api/v1/volunteers/${volunteerId}/favorite`, {
    method: 'POST',
  });
}

export function unfavoriteVolunteer(volunteerId: number) {
  return apiRequest<void>(`/api/v1/volunteers/${volunteerId}/favorite`, {
    method: 'DELETE',
  });
}

export async function fetchMyFavoriteVolunteers() {
  const data = await apiRequest<ApiVolunteer[]>('/api/v1/users/me/favorites');
  const detailedData = await enrichVolunteerDetails(data);

  return detailedData.filter((item) => !isDeletedVolunteer(item)).map(normalizeVolunteerPost);
}

export async function fetchMyApplications() {
  return apiRequest<ApiApplication[]>('/api/v1/users/me/applications');
}

export function applyVolunteer(volunteerId: number) {
  return apiRequest<ApiApplication>(`/api/v1/volunteers/${volunteerId}/application`, {
    method: 'POST',
  });
}

export function cancelVolunteerApplication(
  volunteerId: number,
  payload?: { cancelReason?: string },
) {
  return apiRequest<void>(`/api/v1/volunteers/${volunteerId}/application`, {
    method: 'DELETE',
    body: payload?.cancelReason ? JSON.stringify({ reason: payload.cancelReason }) : undefined,
  });
}

export async function fetchNewApprovedApplications() {
  return apiRequest<ApiApplication[]>('/api/v1/users/me/applications/approved/new');
}

export function markNewApprovedApplicationsRead() {
  return apiRequest<void>('/api/v1/users/me/applications/approved/new/read', {
    method: 'PATCH',
  });
}

export async function fetchMyCertifications() {
  return apiRequest<ApiCertification[]>('/api/v1/users/me/certifications');
}

export async function verifyVolunteerCheckIn(volunteerId: number, qrToken: string) {
  const result = await apiRequest<ApiApplication>(`/api/v1/volunteers/${volunteerId}/checkin`, {
    method: 'POST',
    body: JSON.stringify({ qrToken }),
  });

  return {
    verified: true,
    message: result.status ?? result.applicationStatus,
  };
}

export async function verifyVolunteerCheckOut(volunteerId: number, qrToken: string) {
  const result = await apiRequest<ApiApplication>(`/api/v1/volunteers/${volunteerId}/checkout`, {
    method: 'POST',
    body: JSON.stringify({ qrToken }),
  });

  return {
    verified: true,
    message: result.status ?? result.applicationStatus,
  };
}

export function normalizeVolunteerPost(data: ApiVolunteer): VolunteerPost {
  const start = getDateTimeParts(data.startAt, data.volunteerDate ?? data.startDate, data.startTime);
  const end = getDateTimeParts(data.endAt, data.endDate ?? data.volunteerDate, data.endTime);
  const creditHours =
    data.creditHours ??
    data.rewardHours ??
    getCreditHoursFromParts(start.date, start.time, end.date, end.time);
  const capacity = data.neededCount ?? data.capacity ?? data.maxParticipants ?? 0;

  return {
    id: data.id ?? data.volunteerId ?? 0,
    title: data.title ?? '',
    organization: data.organization ?? data.departmentName ?? categoryToLabel(data.category) ?? '',
    location: data.location ?? '',
    category: categoryToLabel(data.category) ?? data.category ?? data.organization ?? '',
    startDate: start.date,
    endDate: end.date,
    startTime: start.time,
    endTime: end.time,
    recruitmentEndDate: start.date,
    neededCount: capacity,
    appliedCount:
      data.appliedCount ??
      data.applicantCount ??
      data.applicationCount ??
      data.currentApplicants ??
      data.currentParticipants ??
      0,
    creditHours,
    status: normalizeVolunteerStatus(data.status, end.date),
    participationCondition:
      getPrimaryTag(data.summaryTags) || getPrimaryTag(normalizeVolunteerKeywords(data)),
    cancelPolicy: '취소 불가',
    guideTitle: '모집 안내',
    description: data.description ?? data.content ?? '',
    requirements: data.summaryTags ?? [],
    recruitType: normalizeRecruitType(data.recruitType ?? data.recruitmentType ?? data.applicationType),
    keywords: normalizeVolunteerKeywords(data),
    createdAt: data.createdAt ?? start.date,
    isFavorite: data.isFavorite,
    isApplied: data.isApplied,
    applicationStatus: data.applicationStatus,
  };
}

function getPrimaryTag(tags?: string[]) {
  return tags?.[0] ?? '';
}

async function enrichVolunteerDetails(data: ApiVolunteer[]) {
  return Promise.all(
    data.map(async (item) => {
      const id = item.id ?? item.volunteerId;

      if (typeof id !== 'number') {
        return item;
      }

      try {
        const detail = await apiRequest<ApiVolunteer>(`/api/v1/volunteers/${id}`);
        return { ...item, ...detail };
      } catch {
        return item;
      }
    }),
  );
}

function normalizeRecruitType(type?: ApiVolunteer['recruitType']) {
  return type === 'FIRST_COME' || type === 'fcfs' || type === 'FCFS' ? 'fcfs' : 'selection';
}

function normalizeVolunteerStatus(status: ApiVolunteer['status'], endDate?: string): VolunteerStatus {
  if (status === 'DELETED' || status === 'CLOSED' || status === 'COMPLETED') {
    return 'CLOSED';
  }

  if (isPastDate(endDate)) {
    return 'CLOSED';
  }

  return 'RECRUITING';
}

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

function categoryToLabel(category?: string) {
  if (!category) {
    return undefined;
  }

  return CATEGORY_LABELS[category] ?? category;
}

function normalizeVolunteerKeywords(data: ApiVolunteer) {
  const categories = data.selectedCategories?.length
    ? data.selectedCategories
    : data.category
      ? [data.category]
      : [];

  const categoryKeywords = categories.map((category) => categoryToLabel(category) ?? category);

  return categoryKeywords.length > 0 ? categoryKeywords : data.keywords ?? data.summaryTags ?? [];
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
    time: formatLocalTime(time),
  };
}

function formatLocalTime(time?: ApiLocalTime) {
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
