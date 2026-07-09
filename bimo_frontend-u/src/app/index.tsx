import { useEffect, useState } from 'react';
import { router } from 'expo-router';

import { login } from '@/api/auth';
import {
  getSavedLoginId,
  getUserOnboardingCompleted,
  markUserAuthenticated,
  removeSavedLoginId,
  setSavedLoginId,
} from '@/storage/auth-storage';
import EntryFlowScreen from '@shared/screens/EntryFlowScreen';
import type { SchoolLoginSubmitValues } from '@shared/screens/SchoolLoginScreen';

export default function EntryScreen() {
  const [initialStudentId, setInitialStudentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    getSavedLoginId().then((savedLoginId) => {
      if (mounted && savedLoginId) {
        setInitialStudentId(savedLoginId);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogin = async ({ studentId, password, saveId }: SchoolLoginSubmitValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await login({
        loginId: studentId,
        password,
      });

      if (saveId) {
        await setSavedLoginId(studentId);
      } else {
        await removeSavedLoginId();
      }

      if (response.user?.role === 'ADMIN') {
        setErrorMessage('관리자 계정은 관리자 앱에서 로그인해 주세요.');
        return;
      }

      markUserAuthenticated();
      const onboardingCompleted = await getUserOnboardingCompleted();
      router.replace(onboardingCompleted ? '/explore' : '/onboarding');
    } catch {
      setErrorMessage('입력하신 계정 정보를 다시 확인해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EntryFlowScreen
      errorMessage={errorMessage}
      initialSaveId={initialStudentId.length > 0}
      initialStudentId={initialStudentId}
      isSubmitting={isSubmitting}
      onFieldChange={() => {
        setErrorMessage(null);
      }}
      onSubmit={handleLogin}
    />
  );
}
