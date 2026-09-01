import { Asset } from 'expo-asset';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';
import { SvgUri } from 'react-native-svg';

import { UserGnb } from '@/components/navigation/user-gnb';

import { verifyQrCapture } from './qr-verification-api';

const QR_EXAMPLE = require('../../../assets/images/joinimg/QRCODEex.svg');
const CAPTURE_CTA = require('../../../assets/images/joinimg/Capture CTA.svg');
const SCAN_EXAMPLE_BACKGROUND = require('../../../assets/images/joinimg/QRScanExampleBackground.png');

type ScanStep = 'loading' | 'camera' | 'failed';

export function QrActivityScanScreen() {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 393);
  const { postId, type, startTime, endTime } = useLocalSearchParams<{
    postId?: string;
    type?: 'start' | 'end';
    startTime?: string;
    endTime?: string;
  }>();
  const [step, setStep] = useState<ScanStep>('loading');
  const [permission, requestPermission] = useCameraPermissions();
  const [detectedQrValue, setDetectedQrValue] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const scanType = type === 'end' ? 'end' : 'start';
  const activityTime =
    scanType === 'end'
      ? typeof endTime === 'string' && endTime
        ? endTime
        : '16:30'
      : typeof startTime === 'string' && startTime
        ? startTime
        : '11:30';

  useEffect(() => {
    requestPermission();

    const timer = setTimeout(() => {
      setStep('camera');
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const close = () => {
    router.replace('/explore');
  };

  const capture = async () => {
    if (isVerifying) {
      return;
    }

    setIsVerifying(true);

    let capturedImageUri: string | undefined;

    try {
      if (permission?.granted === true && cameraRef.current) {
        const picture = await cameraRef.current.takePictureAsync({
          quality: 0.9,
          base64: Platform.OS === 'web',
          shutterSound: false,
        });
        capturedImageUri = picture.uri;
      }

      const verification = await verifyQrCapture({
        imageUri: capturedImageUri,
        postId,
        scanType,
        detectedQrValue,
      });

      if (!verification.verified) {
        // 서버가 내려준 구체적 실패 사유(QR 만료, 타입 불일치, 미승인, 이미 체크인 등)를 노출
        setFailureMessage(verification.message ?? null);
        setStep('failed');
        return;
      }

      const query = `qrSuccess=${scanType}&time=${encodeURIComponent(activityTime)}${
        postId ? `&postId=${encodeURIComponent(postId)}` : ''
      }${
        scanType === 'end' && typeof startTime === 'string' && startTime
          ? `&startTime=${encodeURIComponent(startTime)}`
          : ''
      }`;
      router.replace(`/explore?${query}` as Href);
    } catch (error) {
      setFailureMessage(error instanceof Error ? error.message : null);
      setStep('failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBarcodeScanned = ({ data }: BarcodeScanningResult) => {
    if (typeof data === 'string' && data.length > 0) {
      setDetectedQrValue(data);
      return;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <View style={[styles.screen, { width: contentWidth }]}>
        {step === 'loading' ? (
          <LoadingQrView onClose={close} onStartScan={() => setStep('camera')} />
        ) : (
          <CameraQrView
            cameraRef={cameraRef}
            cameraReady={permission?.granted === true}
            failed={step === 'failed'}
            failureMessage={failureMessage}
            verifying={isVerifying}
            onCapture={capture}
            onClose={close}
            onDismissFailure={() => {
              setFailureMessage(null);
              setStep('camera');
            }}
            onQrDetected={handleBarcodeScanned}
          />
        )}
        <UserGnb activeKey="participation" />
      </View>
    </SafeAreaView>
  );
}

function LoadingQrView({
  onClose,
  onStartScan,
}: {
  onClose: () => void;
  onStartScan: () => void;
}) {
  const qrUri = Asset.fromModule(QR_EXAMPLE).uri;

  return (
    <View style={styles.captureSurface}>
      <CloseButton onPress={onClose} />
      <SvgUri height={107} style={styles.qrExample} uri={qrUri} width={125} />
      <Text style={styles.loadingText}>
        QR 코드를 촬영하여{'\n'}인증을 시작해 주세요
      </Text>
      <CaptureButton onPress={onStartScan} style={styles.loadingCaptureButton} />
    </View>
  );
}

function CameraQrView({
  cameraRef,
  cameraReady,
  failed,
  failureMessage,
  verifying,
  onCapture,
  onClose,
  onDismissFailure,
  onQrDetected,
}: {
  cameraRef: React.RefObject<CameraView | null>;
  cameraReady: boolean;
  failed: boolean;
  failureMessage?: string | null;
  verifying: boolean;
  onCapture: () => void;
  onClose: () => void;
  onDismissFailure: () => void;
  onQrDetected: (result: BarcodeScanningResult) => void;
}) {
  return (
    <View style={styles.cameraSurface}>
      {cameraReady ? (
        <CameraView
          ref={cameraRef}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          facing="back"
          style={styles.cameraPreview}
          onBarcodeScanned={onQrDetected}
        />
      ) : (
        <Image resizeMode="cover" source={SCAN_EXAMPLE_BACKGROUND} style={styles.cameraPreview} />
      )}
      <CloseButton onPress={onClose} />
      <ScannerFrame />
      <CaptureButton disabled={verifying} onPress={onCapture} style={styles.cameraCaptureButton} />
      {failed ? <FailureDialog message={failureMessage} onClose={onDismissFailure} /> : null}
    </View>
  );
}

function CaptureButton({
  disabled,
  onPress,
  style,
}: {
  disabled?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const uri = Asset.fromModule(CAPTURE_CTA).uri;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [styles.captureButton, pressed && !disabled && styles.pressed, style]}
      onPress={onPress}>
      <SvgUri height={102} uri={uri} width={102} />
    </Pressable>
  );
}

function CloseButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityLabel="닫기" hitSlop={12} style={styles.closeButton} onPress={onPress}>
      <Svg height={24} viewBox="0 0 24 24" width={24}>
        <Line stroke="#FFFFFF" strokeLinecap="round" strokeWidth={2} x1={7} x2={17} y1={7} y2={17} />
        <Line stroke="#FFFFFF" strokeLinecap="round" strokeWidth={2} x1={17} x2={7} y1={7} y2={17} />
      </Svg>
    </Pressable>
  );
}

function ScannerFrame() {
  return (
    <View pointerEvents="none" style={styles.scannerFrame}>
      <View style={[styles.corner, styles.cornerTopLeft]} />
      <View style={[styles.corner, styles.cornerTopRight]} />
      <View style={[styles.corner, styles.cornerBottomLeft]} />
      <View style={[styles.corner, styles.cornerBottomRight]} />
      <View style={[styles.sideLine, styles.sideLineLeftTop]} />
      <View style={[styles.sideLine, styles.sideLineLeftBottom]} />
      <View style={[styles.sideLine, styles.sideLineRightTop]} />
      <View style={[styles.sideLine, styles.sideLineRightBottom]} />
    </View>
  );
}

function FailureDialog({ message, onClose }: { message?: string | null; onClose: () => void }) {
  const description = message?.trim()
    ? message.trim()
    : 'QR 코드를 인식할 수 없어요.\n다시 시도하거나 관리자에게 문의해주세요.';

  return (
    <View style={styles.failureOverlay}>
      <View style={styles.failureCard}>
        <Pressable accessibilityLabel="닫기" hitSlop={10} style={styles.failureClose} onPress={onClose}>
          <Svg height={18} viewBox="0 0 18 18" width={18}>
            <Line stroke="#606060" strokeLinecap="round" strokeWidth={1.6} x1={4} x2={14} y1={4} y2={14} />
            <Line stroke="#606060" strokeLinecap="round" strokeWidth={1.6} x1={14} x2={4} y1={4} y2={14} />
          </Svg>
        </Pressable>
        <View style={styles.warningCircle}>
          <Text style={styles.warningMark}>!</Text>
        </View>
        <Text style={styles.failureTitle}>QR 코드 인증 실패</Text>
        <Text style={styles.failureDescription}>{description}</Text>
        <Pressable style={({ pressed }) => [styles.failureConfirm, pressed && styles.pressed]} onPress={onClose}>
          <Text style={styles.failureConfirmText}>확인</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function QrSuccessDialog({
  time,
  type = 'start',
  onConfirm,
}: {
  time: string;
  type?: 'start' | 'end';
  onConfirm: () => void;
}) {
  const message =
    type === 'end'
      ? `${time} 봉사 활동이 종료되었습니다.`
      : `${time} 봉사 활동을 시작합니다.`;

  return (
    <View style={styles.successOverlay}>
      <View style={styles.successCard}>
        <Pressable accessibilityLabel="닫기" hitSlop={10} style={styles.successClose} onPress={onConfirm}>
          <Svg height={18} viewBox="0 0 18 18" width={18}>
            <Line stroke="#606060" strokeLinecap="round" strokeWidth={1.5} x1={4} x2={14} y1={4} y2={14} />
            <Line stroke="#606060" strokeLinecap="round" strokeWidth={1.5} x1={14} x2={4} y1={4} y2={14} />
          </Svg>
        </Pressable>
        <Text style={styles.successText}>{message}</Text>
        <Pressable style={({ pressed }) => [styles.successConfirm, pressed && styles.pressed]} onPress={onConfirm}>
          <Text style={styles.successConfirmText}>확인</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#323232',
  },
  screen: {
    flex: 1,
    backgroundColor: '#323232',
  },
  captureSurface: {
    flex: 1,
    backgroundColor: '#323232',
  },
  cameraSurface: {
    flex: 1,
    backgroundColor: '#323232',
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: 55,
    right: 28,
    zIndex: 5,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrExample: {
    position: 'absolute',
    top: 262,
    alignSelf: 'center',
    width: 125,
    height: 107,
  },
  loadingText: {
    position: 'absolute',
    top: 436,
    alignSelf: 'center',
    color: '#FFFFFF',
    fontFamily: 'Pretendard',
    fontSize: 21,
    fontWeight: '500',
    lineHeight: 34,
    textAlign: 'center',
  },
  captureButton: {
    width: 102,
    height: 102,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCaptureButton: {
    position: 'absolute',
    top: 575,
    alignSelf: 'center',
  },
  cameraPreview: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
  scannerFrame: {
    position: 'absolute',
    top: 125,
    left: 49,
    width: 295,
    height: 353,
    borderRadius: 16,
  },
  corner: {
    position: 'absolute',
    width: 94,
    height: 62,
    borderColor: '#D2D2D2',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 6,
    borderLeftWidth: 6,
    borderTopLeftRadius: 16,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 6,
    borderRightWidth: 6,
    borderTopRightRadius: 16,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 6,
    borderLeftWidth: 6,
    borderBottomLeftRadius: 16,
  },
  cornerBottomRight: {
    right: 0,
    bottom: 0,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderBottomRightRadius: 16,
  },
  sideLine: {
    position: 'absolute',
    width: 6,
    height: 62,
    borderRadius: 6,
    backgroundColor: '#D2D2D2',
  },
  sideLineLeftTop: {
    top: 111,
    left: 0,
  },
  sideLineLeftBottom: {
    bottom: 82,
    left: 0,
  },
  sideLineRightTop: {
    top: 111,
    right: 0,
  },
  sideLineRightBottom: {
    right: 0,
    bottom: 82,
  },
  cameraCaptureButton: {
    position: 'absolute',
    top: 575,
    alignSelf: 'center',
  },
  failureOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 17, 17, 0.56)',
    zIndex: 10,
  },
  failureCard: {
    width: 317,
    height: 332,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingTop: 36,
  },
  failureClose: {
    position: 'absolute',
    top: 17,
    right: 17,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningCircle: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 35,
    backgroundColor: '#FFE5E8',
  },
  warningMark: {
    color: '#F07D82',
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 42,
  },
  failureTitle: {
    marginTop: 20,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 20,
    fontWeight: '700',
  },
  failureDescription: {
    marginTop: 20,
    color: '#606060',
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 26,
    textAlign: 'center',
  },
  failureConfirm: {
    position: 'absolute',
    left: 25,
    right: 25,
    bottom: 25,
    height: 47,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#222222',
  },
  failureConfirmText: {
    color: '#F5F5F5',
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontWeight: '600',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 17, 17, 0.58)',
  },
  successCard: {
    width: 271,
    height: 143,
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  successClose: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    marginTop: 48,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  successConfirm: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222222',
  },
  successConfirmText: {
    color: '#F5F5F5',
    fontFamily: 'Pretendard',
    fontSize: 13,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.88,
  },
});
