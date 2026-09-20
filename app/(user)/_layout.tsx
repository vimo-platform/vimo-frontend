import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

// 관리자 화면과 동일하게 웹에서 393 너비로 가운데 정렬해 앱처럼 테두리가 보이게 한다.
const APP_FRAME_MAX_WIDTH = 393;
const APP_FRAME_BACKGROUND = '#F5F7FA';

export default function UserLayout() {
  return (
    <View style={styles.frameOuter}>
      <View style={styles.frameInner}>
        <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frameOuter: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: APP_FRAME_BACKGROUND,
  },
  frameInner: {
    flex: 1,
    width: '100%',
    maxWidth: APP_FRAME_MAX_WIDTH,
  },
});
