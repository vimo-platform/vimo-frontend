import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Gnb, type GnbTabKey } from '@/components/common/Gnb';

export function UserGnb({ activeKey }: { activeKey: GnbTabKey }) {
  return (
    <View style={styles.fixedGnb}>
      <Gnb
        activeKey={activeKey}
        items={[
          { key: 'participation', label: '참여', onPress: () => router.replace('/explore') },
          { key: 'search', label: '탐색', onPress: () => router.replace('/search') },
          { key: 'verification', label: '인증', onPress: () => router.replace('/verification') },
          { key: 'myPage', label: '마이페이지', onPress: () => router.replace('/my-page') },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fixedGnb: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 50,
  },
});
