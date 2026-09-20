import { Asset } from 'expo-asset';
import { Image, Platform, StyleSheet } from 'react-native';
import { SvgUri } from 'react-native-svg';

const SEARCH_ICON = require('@/assets/icons/search.svg');

type SearchIconProps = {
  size?: number;
};

export function SearchIcon({ size = 24 }: SearchIconProps) {
  const uri = Asset.fromModule(SEARCH_ICON).uri;

  if (Platform.OS === 'web') {
    return (
      <Image
        resizeMode="contain"
        source={{ uri }}
        style={[styles.icon, { width: size, height: size }]}
      />
    );
  }

  return <SvgUri height={size} uri={uri} width={size} />;
}

const styles = StyleSheet.create({
  icon: {
    flexShrink: 0,
  },
});
