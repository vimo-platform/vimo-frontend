import { Asset } from 'expo-asset';
import { Image, Platform, StyleSheet } from 'react-native';
import { SvgUri } from 'react-native-svg';

const CALENDAR_CIRCLE = require('@/assets/images/joinimg/calendarcircle.svg');

export function CalendarCircle() {
  const uri = Asset.fromModule(CALENDAR_CIRCLE).uri;

  if (Platform.OS === 'web') {
    return <Image resizeMode="contain" source={{ uri }} style={styles.calendarCircle} />;
  }

  return <SvgUri height={43} style={styles.calendarCircle} uri={uri} width={43} />;
}

const styles = StyleSheet.create({
  calendarCircle: {
    position: 'absolute',
    width: 43,
    height: 43,
  },
});

