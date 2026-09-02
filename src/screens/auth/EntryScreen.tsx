import { useEffect, useState } from 'react';
import { router } from 'expo-router';

import { login } from '@/services/common/auth';
import { fetchNewApprovedApplications } from '@/services/common/volunteers';
import { getVolunteerPostById } from '@/services/exploration/api';
import {
  clearUserSession,
  getSavedStudentId,
  getUserOnboardingCompleted,
  markUserAuthenticated,
  removeSavedStudentId,
  setAccessToken,
  setCurrentUser,
  setSavedStudentId,
} from '@/services/common/auth-storage';
import {
  approveVolunteerApplication,
  getPendingApprovalConfirmationId,
  resetVolunteerInteractions,
} from '@/services/exploration/volunteer-interaction-store';
import EntryFlowScreen from '@/screens/auth/EntryFlowScreen';
import type { SchoolLoginSubmitValues } from '@/screens/auth/SchoolLoginScreen';

export default function EntryScreen() {
  const [initialStudentId, setInitialStudentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    getSavedStudentId().then((savedStudentId) => {
      if (mounted && savedStudentId) {
        setInitialStudentId(savedStudentId);
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
      clearUserSession();
      resetVolunteerInteractions();

      const response = await login({
        studentId,
        password,
      });

      if (saveId) {
        await setSavedStudentId(studentId);
      } else {
        await removeSavedStudentId();
      }
      await setAccessToken(response.accessToken);

      if (response.user) {
        await setCurrentUser(response.user);
      }

      markUserAuthenticated();
      if (response.user?.role === 'ADMIN') {
        router.replace('/admin');
        return;
      }

      const onboardingCompleted = await getUserOnboardingCompleted();
      if (!onboardingCompleted) {
        router.replace('/onboarding');
        return;
      }

      try {
        const newApprovedApplications = await fetchNewApprovedApplications();
        const selectionApprovedApplications = await Promise.all(
          newApprovedApplications
            .filter((application) => isApprovedApplication(application))
            .map(async (application) => {
              const post = await getVolunteerPostById(application.volunteerId);

              return post?.recruitType === 'selection' ? application : null;
            }),
        );

        selectionApprovedApplications.forEach((application) => {
          if (application) {
            approveVolunteerApplication(application.volunteerId);
          }
        });
      } catch {
        // Approval notifications are non-blocking; keep login flow available offline.
      }

      const pendingApprovalId = getPendingApprovalConfirmationId();
      router.replace(
        pendingApprovalId
          ? `/volunteer-approval-confirmed?id=${pendingApprovalId}`
          : '/explore',
      );
    } catch {
      setErrorMessage('입력하신 계정 정보를 다시 확인해 주세요.');
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

function isApprovedApplication(application: { status?: string; applicationStatus?: string }) {
  return (application.applicationStatus ?? application.status) === 'APPROVED';
}
