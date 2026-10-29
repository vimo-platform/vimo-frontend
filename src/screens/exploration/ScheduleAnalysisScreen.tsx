import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Tag } from '@/components/common';
import { LoadingOverlay, LOADING_FILL_DURATION_MS } from '@/components/common/LoadingOverlay';
import { useUserSessionGuard } from '@/hooks/common/use-user-session-guard';
import { isAuthError } from '@/services/common/client';
import { getScheduleAnalysisErrorMessage, TimetableError } from '@/services/exploration/schedule-analysis-errors';
import type { ApiLocalTime, ClassSlot } from '@/services/common/user-setup';

import {
  analyzeScheduleImage,
  getSavedScheduleAnalysis,
  saveScheduleAnalysisSelection,
  type ScheduleAnalysisResult,
} from '@/services/exploration/schedule-analysis-api';
import { setScheduleRecommendationFromAnalysis } from '@/services/exploration/customized-recommendation-store';

const EXPLORATION_STAR = require('@/assets/images/explorationimg/explorationstar.png');

type AnalysisPhase = 'loading' | 'complete' | 'error';

export function ScheduleAnalysisScreen() {
  const { imageUri, source } = useLocalSearchParams<{ imageUri?: string; source?: string }>();
  const uploadedImageUri = typeof imageUri === 'string' && imageUri ? imageUri : undefined;
  const isSavedScheduleView = source === 'saved';

  return (
    <ScheduleAnalysisContent
      key={`${isSavedScheduleView ? 'saved' : 'upload'}:${uploadedImageUri ?? ''}`}
      uploadedImageUri={uploadedImageUri}
      isSavedScheduleView={isSavedScheduleView}
    />
  );
}

