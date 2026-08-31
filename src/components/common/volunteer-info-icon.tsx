import { Asset } from 'expo-asset';
import { Image, Platform, StyleSheet } from 'react-native';
import { SvgUri } from 'react-native-svg';

export type VolunteerInfoIconType = 'location' | 'calendar' | 'clock';

const ICONS = {
  location: require('../../../assets/icons/location.svg'),
  calendar: require('../../../assets/icons/calender.svg'),
  clock: require('../../../assets/icons/clock.svg'),
} as const;

const DEFAULT_SIZES: Record<VolunteerInfoIconType, { width: number; height: number }> = {
  location: { width: 12, height: 15 },
  calendar: { width: 14, height: 13 },
  clock: { width: 13, height: 13 },
};

type Props = {
  type: VolunteerInfoIconType;
  width?: number;
  height?: number;
};

export function VolunteerInfoIcon({ type, width, height }: Props) {
  const uri = Asset.fromModule(ICONS[type]).uri;
  const size = DEFAULT_SIZES[type];
  const iconWidth = width ?? size.width;
  const iconHeight = height ?? size.height;

  if (Platform.OS === 'web') {
    return (
      <Image
        resizeMode="contain"
        source={{ uri }}
        style={[styles.icon, { width: iconWidth, height: iconHeight }]}
      />
    );
  }

  return <SvgUri height={iconHeight} uri={uri} width={iconWidth} />;
}

const styles = StyleSheet.create({
  icon: {
    flexShrink: 0,
  },
});
