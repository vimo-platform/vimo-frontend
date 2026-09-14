import { View } from 'react-native';
import Svg, { Defs, FeDropShadow, Filter, Text as SvgText } from 'react-native-svg';

import { pretendard } from '@/styles/common/fonts';

type VimoLogoProps = {
  accessibilityRole?: 'header';
};

export function VimoLogo({ accessibilityRole }: VimoLogoProps) {
  return (
    <View accessibilityRole={accessibilityRole} accessibilityLabel="VIMO">
      <Svg width={220} height={96} viewBox="0 0 220 96">
        <Defs>
          <Filter id="logoVolume" x="-50%" y="-50%" width="200%" height="200%">
            <FeDropShadow dx="0" dy="8" stdDeviation="4" floodColor="#000000" floodOpacity="0.34" />
          </Filter>
        </Defs>
        <SvgText
          x={110}
          y={52}
          textAnchor="middle"
          fontFamily={pretendard(700)}
          fontSize={50}
          fill="#222222"
          stroke="#000000"
          strokeWidth={2}
          paintOrder="stroke"
          filter="url(#logoVolume)">
          VIMO
        </SvgText>
      </Svg>
    </View>
  );
}
