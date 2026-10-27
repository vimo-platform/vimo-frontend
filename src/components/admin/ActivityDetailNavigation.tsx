import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Gnb, type GnbTabKey } from '@/components/common/Gnb';
import { pretendard } from '@/styles/common/fonts';

const ICONS = {
  participation: { source: require('@/assets/admin/activity-detail/nav-field-qr.svg'), width: 20.5, height: 20.5 },
  search: { source: require('@/assets/admin/activity-detail/nav-postings.svg'), width: 19, height: 19 },
  verification: { source: require('@/assets/admin/activity-detail/nav-approvals.svg'), width: 21.5, height: 21.5 },
  myPage: { source: require('@/assets/admin/activity-detail/nav-profile.svg'), width: 21.8065, height: 21.5 },
} as const;

function renderIcon(key: GnbTabKey) {
  const icon = ICONS[key];
  return (
    <View style={styles.iconSlot}>
      <Image source={icon.source} style={{ width: icon.width, height: icon.height }} contentFit="contain" />
    </View>
  );
}

export function ActivityDetailNavigation() {
  return (
    <Gnb
      activeKey={null}
      items={[
        { key: 'participation', label: '현장 QR', onPress: () => router.dismissTo('/admin') },
        { key: 'search', label: '공고', onPress: () => router.dismissTo('/admin/postings') },
        { key: 'verification', label: '승인', onPress: () => router.dismissTo('/admin/approvals') },
        { key: 'myPage', label: '마이페이지', onPress: () => router.dismissTo('/admin/profile') },
      ]}
      tabStyle={styles.tab}
      labelStyle={styles.label}
      renderIcon={renderIcon}
    />
  );
}

const styles = StyleSheet.create({
  tab: { paddingTop: 14 },
  label: { fontFamily: pretendard(400), lineHeight: 12 },
  iconSlot: {
    width: 24,
    height: 24,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
