export type User = {
  id: string;
  name: string;
  email: string;
  department: string;
};

export type PostingStatus = "open" | "closed" | "draft";

export type Gender = "전체" | "남성" | "여성";

export type Posting = {
  id: string;
  title: string;
  description: string;
  location: string;
  period: string;
  startTime: string;
  endTime: string;
  capacity: number;
  applicants: number;
  hoursPerSession: number;
  status: PostingStatus;
  tags: string[];
  gender?: Gender;
  createdAt: string;
};

export type SessionStatus = "before" | "ongoing" | "done";

export type Session = {
  id: string;
  postingId: string;
  title: string;
  hoursPerSession: number;
  location: string;
  period: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
};

export type ParticipantStatus = "ongoing" | "done" | "none";

export type Participant = {
  id: string;
  name: string;
  department: string;
  status: ParticipantStatus;
};

export type Applicant = {
  id: string;
  name: string;
  department: string;
  selected: boolean;
};

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type Approval = {
  id: string;
  postingTitle: string;
  hoursPerSession: number;
  location: string;
  period: string;
  startTime: string;
  endTime: string;
  studentName: string;
  status: ApprovalStatus;
};
