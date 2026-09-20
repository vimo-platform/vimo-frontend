import { Asset } from 'expo-asset';
import { Image, Platform, StyleSheet, type ImageStyle, type StyleProp } from 'react-native';
import { SvgUri } from 'react-native-svg';

const ALL_LINE = require('@/assets/images/common/allLine.svg');

type AllLineProps = {
  style?: StyleProp<ImageStyle>;
};

export function AllLine({ style }: AllLineProps) {
  const uri = Asset.fromModule(ALL_LINE).uri;

  if (Platform.OS === 'web') {
    return <Image resizeMode="stretch" source={{ uri }} style={[styles.line, style]} />;
  }

  return <SvgUri height={9} style={[styles.line, style]} uri={uri} width="100%" />;
}

const styles = StyleSheet.create({
  line: {
    width: '100%',
    height: 9,
  },
});
