import { apiRequest } from './client';

import type {
  VolunteerApplicationStatus,
  VolunteerPost,
  VolunteerStatus,
} from '@/features/exploration/types';

export type ApiVolunteer = {
  id?: number;
  volunteerId?: number;
  title?: string;
  organization?: string;
  category?: string;
  location?: string;
  startAt?: string;
  endAt?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  recruitmentEndDate?: string;
  capacity?: number;
  neededCount?: number;
  appliedCount?: number;
  applicantCount?: number;
  creditHours?: number;
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
  volunteerId: number;
  status: VolunteerApplicationStatus;
  cancelReason?: string;
  rejectedReason?: string;
  rejectedAt?: string;
  volunteer?: ApiVolunteer;
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
  submittedAt?: string;
  rejectedAt?: string;
  rejectedReason?: string;
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

  return data.map(normalizeVolunteerPost);
}

export async function searchVolunteers(query: string) {
  const params = new URLSearchParams({ query });
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
    body: payload?.cancelReason ? JSON.stringify(payload) : undefined,
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
    body: JSON.stringify(payload ?? {}),
  });
}

export function fetchVolunteerCertification(volunteerId: number) {
  return apiRequest<ApiCertification>(`/api/v1/volunteers/${volunteerId}/certification`);
}

export function verifyVolunteerCheckIn(volunteerId: number, formData: FormData) {
  return apiRequest<{ verified: boolean; message?: string }>(
    `/api/v1/volunteers/${volunteerId}/checkin`,
    {
      method: 'POST',
      body: formData,
    },
  );
}

export function verifyVolunteerCheckOut(volunteerId: number, formData: FormData) {
  return apiRequest<{ verified: boolean; message?: string }>(
    `/api/v1/volunteers/${volunteerId}/checkout`,
    {
      method: 'POST',
      body: formData,
    },
  );
}

export function normalizeVolunteerPost(data: ApiVolunteer): VolunteerPost {
  const id = data.id ?? data.volunteerId ?? 0;
  const start = getDateTimeParts(data.startAt, data.startDate, data.startTime);
  const end = getDateTimeParts(data.endAt, data.endDate, data.endTime);
  const creditHours = data.creditHours ?? getCreditHours(data.startAt, data.endAt);
  const capacity = data.neededCount ?? data.capacity ?? 0;

  return {
    id,
    title: data.title ?? '',
    organization: data.organization ?? data.category ?? '',
    location: data.location ?? '',
    category: data.category ?? data.organization ?? '',
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
    description: data.description ?? '',
    requirements: data.requirements ?? [],
    recruitType: normalizeRecruitType(
      data.recruitType ?? data.recruitmentType ?? data.applicationType,
    ),
    keywords: data.keywords ?? [],
    createdAt: data.createdAt,
    isFavorite: data.isFavorite,
    isApplied: data.isApplied,
    applicationStatus: data.applicationStatus,
  };
}

function normalizeRecruitType(type: ApiVolunteer['recruitType']) {
  if (type === 'fcfs' || type === 'FCFS' || type === 'FIRST_COME') {
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

function getDateTimeParts(dateTime?: string, date?: string, time?: string) {
  if (dateTime) {
    const [datePart = '', timePart = ''] = dateTime.split('T');

    return {
      date: datePart,
      time: timePart.slice(0, 5),
    };
  }

  return {
    date: date ?? '',
    time: time ?? '',
  };
}

function getCreditHours(startAt?: string, endAt?: string) {
  if (!startAt || !endAt) {
    return 0;
  }

  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }

  return Math.round((end - start) / (1000 * 60 * 60));
}