function ScheduleAnalysisContent({ uploadedImageUri, isSavedScheduleView }: {
  uploadedImageUri?: string;
  isSavedScheduleView: boolean;
}) {
  useUserSessionGuard();

  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 393);
  const [phase, setPhase] = useState<AnalysisPhase>('loading');
  const [analysis, setAnalysis] = useState<ScheduleAnalysisResult | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [showKeywordError, setShowKeywordError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [needsLogin, setNeedsLogin] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [completeOpacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let mounted = true;
    let timedOut = false;
    let loadingTimer: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();
    let timeoutTimer: ReturnType<typeof setTimeout> | undefined;
    const deadline = new Promise<never>((_, reject) => {
      timeoutTimer = setTimeout(() => {
        timedOut = true;
        controller.abort();
        reject(new TimetableError('시간표 요청 시간이 초과되었어요. 다시 시도해 주세요.'));
      }, 60_000);
    });

    const request = isSavedScheduleView
      ? getSavedScheduleAnalysis({ throwOnError: true, signal: controller.signal }).then((savedAnalysis) => {
          if (!savedAnalysis?.classes.length) throw new TimetableError('저장된 수업 정보가 없어요. 시간표 사진을 다시 등록해 주세요.');
          return savedAnalysis;
        })
      : analyzeScheduleImage(uploadedImageUri, controller.signal);

    Promise.all([
      Promise.race([request, deadline]),
      isSavedScheduleView
        ? Promise.resolve()
        : new Promise((resolve) => { loadingTimer = setTimeout(resolve, LOADING_FILL_DURATION_MS); }),
    ]).then(([result]) => {
      if (!mounted) return;

      setAnalysis(result);
      setSelectedKeywords(isSavedScheduleView ? result?.recommendedKeywords ?? [] : []);
      setPhase('complete');
    }).catch((error: unknown) => {
      if (!mounted) return;
      setErrorMessage(timedOut
        ? '분석 시간이 오래 걸리고 있어요. 인터넷 연결을 확인하고 다시 시도해 주세요.'
        : getScheduleAnalysisErrorMessage(error));
      setNeedsLogin(isAuthError(error));
      setPhase('error');
    }).finally(() => {
      clearTimeout(timeoutTimer);
      clearTimeout(loadingTimer);
    });

    return () => {
      mounted = false;
      controller.abort();
      clearTimeout(timeoutTimer);
      clearTimeout(loadingTimer);
    };
  }, [isSavedScheduleView, uploadedImageUri, retryAttempt]);

  useEffect(() => {
    if (phase !== 'complete') {
      return;
    }

    completeOpacity.setValue(0);
    const animation = Animated.timing(completeOpacity, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [completeOpacity, phase]);
  const keywordOptions = useMemo(
    () => analysis?.recommendedKeywords ?? [],
    [analysis],
  );

  const toggleKeyword = (keyword: string) => {
    setShowKeywordError(false);
    setSelectedKeywords((current) =>
      current.includes(keyword)
        ? current.filter((item) => item !== keyword)
        : [...current, keyword],
    );
  };

  const retryAnalysis = () => {
    setPhase('loading');
    setAnalysis(null);
    setSelectedKeywords([]);
    setShowKeywordError(false);
    setErrorMessage('');
    setNeedsLogin(false);
    setRetryAttempt((attempt) => attempt + 1);
  };

  const handleSave = async () => {
    if (isSaving || !analysis || phase !== 'complete') return;
    if (selectedKeywords.length === 0) {
      setShowKeywordError(true);
      return;
    }

    setIsSaving(true);
    try {
      await saveScheduleAnalysisSelection(analysis, selectedKeywords);
      setScheduleRecommendationFromAnalysis({
        scheduleItems: analysis.scheduleItems,
        freeTimeSlots: analysis.freeTimeSlots,
        selectedKeywords,
        timetableImageUrl: analysis.timetableImageUrl,
      });
      router.replace('/search');
    } catch (error) {
      Alert.alert('시간표 저장 실패', getScheduleAnalysisErrorMessage(error), isAuthError(error)
        ? [{ text: '다시 로그인', onPress: () => router.replace('/') }]
        : undefined);
    } finally {
      setIsSaving(false);
    }
  };

  if (phase === 'loading') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.loadingScreen, { width: contentWidth }]}> 
          <LoadingOverlay message="시간표를 읽고 있어요" />
          <View style={styles.homeIndicator} />
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'error') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.screen, { width: contentWidth }]}>
          <ScrollView contentContainerStyle={styles.failureContent}>
            <Text accessibilityRole="header" style={styles.failureTitle}>
              {isSavedScheduleView ? '시간표를 불러오지 못했어요' : '시간표를 분석하지 못했어요'}
            </Text>
            <Text accessibilityLiveRegion="polite" style={styles.failureMessage}>{errorMessage}</Text>
            <Button
              label={needsLogin ? '다시 로그인' : '다시 시도'}
              style={styles.nextButton}
              onPress={() => needsLogin ? router.replace('/') : retryAnalysis()}
            />
            {!needsLogin ? (
              <Button
                label="사진 다시 선택"
                variant="secondary"
                style={styles.nextButton}
                onPress={() => router.replace('/schedule-register')}
              />
            ) : null}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.screen, { width: contentWidth, opacity: completeOpacity }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <Image resizeMode="contain" source={EXPLORATION_STAR} style={styles.completeStar} />

          <View style={styles.headerTextGroup}>
            <Text style={styles.title}>시간표 분석이 완료되었어요!</Text>
            <Text style={styles.description}>수정이 필요한 경우 각 과목을 클릭해주세요</Text>
          </View>

          <View style={styles.timetableCard}>
            <AnalyzedTimetable classes={analysis?.classes ?? []} />
          </View>

          <SectionTitle
            description="관심 있는 키워드를 골라주세요"
            title="이런 분야에 관심 있어 보여요"
          />
          <View style={styles.keywordGrid}>
            {chunkKeywords(keywordOptions, 3).map((row, rowIndex) => (
              <View key={`keyword-row-${rowIndex}`} style={styles.keywordGridRow}>
                {row.map((keyword) => (
                  <Tag
                    key={keyword}
                    label={keyword}
                    selected={selectedKeywords.includes(keyword)}
                    size="compact"
                    onPress={() => toggleKeyword(keyword)}
                  />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.bottomButtonWrap}>
          {showKeywordError ? (
            <Text style={styles.keywordErrorText}>1개 이상의 키워드를 선택하세요</Text>
          ) : null}
          <Button
            label={isSaving ? '저장 중' : '다음'}
            disabled={isSaving}
            style={styles.nextButton}
            onPress={handleSave}
          />
        </View>
        <View style={styles.completeHomeIndicator} />
      </Animated.View>
    </SafeAreaView>
  );
}

function chunkKeywords(keywords: string[], size: number) {
  const rows: string[][] = [];

  for (let index = 0; index < keywords.length; index += size) {
    rows.push(keywords.slice(index, index + size));
  }

  return rows;
}

function SectionTitle({
  title,
  description,
  style,
}: {
  title: string;
  description: string;
  style?: object;
}) {
  return (
    <View style={[styles.sectionTitleGroup, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>
    </View>
  );
}

const TIMETABLE_DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const TIMETABLE_MIN_DAY_COUNT = 5;
const TIMETABLE_DAY_INDEX: Readonly<Record<string, number>> = {
  MONDAY: 0,
  MON: 0,
  월: 0,
  TUESDAY: 1,
  TUE: 1,
  화: 1,
  WEDNESDAY: 2,
  WED: 2,
  수: 2,
  THURSDAY: 3,
  THU: 3,
  목: 3,
  FRIDAY: 4,
  FRI: 4,
  금: 4,
  SATURDAY: 5,
  SAT: 5,
  토: 5,
  SUNDAY: 6,
  SUN: 6,
  일: 6,
};
const TIMETABLE_START_MINUTES = 9 * 60;
const TIMETABLE_END_MINUTES = 19 * 60;
const TIMETABLE_HEADER_HEIGHT = 22;
const TIMETABLE_TIME_GUTTER = 26;
const TIMETABLE_WIDTH = 247;
const TIMETABLE_HEIGHT = 340;
const TIMETABLE_GRID_WIDTH = TIMETABLE_WIDTH - TIMETABLE_TIME_GUTTER;
const TIMETABLE_GRID_HEIGHT = TIMETABLE_HEIGHT - TIMETABLE_HEADER_HEIGHT;
const CLASS_COLORS = [
  '#D57063',
  '#A6CD70',
  '#6F95CF',
  '#E29958',
  '#9A77DA',
  '#7BD1C0',
  '#F0C356',
  '#66C770',
  '#8D71C8',
];

function AnalyzedTimetable({ classes }: { classes: ClassSlot[] }) {
  const dayCount = classes.reduce(
    (count, item) => Math.max(count, getDayIndex(item.dayOfWeek) + 1),
    TIMETABLE_MIN_DAY_COUNT,
  );
  const days = TIMETABLE_DAYS.slice(0, dayCount);
  const columnWidth = TIMETABLE_GRID_WIDTH / days.length;
  const classBlocks = classes
    .map((item, index) => getClassBlockLayout(item, index, columnWidth))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <View style={styles.analyzedTimetable}>
      <View style={styles.dayHeaderRow}>
        <View style={styles.timeHeaderSpacer} />
        {days.map((day) => (
          <Text key={day} style={[styles.dayHeaderText, { width: columnWidth }]}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.timetableGrid}>
        {Array.from({ length: 11 }).map((_, index) => (
          <View key={`row-${index}`} style={[styles.gridLineHorizontal, { top: index * 31.8 }]} />
        ))}
        {Array.from({ length: days.length + 1 }).map((_, index) => (
          <View
            key={`column-${index}`}
            style={[
              styles.gridLineVertical,
              {
                left: TIMETABLE_TIME_GUTTER + index * columnWidth,
              },
            ]}
          />
        ))}
        {Array.from({ length: 11 }).map((_, index) => (
          <Text key={`time-${index}`} style={[styles.timeLabel, { top: index * 31.8 - 3 }]}>
            {index + 9 <= 12 ? index + 9 : index - 3}
          </Text>
        ))}

        {classBlocks.map((item) => (
          <View
            key={`${item.classItem.dayOfWeek}-${item.classItem.subjectName}-${item.index}`}
            style={[
              styles.classBlock,
              {
                top: item.top,
                left: item.left,
                width: item.width,
                height: item.height,
                backgroundColor: item.color,
              },
            ]}>
            <Text numberOfLines={getClassTextLineCount(item.height)} style={styles.classText}>
              {item.classItem.subjectName}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function getClassBlockLayout(classItem: ClassSlot, index: number, columnWidth: number) {
  const dayIndex = getDayIndex(classItem.dayOfWeek);

  if (dayIndex < 0) {
    return null;
  }

  const startMinutes = getMinutes(classItem.startTime);
  const endMinutes = getMinutes(classItem.endTime);
  const clampedStart = Math.max(TIMETABLE_START_MINUTES, startMinutes);
  const clampedEnd = Math.min(TIMETABLE_END_MINUTES, Math.max(endMinutes, clampedStart + 30));

  if (clampedEnd <= TIMETABLE_START_MINUTES || clampedStart >= TIMETABLE_END_MINUTES) {
    return null;
  }

  const minuteRange = TIMETABLE_END_MINUTES - TIMETABLE_START_MINUTES;
  const top = ((clampedStart - TIMETABLE_START_MINUTES) / minuteRange) * TIMETABLE_GRID_HEIGHT;
  const height = Math.max(24, ((clampedEnd - clampedStart) / minuteRange) * TIMETABLE_GRID_HEIGHT);

  return {
    classItem,
    index,
    top,
    left: TIMETABLE_TIME_GUTTER + dayIndex * columnWidth,
    width: columnWidth + 1,
    height,
    color: CLASS_COLORS[index % CLASS_COLORS.length],
  };
}

function getClassTextLineCount(height: number) {
  return Math.max(2, Math.floor((height - 6) / 8));
}

function getDayIndex(dayOfWeek: string) {
  const normalized = dayOfWeek.trim().toUpperCase().replace(/요일$/, '');
  return TIMETABLE_DAY_INDEX[normalized] ?? -1;
}

function getMinutes(time: ApiLocalTime) {
  if (typeof time === 'string') {
    const [hour = '0', minute = '0'] = time.split(':');
    return Number(hour) * 60 + Number(minute);
  }

  return (time.hour ?? 0) * 60 + (time.minute ?? 0);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: '#626877',
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  failureContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
    gap: 16,
  },
  failureTitle: {
    color: '#222222',
    fontSize: 21,
    fontWeight: '600',
    textAlign: 'center',
  },
  failureMessage: {
    color: '#606060',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 77,
    paddingBottom: 144,
  },
  completeStar: {
    width: 80,
    height: 78,
  },
  headerTextGroup: {
    width: 269,
    marginTop: 23,
    gap: 10,
  },
  title: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 23,
    fontWeight: '700',
    lineHeight: 31,
  },
  description: {
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 26,
  },
  timetableCard: {
    width: 247,
    height: 340,
    overflow: 'hidden',
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#9C9C9C',
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
  },
  timetableImage: {
    width: '100%',
    height: '100%',
  },
  analyzedTimetable: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  dayHeaderRow: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeHeaderSpacer: {
    width: TIMETABLE_TIME_GUTTER,
  },
  dayHeaderText: {
    color: '#8F8F8F',
    fontFamily: 'Pretendard',
    fontSize: 7,
    fontWeight: '600',
    textAlign: 'center',
  },
  timetableGrid: {
    position: 'absolute',
    top: TIMETABLE_HEADER_HEIGHT,
    right: 0,
    bottom: 0,
    left: 0,
  },
  timeLabel: {
    position: 'absolute',
    left: 5,
    width: 17,
    color: '#8F8F8F',
    fontFamily: 'Pretendard',
    fontSize: 7,
    fontWeight: '500',
    textAlign: 'center',
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: TIMETABLE_TIME_GUTTER,
    right: 0,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#E8E8E8',
  },
  classBlock: {
    position: 'absolute',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    paddingTop: 3,
    paddingHorizontal: 3,
  },
  classText: {
    color: '#FFFFFF',
    fontFamily: 'Pretendard',
    fontSize: 6,
    fontWeight: '700',
    lineHeight: 8,
  },
  sectionTitleGroup: {
    width: 301,
    alignItems: 'center',
    gap: 10,
    marginTop: 50,
  },
  sectionTitle: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 23,
    fontWeight: '700',
    lineHeight: 31,
    textAlign: 'center',
  },
  sectionDescription: {
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 26,
    textAlign: 'center',
  },
  keywordGrid: {
    alignItems: 'center',
    gap: 10,
    marginTop: 31,
  },
  keywordGridRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
  },
  bottomButtonWrap: {
    position: 'absolute',
    right: 0,
    bottom: 44,
    left: 0,
    alignItems: 'center',
  },
  keywordErrorText: {
    marginBottom: 10,
    color: '#DC2626',
    fontFamily: 'Pretendard',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  nextButton: {
    width: 326,
  },
  completeHomeIndicator: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: '#626877',
  },
  pressed: {
    opacity: 0.86,
  },
});

