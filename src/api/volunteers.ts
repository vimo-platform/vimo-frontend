import { apiRequest } from './client';

import type {
  VolunteerApplicationStatus,
  VolunteerPost,
  VolunteerStatus,
} from '@/features/exploration/types';

export type ApiVolunteer = {
  id?: number;
  volunteerId?: number;
  studentId?: string;
  departmentName?: string;
  title?: string;
  organization?: string;
  category?: string;
  content?: string;
  summaryTags?: string[];
  location?: string;
  startAt?: string;
  endAt?: string;
  volunteerDate?: string;
  startDate?: string;
  endDate?: string;
  startTime?: ApiLocalTime;
  endTime?: ApiLocalTime;
  recruitmentEndDate?: string;
  capacity?: number;
  maxParticipants?: number;
  neededCount?: number;
  appliedCount?: number;
  applicantCount?: number;
  creditHours?: number;
  rewardHours?: number;
  status?: VolunteerStatus | string;
  participationCondition?: string;
  cancelPolicy?: string;
  guideTitle?: string;
  description?: string;
  requirements?: string[];
  recruitType?: 'selection' | 'fcfs' | string;
  recruitmentType?: 'selection' | 'fcfs' | string;
  applicationType?: 'selection' | 'fcfs' | string;
  keywords?: string[];
  createdAt?: string;
  isFavorite?: boolean;
  isApplied?: boolean;
  applicationStatus?: VolunteerApplicationStatus;
};

export type ApiApplication = {
  id?: number;
  applicationId?: number;
  volunteerId: number;
  status: VolunteerApplicationStatus;
  applicationStatus?: VolunteerApplicationStatus;
  cancelReason?: string;
  rejectedReason?: string;
  rejectReason?: string;
  certificationRejectReason?: string;
  rejectedAt?: string;
  volunteer?: ApiVolunteer;
  title?: string;
  category?: string;
  location?: string;
  startAt?: string;
  endAt?: string;
};

type ApiLocalTime =
  | string
  | {
      hour?: number;
      minute?: number;
      second?: number;
      nano?: number;
    };

export type ApiCertificationStatus =
  | 'PENDING'
  | 'REJECTED'
  | 'APPROVED'
  | 'COMPLETED'
  | string;

export type ApiCertification = {
  volunteerId: number;
  status: ApiCertificationStatus;
  applicationStatus?: ApiCertificationStatus;
  submittedAt?: string;
  rejectedAt?: string;
  rejectedReason?: string;
  rejectReason?: string;
  certificationRejectReason?: string;
  volunteer?: ApiVolunteer;
};

export type SubmitCertificationPayload = {
  startedAt?: string;
  endedAt?: string;
  checkInQrValue?: string;
  checkOutQrValue?: string;
  note?: string;
};

export type VolunteerQrVerifyPayload = {
  volunteerId: number;
  type: 'start' | 'end';
  qrImage?: FormData;
  qrValue?: string | null;
};

