import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { Button } from '@/components/common';
import { BackIcon } from '@/components/common/icons';
import { VolunteerInfoIcon } from '@/components/common/volunteer-info-icon';
import { UserGnb } from '@/components/navigation/user-gnb';
import { useUserSessionGuard } from '@/hooks/use-user-session-guard';

import type { VolunteerPost } from '@/features/exploration/types';
import { getVolunteerPostsSnapshot } from '@/features/exploration/volunteer-interaction-store';

type CertificationDetailVariant = 'pending' | 'complete';

export function CertificationPendingDetailScreen() {
  return <CertificationDetailScreen variant="pending" />;
}

export function CertificationCompleteDetailScreen() {
  return <CertificationDetailScreen variant="complete" />;
}

function CertificationDetailScreen({ variant }: { variant: CertificationDetailVariant }) {
  useUserSessionGuard();

  const { id } = useLocalSearchParams<{ id?: string }>();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 393);
  const post = useMemo(
    () => getVolunteerPostsSnapshot().find((item) => item.id === Number(id)) ?? null,
    [id],
  );
  const isComplete = variant === 'complete';

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/verification');
  };

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <View style={[styles.screen, { width: contentWidth }]}>
        {isComplete ? <ConfettiBackground /> : null}

        <View style={styles.topBar}>
          {!isComplete ? (
            <Pressable
              accessibilityLabel="이전 화면으로 이동"
              accessibilityRole="button"
              hitSlop={10}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              onPress={goBack}>
              <BackIcon width={9} height={18} />
            </Pressable>
          ) : null}
          <Text style={styles.topTitle}>인증</Text>
        </View>

        <View style={styles.heroIconSlot}>
          {isComplete ? <VerificationCompleteHeroIcon /> : <VerificationSyncIcon />}
        </View>
        <Text style={[styles.heroText, isComplete && styles.completeHeroText]}>
          {isComplete ? '봉사 시간 연동이 완료되었어요!' : '담당자가 봉사 활동 내역을 확인하고 있어요'}
        </Text>

        <VerificationStepper variant={variant} />

        {post ? (
          <VerificationVolunteerCard isComplete={isComplete} post={post} />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>인증 봉사를 찾을 수 없어요.</Text>
          </View>
        )}

        {isComplete ? (
          <View style={styles.confirmArea}>
            <Button
              label="확인"
              style={styles.confirmButton}
              onPress={() => router.replace('/verification')}
            />
          </View>
        ) : null}

        <UserGnb activeKey="verification" />
      </View>
    </SafeAreaView>
  );
}

function VerificationSyncIcon() {
  return (
    <View style={styles.syncIconOuter}>
      <View style={styles.syncIconInner}>
        <View style={[styles.syncBar, styles.syncBarShort]} />
        <View style={[styles.syncBar, styles.syncBarTall]} />
        <View style={[styles.syncBar, styles.syncBarMedium]} />
        <View style={styles.syncDot} />
      </View>
    </View>
  );
}

function VerificationCompleteHeroIcon() {
  return (
    <View style={styles.completeIconOuter}>
      <View style={styles.completeIconInner}>
        <Svg height={37} viewBox="0 0 42 37" width={42}>
          <Path
            d="M4 18.5 16.5 31 38 6"
            fill="none"
            stroke="#F5F5F5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={7}
          />
        </Svg>
      </View>
    </View>
  );
}

function VerificationStepper({ variant }: { variant: CertificationDetailVariant }) {
  const isComplete = variant === 'complete';

  return (
    <View style={styles.stepper}>
      <View style={[styles.stepLine, isComplete && styles.completeStepLine]} />
      <StepMark done={isComplete} isCurrent={!isComplete} style={styles.firstStepCircle} />
      <StepMark done={isComplete} number={2} style={styles.secondStepCircle} />
      <StepMark done={false} isCurrent={isComplete} number={3} style={styles.thirdStepCircle} />

      <Text
        numberOfLines={1}
        style={[styles.stepLabel, styles.firstStepLabel, isComplete && styles.doneStepLabel]}>
        담당자 확인 중
      </Text>
      <Text
        numberOfLines={1}
        style={[styles.stepLabel, styles.secondStepLabel, isComplete && styles.doneStepLabel]}>
        학사 시스템 연동
      </Text>
      <Text
        numberOfLines={1}
        style={[styles.stepLabel, styles.thirdStepLabel, isComplete && styles.doneStepLabel]}>
        자동 연동 완료
      </Text>
    </View>
  );
}

