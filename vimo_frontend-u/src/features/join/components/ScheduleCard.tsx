import { Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { ParticipationButton, StatusBadge } from '@/components/common';

import type { VolunteerSchedule } from '../types';
import {
  formatDateWithDots,
  formatTimeRange,
  getWeekdayLabel,
} from '../utils/date';

export function ScheduleCard({ schedule }: { schedule: VolunteerSchedule }) {
  const postId = schedule.postId ?? schedule.id;
  const displayTime = formatTimeRange(schedule.startTime, schedule.endTime, false);
  const activityTime = formatTimeRange(schedule.startTime, schedule.endTime, true);
  const period = `${formatDateWithDots(schedule.startDate)} ~ ${formatDateWithDots(
    schedule.endDate,
  )} (매주 ${getWeekdayLabel(schedule.repeatWeekday)}요일)`;

  const openDetail = () => {
    router.push(`/volunteer-post/${postId}?mode=confirm` as Href);
  };
  const noop = () => {};

  return (
    <View style={styles.scheduleGroup}>
      <View style={styles.scheduleHeading}>
        <View style={styles.scheduleTimeGroup}>
          <View style={styles.scheduleBullet} />
          <Text style={styles.scheduleTime}>{displayTime}</Text>
        </View>
        <StatusBadge status={schedule.status} />
      </View>

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        onPress={openDetail}>
        <Text style={styles.cardTitle}>{schedule.title}</Text>
        <Text style={styles.credit}>{schedule.credit}</Text>

        <View style={styles.details}>
          <DetailRow icon="location" text={schedule.location} />
          <DetailRow icon="calendar" text={period} />
          <DetailRow icon="clock" text={activityTime} />
        </View>

        <View style={styles.cardActions}>
          <ParticipationButton style={styles.cardAction} onPress={noop} />
          <ParticipationButton style={styles.cardAction} variant="end" onPress={noop} />
        </View>
      </Pressable>
    </View>
  );
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
      <InfoIcon type={icon} />
      <Text numberOfLines={1} style={styles.detailText}>
        {text}
      </Text>
    </View>
  );
}

function InfoIcon({ type }: { type: 'calendar' | 'clock' | 'location' }) {
  if (type === 'location') {
    return (
      <Svg height={12} viewBox="0 0 12 14" width={12}>
        <Path
          d="M6 13s4-4.16 4-7A4 4 0 1 0 2 6c0 2.84 4 7 4 7Z"
          fill="#818181"
        />
        <Circle cx={6} cy={6} fill="#FFFFFF" r={1.5} />
      </Svg>
    );
  }

  if (type === 'calendar') {
    return (
      <Svg height={12} viewBox="0 0 14 14" width={12}>
        <Path
          d="M2 3h10v9H2V3Zm2-2v3m6-3v3M2 6h10"
          fill="none"
          stroke="#818181"
          strokeWidth={1.5}
        />
      </Svg>
    );
  }

  return (
    <Svg height={12} viewBox="0 0 14 14" width={12}>
      <Circle cx={7} cy={7} fill="#818181" r={6} />
      <Path
        d="M7 3.5V7l2.5 1.5"
        fill="none"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeWidth={1.3}
      />
    </Svg>
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
