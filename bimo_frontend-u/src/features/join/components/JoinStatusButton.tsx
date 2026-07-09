import { Image, Pressable, StyleSheet } from 'react-native';

const JOIN_STATUS = require('../../../../assets/images/joinimg/joinstatus.png');

export function JoinStatusButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel="지원 현황"
      accessibilityRole="button"
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}>
      <Image resizeMode="contain" source={JOIN_STATUS} style={styles.image} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 76,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 76,
    height: 34,
  },
  pressed: {
    opacity: 0.85,
  },
});

