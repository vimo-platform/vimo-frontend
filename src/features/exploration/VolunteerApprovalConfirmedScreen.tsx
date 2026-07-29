import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

import { markNewApprovedApplicationsRead } from '@/api/volunteers';
import { useUserSessionGuard } from '@/hooks/use-user-session-guard';

import { VolunteerResultScreen } from './components/VolunteerResultScreen';
import { markApprovalConfirmationSeen } from './volunteer-interaction-store';

const CONFIRMED_CHARACTER = require('../../../assets/images/explorationimg/16.png');

export function VolunteerApprovalConfirmedScreen() {
  useUserSessionGuard();

  const { id } = useLocalSearchParams<{ id?: string }>();
  const postId = Number(id);

  useEffect(() => {
    if (!Number.isFinite(postId)) {
      router.replace('/explore');
      return;
    }

    if (Number.isFinite(postId)) {
      markApprovalConfirmationSeen(postId);
    }

    markNewApprovedApplicationsRead().catch(() => undefined);
  }, [postId]);

  const handleConfirm = async () => {
    await markNewApprovedApplicationsRead().catch(() => undefined);
    router.replace('/explore');
  };

  return (
    <VolunteerResultScreen
      characterSource={CONFIRMED_CHARACTER}
      characterStyle={styles.confirmedCharacter}
      description={'봉사 참여가 최종 확정되었습니다!\n봉사 일정 및 안내사항을 확인해 주세요.'}
      title="지원 확정"
      tone="dark"
      onConfirm={handleConfirm}
    />
  );
}

const styles = {
  confirmedCharacter: {
    left: 76,
    top: 124,
    width: 221,
    height: 221,
  },
};
