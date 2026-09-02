import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import {
  GnbMyPageIcon,
  GnbParticipationIcon,
  GnbSearchIcon,
  GnbVerificationIcon,
} from './Icons';

export type GnbTabKey = 'participation' | 'search' | 'verification' | 'myPage';

type GnbItem = {
  key: GnbTabKey;
  label: string;
  onPress?: () => void;
};

type GnbProps = {
  activeKey?: GnbTabKey;
  items?: GnbItem[];
  style?: StyleProp<ViewStyle>;
};

const iconByKey = {
  participation: GnbParticipationIcon,
  search: GnbSearchIcon,
  verification: GnbVerificationIcon,
  myPage: GnbMyPageIcon,
};

const defaultItems: GnbItem[] = [
  { key: 'participation', label: '참여' },
  { key: 'search', label: '탐색' },
  { key: 'verification', label: '인증' },
  { key: 'myPage', label: '마이페이지' },
];

export function Gnb({ activeKey = 'participation', items = defaultItems, style }: GnbProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.tabRow}>
        {items.map((item) => {
          const Icon = iconByKey[item.key];
          const isActive = item.key === activeKey;

          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              style={styles.tab}
              onPress={item.onPress}>
              <Icon
                width={22}
                height={22}
                style={[styles.icon, !isActive && styles.inactiveIcon]}
              />
              <Text style={[styles.label, isActive && styles.activeLabel]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View pointerEvents="none" style={styles.homeIndicatorArea}>
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 102,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  tabRow: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    height: 68,
    alignItems: 'center',
    paddingTop: 16,
  },
  icon: {
    marginBottom: 3,
  },
  inactiveIcon: {
    opacity: 0.45,
  },
  label: {
    color: '#000000',
    fontFamily: 'Pretendard',
    fontSize: 10,
    fontWeight: '400',
    textAlign: 'center',
  },
  activeLabel: {
    fontWeight: '600',
  },
  homeIndicatorArea: {
    height: 34,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: '#626877',
  },
});
