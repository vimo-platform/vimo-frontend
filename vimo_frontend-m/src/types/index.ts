export type User = {
  id: string;
  name: string;
  email: string;
  department: string;
};

export type PostingStatus = "open" | "closed" | "draft";

// selection: 관리자가 채택, fcfs: 선착순 (정원이 차면 자동 마감)
export type RecruitType = "selection" | "fcfs";

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
  recruitType?: RecruitType;
  tags: string[];
  // 지원 취소 불가 공고 (미지정이면 취소 불가로 취급)
  noCancel?: boolean;
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
  // 지원 취소한 학생만 값이 있음
  cancel?: { at: string; reason: string };
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
