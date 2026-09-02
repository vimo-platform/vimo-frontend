import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { logout as requestLogout } from "@/api/auth";
import { useAuth } from "@/features/admin/hooks/use-admin-auth";
import { clearUserSession } from "@/storage/auth-storage";

const PROFILE_IMAGE = require("../../../assets/admin/profile.png");

const INFO_ITEMS = ["이름 / 이메일", "내 정보 설정"];
const SETTING_ITEMS = ["알림 설정", "약관 및 정책", "문의하기"];

export default function ProfileScreen() {
  const { user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await requestLogout();
    } catch {
      // 서버 로그아웃 요청이 실패해도 앱에서는 로컬 세션을 지워 로그아웃을 완료한다.
    } finally {
      clearUserSession();
      router.replace("/");
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>마이페이지</Text>

        <View style={styles.profileRow}>
          <Image resizeMode="contain" source={PROFILE_IMAGE} style={styles.profileImage} />
          <View style={styles.profileTextArea}>
            <Text numberOfLines={1} style={styles.name}>
              {user.name}
            </Text>
            <Text numberOfLines={1} style={styles.email}>
              {user.email}
            </Text>
            <View style={styles.accountActionRow}>
              <Pressable
                accessibilityRole="button"
                disabled={isLoggingOut}
                hitSlop={8}
                style={({ pressed }) => [styles.textButton, pressed && styles.textButtonPressed]}
                onPress={handleLogout}>
                <Text style={styles.logoutText}>로그아웃</Text>
              </Pressable>
              <View style={styles.accountDivider} />
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                style={({ pressed }) => [styles.textButton, pressed && styles.textButtonPressed]}
                onPress={() => {}}>
                <Text style={styles.authText}>본인인증</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {user.organization ? (
          <View style={styles.chipWrap}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{user.organization}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.sections}>
          <MenuSection items={INFO_ITEMS} title="내 정보" />
          <MenuSection items={SETTING_ITEMS} title="앱 설정" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuSection({ title, items }: { title: string; items: string[] }) {
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
  safeArea: {
    flex: 1,
    backgroundColor: "#F9F9FB",
  },
  scrollContent: {
    paddingBottom: 126,
  },
  title: {
    marginTop: 39,
    color: "#222222",
    fontFamily: "Pretendard",
    fontSize: 25,
    fontWeight: "500",
    lineHeight: 35,
    textAlign: "center",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 36,
    paddingHorizontal: 37,
  },
  profileImage: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 1.5,
    borderColor: "#818181",
  },
  profileTextArea: {
    flex: 1,
    marginLeft: 22,
  },
  name: {
    color: "#222222",
    fontFamily: "Pretendard",
    fontSize: 19,
    fontWeight: "800",
    lineHeight: 23,
  },
  email: {
    marginTop: 2,
    color: "#222222",
    fontFamily: "Pretendard",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  accountActionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  textButton: {
    minHeight: 19,
    justifyContent: "center",
  },
  textButtonPressed: {
    opacity: 0.5,
  },
  logoutText: {
    color: "#FF8B8B",
    fontFamily: "Pretendard",
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 15,
  },
  authText: {
    color: "#818181",
    fontFamily: "Pretendard",
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 15,
  },
  accountDivider: {
    width: 1,
    height: 11,
    marginHorizontal: 16,
    backgroundColor: "#818181",
  },
  chipWrap: {
    alignItems: "center",
    marginTop: 24,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#DADADA",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  chipText: {
    color: "#222222",
    fontFamily: "Pretendard",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
  },
  sections: {
    marginTop: 24,
    gap: 12,
  },
  section: {
    paddingTop: 25,
    paddingRight: 29,
    paddingBottom: 26,
    paddingLeft: 37,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },
  sectionTitle: {
    color: "#222222",
    fontFamily: "Pretendard",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
  },
  itemList: {
    marginTop: 18,
  },
  menuItem: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#DADADA",
  },
  menuItemPressed: {
    opacity: 0.55,
  },
  menuItemText: {
    color: "#818181",
    fontFamily: "Pretendard",
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 21,
  },
});
