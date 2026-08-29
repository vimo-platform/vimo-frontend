export type VolunteerSchedule = {
  id: number;
  postId?: number;
  startDate: string;
  endDate: string;
  repeatWeekday?: number;
  startTime: string;
  endTime: string;
  status: 'before' | 'active';
  applicationStatus?: string;
  title: string;
  credit: string;
  location: string;
};