function StepMark({
  done,
  isCurrent,
  number,
  style,
}: {
  done: boolean;
  isCurrent?: boolean;
  number?: number;
  style: object;
}) {
  if (done) {
    return (
      <View style={[styles.stepCircle, styles.doneStepCircle, style]}>
        <Svg height={11} viewBox="0 0 14 11" width={14}>
          <Path
            d="M1.5 5.5 5.5 9.2 12.5 1.5"
            fill="none"
            stroke="#F5F5F5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
          />
        </Svg>
      </View>
    );
  }

  if (isCurrent) {
    return (
      <View style={[styles.stepCircle, styles.currentStepCircle, style]}>
        <View style={styles.currentStepInner} />
      </View>
    );
  }

  return (
    <View style={[styles.stepCircle, style]}>
      <Text style={styles.stepNumber}>{number}</Text>
    </View>
  );
}

function VerificationVolunteerCard({
  isComplete,
  post,
}: {
  isComplete: boolean;
  post: VolunteerPost;
}) {
  return (
    <View style={[styles.volunteerCard, isComplete && styles.completeVolunteerCard]}>
      <View style={styles.activityBadge}>
        <Text style={styles.activityBadgeText}>활동 완료</Text>
      </View>

      <Text style={styles.cardTitle}>
        {post.title}
      </Text>
      <Text style={styles.credit}>봉사 인정 시간 : {formatCredit(post.creditHours)} 인정</Text>

      <View style={styles.details}>
        <DetailRow icon="location" text={post.location} />
        <DetailRow
          icon="calendar"
          text={`${formatDate(post.startDate)} ~ ${formatDate(post.endDate)}${getRepeatLabel(post)}`}
        />
        <DetailRow icon="clock" text={`${post.startTime} ~ ${post.endTime}`} />
      </View>

      <Text style={styles.counts}>
        모집{post.neededCount}명 / 지원{post.appliedCount}명
      </Text>
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
      <VolunteerInfoIcon type={icon} />
      <Text numberOfLines={1} style={styles.detailText}>
        {text}
      </Text>
    </View>
  );
}

function ConfettiBackground() {
  const pieces = [
    [24, 64, 9, 3, 32],
    [86, 24, 18, 4, 7],
    [151, 10, 10, 4, 84],
    [298, 54, 18, 5, 99],
    [353, 112, 10, 4, 18],
    [62, 232, 15, 4, 117],
    [185, 274, 19, 5, 27],
    [330, 302, 12, 4, 79],
    [35, 480, 17, 5, 64],
    [265, 556, 21, 5, 74],
    [145, 680, 19, 4, 83],
  ];

  return (
    <View pointerEvents="none" style={styles.confetti}>
      {pieces.map(([left, top, width, height, rotate], index) => (
        <View
          key={index}
          style={[
            styles.confettiPiece,
            {
              left,
              top,
              width,
              height,
              transform: [{ rotate: `${rotate}deg` }],
            },
          ]}
        />
      ))}
    </View>
  );
}

function formatCredit(hours: number) {
  return hours >= 6 ? `일 최대 ${hours}시간` : `회차당 ${hours}시간`;
}

function formatDate(date: string) {
  const [year, month, day] = date.split('-');
  return `${year}.${month}.${day}`;
}

