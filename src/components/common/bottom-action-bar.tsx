import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Button } from './button';

type BottomActionBarProps = {
  label?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function BottomActionBar({ label = '로그인', onPress, style }: BottomActionBarProps) {
  return (
    <View style={[styles.container, style]}>
      <Button label={label} onPress={onPress} />
      <View style={styles.homeArea}>
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 393,
    height: 104,
    alignItems: 'center',
  },
  homeArea: {
    height: 34,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: '#626877',
  },
});
