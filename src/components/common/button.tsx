import { Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'scheduleCancel' | 'scheduleSubmit';

type ButtonProps = Omit<PressableProps, 'children'> & {
  label?: string;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
};

const variantStyles: Record<ButtonVariant, StyleProp<ViewStyle>> = {
  primary: {
    width: 326,
    backgroundColor: '#222222',
  },
  secondary: {
    width: 326,
    backgroundColor: '#818181',
  },
  scheduleCancel: {
    width: 143,
    backgroundColor: '#818181',
  },
  scheduleSubmit: {
    width: 173,
    backgroundColor: '#222222',
  },
};

export function Button({ label = '로그인', variant = 'primary', disabled, style, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        variantStyles[variant],
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...props}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  label: {
    color: '#F5F5F5',
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: -0.45,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
});
