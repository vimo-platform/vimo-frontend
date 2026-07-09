import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import {
  GnbMyPageIcon,
  GnbParticipationIcon,
  GnbSearchIcon,
  GnbVerificationIcon,
} from './icons';

type GnbTabKey = 'participation' | 'search' | 'verification' | 'myPage';

type GnbItem = {
  key: GnbTabKey;
  label: string;
  onPress?: () => void;
};

type GnbProps = {
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

export function Gnb({ items = defaultItems, style }: GnbProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.tabs}>
        {items.map((item) => (
          <Pressable key={item.key} accessibilityRole="button" style={styles.tab} onPress={item.onPress}>
            {(() => {
              const Icon = iconByKey[item.key];
              return <Icon width={22} height={22} style={styles.icon} />;
            })()}
            <Text style={styles.label}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.homeArea}>
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 393,
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
  tabs: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  tab: {
    width: 98.25,
    height: 68,
    alignItems: 'center',
    paddingTop: 16,
  },
  icon: {
    marginBottom: 3,
  },
  label: {
    color: '#000000',
    fontFamily: 'Pretendard',
    fontSize: 10,
    fontWeight: '400',
    textAlign: 'center',
  },
  homeArea: {
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
