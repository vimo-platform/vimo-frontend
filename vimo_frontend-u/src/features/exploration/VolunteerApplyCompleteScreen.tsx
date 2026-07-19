import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useUserSessionGuard } from '@/hooks/use-user-session-guard';

import { createVolunteerApplication } from './api';
import { VolunteerResultScreen } from './components/VolunteerResultScreen';
import { submitVolunteerApplication } from './volunteer-interaction-store';

const COMPLETE_CHARACTER = require('../../../assets/images/explorationimg/15.png');

export function VolunteerApplyCompleteScreen() {
  useUserSessionGuard();

  const { id } = useLocalSearchParams<{ id?: string }>();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    if (isConfirming) {
      return;
    }

    const postId = Number(id);

    if (Number.isFinite(postId)) {
      setIsConfirming(true);

      try {
        await createVolunteerApplication(postId);
      } catch (error) {
        const message = error instanceof Error ? error.message : '';

        if (!message.includes('이미 신청한 공고입니다')) {
          setIsConfirming(false);
          return;
        }
      }

      submitVolunteerApplication(postId);
    }

    router.replace('/search');
  };

  return (
    <VolunteerResultScreen
      characterSource={COMPLETE_CHARACTER}
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
