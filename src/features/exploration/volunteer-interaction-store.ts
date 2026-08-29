import type { VolunteerPost } from './types';

type Listener = () => void;
const APPROVAL_NOTICE_SEEN_IDS_KEY = 'vimo.approvalNoticeSeenIds';

type VolunteerInteractionState = {
  favoriteIds: number[];
  appliedIds: number[];
  approvedIds: number[];
  activityCompletedIds: number[];
  certificationCompletedIds: number[];
  certificationRejectedRecords: CertificationRejectedRecord[];
  approvalNoticeSeenIds: number[];
};

export type CertificationRejectedRecord = {
  id: number;
  rejectedAt: string;
  reason: string;
};

export type CertificationStatusRecord = {
  volunteerId: number;
  status: string;
  rejectedAt?: string;
  rejectedReason?: string;
};

let state: VolunteerInteractionState = {
  favoriteIds: [],
  appliedIds: [],
  approvedIds: [],
  activityCompletedIds: [],
  certificationCompletedIds: [],
  certificationRejectedRecords: [],
  approvalNoticeSeenIds: readStoredApprovalNoticeSeenIds(),
};

const listeners = new Set<Listener>();
let volunteerPostsSnapshot: VolunteerPost[] = [];

export function subscribeVolunteerInteractions(listener: Listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getVolunteerPostsSnapshot() {
  return volunteerPostsSnapshot;
}

export function setVolunteerPostsSnapshot(posts: VolunteerPost[]) {
  volunteerPostsSnapshot = posts;
  notify();
}

export function getVolunteerInteractionsSnapshot() {
  return state;
}

export function resetVolunteerInteractions() {
  state = {
    favoriteIds: [],
    appliedIds: [],
    approvedIds: [],
    activityCompletedIds: [],
    certificationCompletedIds: [],
    certificationRejectedRecords: [],
    approvalNoticeSeenIds: readStoredApprovalNoticeSeenIds(),
  };
  volunteerPostsSnapshot = [];
  notify();
}

export function toggleVolunteerFavorite(id: number) {
  setVolunteerFavorite(id, !state.favoriteIds.includes(id));
}

export function setVolunteerFavorite(id: number, isFavorite: boolean) {
  state = {
    ...state,
    favoriteIds: isFavorite
      ? unique([...state.favoriteIds, id])
      : state.favoriteIds.filter((favoriteId) => favoriteId !== id),
  };
  notify();
}

export function applyVolunteerPost(id: number) {
  if (state.appliedIds.includes(id)) {
    return;
  }

  state = {
    ...state,
    appliedIds: [...state.appliedIds, id],
  };
  notify();
}

export function submitVolunteerApplication(id: number) {
  applyVolunteerPost(id);
}

export function approveVolunteerApplication(id: number) {
  state = {
    ...state,
    appliedIds: state.appliedIds.includes(id) ? state.appliedIds : [...state.appliedIds, id],
    approvedIds: state.approvedIds.includes(id) ? state.approvedIds : [...state.approvedIds, id],
  };
  notify();
}

export function completeVolunteerActivity(id: number) {
  state = {
    ...state,
    activityCompletedIds: state.activityCompletedIds.includes(id)
      ? state.activityCompletedIds
      : [...state.activityCompletedIds, id],
  };
  notify();
}

export function rejectVolunteerCertification(record: CertificationRejectedRecord) {
  const nextRejectedRecords = state.certificationRejectedRecords.some(
    (rejectedRecord) => rejectedRecord.id === record.id,
  )
    ? state.certificationRejectedRecords.map((rejectedRecord) =>
        rejectedRecord.id === record.id ? record : rejectedRecord,
      )
    : [...state.certificationRejectedRecords, record];

  state = {
    ...state,
    activityCompletedIds: state.activityCompletedIds.includes(record.id)
      ? state.activityCompletedIds
      : [...state.activityCompletedIds, record.id],
    certificationCompletedIds: state.certificationCompletedIds.filter(
      (completedId) => completedId !== record.id,
    ),
    certificationRejectedRecords: nextRejectedRecords,
  };
  notify();
}

export function completeVolunteerCertification(id: number) {
  state = {
    ...state,
    activityCompletedIds: state.activityCompletedIds.includes(id)
      ? state.activityCompletedIds
      : [...state.activityCompletedIds, id],
    certificationCompletedIds: state.certificationCompletedIds.includes(id)
      ? state.certificationCompletedIds
      : [...state.certificationCompletedIds, id],
    certificationRejectedRecords: state.certificationRejectedRecords.filter(
      (rejectedRecord) => rejectedRecord.id !== id,
    ),
  };
  notify();
}

export function mergeCertificationStatusRecords(records: CertificationStatusRecord[]) {
  if (records.length === 0) {
    return;
  }

  const pendingIds = records
    .filter((record) => record.status === 'COMPLETED')
    .map((record) => record.volunteerId);
  const completedIds = records
    .filter((record) => record.status === 'CERTIFIED')
    .map((record) => record.volunteerId);
  const rejectedRecords = records
    .filter(
      (record) =>
        record.status === 'REJECTED' ||
        record.status === 'CERTIFICATION_REJECTED' ||
        record.status === 'ABSENT',
    )
    .map((record) => ({
      id: record.volunteerId,
      rejectedAt: record.rejectedAt ?? new Date().toISOString(),
      reason: record.rejectedReason ?? '반려 사유를 확인해 주세요.',
    }));
  const rejectedIds = new Set(rejectedRecords.map((record) => record.id));
  const nextRejectedRecords = [
    ...state.certificationRejectedRecords.filter((record) => !rejectedIds.has(record.id)),
    ...rejectedRecords,
  ];

  state = {
    ...state,
    activityCompletedIds: unique([
      ...state.activityCompletedIds,
      ...pendingIds,
      ...completedIds,
      ...rejectedRecords.map((record) => record.id),
    ]),
    certificationCompletedIds: unique([
      ...state.certificationCompletedIds.filter((id) => !rejectedIds.has(id)),
      ...completedIds,
    ]),
    certificationRejectedRecords: nextRejectedRecords,
  };
  notify();
}

export function getPendingApprovalConfirmationId() {
  return (
    state.approvedIds.find((approvedId) => !state.approvalNoticeSeenIds.includes(approvedId)) ??
    null
  );
}

export function markApprovalConfirmationSeen(id: number) {
  if (state.approvalNoticeSeenIds.includes(id)) {
    return;
  }

  const approvalNoticeSeenIds = [...state.approvalNoticeSeenIds, id];

  state = {
    ...state,
    approvalNoticeSeenIds,
  };
  writeStoredApprovalNoticeSeenIds(approvalNoticeSeenIds);
  notify();
}

export function cancelVolunteerApplication(id: number) {
  state = {
    ...state,
    appliedIds: state.appliedIds.filter((appliedId) => appliedId !== id),
  };
  notify();
}

export function mergeVolunteerInteractionsFromPosts(posts: VolunteerPost[]) {
  const hasFavoriteFlags = posts.some((post) => typeof post.isFavorite === 'boolean');
  const hasApplicationFlags = posts.some(
    (post) => typeof post.isApplied === 'boolean' || typeof post.applicationStatus === 'string',
  );

  if (!hasFavoriteFlags && !hasApplicationFlags) {
    return;
  }

  const favoriteIds = hasFavoriteFlags
    ? posts.filter((post) => post.isFavorite).map((post) => post.id)
    : state.favoriteIds;
  const appliedIds = hasApplicationFlags
    ? posts
        .filter((post) => post.isApplied || isAppliedStatus(post.applicationStatus))
        .map((post) => post.id)
    : state.appliedIds;
  const approvedIds = hasApplicationFlags
    ? posts.filter((post) => post.applicationStatus === 'APPROVED').map((post) => post.id)
    : state.approvedIds;

  state = {
    ...state,
    favoriteIds,
    appliedIds,
    approvedIds,
  };
  notify();
}

export function getSearchableVolunteerText(post: VolunteerPost) {
  return [post.title, post.organization, post.location, post.category].join(' ').toLowerCase();
}

function notify() {
  listeners.forEach((listener) => listener());
}

function isAppliedStatus(status: VolunteerPost['applicationStatus']) {
  return (
    status === 'PENDING' ||
    status === 'APPROVED' ||
    status === 'REJECTED' ||
    status === 'ATTENDED' ||
    status === 'COMPLETED' ||
    status === 'CERTIFIED' ||
    status === 'CERTIFICATION_REJECTED' ||
    status === 'ABSENT'
  );
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function readStoredApprovalNoticeSeenIds() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(APPROVAL_NOTICE_SEEN_IDS_KEY);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter((id): id is number => typeof id === 'number');
  } catch {
    return [];
  }
}

function writeStoredApprovalNoticeSeenIds(ids: number[]) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(APPROVAL_NOTICE_SEEN_IDS_KEY, JSON.stringify(unique(ids)));
  } catch {
    // Persistence is best-effort; in-memory state still prevents repeat within the session.
  }
}
