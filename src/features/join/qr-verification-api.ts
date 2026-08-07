import { scanFromURLAsync } from 'expo-camera';

import { verifyVolunteerCheckIn, verifyVolunteerCheckOut } from '@/api/volunteers';

export type QrScanType = 'start' | 'end';

type VerifyQrCaptureRequest = {
  imageUri?: string;
  postId?: string;
  scanType: QrScanType;
  detectedQrValue?: string | null;
};

type VerifyQrCaptureResponse = {
  verified: boolean;
  message?: string;
};

export async function verifyQrCapture({
  imageUri,
  postId,
  scanType,
  detectedQrValue,
}: VerifyQrCaptureRequest): Promise<VerifyQrCaptureResponse> {
  const qrValue = normalizeQrToken(detectedQrValue ?? (await scanQrFromImage(imageUri)));

  const volunteerId = Number(postId);

  if (!Number.isFinite(volunteerId)) {
    throw new Error('봉사 공고 정보를 확인할 수 없어요.');
  }

  if (!qrValue) {
    return { verified: false, message: 'QR 코드를 인식할 수 없어요.' };
  }

  try {
    return scanType === 'start'
      ? await verifyVolunteerCheckIn(volunteerId, qrValue)
      : await verifyVolunteerCheckOut(volunteerId, qrValue);
  } catch (error) {
    return {
      verified: false,
      message: error instanceof Error ? normalizeQrErrorMessage(error.message) : undefined,
    };
  }
}

async function scanQrFromImage(imageUri?: string) {
  if (!imageUri) {
    return null;
  }

  try {
    const [result] = await scanFromURLAsync(imageUri, ['qr']);

    return typeof result?.data === 'string' && result.data.length > 0 ? result.data : null;
  } catch {
    return null;
  }
}

function normalizeQrToken(value: string | null | undefined) {
  const normalizedValue = value?.trim();

  return normalizedValue && normalizedValue.length > 0 ? normalizedValue : null;
}

function normalizeQrErrorMessage(message: string) {
  const normalizedMessage = message.trim();

  if (normalizedMessage.includes('QR token has expired')) {
    return 'QR 코드가 만료되었어요. 관리자에게 새 QR 생성을 요청해주세요.';
  }

  if (normalizedMessage.includes('QR token type mismatch')) {
    return '시작/종료 QR 코드가 맞지 않아요.';
  }

  if (normalizedMessage.includes('Only approved applications can check in')) {
    return '승인된 봉사만 시작 인증을 할 수 있어요.';
  }

  if (normalizedMessage.includes('Cannot check out before check-in')) {
    return '시작 인증 후 종료 인증을 할 수 있어요.';
  }

  if (normalizedMessage.includes('already checked in')) {
    return '이미 시작 인증이 완료되었어요.';
  }

  if (normalizedMessage.includes('오늘 진행하는 봉사가 아닙니다')) {
    return '오늘 진행하는 봉사가 아니에요.';
  }

  return normalizedMessage || 'QR 코드 인증에 실패했어요.';
}
