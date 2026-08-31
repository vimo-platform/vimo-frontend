import { Asset } from 'expo-asset';
import {
  Image,
  Platform,
  View,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SvgUri } from 'react-native-svg';

const HEART = require('../../../assets/images/common/heart.png');
const EMPTY_HEART = require('../../../assets/icons/heart-empty-point.svg');

type HeartImageProps = {
  filled?: boolean;
  style?: StyleProp<ImageStyle>;
};

export function HeartImage({ filled = false, style }: HeartImageProps) {
  if (filled || Platform.OS === 'web') {
    const source = filled ? HEART : { uri: Asset.fromModule(EMPTY_HEART).uri };

    return <Image resizeMode="contain" source={source} style={style} />;
  }

  return (
    <View style={style as StyleProp<ViewStyle>}>
      <SvgUri height="100%" uri={Asset.fromModule(EMPTY_HEART).uri} width="100%" />
    </View>
  );
}
