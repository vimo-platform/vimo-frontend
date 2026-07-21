import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { GnbTabKey } from '@/components/common/gnb';
import { UserGnb } from '@/components/navigation/user-gnb';
import { useUserSessionGuard } from '@/hooks/use-user-session-guard';

export function TabPlaceholderScreen({
  activeKey,
  title,
}: {
  activeKey: GnbTabKey;
  title: string;
}) {
  useUserSessionGuard();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>화면을 준비하고 있어요.</Text>
      </View>
      <UserGnb activeKey={activeKey} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F9FB',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#222222',
    fontSize: 24,
    fontWeight: '700',
  },
  description: {
    marginTop: 10,
    color: '#818181',
    fontSize: 14,
  },
});
