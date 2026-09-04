import { scanFromURLAsync } from 'expo-camera';

import { verifyVolunteerCheckIn, verifyVolunteerCheckOut } from '@/services/common/volunteers';

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
    return { verified: false, message: 'QR 코드를 인식할 수 없어요. 다시 촬영해 주세요.' };
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
  const lowerMessage = normalizedMessage.toLowerCase();

  if (lowerMessage.includes('expired') || normalizedMessage.includes('만료')) {
    return 'QR 코드가 만료되었어요. 관리자에게 새 QR 생성을 요청해 주세요.';
  }

  if (lowerMessage.includes('type mismatch') || normalizedMessage.includes('타입')) {
    return '시작/종료 QR 코드가 맞지 않아요.';
  }

  if (
    lowerMessage.includes('only approved') ||
    normalizedMessage.includes('승인') ||
    normalizedMessage.includes('미승인')
  ) {
    return '승인된 봉사만 QR 인증할 수 있어요.';
  }

  if (lowerMessage.includes('before check-in') || normalizedMessage.includes('체크인 전')) {
    return '시작 인증 후 종료 인증할 수 있어요.';
  }

  if (lowerMessage.includes('already checked in') || normalizedMessage.includes('이미')) {
    return '이미 시작 인증이 완료되었어요.';
  }

  if (
    normalizedMessage.includes('오늘') ||
    lowerMessage.includes('not today') ||
    lowerMessage.includes('today') ||
    lowerMessage.includes('not scheduled') ||
    lowerMessage.includes('different date')
  ) {
    return '오늘 진행하는 봉사가 아니에요.';
  }

  if (lowerMessage.includes('invalid qr') || lowerMessage.includes('invalid token')) {
    return '인식한 QR 코드가 이 봉사 공고의 QR과 일치하지 않아요.';
  }

  return normalizedMessage || 'QR 코드 인증에 실패했어요.';
}
