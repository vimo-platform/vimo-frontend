import { mockVolunteerPosts } from './mock';
import type { VolunteerPost } from './types';

type Listener = () => void;

type VolunteerInteractionState = {
  favoriteIds: number[];
  appliedIds: number[];
  approvedIds: number[];
  activityCompletedIds: number[];
  certificationCompletedIds: number[];
  approvalNoticeSeenIds: number[];
};

let state: VolunteerInteractionState = {
  favoriteIds: [101],
  appliedIds: [],
  approvedIds: [],
  activityCompletedIds: [101],
  certificationCompletedIds: [102],
  approvalNoticeSeenIds: [],
};

const listeners = new Set<Listener>();
let volunteerPostsSnapshot = mockVolunteerPosts;

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

export function toggleVolunteerFavorite(id: number) {
  state = {
    ...state,
    favoriteIds: state.favoriteIds.includes(id)
      ? state.favoriteIds.filter((favoriteId) => favoriteId !== id)
      : [...state.favoriteIds, id],
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

export function completeVolunteerCertification(id: number) {
  state = {
    ...state,
    activityCompletedIds: state.activityCompletedIds.includes(id)
      ? state.activityCompletedIds
      : [...state.activityCompletedIds, id],
    certificationCompletedIds: state.certificationCompletedIds.includes(id)
      ? state.certificationCompletedIds
      : [...state.certificationCompletedIds, id],
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

  state = {
    ...state,
    approvalNoticeSeenIds: [...state.approvalNoticeSeenIds, id],
  };
  notify();
}

export function cancelVolunteerApplication(id: number) {
  state = {
    ...state,
    appliedIds: state.appliedIds.filter((appliedId) => appliedId !== id),
  };
  notify();
}

export function getSearchableVolunteerText(post: VolunteerPost) {
  return [post.title, post.organization, post.location, post.category].join(' ').toLowerCase();
}

function notify() {
  listeners.forEach((listener) => listener());
}
