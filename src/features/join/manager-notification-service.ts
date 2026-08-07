import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

type ActivityStartNotificationPayload = {
  studentName: string;
  startTime: string;
  postId?: number;
};

type ActivityEndNotificationPayload = {
  studentName: string;
  startTime: string;
  endTime: string;
  postId?: number;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function notifyManagerActivityStarted({
  studentName,
  startTime,
  postId,
}: ActivityStartNotificationPayload) {
  await scheduleManagerNotification({
    title: `${studentName} (${startTime}) 활동 시작 알림`,
    body: '현장에서 봉사 활동이 시작되었습니다.',
    badge: 1,
    data: {
      kind: 'activity-start',
      postId,
    },
  });
}

export async function notifyManagerActivityEnded({
  studentName,
  startTime,
  endTime,
  postId,
}: ActivityEndNotificationPayload) {
  await scheduleManagerNotification({
    title: `${studentName} 봉사활동 인증 필요`,
    body: '학생의 활동이 정상 종료되었어요.\n봉사 시간 자동 연동을 위해 승인해주세요.',
    badge: 1,
    data: {
      kind: 'activity-certification-required',
      postId,
      startTime,
      endTime,
    },
  });

  await scheduleManagerNotification({
    title: `${studentName} (${endTime}) 활동 완료 알림`,
    body: `${startTime}~${endTime}분 봉사 활동이 종료되었습니다.`,
    badge: 1,
    data: {
      kind: 'activity-complete',
      postId,
      startTime,
      endTime,
    },
  });
}

async function scheduleManagerNotification({
  title,
  body,
  badge,
  data,
}: {
  title: string;
  body: string;
  badge: number;
  data: Record<string, string | number | undefined>;
}) {
  // Real manager-device push needs a backend/APNs request. Until then this mirrors
  // the iOS notification copy locally from the QR success point.
  if (Platform.OS === 'web') {
    return;
  }

  const permission = await ensureNotificationPermission();
  if (!permission) {
    return;
  }

  await Notifications.setBadgeCountAsync(badge);
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      badge,
      data,
    },
    trigger: null,
  });
}

async function ensureNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}
