import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AnimatedSplashOverlay } from '@/components/auth/AnimatedSplashOverlay';

SplashScreen.preventAutoHideAsync();

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
  return (
    <SafeAreaProvider>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
