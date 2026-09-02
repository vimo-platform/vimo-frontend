import { Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ParticipationButton, StatusBadge } from '@/components/common';
import { VolunteerInfoIcon } from '@/components/common/VolunteerInfoIcon';

import type { VolunteerSchedule } from '@/types/join/types';
import {
  formatDateWithDots,
  formatTimeRange,
  getWeekdayLabel,
} from '@/utils/join/date';

export function ScheduleCard({ schedule }: { schedule: VolunteerSchedule }) {
  const postId = schedule.postId ?? schedule.id;
  const hasStarted = schedule.applicationStatus === 'ATTENDED';
  const displayTime = formatTimeRange(schedule.startTime, schedule.endTime, false);
  const activityTime = formatTimeRange(schedule.startTime, schedule.endTime, true);
  const dateRange = `${formatDateWithDots(schedule.startDate)} ~ ${formatDateWithDots(
    schedule.endDate,
  )}`;
  const repeatWeekday = schedule.repeatWeekday;
  const isWeeklySchedule =
    getInclusiveDayCount(schedule.startDate, schedule.endDate) >= 8 &&
    typeof repeatWeekday === 'number';
  const period = isWeeklySchedule
    ? `${dateRange} (매주 ${getWeekdayLabel(repeatWeekday)}요일)`
    : dateRange;

  const openDetail = () => {
    router.push(`/volunteer-post/${postId}?mode=confirm` as Href);
  };

  const openStartQrScan = () => {
    router.push(
      `/volunteer-qr-scan?postId=${postId}&type=start&startTime=${encodeURIComponent(
        schedule.startTime,
      )}` as Href,
    );
  };

  const openEndQrScan = () => {
    router.push(
      `/volunteer-qr-scan?postId=${postId}&type=end&startTime=${encodeURIComponent(
        schedule.startTime,
      )}&endTime=${encodeURIComponent(schedule.endTime)}` as Href,
    );
  };

  return (
    <View style={styles.scheduleGroup}>
      <View style={styles.scheduleHeading}>
        <View style={styles.scheduleTimeGroup}>
          <View style={styles.scheduleBullet} />
          <Text style={styles.scheduleTime}>{displayTime}</Text>
        </View>
        <StatusBadge status={schedule.status} />
      </View>

      <View style={styles.card}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.cardContent, pressed && styles.pressed]}
          onPress={openDetail}>
          <Text style={styles.cardTitle}>{schedule.title}</Text>
          <Text style={styles.credit}>{schedule.credit}</Text>

          <View style={styles.details}>
            <DetailRow icon="location" text={schedule.location} />
            <DetailRow icon="calendar" text={period} />
            <DetailRow icon="clock" text={activityTime} />
          </View>
        </Pressable>

        <View style={styles.cardActions}>
          <ParticipationButton
            disabled={hasStarted}
            style={styles.cardAction}
            onPress={openStartQrScan}
          />
          <ParticipationButton
            disabled={!hasStarted}
            style={styles.cardAction}
            variant="end"
            onPress={openEndQrScan}
          />
        </View>
      </View>
    </View>
  );
}

function getInclusiveDayCount(startDate: string, endDate: string) {
  const start = parseDateKey(startDate).getTime();
  const end = parseDateKey(endDate).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return 1;
  }

  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function DetailRow({
  icon,
  text,
}: {
  icon: 'calendar' | 'clock' | 'location';
  text: string;
}) {
  return (
      <View style={styles.detailRow}>
      <VolunteerInfoIcon type={icon} />
      <Text numberOfLines={1} style={styles.detailText}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scheduleGroup: {
    width: '100%',
    maxWidth: 330,
  },
  scheduleHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  scheduleTimeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scheduleBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#222222',
  },
  scheduleTime: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 25,
    letterSpacing: -0.45,
  },
  card: {
    minHeight: 241,
    paddingHorizontal: 26,
    paddingTop: 26,
    paddingBottom: 16,
    borderWidth: 1,
    borderColor: '#9C9C9C',
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 5, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 19,
    elevation: 6,
  },
  cardContent: {
    marginHorizontal: -26,
    marginTop: -26,
    paddingHorizontal: 26,
    paddingTop: 26,
    paddingBottom: 1,
  },
  cardTitle: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 15,
    fontWeight: '800',
  },
  credit: {
    marginTop: 10,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 12,
    fontWeight: '500',
  },
  details: {
    gap: 7,
    marginTop: 18,
  },
  detailRow: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  detailText: {
    flex: 1,
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 13,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 24,
    paddingHorizontal: 8,
  },
  cardAction: {
    flex: 1,
    width: undefined,
  },
  pressed: {
    opacity: 0.86,
  },
});
