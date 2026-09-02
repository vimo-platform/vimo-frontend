import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { BackIcon } from './Icons';

type TopBarProps = {
  title?: string;
  onBackPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function TopBar({ title = '지원공고', onBackPress, style }: TopBarProps) {
  return (
    <View style={[styles.container, style]}>
      <Pressable
        accessibilityLabel="이전 화면으로 이동"
        accessibilityRole="button"
        hitSlop={8}
        style={({ pressed }) => [
          styles.backButton,
          Platform.OS === 'web' && styles.webBackButton,
          pressed && styles.pressed,
        ]}
        onPress={onBackPress}>
        <BackIcon width={9} height={18} />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 393,
    height: 50,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 10,
    width: 56,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
  },
  webBackButton: {
    cursor: 'pointer',
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    color: '#111111',
    fontFamily: 'Pretendard',
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
});
