import { router } from 'expo-router';

import { Gnb, type GnbTabKey } from '@/components/common/gnb';

export function UserGnb({ activeKey }: { activeKey: GnbTabKey }) {
  return (
    <Gnb
      activeKey={activeKey}
      items={[
        { key: 'participation', label: '참여', onPress: () => router.replace('/explore') },
        { key: 'search', label: '탐색', onPress: () => router.replace('/search') },
        { key: 'verification', label: '인증', onPress: () => router.replace('/verification') },
        { key: 'myPage', label: '마이페이지', onPress: () => router.replace('/my-page') },
      ]}
    />
  );
}
