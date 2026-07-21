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

const USE_MOCK_QR_VALIDATION = process.env.EXPO_PUBLIC_USE_MOCK_QR_VALIDATION !== 'false';

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

  const formData = new FormData();

  if (imageUri) {
    formData.append('qrImage', {
      uri: imageUri,
      name: `${scanType}-qr.jpg`,
      type: 'image/jpeg',
    } as unknown as Blob);
  }

  if (detectedQrValue) {
    formData.append('qrValue', detectedQrValue);
  }

  return scanType === 'start'
    ? verifyVolunteerCheckIn(volunteerId, formData)
    : verifyVolunteerCheckOut(volunteerId, formData);
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
