import { View } from 'react-native';
import Svg, { Text as SvgText } from 'react-native-svg';

type VimoLogoProps = {
  accessibilityRole?: 'header';
};

export function VimoLogo({ accessibilityRole }: VimoLogoProps) {
  return (
    <View accessibilityRole={accessibilityRole} accessibilityLabel="VIMO">
      <Svg width={200} height={72} viewBox="0 0 200 72">
        <SvgText
          x={100}
          y={54}
          textAnchor="middle"
          fontSize={50}
          fontWeight="bold"
          fill="#333333"
          stroke="#000000"
          strokeWidth={1}>
          VIMO
        </SvgText>
      </Svg>
    </View>
  );
}
