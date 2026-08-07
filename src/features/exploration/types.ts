export type VolunteerStatus = 'RECRUITING' | 'CLOSED' | 'COMPLETED';
export type VolunteerRecruitType = 'selection' | 'fcfs';
export type VolunteerApplicationStatus =
  | 'NONE'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELED'
  | 'ATTENDED' // checkin 성공 후 상태
  | 'COMPLETED' // checkout 성공 후 상태
  | 'CERTIFIED'
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
  recruitType?: VolunteerRecruitType;
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