export async function fetchVolunteers() {
  const data = await apiRequest<ApiVolunteer[]>('/api/v1/volunteers');
  const detailedData = await Promise.all(
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

  return detailedData.map(normalizeVolunteerPost);
}

export async function searchVolunteers(query: string) {
  const params = new URLSearchParams({ keyword: query });
  const data = await apiRequest<ApiVolunteer[]>(`/api/v1/volunteers/search?${params.toString()}`);

  return data.map(normalizeVolunteerPost);
}

export async function fetchRecommendedVolunteers() {
  const data = await apiRequest<ApiVolunteer[]>('/api/v1/volunteers/recommendations');

  return data.map(normalizeVolunteerPost);
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

  return data.map(normalizeVolunteerPost);
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

export function submitVolunteerCertification(
  volunteerId: number,
  payload?: SubmitCertificationPayload,
) {
  return apiRequest<ApiCertification>(`/api/v1/volunteers/${volunteerId}/certification`, {
    method: 'POST',
    body: JSON.stringify({ qrToken: payload?.checkOutQrValue ?? payload?.checkInQrValue ?? '' }),
  });
}

export function fetchVolunteerCertification(volunteerId: number) {
  return apiRequest<ApiCertification>(`/api/v1/volunteers/${volunteerId}/certification`);
}

export async function verifyVolunteerCheckIn(volunteerId: number, qrToken: string) {
  const result = await apiRequest<ApiApplication>(`/api/v1/volunteers/${volunteerId}/checkin`, {
    method: 'POST',
    body: JSON.stringify({ qrToken }),
  });

  return {
    verified: isSuccessfulQrStatus(result.status ?? result.applicationStatus),
    message: result.status ?? result.applicationStatus,
  };
}

export async function verifyVolunteerCheckOut(volunteerId: number, qrToken: string) {
  const result = await apiRequest<ApiApplication>(`/api/v1/volunteers/${volunteerId}/checkout`, {
    method: 'POST',
    body: JSON.stringify({ qrToken }),
  });

  return {
    verified: isSuccessfulQrStatus(result.status ?? result.applicationStatus),
    message: result.status ?? result.applicationStatus,
  };
}

export function normalizeVolunteerPost(data: ApiVolunteer): VolunteerPost {
  const id = data.id ?? data.volunteerId ?? 0;
  const start = getDateTimeParts(data.startAt, data.volunteerDate ?? data.startDate, data.startTime);
  const end = getDateTimeParts(data.endAt, data.volunteerDate ?? data.endDate, data.endTime);
  const creditHours =
    data.creditHours ??
    data.rewardHours ??
    getCreditHoursFromParts(start.date, start.time, end.date, end.time);
  const capacity = data.neededCount ?? data.capacity ?? data.maxParticipants ?? 0;

  return {
    id,
    title: data.title ?? '',
    organization: data.organization ?? data.departmentName ?? data.category ?? '',
    location: data.location ?? '',
    category: data.category ?? data.organization ?? data.departmentName ?? '',
    startDate: start.date,
    endDate: end.date,
    startTime: start.time,
    endTime: end.time,
    recruitmentEndDate: data.recruitmentEndDate ?? start.date,
    neededCount: capacity,
    appliedCount: data.appliedCount ?? data.applicantCount ?? 0,
    creditHours,
    status: normalizeVolunteerStatus(data.status),
    participationCondition: data.participationCondition ?? '정기 참여 가능자 우대',
    cancelPolicy: data.cancelPolicy ?? '취소 불가',
    guideTitle: data.guideTitle ?? '모집 안내',
    description: data.description ?? data.content ?? '',
    requirements: data.requirements ?? data.summaryTags ?? [],
    recruitType: normalizeRecruitType(
      data.recruitType ?? data.recruitmentType ?? data.applicationType,
    ),
    keywords: data.keywords ?? data.summaryTags ?? (data.category ? [data.category] : []),
    createdAt: data.createdAt,
    isFavorite: data.isFavorite,
    isApplied: data.isApplied,
    applicationStatus: data.applicationStatus,
  };
}

function normalizeRecruitType(type: ApiVolunteer['recruitType']) {
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

function normalizeVolunteerStatus(status: ApiVolunteer['status']): VolunteerStatus {
  if (status === 'CLOSED' || status === 'COMPLETED') {
    return status;
  }

  return 'RECRUITING';
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

  // 회차(하루) 기준 인정 시간: 여러 날에 걸친 공고여도 시작일의 시작~종료 시간으로 계산
  const start = new Date(`${startDate}T${startTime}:00`).getTime();
  const end = new Date(`${startDate}T${endTime}:00`).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }

  return Math.round((end - start) / (1000 * 60 * 60));
}

function isSuccessfulQrStatus(status?: string) {
  return status === 'ATTENDED' || status === 'COMPLETED' || status === 'CERTIFIED';
}
