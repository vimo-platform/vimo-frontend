import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Tabs } from "expo-router";

import { Colors } from "@/features/admin/constants/theme";

type GnbProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
};

const adminTabMeta: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; label: string }
> = {
  index: {
    icon: "qr-code-outline",
    label: "현장 QR",
  },
  postings: {
    icon: "document-text-outline",
    label: "공고",
  },
  approvals: {
    icon: "checkmark-circle-outline",
    label: "승인",
  },
  profile: {
    icon: "person-circle-outline",
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
              <Ionicons
                name={tab.icon}
                size={24}
                color={isActive ? "#1F2733" : "#A2A7AE"}
                style={styles.icon}
              />
              <Text style={[styles.label, isActive && styles.activeLabel]}>
                {tab.label}
              </Text>
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
      <Tabs.Screen
        name="profile"
        options={{
          title: "마이페이지",
          headerTitleAlign: "center",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.white },
        }}
      />
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
    paddingTop: 16,
  },
  icon: {
    marginBottom: 3,
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
