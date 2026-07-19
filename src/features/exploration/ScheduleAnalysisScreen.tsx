import { router } from 'expo-router';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/common';
import { useUserSessionGuard } from '@/hooks/use-user-session-guard';

export function ScheduleAnalysisScreen() {
  useUserSessionGuard();

  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 393);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.screen, { width: contentWidth }]}>
        <Text style={styles.title}>시간표 사진이 업로드되었어요.</Text>
        <Text style={styles.description}>
          분석 방식이 확정되면 이 화면에서 맞춤 봉사 추천을 이어서 보여드릴게요.
        </Text>
        <Button label="탐색으로 돌아가기" style={styles.button} onPress={() => router.replace('/search')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#FFFFFF',
  },
  title: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 30,
    textAlign: 'center',
  },
  description: {
    marginTop: 12,
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 23,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    marginTop: 28,
  },
});
