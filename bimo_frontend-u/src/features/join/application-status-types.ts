export type ApplicationProgressStep = 1 | 2 | 3 | 4 | 5;

export type ApplicationVolunteerCard = {
  id: number;
  title: string;
  credit: string;
  location: string;
  period: string;
  time: string;
  recruitCount: number;
  applicantCount: number;
  liked: boolean;
  applied: boolean;
  hasPreferredCondition: boolean;
  progressStep?: ApplicationProgressStep;
};

