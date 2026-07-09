export type VolunteerSchedule = {
  id: number;
  startDate: string;
  endDate: string;
  repeatWeekday: number;
  startTime: string;
  endTime: string;
  status: 'before' | 'active';
  title: string;
  credit: string;
  location: string;
};

