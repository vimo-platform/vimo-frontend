import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

type CancelCompleteModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function CancelCompleteModal({
  visible,
  onClose,
  onConfirm,
}: CancelCompleteModalProps) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dimmed} />
        <View style={styles.dialog}>
          <Pressable
            accessibilityLabel="닫기"
            accessibilityRole="button"
            hitSlop={10}
            style={({ pressed }) => [
              styles.closeIconButton,
              Platform.OS === 'web' && styles.webPointer,
              pressed && styles.pressed,
            ]}
            onPress={onClose}>
            <Svg height={12} viewBox="0 0 12 12" width={12}>
              <Path
                d="M1 1l10 10M11 1 1 11"
                fill="none"
                stroke="#222222"
                strokeLinecap="round"
                strokeWidth={1.2}
              />
            </Svg>
          </Pressable>

          <View style={styles.content}>
            <SuccessIcon />
            <View style={styles.textGroup}>
              <Text style={styles.title}>취소 완료</Text>
              <Text style={styles.description}>
                봉사 지원이 정상적으로{'\n'}
                취소되었습니다.
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.confirmButton,
              Platform.OS === 'web' && styles.webPointer,
              pressed && styles.pressed,
            ]}
            onPress={onConfirm}>
            <Text style={styles.confirmButtonText}>확인</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function SuccessIcon() {
  return (
    <Svg height={54} viewBox="0 0 54 54" width={54}>
      <Circle cx={27} cy={27} fill="#818181" r={24} />
      <Path
        d="M17.5 27.5 24.2 34 37 20"
        fill="none"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={5}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimmed: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(34, 34, 34, 0.5)',
  },
  dialog: {
    width: 238,
    height: 308,
    alignItems: 'center',
    paddingTop: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  closeIconButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 2,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webPointer: {
    cursor: 'pointer',
  },
  content: {
    alignItems: 'center',
    gap: 18,
  },
  textGroup: {
    alignItems: 'center',
    gap: 20,
  },
  title: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    color: '#606060',
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 26,
    textAlign: 'center',
  },
  confirmButton: {
    width: 202,
    height: 47,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 44,
    borderRadius: 13,
    backgroundColor: '#222222',
  },
  confirmButtonText: {
    color: '#F5F5F5',
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.45,
  },
  pressed: {
    opacity: 0.84,
  },
});

