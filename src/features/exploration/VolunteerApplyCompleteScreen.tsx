import { router, useLocalSearchParams } from 'expo-router';

import { useUserSessionGuard } from '@/hooks/use-user-session-guard';

import { VolunteerResultScreen } from './components/VolunteerResultScreen';

const COMPLETE_CHARACTER = require('../../../assets/images/explorationimg/15.png');

export function VolunteerApplyCompleteScreen() {
  useUserSessionGuard();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const postId = Number(id);

  const handleConfirm = () => {
    router.replace('/search');
  };

  return (
    <VolunteerResultScreen
      characterSource={COMPLETE_CHARACTER}
      postId={Number.isFinite(postId) ? postId : undefined}
      description={
        <>
          봉사를 지원해주셔서 감사합니다!
          {'\n'}
          담당자의 승인을 기다려주세요
        </>
      }
      title="지원 완료"
      onConfirm={handleConfirm}
    />
  );
}
