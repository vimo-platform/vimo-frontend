import { Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

type ApplicationStatusButtonProps = Omit<PressableProps, 'children'> & {
  hovered?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

export function ApplicationStatusButton({
  hovered = false,
  label = '지원 현황',
  disabled,
  style,
  ...props
}: ApplicationStatusButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        hovered ? styles.hoveredContainer : styles.defaultContainer,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...props}>
      <Text style={[styles.label, hovered ? styles.hoveredLabel : styles.defaultLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    borderRadius: 20,
  },
  defaultContainer: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  hoveredContainer: {
    backgroundColor: '#222222',
  },
  label: {
    fontFamily: 'Pretendard',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: -0.25,
  },
  defaultLabel: {
    color: '#222222',
  },
  hoveredLabel: {
    color: '#F5F5F5',
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
});
