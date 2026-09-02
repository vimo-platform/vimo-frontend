import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { ScheduleEditIcon } from './Icons';

type ScheduleItem = {
  time: string;
  title: string;
};

type ScheduleButtonProps = Omit<PressableProps, 'children'> & {
  title?: string;
  items?: ScheduleItem[];
  actionLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const defaultItems: ScheduleItem[] = [
  { time: '09:00 - 11:50', title: '국제비즈니스영어' },
  { time: '15:30 - 16:30', title: '인성과 학문 III' },
];

export function ScheduleButton({
  title = '오늘 시간표',
  items = defaultItems,
  actionLabel = '시간표 수정하기',
  disabled,
  style,
  ...props
}: ScheduleButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...props}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {items.map((item) => (
          <Text key={`${item.time}-${item.title}`} style={styles.scheduleText}>
            {item.time} {item.title}
          </Text>
        ))}
      </View>
      <View style={styles.action}>
        <ScheduleEditIcon width={20} height={20} />
        <Text style={styles.actionLabel}>{actionLabel}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 324,
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#606060',
    borderRadius: 18,
  },
  title: {
    color: '#606060',
    fontFamily: 'Pretendard',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 14,
  },
  scheduleText: {
    color: '#606060',
    fontFamily: 'Pretendard',
    fontSize: 9,
    fontWeight: '500',
    lineHeight: 14,
  },
  action: {
    width: 57,
    alignItems: 'center',
    gap: 8,
  },
  actionLabel: {
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
});
