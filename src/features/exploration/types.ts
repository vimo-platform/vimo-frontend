export type VolunteerStatus = 'RECRUITING' | 'CLOSED' | 'COMPLETED';
export type VolunteerApplicationStatus =
  | 'NONE'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELED'
  | 'COMPLETED'
  | string;

export type VolunteerPost = {
  id: number;
  title: string;
  organization: string;
  location: string;
  category: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  recruitmentEndDate: string;
  neededCount: number;
  appliedCount: number;
  creditHours: number;
  status: VolunteerStatus;
  participationCondition: string;
  cancelPolicy: string;
  guideTitle: string;
  description: string;
  requirements: string[];
  keywords?: string[];
  createdAt?: string;
  isFavorite?: boolean;
  isApplied?: boolean;
  applicationStatus?: VolunteerApplicationStatus;
};

export type VolunteerPostFilter = {
  query: string;
  category: string;
  location: string;
  status: VolunteerStatus | 'all';
};
