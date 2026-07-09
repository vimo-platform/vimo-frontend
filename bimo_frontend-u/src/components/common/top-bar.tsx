import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { BackIcon } from './icons';

type TopBarProps = {
  title?: string;
  onBackPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function TopBar({ title = '지원공고', onBackPress, style }: TopBarProps) {
  return (
    <View style={[styles.container, style]}>
      <Pressable accessibilityRole="button" hitSlop={12} style={styles.backButton} onPress={onBackPress}>
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
    left: 20,
    top: 13,
    width: 18,
    height: 24,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    color: '#111111',
    fontFamily: 'Pretendard',
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
});
