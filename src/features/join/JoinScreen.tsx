import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AllLine } from '@/components/common';
import { UserGnb } from '@/components/navigation/user-gnb';
import {
  getCurrentUser,
  isUserAuthenticatedInCurrentSession,
} from '@/storage/auth-storage';
import { submitVolunteerActivityCertification } from '@/features/exploration/api';
import { completeVolunteerActivity } from '@/features/exploration/volunteer-interaction-store';

import { CalendarCircle } from './components/CalendarCircle';
import { JoinStatusButton } from './components/JoinStatusButton';
import { ParticipationLogo } from './components/ParticipationLogo';
import { ScheduleCard } from './components/ScheduleCard';
import { getMyVolunteerSchedules } from './api';
import {
  notifyManagerActivityEnded,
  notifyManagerActivityStarted,
} from './manager-notification-service';
import { QrSuccessDialog } from './QrActivityScanScreen';
import type { VolunteerSchedule } from './types';
import {
  addDays,
  getScheduleOccurrenceKeys,
  isSameDay,
  isScheduleOnDate,
  startOfDay,
  startOfWeek,
  toDateKey,
} from './utils/date';

const WEEK_COUNT = 53;
const INITIAL_WEEK_INDEX = Math.floor(WEEK_COUNT / 2);
const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

