export type VolunteerStatus = 'RECRUITING' | 'CLOSED' | 'COMPLETED';

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
};

export type VolunteerPostFilter = {
  query: string;
  category: string;
  location: string;
  status: VolunteerStatus | 'all';
};
