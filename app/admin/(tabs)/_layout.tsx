import { Pressable, StyleSheet, View } from "react-native";
import { Tabs } from "expo-router";

import { Figma } from "@/features/admin/components/figma";
import { Colors } from "@/features/admin/constants/theme";

type GnbProps = {
  state: { routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
};

function GnbTabBar({ state, navigation }: GnbProps) {
  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        <Figma
          name="gnb"
          style={styles.gnbAsset}
        />
        <View style={styles.touchRow}>
          {state.routes.map((route) => (
            <Pressable
              key={route.key}
              style={styles.touch}
              onPress={() => navigation.navigate(route.name)}
            />
          ))}
        </View>
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
    alignItems: "center",
    justifyContent: "flex-end",
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
  inner: {
    width: "100%",
    maxWidth: 453,
    height: 102,
    overflow: "hidden",
  },
  gnbAsset: {
    width: "100%",
    height: 102,
  },
  touchRow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    paddingHorizontal: "7%",
  },
  touch: {
    flex: 1,
  },
});
