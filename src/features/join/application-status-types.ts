import type { VolunteerStatus } from '@/features/exploration/types';

export type ApplicationProgressStep = 1 | 2 | 3 | 4 | 5;

export type ApplicationVolunteerCard = {
  id: number;
  status: VolunteerStatus;
  title: string;
  credit: string;
  location: string;
  period: string;
  time: string;
  recruitCount: number;
  applicantCount: number;
  favorite: boolean;
  applied: boolean;
  actionLabel?: string;
  actionDisabled?: boolean;
  hasPreferredCondition: boolean;
  progressStep?: ApplicationProgressStep;
};
