import {
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type ParticipationButtonVariant = 'start' | 'end';

type ParticipationButtonProps = Omit<PressableProps, 'children'> & {
  label?: string;
  variant?: ParticipationButtonVariant;
  style?: StyleProp<ViewStyle>;
};

export function ParticipationButton({
  label,
  variant = 'start',
  disabled,
  style,
  ...props
}: ParticipationButtonProps) {
  const isEnd = variant === 'end';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        styles.activeContainer,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...props}>
      <Text style={styles.label}>{label ?? (isEnd ? '종료' : '시작')}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 122,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: 7,
    paddingBottom: 8,
    borderRadius: 16,
  },
  activeContainer: {
    backgroundColor: '#222222',
  },
  label: {
    color: '#F5F5F5',
    fontFamily: 'Pretendard',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    backgroundColor: '#818181',
  },
});
