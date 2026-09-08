import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const MAX_REASON_LENGTH = 100;

type CancelApplicationSheetProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

export function CancelApplicationSheet({
  visible,
  onClose,
  onConfirm,
}: CancelApplicationSheetProps) {
  const [reason, setReason] = useState('');

  const handleClose = () => {
    setReason('');
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(reason.trim());
    setReason('');
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        <Pressable accessibilityRole="button" style={styles.dimmed} onPress={handleClose} />

        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>지원 취소</Text>

          <View style={styles.messageGroup}>
            <WarningIcon />
            <View style={styles.messageTextGroup}>
              <Text style={styles.confirmTitle}>정말 지원을 취소하시겠어요?</Text>
              <Text style={styles.description}>
                취소 시, 참여 기회를 놓칠 수 있으며{'\n'}
                일부 봉사는 재신청이 제한될 수 있습니다.
              </Text>
            </View>
          </View>

          <View style={styles.reasonGroup}>
            <Text style={styles.reasonLabel}>취소 사유를 입력해주세요.</Text>
            <View style={styles.inputBox}>
              <TextInput
                maxLength={MAX_REASON_LENGTH}
                multiline
                placeholder="개인 일정으로 참여 불가 / 건강상의 이유/ 단순변심 등"
                placeholderTextColor="#D2D2D2"
                style={styles.input}
                textAlignVertical="top"
                value={reason}
                onChangeText={setReason}
              />
              <Text style={styles.counter}>
                {reason.length} / {MAX_REASON_LENGTH}
              </Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              onPress={handleClose}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed]}
              onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>취소하기</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function WarningIcon() {
  return (
    <Svg height={54} viewBox="0 0 54 54" width={54}>
      <Path
        d="M24.43 10.5c1.14-1.98 3.99-1.98 5.13 0l18.27 31.65c1.14 1.98-.29 4.45-2.56 4.45H8.72c-2.27 0-3.7-2.47-2.56-4.45L24.43 10.5Z"
        fill="none"
        stroke="#ED8585"
        strokeLinejoin="round"
        strokeWidth={3}
      />
      <Path
        d="M27 22v9"
        fill="none"
        stroke="#ED8585"
        strokeLinecap="round"
        strokeWidth={3}
      />
      <Path
        d="M27 38h.02"
        fill="none"
        stroke="#ED8585"
        strokeLinecap="round"
        strokeWidth={4}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  dimmed: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(34, 34, 34, 0.5)',
  },
  sheet: {
    width: '100%',
    maxWidth: 393,
    height: 537,
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 31,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 26,
    backgroundColor: '#FFFFFF',
  },
  sheetTitle: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  messageGroup: {
    alignItems: 'center',
    marginTop: 29,
  },
  messageTextGroup: {
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
  },
  confirmTitle: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    color: '#606060',
    fontFamily: 'Pretendard',
    fontSize: 15,
    fontWeight: '300',
    lineHeight: 22,
    textAlign: 'center',
  },
  reasonGroup: {
    width: 320,
    marginTop: 29,
  },
  reasonLabel: {
    color: '#606060',
    fontFamily: 'Pretendard',
    fontSize: 12,
    fontWeight: '700',
  },
  inputBox: {
    height: 122,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#D2D2D2',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  input: {
    minHeight: 82,
    paddingTop: 18,
    paddingHorizontal: 17,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 12,
    fontWeight: '600',
  },
  counter: {
    position: 'absolute',
    right: 17,
    bottom: 18,
    color: '#D2D2D2',
    fontFamily: 'Pretendard',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginTop: 40,
  },
  closeButton: {
    width: 143,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#818181',
  },
  confirmButton: {
    width: 173,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#C07777',
  },
  closeButtonText: {
    color: '#F5F5F5',
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.45,
  },
  confirmButtonText: {
    color: '#FCE8E8',
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.45,
  },
  pressed: {
    opacity: 0.85,
  },
});
