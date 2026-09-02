import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { VerificationCompleteIcon, VerificationPendingIcon } from './Icons';

type StatusBadgeStatus = 'before' | 'active';
type VerificationBadgeStatus = 'pending' | 'completeWithCount' | 'syncing' | 'complete';

type StatusBadgeProps = {
  status: StatusBadgeStatus;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

type VerificationBadgeProps = {
  status: VerificationBadgeStatus;
  count?: number;
  style?: StyleProp<ViewStyle>;
};

const statusText: Record<StatusBadgeStatus, string> = {
  before: '시작 전',
  active: '활동 중',
};

export function StatusBadge({ status, label = statusText[status], style }: StatusBadgeProps) {
  const isActive = status === 'active';

  return (
    <View style={[styles.statusContainer, isActive ? styles.activeStatus : styles.beforeStatus, style]}>
      <Text style={[styles.statusLabel, isActive ? styles.activeStatusLabel : styles.beforeStatusLabel]}>
        {label}
      </Text>
    </View>
  );
}

export function VerificationBadge({ status, count, style }: VerificationBadgeProps) {
  if (status === 'syncing' || status === 'complete') {
    const isComplete = status === 'complete';

    return (
      <View style={[styles.solidVerification, isComplete ? styles.completeSolid : styles.syncingSolid, style]}>
        <Text style={styles.solidVerificationLabel}>
          {isComplete ? '인증 완료' : '학사 시스템 연동 중'}
        </Text>
      </View>
    );
  }

  const isCompleteWithCount = status === 'completeWithCount';
  const label = isCompleteWithCount ? '인증 완료' : '대기';
  const resolvedCount = count ?? (isCompleteWithCount ? 2 : 1);

  return (
    <View style={[styles.outlineVerification, style]}>
      {isCompleteWithCount ? (
        <VerificationCompleteIcon width={12.5} height={8.5} />
      ) : (
        <VerificationPendingIcon width={15} height={3} />
      )}
      <Text style={styles.outlineVerificationLabel}>
        {label}
        <Text style={styles.countSpacer}>          </Text>
        <Text style={styles.outlineVerificationCount}>{resolvedCount}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statusContainer: {
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
  },
  beforeStatus: {
    backgroundColor: '#E8E8E8',
  },
  activeStatus: {
    backgroundColor: '#818181',
  },
  statusLabel: {
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19.6,
    letterSpacing: -0.35,
    textAlign: 'center',
  },
  beforeStatusLabel: {
    color: '#818181',
  },
  activeStatusLabel: {
    color: '#F5F5F5',
  },
  outlineVerification: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: '#222222',
    borderRadius: 6,
  },
  outlineVerificationLabel: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: -0.25,
    textAlign: 'center',
  },
  countSpacer: {
    fontWeight: '600',
  },
  outlineVerificationCount: {
    fontWeight: '900',
  },
  solidVerification: {
    minHeight: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    opacity: 0.8,
  },
  syncingSolid: {
    backgroundColor: '#222222',
  },
  completeSolid: {
    backgroundColor: '#818181',
  },
  solidVerificationLabel: {
    color: '#FFFFFF',
    fontFamily: 'Pretendard',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: -0.25,
    textAlign: 'center',
  },
});
