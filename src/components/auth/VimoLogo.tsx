import { View } from 'react-native';
import Svg, {
  Defs,
  FeComposite,
  FeDropShadow,
  FeFlood,
  FeGaussianBlur,
  FeMerge,
  FeMergeNode,
  FeOffset,
  Filter,
  G,
  Text as SvgText,
} from 'react-native-svg';

import { pretendard } from '@/styles/common/fonts';

type VimoLogoProps = {
  accessibilityRole?: 'header';
};

// 글자 면은 새까맣게(#222222) 유지 + 가장자리 살짝 광택(볼륨감).
// 바깥 배경 흐림(드롭섀도)은 아주 약하게만.
export function VimoLogo({ accessibilityRole }: VimoLogoProps) {
  return (
    <View accessibilityRole={accessibilityRole} accessibilityLabel="VIMO">
      <Svg width={220} height={92} viewBox="0 0 220 92">
        <Defs>
          <Filter id="logoVolume" x="-40%" y="-40%" width="180%" height="180%">
            {/* 아주 약한 드롭섀도 (큰 halo 제거) */}
            <FeDropShadow
              in="SourceGraphic"
              dx="0"
              dy="2"
              stdDeviation="2"
              floodColor="#000000"
              floodOpacity="0.18"
              result="ds1"
            />
            {/* 화이트 이너 광택 — 가장자리 rim만 (면은 검게 유지) */}
            <FeOffset in="SourceAlpha" dx="1" dy="1" result="wOff" />
            <FeGaussianBlur in="wOff" stdDeviation="1" result="wBlur" />
            <FeComposite in="SourceAlpha" in2="wBlur" operator="out" result="wCut" />
            <FeFlood floodColor="#FFFFFF" floodOpacity="0.5" result="wCol" />
            <FeComposite in="wCol" in2="wCut" operator="in" result="wInner" />
            {/* 다크 이너 엣지 */}
            <FeOffset in="SourceAlpha" dx="1" dy="0" result="bOff" />
            <FeGaussianBlur in="bOff" stdDeviation="0.5" result="bBlur" />
            <FeComposite in="SourceAlpha" in2="bBlur" operator="out" result="bCut" />
            <FeFlood floodColor="#000000" floodOpacity="0.42" result="bCol" />
            <FeComposite in="bCol" in2="bCut" operator="in" result="bInner" />
            {/* 합성: 약한 드롭섀도 → 본체 → 이너 광택/엣지 */}
            <FeMerge>
              <FeMergeNode in="ds1" />
              <FeMergeNode in="SourceGraphic" />
              <FeMergeNode in="wInner" />
              <FeMergeNode in="bInner" />
            </FeMerge>
          </Filter>
        </Defs>
        <G filter="url(#logoVolume)">
          <SvgText
            x={110}
            y={60}
            textAnchor="middle"
            fontFamily={pretendard(700)}
            fontSize={50}
            fill="none"
            stroke="#000000"
            strokeWidth={2}>
            VIMO
          </SvgText>
          <SvgText
            x={110}
            y={60}
            textAnchor="middle"
            fontFamily={pretendard(700)}
            fontSize={50}
            fill="#222222">
            VIMO
          </SvgText>
        </G>
      </Svg>
    </View>
  );
}
