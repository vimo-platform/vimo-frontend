// React Native는 커스텀 폰트에 fontWeight를 적용하지 못한다 — 굵기별로 별도 파일을
// 별도 family 이름으로 등록해야 네이티브에서도 실제로 굵기가 달라진다.
export const PRETENDARD_FONTS = {
  300: 'Pretendard-Light',
  400: 'Pretendard-Regular',
  500: 'Pretendard-Medium',
  600: 'Pretendard-SemiBold',
  700: 'Pretendard-Bold',
  800: 'Pretendard-ExtraBold',
  900: 'Pretendard-Black',
} as const;

export type PretendardWeight = keyof typeof PRETENDARD_FONTS;

export function pretendard(weight: PretendardWeight = 400): string {
  return PRETENDARD_FONTS[weight];
}

// useFonts()에 그대로 전달한다 (app/_layout.tsx).
export const PRETENDARD_FONT_ASSETS = {
  [PRETENDARD_FONTS[300]]: require('@/assets/fonts/Pretendard-Light.ttf'),
  [PRETENDARD_FONTS[400]]: require('@/assets/fonts/Pretendard-Regular.ttf'),
  [PRETENDARD_FONTS[500]]: require('@/assets/fonts/Pretendard-Medium.ttf'),
  [PRETENDARD_FONTS[600]]: require('@/assets/fonts/Pretendard-SemiBold.ttf'),
  [PRETENDARD_FONTS[700]]: require('@/assets/fonts/Pretendard-Bold.ttf'),
  [PRETENDARD_FONTS[800]]: require('@/assets/fonts/Pretendard-ExtraBold.ttf'),
  [PRETENDARD_FONTS[900]]: require('@/assets/fonts/Pretendard-Black.ttf'),
};
