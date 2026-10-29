import { ApiError } from '@/services/common/client';

export class TimetableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimetableError';
  }
}

export function getScheduleAnalysisErrorMessage(error: unknown): string {
  if (error instanceof TimetableError) return error.message;

  if (error instanceof ApiError) {
    if (error.status === 401) return '로그인이 만료되었어요. 다시 로그인해 주세요.';
    if (error.status === 413) return '사진 용량이 너무 커요. 10MB 이하의 시간표 사진을 선택해 주세요.';
    if (error.status === 422) {
      try {
        const body = JSON.parse(error.message);
        if (typeof body.message === 'string' && body.message.trim()) return body.message;
      } catch {
        // Some server versions return a plain-text error instead of JSON.
      }
      return '사진에서 시간표를 읽지 못했어요. 과목명과 시간이 선명하게 보이는 사진을 선택해 주세요.';
    }
    if (error.status >= 500) return '서버에서 시간표를 처리하지 못했어요. 잠시 후 다시 시도해 주세요.';
  }

  return '시간표 요청을 처리하지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요.';
}
