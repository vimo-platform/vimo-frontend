import { router, useLocalSearchParams } from 'expo-router';

import { useUserSessionGuard } from '@/hooks/use-user-session-guard';

import { VolunteerResultScreen } from './components/VolunteerResultScreen';
import { markApprovalConfirmationSeen } from './volunteer-interaction-store';

const CONFIRMED_CHARACTER = require('../../../assets/images/explorationimg/16.png');

export function VolunteerApprovalConfirmedScreen() {
  useUserSessionGuard();

  const { id } = useLocalSearchParams<{ id?: string }>();

  const handleConfirm = () => {
    const postId = Number(id);

    if (Number.isFinite(postId)) {
      markApprovalConfirmationSeen(postId);
    }

    router.replace('/explore');
  };

  return (
    <VolunteerResultScreen
      characterSource={CONFIRMED_CHARACTER}
      characterStyle={styles.confirmedCharacter}
      description="봉사 참여가 최종 확정되었습니다!\n봉사 일정 및 안내사항을 확인해 주세요."
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
