import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { pretendard } from '@/styles/common/fonts';

// 디자인이 고정폭(393) 프레임을 기준으로 만들어져 있어, 검색창도 그 안에서
// 좌우 39px씩 뺀 고정폭(315)을 그대로 쓴다.
const WIDTH = 315;
const HEIGHT = 50;
const RADIUS = 28;
const BORDER_WIDTH = 1;

// Figma의 "radial-gradient(98.57% 621% at 1.43% 55%, ...)"는 가로/세로 각각
// 자기 축 길이 기준 퍼센트라 서로 달라 보이지만, 실제 픽셀 반지름으로 환산하면
// 두 값이 같다(315 * 98.57% ≈ 50 * 621% ≈ 310.5) — 즉 315×50 박스 안에서는
// 그냥 반지름 310.5px짜리 원형 그라데이션이다. SVG에서는 굳이 타원으로 왜곡할
// 필요 없이 원형 radialGradient를 그대로 쓰면 된다.
const GRADIENT_CENTER_X = WIDTH * 0.0143;
const GRADIENT_CENTER_Y = HEIGHT * 0.55;
const GRADIENT_RADIUS = WIDTH * 0.9857;

export const SEARCH_FIELD_TEXT_STYLE = {
  fontFamily: pretendard(500),
  fontSize: 12,
  lineHeight: 12,
  letterSpacing: 0,
} as const;

export const SEARCH_FIELD_PLACEHOLDER_COLOR = '#818181';

type GradientSearchFieldProps = {
  children: ReactNode;
};

// 검색창 배경/테두리/그림자를 유저·관리자 공통으로 그리는 컴포넌트.
// 테두리: radial-gradient(다이아몬드) 1px 스트록
// 배경: #D9D9D9 20%(그라데이션이 비쳐 보이지 않도록 흰 배경 위에 겹침)
// 그림자: 0 0 10px #F5F5F5
export function GradientSearchField({ children }: GradientSearchFieldProps) {
  return (
    <View style={styles.shadowWrap}>
      <View style={styles.box}>
        <Svg height={HEIGHT} style={StyleSheet.absoluteFill} width={WIDTH}>
          <Defs>
            <RadialGradient
              cx={GRADIENT_CENTER_X}
              cy={GRADIENT_CENTER_Y}
              gradientUnits="userSpaceOnUse"
              id="searchFieldBorder"
              r={GRADIENT_RADIUS}>
              <Stop offset={0.1509} stopColor="#C1C1C1" />
              <Stop offset={0.4135} stopColor="#FFFFFF" />
              <Stop offset={0.7308} stopColor="#222222" />
              <Stop offset={1} stopColor="#EFEFEF" />
            </RadialGradient>
          </Defs>
          <Rect
            fill="none"
            height={HEIGHT - BORDER_WIDTH}
            rx={RADIUS - BORDER_WIDTH / 2}
            ry={RADIUS - BORDER_WIDTH / 2}
            stroke="url(#searchFieldBorder)"
            strokeWidth={BORDER_WIDTH}
            width={WIDTH - BORDER_WIDTH}
            x={BORDER_WIDTH / 2}
            y={BORDER_WIDTH / 2}
          />
        </Svg>
        <View style={styles.backdrop} />
        <View style={styles.fill}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    width: WIDTH,
    height: HEIGHT,
    alignSelf: 'center',
    shadowColor: '#F5F5F5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  box: {
    width: WIDTH,
    height: HEIGHT,
  },
  backdrop: {
    position: 'absolute',
    top: BORDER_WIDTH,
    left: BORDER_WIDTH,
    right: BORDER_WIDTH,
    bottom: BORDER_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS - BORDER_WIDTH,
  },
  fill: {
    position: 'absolute',
    top: BORDER_WIDTH,
    left: BORDER_WIDTH,
    right: BORDER_WIDTH,
    bottom: BORDER_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 24,
    backgroundColor: '#D9D9D933',
    borderRadius: RADIUS - BORDER_WIDTH,
  },
});
