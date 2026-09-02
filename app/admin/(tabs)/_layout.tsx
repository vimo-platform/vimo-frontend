import { Pressable, StyleSheet, Text, View } from "react-native";
import { Tabs } from "expo-router";
import { SvgXml } from "react-native-svg";

type GnbProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
};

const fieldQrIconXml = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3 7C3 4.79086 4.79086 3 7 3H17C19.2091 3 21 4.79086 21 7V17C21 19.2091 19.2091 21 17 21H7C4.79086 21 3 19.2091 3 17V7Z" fill="#D2D2D2"/>
<path d="M2.5 8.187C2.604 6.087 2.915 4.777 3.847 3.847C4.777 2.915 6.087 2.604 8.187 2.5M21.5 8.187C21.396 6.087 21.085 4.777 20.153 3.847C19.223 2.915 17.913 2.604 15.813 2.5M15.813 21.5C17.913 21.396 19.223 21.085 20.153 20.153C21.085 19.223 21.396 17.913 21.5 15.813M8.187 21.5C6.087 21.396 4.777 21.085 3.847 20.153C2.915 19.223 2.604 17.913 2.5 15.813M17 7V7.01M17 11V13C17 14.886 17 15.828 16.414 16.414C15.828 17 14.886 17 13 17M9 17H7M8.235 12.848C8.602 13 9.068 13 10 13C10.932 13 11.398 13 11.765 12.848C12.0078 12.7475 12.2284 12.6001 12.4143 12.4143C12.6001 12.2284 12.7475 12.0078 12.848 11.765C13 11.398 13 10.932 13 10C13 9.068 13 8.602 12.848 8.235C12.7475 7.99218 12.6001 7.77155 12.4143 7.58572C12.2284 7.3999 12.0078 7.25251 11.765 7.152C11.398 7 10.932 7 10 7C9.068 7 8.602 7 8.235 7.152C7.99218 7.25251 7.77155 7.3999 7.58572 7.58572C7.3999 7.77155 7.25251 7.99218 7.152 8.235C7 8.602 7 9.068 7 10C7 10.932 7 11.398 7.152 11.765C7.25251 12.0078 7.3999 12.2284 7.58572 12.4143C7.77155 12.6001 7.99218 12.7475 8.235 12.848Z" stroke="#28303F" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const postingsIconXml = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3 7C3 4.79086 4.79086 3 7 3H17C19.2091 3 21 4.79086 21 7V17C21 19.2091 19.2091 21 17 21H7C4.79086 21 3 19.2091 3 17V7Z" fill="#D2D2D2"/>
<path d="M21 21L19.5 19.5M8.625 21H7C4.79086 21 3 19.2091 3 17V7C3 4.79086 4.79086 3 7 3H17C19.2091 3 21 4.79086 21 7V8.0625M21 15C21 18.3137 18.3137 21 15 21C11.6863 21 9 18.3137 9 15C9 11.6863 11.6863 9 15 9C18.3137 9 21 11.6863 21 15Z" stroke="#28303F" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

const approvalsIconXml = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="12" cy="12" r="10" fill="#D2D2D2"/>
<path d="M17 3.33782C15.5291 2.48697 13.8214 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 10.7687 21.7775 9.58934 21.3704 8.5M7 10L10.5264 12.8211C11.3537 13.483 12.5536 13.3848 13.2624 12.5973L21 4" stroke="#28303F" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

const mypageIconXml = `<svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20.5 10.5C20.5 13.5134 19.1672 16.2154 17.0588 18.0488C15.3031 19.5756 13.0095 20.5 10.5 20.5C7.99052 20.5 5.69694 19.5756 3.94117 18.0488C1.83285 16.2154 0.5 13.5134 0.5 10.5C0.5 4.97715 4.97715 0.5 10.5 0.5C16.0228 0.5 20.5 4.97715 20.5 10.5Z" fill="#A9ACB2" stroke="#28303F" stroke-linejoin="round"/>
<circle cx="10.5" cy="7.5" r="3" fill="#28303F"/>
<path d="M17.0552 18.0488C16.0617 15.3918 13.5 13.5 10.4963 13.5C7.49271 13.5 4.93093 15.3918 3.9375 18.0488C5.69327 19.5756 7.98685 20.5 10.4963 20.5C13.0058 20.5 15.2994 19.5756 17.0552 18.0488Z" fill="#28303F"/>
</svg>`;

const adminTabMeta: Record<string, { icon: string; label: string }> = {
  index: {
    icon: fieldQrIconXml,
    label: "현장 QR",
  },
  postings: {
    icon: postingsIconXml,
    label: "공고",
  },
  approvals: {
    icon: approvalsIconXml,
    label: "승인",
  },
  profile: {
    icon: mypageIconXml,
    label: "마이페이지",
  },
};

function GnbTabBar({ state, navigation }: GnbProps) {
  return (
    <View style={styles.bar}>
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const tab = adminTabMeta[route.name];
          const isActive = state.index === index;

          if (!tab) {
            return null;
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              style={styles.tab}
              onPress={() => navigation.navigate(route.name)}
            >
              <View style={[styles.tabInner, isActive && styles.tabInnerActive]}>
                <SvgXml
                  xml={tab.icon}
                  width={24}
                  height={24}
                  style={[styles.icon, !isActive && styles.iconInactive]}
                />
                <Text style={[styles.label, isActive && styles.activeLabel]}>
                  {tab.label}
                </Text>
              </View>
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

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={({ state, navigation }) => (
        <GnbTabBar state={state} navigation={navigation} />
      )}
    >
      <Tabs.Screen name="index" options={{ title: "현장 QR", headerShown: false }} />
      <Tabs.Screen name="postings" options={{ title: "공고" }} />
      <Tabs.Screen name="approvals" options={{ title: "승인" }} />
      <Tabs.Screen name="profile" options={{ title: "마이페이지", headerShown: false }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: "100%",
    height: 102,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
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
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  tab: {
    flex: 1,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
  },
  tabInner: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  tabInnerActive: {
    backgroundColor: "#EEF0F3",
  },
  icon: {
    marginBottom: 3,
  },
  iconInactive: {
    opacity: 0.45,
  },
  label: {
    color: "#000000",
    fontFamily: "Pretendard",
    fontSize: 10,
    fontWeight: "400",
    textAlign: "center",
  },
  activeLabel: {
    fontWeight: "600",
  },
  homeIndicatorArea: {
    height: 34,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: "#626877",
  },
});
