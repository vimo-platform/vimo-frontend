import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

import { markNewApprovedApplicationsRead } from '@/services/common/volunteers';
import { useUserSessionGuard } from '@/hooks/common/use-user-session-guard';

import { VolunteerResultScreen } from '@/components/exploration/VolunteerResultScreen';
import { markApprovalConfirmationSeen } from '@/services/exploration/volunteer-interaction-store';

const CONFIRMED_CHARACTER = require('@/assets/images/explorationimg/16.png');

export function VolunteerApprovalConfirmedScreen() {
  useUserSessionGuard();

  const { id, source } = useLocalSearchParams<{ id?: string; source?: string }>();
  const postId = Number(id);
  const isFirstComeApplication = source === 'fcfs';

  useEffect(() => {
    if (!Number.isFinite(postId)) {
      router.replace('/explore');
      return;
    }

    markApprovalConfirmationSeen(postId);
    if (!isFirstComeApplication) {
      markNewApprovedApplicationsRead().catch(() => undefined);
    }
  }, [isFirstComeApplication, postId]);

  const handleConfirm = async () => {
    if (!isFirstComeApplication) {
      await markNewApprovedApplicationsRead().catch(() => undefined);
    }
    router.replace('/explore');
  };

  return (
    <VolunteerResultScreen
      characterSource={CONFIRMED_CHARACTER}
      characterStyle={styles.confirmedCharacter}
      postId={postId}
      description={
        '봉사 참여가 최종 확정되었습니다!\n봉사 일정 및 안내사항을 확인해 주세요.'
      }
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
