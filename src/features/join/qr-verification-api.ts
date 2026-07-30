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

const USE_MOCK_QR_VALIDATION = process.env.EXPO_PUBLIC_USE_MOCK_QR_VALIDATION === 'true';

export async function verifyQrCapture({
  imageUri,
  postId,
  scanType,
  detectedQrValue,
}: VerifyQrCaptureRequest): Promise<VerifyQrCaptureResponse> {
  if (USE_MOCK_QR_VALIDATION) {
    return {
      verified: isValidVimoQr(detectedQrValue, scanType),
    };
  }

  const volunteerId = Number(postId);

  if (!Number.isFinite(volunteerId)) {
    throw new Error('봉사 공고 정보를 확인할 수 없습니다.');
  }

  const qrValue = detectedQrValue ?? (await scanQrFromImage(imageUri));

  if (!qrValue) {
    return { verified: false, message: 'QR 코드를 인식하지 못했습니다.' };
  }

  try {
    return scanType === 'start'
      ? await verifyVolunteerCheckIn(volunteerId, qrValue)
      : await verifyVolunteerCheckOut(volunteerId, qrValue);
  } catch (error) {
    return {
      verified: false,
      message: error instanceof Error ? error.message : undefined,
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

function isValidVimoQr(value: string | null | undefined, type: QrScanType) {
  if (!value) {
    return false;
  }

  const [prefix, sessionId, qrType, issuedAt] = value.split(':');

  return (
    prefix === 'vimo' &&
    sessionId.length > 0 &&
    qrType === type &&
    Number.isFinite(Number(issuedAt))
  );
}
