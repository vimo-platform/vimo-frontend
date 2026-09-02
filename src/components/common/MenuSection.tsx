import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

/**
 * 마이페이지(유저) / 프로필(관리자)에서 공통으로 쓰는 설정 메뉴 섹션.
 * 두 화면이 동일한 결과를 렌더링하던 코드를 하나로 합친 것이라, 렌더링 결과는 이전과 같다.
 */
export function MenuSection({ title, items }: { title: string; items: string[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.itemList}>
        {items.map((item, index) => (
          <Pressable
            key={item}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.menuItem,
              index < items.length - 1 && styles.menuItemBorder,
              pressed && styles.menuItemPressed,
            ]}
            onPress={() => {}}>
            <Text style={styles.menuItemText}>{item}</Text>
            <ChevronRight />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ChevronRight() {
  return (
    <Svg height={24} viewBox="0 0 24 24" width={24}>
      <Path
        d="M9 5L16 12L9 19"
        fill="none"
        stroke="#A8A8A8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingTop: 25,
    paddingRight: 29,
    paddingBottom: 26,
    paddingLeft: 37,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  sectionTitle: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  itemList: {
    marginTop: 18,
  },
  menuItem: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DADADA',
  },
  menuItemPressed: {
    opacity: 0.55,
  },
  menuItemText: {
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 21,
  },
});
