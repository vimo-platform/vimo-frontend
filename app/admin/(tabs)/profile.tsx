import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { logout as requestLogout } from "@/api/auth";
import { Colors } from "@/features/admin/constants/theme";
import { useAuth } from "@/features/admin/hooks/use-admin-auth";
import { clearUserSession } from "@/storage/auth-storage";

function MenuRow({ label, last }: { label: string; last?: boolean }) {
  return (
    <Pressable style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 프로필 영역 */}
      <View style={styles.profileSection}>
        <View style={styles.profileRow}>
          <Image
            source={require("../../../assets/admin/icons/logo.png")}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.linkRow}>
              <Pressable
                accessibilityRole="button"
                disabled={isLoggingOut}
                hitSlop={8}
                onPress={handleLogout}
              >
                <Text style={styles.logout}>로그아웃</Text>
              </Pressable>
              <Text style={styles.linkDivider}>|</Text>
              <Pressable>
                <Text style={styles.verify}>본인인증</Text>
              </Pressable>
            </View>
          </View>
        </View>
        <View style={styles.chipWrap}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{user.department}</Text>
          </View>
        </View>
      </View>

      {/* 내 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>내 정보</Text>
        <MenuRow label="이름 / 이메일" />
        <MenuRow label="내 정보 설정" last />
      </View>

      {/* 앱 설정 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>앱 설정</Text>
        <MenuRow label="알림 설정" />
        <MenuRow label="약관 및 정책" />
        <MenuRow label="문의하기" last />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    gap: 12,
  },
  profileSection: {
    backgroundColor: Colors.card,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  email: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  logout: {
    fontSize: 13,
    color: Colors.danger,
  },
  linkDivider: {
    fontSize: 12,
    color: Colors.border,
  },
  verify: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  chipWrap: {
    alignItems: "center",
    marginTop: 20,
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  section: {
    backgroundColor: Colors.card,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    paddingVertical: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  rowLabel: {
    fontSize: 15,
    color: Colors.text,
  },
  chevron: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
});
