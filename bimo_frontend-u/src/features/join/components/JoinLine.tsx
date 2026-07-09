import { Asset } from 'expo-asset';
import { Image, Platform, StyleSheet } from 'react-native';
import { SvgUri } from 'react-native-svg';

const JOIN_LINE = require('../../../../assets/images/joinimg/joinLine.svg');

export function JoinLine() {
  const uri = Asset.fromModule(JOIN_LINE).uri;

  if (Platform.OS === 'web') {
    return <Image resizeMode="stretch" source={{ uri }} style={styles.divider} />;
  }

  return <SvgUri height={9} style={styles.divider} uri={uri} width="100%" />;
}

const styles = StyleSheet.create({
  divider: {
    width: '100%',
    height: 9,
  },
});