export function JoinScreen() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [displayedMonth, setDisplayedMonth] = useState(today);
  const [userName, setUserName] = useState('사용자');
  const [schedules, setSchedules] = useState<VolunteerSchedule[]>([]);
  const { qrSuccess, time, postId, startTime } = useLocalSearchParams<{
    qrSuccess?: string;
    time?: string;
    postId?: string;
    startTime?: string;
  }>();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 393);
  const weekListRef = useRef<FlatList<Date[]>>(null);
  const notifiedStartKeyRef = useRef<string | null>(null);
  const notifiedEndKeyRef = useRef<string | null>(null);

  const weeks = useMemo(() => {
    const currentWeekStart = startOfWeek(today);
    return Array.from({ length: WEEK_COUNT }, (_, index) =>
      Array.from({ length: 7 }, (__, dayIndex) =>
        addDays(currentWeekStart, (index - INITIAL_WEEK_INDEX) * 7 + dayIndex),
      ),
    );
  }, [today]);

  const eventDateKeys = useMemo(() => {
    const keys = new Set<string>();

    schedules.forEach((schedule) => {
      getScheduleOccurrenceKeys(schedule).forEach((dateKey) => {
        keys.add(dateKey);
      });
    });

    return keys;
  }, [schedules]);

  const selectedSchedules = schedules.filter((schedule) =>
    isScheduleOnDate(schedule, selectedDate),
  );
  const qrSuccessType = qrSuccess === 'end' ? 'end' : 'start';
  const showQrSuccess = qrSuccess === 'start' || qrSuccess === 'end';
  const qrSuccessTime = typeof time === 'string' && time ? time : '11:30';
  const qrActivityStartTime =
    typeof startTime === 'string' && startTime ? startTime : '11:30';

  useEffect(() => {
    if (!isUserAuthenticatedInCurrentSession()) {
      router.replace('/');
      return;
    }

    getCurrentUser().then((user) => {
      if (user?.name?.trim()) {
        setUserName(user.name.trim());
      }
    });

    getMyVolunteerSchedules()
      .then(setSchedules)
      .catch(() => {
        setSchedules([]);
      });
  }, []);

  useEffect(() => {
    if (qrSuccess !== 'end') {
      return;
    }

    const completedPostId = Number(postId);
    if (Number.isFinite(completedPostId)) {
      completeVolunteerActivity(completedPostId);
      submitVolunteerActivityCertification(completedPostId);
    }

    const notificationKey = `${postId ?? 'unknown'}:${qrActivityStartTime}:${qrSuccessTime}`;
    if (notifiedEndKeyRef.current === notificationKey) {
      return;
    }

    notifiedEndKeyRef.current = notificationKey;

    getCurrentUser().then((user) => {
      notifyManagerActivityEnded({
        studentName: user?.name?.trim() || userName,
        startTime: qrActivityStartTime,
        endTime: qrSuccessTime,
        postId: Number.isFinite(completedPostId) ? completedPostId : undefined,
      });
    });
  }, [postId, qrActivityStartTime, qrSuccess, qrSuccessTime, userName]);

  useEffect(() => {
    if (qrSuccess !== 'start') {
      return;
    }

    const notificationKey = `${postId ?? 'unknown'}:${qrSuccessTime}`;
    if (notifiedStartKeyRef.current === notificationKey) {
      return;
    }

    notifiedStartKeyRef.current = notificationKey;
    const startedPostId = Number(postId);

    getCurrentUser().then((user) => {
      notifyManagerActivityStarted({
        studentName: user?.name?.trim() || userName,
        startTime: qrSuccessTime,
        postId: Number.isFinite(startedPostId) ? startedPostId : undefined,
      });
    });
  }, [postId, qrSuccess, qrSuccessTime, userName]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={[styles.screen, { width: contentWidth }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ParticipationLogo />
            <View style={styles.greetingRow}>
              <Text numberOfLines={1} style={styles.greeting}>
                <Text style={styles.userName}>{userName}</Text>님, 안녕하세요!
              </Text>
              <JoinStatusButton onPress={() => router.push('/application-status')} />
            </View>
            <Text style={styles.month}>
              {displayedMonth.getFullYear()}년 {displayedMonth.getMonth() + 1}월
            </Text>
          </View>

          <FlatList
            ref={weekListRef}
            data={weeks}
            getItemLayout={(_, index) => ({
              index,
              length: contentWidth,
              offset: contentWidth * index,
            })}
            horizontal
            initialScrollIndex={INITIAL_WEEK_INDEX}
            keyExtractor={(_, index) => String(index)}
            pagingEnabled
            renderItem={({ item: week }) => (
              <View style={[styles.week, { width: contentWidth }]}>
                {week.map((date, index) => {
                  const isSelected = isSameDay(date, selectedDate);
                  const isToday = isSameDay(date, today);
                  const hasEvent = eventDateKeys.has(toDateKey(date));

                  return (
                    <Pressable
                      key={toDateKey(date)}
                      accessibilityLabel={`${date.getMonth() + 1}월 ${date.getDate()}일`}
                      accessibilityState={{ selected: isSelected }}
                      style={styles.day}
                      onPress={() => {
                        setSelectedDate(date);
                        setDisplayedMonth(date);
                      }}>
                      <View style={styles.eventDotSlot}>
                        {hasEvent && (
                          <View style={[styles.eventDot, isToday && styles.todayEventDot]} />
                        )}
                      </View>
                      <Text style={[styles.weekday, isToday && styles.todayText]}>
                        {WEEKDAY_LABELS[index]}
                      </Text>
                      <View style={styles.dateSlot}>
                        {isSelected && <CalendarCircle />}
                        <Text style={[styles.date, isToday && styles.todayText]}>
                          {date.getDate()}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
            showsHorizontalScrollIndicator={false}
            style={styles.calendarList}
            onMomentumScrollEnd={(event) => {
              const pageIndex = Math.round(event.nativeEvent.contentOffset.x / contentWidth);
              const visibleWeek = weeks[pageIndex];
              if (visibleWeek) {
                setDisplayedMonth(visibleWeek[3]);
              }
            }}
          />

          <AllLine />

          <View style={styles.scheduleSection}>
            {selectedSchedules.length > 0 ? (
              selectedSchedules.map((schedule) => (
                <ScheduleCard key={schedule.id} schedule={schedule} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>예정된 봉사 일정이 없어요</Text>
                <Text style={styles.emptyDescription}>다른 날짜를 선택해 확인해 보세요.</Text>
              </View>
            )}
          </View>
        </ScrollView>

        <UserGnb activeKey="participation" />
        {showQrSuccess ? (
          <QrSuccessDialog
            time={qrSuccessTime}
            type={qrSuccessType}
            onConfirm={() => router.replace('/explore')}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9F9FB',
  },
  screen: {
    flex: 1,
    backgroundColor: '#F9F9FB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 126,
  },
  header: {
    paddingHorizontal: 30,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 7,
  },
  greeting: {
    flex: 1,
    color: '#111111',
    fontFamily: 'Pretendard',
    fontSize: 20,
    fontWeight: '400',
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  userName: {
    fontWeight: '500',
  },
  month: {
    marginTop: 20,
    color: '#111111',
    fontFamily: 'Pretendard',
    fontSize: 20,
    fontWeight: '700',
  },
  calendarList: {
    height: 143,
    flexGrow: 0,
    flexShrink: 0,
  },
  week: {
    height: 143,
    flexDirection: 'row',
    paddingHorizontal: 22,
    paddingTop: 30,
  },
  day: {
    flex: 1,
    alignItems: 'center',
  },
  eventDotSlot: {
    height: 12,
    justifyContent: 'flex-start',
  },
  eventDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#C7C7C7',
  },
  todayEventDot: {
    backgroundColor: '#222222',
  },
  weekday: {
    color: '#818181',
    opacity: 0.5,
    fontFamily: 'Pretendard',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: -0.425,
  },
  dateSlot: {
    width: 43,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  date: {
    color: '#818181',
    opacity: 0.5,
    fontFamily: 'Pretendard',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: -0.425,
  },
  todayText: {
    color: '#222222',
    opacity: 1,
    fontWeight: '700',
  },
  scheduleSection: {
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 30,
  },
  emptyState: {
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: '#222222',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyDescription: {
    marginTop: 8,
    color: '#818181',
    fontSize: 13,
  },
});
