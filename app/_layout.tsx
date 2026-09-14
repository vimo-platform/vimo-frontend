import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Platform, Text, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AnimatedSplashOverlay } from '@/components/auth/AnimatedSplashOverlay';
import { PRETENDARD_FONT_ASSETS } from '@/styles/common/fonts';

SplashScreen.preventAutoHideAsync();

// OS 접근성 글자 확대 설정과 무관하게 디자인 그대로 고정한다(제품 결정).
// @ts-expect-error -- defaultProps는 공식 타입에 없지만 RN에서 널리 쓰이는 전역 오버라이드 방식
Text.defaultProps = { ...(Text.defaultProps ?? {}), allowFontScaling: false };
// @ts-expect-error -- 위와 동일한 이유
TextInput.defaultProps = { ...(TextInput.defaultProps ?? {}), allowFontScaling: false };

// 웹에서 모든 입력칸(TextInput = input/textarea) 포커스 시 나타나는
// 브라우저 기본 검은 아웃라인을 앱 전역에서 제거한다.
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const STYLE_ID = 'vimo-input-outline-reset';

  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      'input:focus, textarea:focus, [contenteditable]:focus { outline: none !important; box-shadow: none !important; }';
    document.head.appendChild(style);
  }
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts(PRETENDARD_FONT_ASSETS);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