function getRepeatLabel(post: VolunteerPost) {
  return post.id === 101 ? ' (매주 금요일)' : '';
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
    overflow: 'hidden',
  },
  topBar: {
    position: 'absolute',
    top: 44,
    right: 0,
    left: 0,
    zIndex: 2,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 0,
    width: 40,
    height: 50,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  topTitle: {
    color: '#111111',
    fontFamily: 'Pretendard',
    fontSize: 20,
    fontWeight: '500',
  },
  heroIconSlot: {
    position: 'absolute',
    top: 123,
    left: 153,
    width: 85,
    height: 85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncIconOuter: {
    width: 85,
    height: 85,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#555555',
    borderRadius: 42.5,
    opacity: 0.8,
  },
  syncIconInner: {
    width: 74,
    height: 74,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 37,
    backgroundColor: '#444444',
  },
  syncBar: {
    width: 7,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    opacity: 0.8,
  },
  syncBarShort: {
    height: 17,
  },
  syncBarTall: {
    height: 31,
  },
  syncBarMedium: {
    height: 17,
  },
  syncDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#F5F5F5',
    opacity: 0.8,
  },
  completeIconOuter: {
    width: 85,
    height: 85,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#111111',
    borderRadius: 42.5,
  },
  completeIconInner: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 35,
    backgroundColor: '#111111',
  },
  heroText: {
    position: 'absolute',
    top: 252,
    left: 42,
    width: 309,
    height: 20,
    textAlign: 'center',
    color: '#222222',
    opacity: 0.8,
    fontFamily: 'Pretendard',
    fontSize: 17,
    fontWeight: '700',
  },
  completeHeroText: {
    left: 46,
    width: 300,
  },
  stepper: {
    position: 'absolute',
    top: 297,
    left: 41,
    width: 311,
    height: 59,
  },
  stepLine: {
    position: 'absolute',
    top: 14,
    left: 19,
    width: 263,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D2D2D2',
  },
  completeStepLine: {
    backgroundColor: '#444444',
  },
  stepCircle: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#D2D2D2',
  },
  firstStepCircle: {
    left: 5,
  },
  currentStepCircle: {
    borderWidth: 7,
    borderColor: '#444444',
    backgroundColor: '#F9F9FB',
  },
  currentStepInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F9F9FB',
  },
  doneStepCircle: {
    backgroundColor: '#444444',
  },
  secondStepCircle: {
    left: 137,
  },
  thirdStepCircle: {
    left: 268,
  },
  stepNumber: {
    color: '#F5F5F5',
    fontFamily: 'Pretendard',
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: 2.025,
  },
  stepLabel: {
    position: 'absolute',
    top: 47,
    color: '#D2D2D2',
    fontFamily: 'Pretendard',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  doneStepLabel: {
    color: '#444444',
  },
  firstStepLabel: {
    left: -12,
    width: 82,
    color: '#444444',
    textAlign: 'center',
  },
  secondStepLabel: {
    left: 104,
    width: 94,
    textAlign: 'center',
  },
  thirdStepLabel: {
    left: 236,
    width: 84,
    textAlign: 'center',
  },
  volunteerCard: {
    position: 'absolute',
    top: 392,
    left: 39,
    width: 315,
    minHeight: 237,
    paddingTop: 38,
    paddingRight: 31,
    paddingBottom: 35,
    paddingLeft: 39,
    borderRadius: 24,
    backgroundColor: '#CECECE',
    shadowColor: '#000000',
    shadowOffset: { width: 5, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 19,
    elevation: 6,
  },
  completeVolunteerCard: {
    top: 389,
    height: 237,
    minHeight: 237,
    paddingTop: 33,
    paddingRight: 31,
    paddingBottom: 27,
    paddingLeft: 39,
  },
  activityBadge: {
    position: 'absolute',
    top: 22,
    right: 20,
    width: 55,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#818181',
    opacity: 0.8,
  },
  activityBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'Pretendard',
    fontSize: 9,
    fontWeight: '600',
    lineHeight: 13,
  },
  cardTitle: {
    width: 190,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  credit: {
    marginTop: 15,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  details: {
    gap: 7,
    marginTop: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    flex: 1,
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  counts: {
    marginTop: 19,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  confirmArea: {
    position: 'absolute',
    right: 33,
    bottom: 133,
    left: 33,
    alignItems: 'center',
  },
  confirmButton: {
    width: 326,
    height: 60,
    borderRadius: 16,
  },
  confetti: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  confettiPiece: {
    position: 'absolute',
    borderRadius: 1,
    backgroundColor: '#D2D2D2',
    opacity: 0.45,
  },
  emptyState: {
    width: 315,
    minHeight: 180,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  emptyText: {
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.78,
  },
});
