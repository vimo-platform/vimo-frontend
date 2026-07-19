import { Image, type ImageStyle, type StyleProp } from 'react-native';

const HEART = require('../../../assets/images/common/heart.png');
const EMPTY_HEART = require('../../../assets/images/common/emptyheart.png');

type HeartImageProps = {
  filled?: boolean;
  style?: StyleProp<ImageStyle>;
};

export function HeartImage({ filled = false, style }: HeartImageProps) {
  return <Image resizeMode="contain" source={filled ? HEART : EMPTY_HEART} style={style} />;
}
