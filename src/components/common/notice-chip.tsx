import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

type NoticeChipProps = {
  label: string;
  style?: StyleProp<ViewStyle>;
};

export function NoticeChip({ label, style }: NoticeChipProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
  },
  label: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16.8,
    letterSpacing: -0.3,
    textAlign: 'center',
    opacity: 0.5,
  },
});
