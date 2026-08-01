import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { HeartImage } from '@/components/common';

import type { ApplicationVolunteerCard as ApplicationVolunteerCardType } from '../application-status-types';

const GLASS_CIRCLE = require('../../../../assets/images/joinimg/joinglasscircle.png');

const PROGRESS_LABELS = ['지원 완료', '승인 대기', '승인 완료', '활동 중', '활동 완료'];

type ApplicationVolunteerCardProps = {
  item: ApplicationVolunteerCardType;
  onCancelPress?: (item: ApplicationVolunteerCardType) => void;
  onCardPress?: (item: ApplicationVolunteerCardType) => void;
  onToggleLike: (id: number) => void;
};

export function ApplicationVolunteerCard({
  item,
  onCancelPress,
  onCardPress,
  onToggleLike,
}: ApplicationVolunteerCardProps) {
  // 승인 대기(step 2) 상태면 취소 가능. 승인 완료 이후엔 취소불가.
  const canCancel = item.applied && item.progressStep === 2;
  const isCardPressable = Boolean(onCardPress);
  const isActionDisabled = item.actionDisabled ?? item.status !== 'RECRUITING';
  const favoriteActionLabel = item.actionLabel ?? (item.status !== 'RECRUITING' ? '지원 마감' : '지원하기');

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        {isCardPressable ? (
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [StyleSheet.absoluteFill, pressed && styles.pressedCard]}
            onPress={() => onCardPress?.(item)}
          />
        ) : null}

        <View pointerEvents={isCardPressable ? 'box-none' : 'auto'}>
          <View style={styles.cardHeader}>
            <Text numberOfLines={3} style={styles.title}>
              {item.title}
            </Text>
            <Pressable
              accessibilityLabel={item.favorite ? '찜 해제' : '찜하기'}
              accessibilityRole="button"
              hitSlop={8}
              style={({ pressed }) => [styles.heartButton, pressed && styles.pressed]}
              onPress={() => onToggleLike(item.id)}>
              <HeartImage filled={item.favorite} style={styles.heart} />
            </Pressable>
          </View>

          <Text style={styles.credit}>{item.credit}</Text>

          <View style={styles.details}>
            <DetailRow icon="location" text={item.location} />
            <DetailRow icon="calendar" text={item.period} />
            <DetailRow icon="clock" text={item.time} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.counts}>
              모집{item.recruitCount}명 / 지원{item.applicantCount}명
            </Text>
            {item.applied ? (
              <Pressable
                accessibilityRole="button"
                disabled={!canCancel}
                style={[styles.actionButton, canCancel ? styles.cancelButton : styles.disabledButton]}
                onPress={() => {
                  if (canCancel) {
                    onCancelPress?.(item);
                  }
                }}>
                <Text style={[styles.actionText, canCancel ? styles.cancelText : styles.disabledText]}>
                  {canCancel ? '취소하기' : '취소불가'}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                disabled={isActionDisabled}
                style={[
                  styles.actionButton,
                  isActionDisabled ? styles.closedApplyButton : styles.applyButton,
                ]}
                onPress={() => {
                  if (!isActionDisabled) {
                    onCardPress?.(item);
                  }
                }}>
                <Text style={styles.applyText}>{favoriteActionLabel}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {item.applied && item.progressStep ? <ProgressSteps currentStep={item.progressStep} /> : null}
    </View>
  );
}
function ProgressSteps({ currentStep }: { currentStep: number }) {
  const activeLineWidth = getDoneLineWidth(currentStep);

  return (
    <View style={styles.progress}>
      <View style={styles.progressLine} />
      {activeLineWidth > 0 ? (
        <View style={[styles.progressLineDone, { width: activeLineWidth }]} />
      ) : null}
      <View style={styles.steps}>
        {PROGRESS_LABELS.map((label, index) => {
          const step = index + 1;
          const isDone = step < currentStep;
          const isCurrent = step === currentStep;
          const isPending = step > currentStep;

          return (
            <View key={label} style={styles.step}>
              <View style={styles.stepCircleSlot}>
                {isCurrent && (
                  <Image resizeMode="contain" source={GLASS_CIRCLE} style={styles.currentGlow} />
                )}
                <View
                  style={[
                    styles.stepCircle,
                    (isDone || isCurrent) && styles.doneCircle,
                    isPending && styles.pendingCircle,
                  ]}>
                  <Text style={styles.stepNumber}>{step}</Text>
                </View>
              </View>
              <Text style={[styles.stepLabel, isPending && styles.pendingLabel]}>{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function getDoneLineWidth(currentStep: number) {
  const stepGap = 60;
  // 현재 단계 원의 중심까지 검은색으로 채운다 (완료·진행 구간 표시)
  const filled = stepGap * (currentStep - 1);

  return Math.max(0, Math.min(240, filled));
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
      <Svg height={11} viewBox="0 0 12 14" width={9}>
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
      <Svg height={10} viewBox="0 0 14 14" width={9}>
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
    <Svg height={9} viewBox="0 0 14 14" width={9}>
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
  wrapper: {
    alignItems: 'center',
  },
  card: {
    width: 316,
    minHeight: 237,
    paddingTop: 33,
    paddingRight: 28,
    paddingBottom: 31,
    paddingLeft: 31,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    shadowColor: '#F5F5F5',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    minHeight: 19,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 18,
  },
  heartButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -3,
  },
  heart: {
    width: 24,
    height: 22,
  },
  pressed: {
    opacity: 0.82,
  },
  pressedCard: {
    opacity: 0.9,
  },
  credit: {
    marginTop: 11,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 12,
    fontWeight: '500',
  },
  details: {
    gap: 8,
    marginTop: 17,
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
  },
  footer: {
    minHeight: 31,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  counts: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 13,
    fontWeight: '500',
  },
  actionButton: {
    width: 105,
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#C07777',
    backgroundColor: '#C07777',
  },
  disabledButton: {
    backgroundColor: '#CECECE',
  },
  applyButton: {
    backgroundColor: '#222222',
  },
  closedApplyButton: {
    backgroundColor: '#CECECE',
  },
  actionText: {
    fontFamily: 'Pretendard',
    fontSize: 13,
  },
  cancelText: {
    color: '#FCE8E8',
    fontWeight: '500',
  },
  disabledText: {
    color: '#C07777',
    fontWeight: '600',
  },
  applyText: {
    color: '#F5F5F5',
    fontFamily: 'Pretendard',
    fontSize: 13,
    fontWeight: '500',
  },
  progress: {
    width: 290,
    height: 85,
    marginTop: 23,
  },
  progressLine: {
    position: 'absolute',
    top: 20,
    left: 25,
    width: 240,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D2D2D2',
  },
  progressLineDone: {
    position: 'absolute',
    top: 20,
    left: 25,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#222222',
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  step: {
    width: 50,
    alignItems: 'center',
  },
  stepCircleSlot: {
    width: 43,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentGlow: {
    position: 'absolute',
    width: 43,
    height: 43,
  },
  stepCircle: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  doneCircle: {
    backgroundColor: '#444444',
  },
  pendingCircle: {
    backgroundColor: '#D2D2D2',
  },
  stepNumber: {
    color: '#F5F5F5',
    fontFamily: 'Pretendard',
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: 2.025,
    textAlign: 'center',
  },
  stepLabel: {
    marginTop: 4,
    color: '#444444',
    fontFamily: 'Pretendard',
    fontSize: 10,
    fontWeight: '700',
  },
  pendingLabel: {
    color: '#D2D2D2',
  },
});

