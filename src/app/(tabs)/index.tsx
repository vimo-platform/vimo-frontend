import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";

import { fetchSessions } from "@/api/sessions";
import { SessionStatusBadge } from "@/components/figma";
import { SessionCard } from "@/components/session-card";
import { WeekCalendar, dateKey } from "@/components/week-calendar";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import type { Session } from "@/types";

export default function FieldQrScreen() {
  const { user } = useAuth();
  const [selected, setSelected] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchSessions(dateKey(selected)).then(setSessions);
    }, [selected]),
  );

  // 같은 시간대(11:30~16:30 등)끼리 묶기
  const groups = useMemo(() => {
    const map = new Map<string, Session[]>();
    for (const s of sessions) {
      const key = `${s.startTime}~${s.endTime}`;
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    return [...map.entries()];
  }, [sessions]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* TODO: 로고 이미지 교체 (assets/icons/logo.png) */}
        <Image source={require("@/assets/icons/logo.png")} style={styles.logo} />
        <Text style={styles.greeting}>{user?.name}님, 안녕하세요!</Text>

        <WeekCalendar
          selected={selected}
          onSelect={setSelected}
          marked={[dateKey(new Date())]} // TODO: 일정 있는 날짜를 서버에서 받아 표시
        />

        <View style={styles.divider} />

        {groups.map(([time, list]) => (
          <SessionGroup key={time} time={time} sessions={list} />
        ))}
        {groups.length === 0 && (
          <Text style={styles.empty}>이 날짜에 예정된 봉사 회차가 없어요.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SessionGroup({ time, sessions }: { time: string; sessions: Session[] }) {
  const [open, setOpen] = useState(true);

  return (
    <View style={styles.group}>
      <Pressable style={styles.groupHeader} onPress={() => setOpen((v) => !v)}>
        <Ionicons name={open ? "caret-up" : "caret-down"} size={13} color={Colors.text} />
        <Text style={styles.groupTime}>{time}</Text>
        <SessionStatusBadge status={sessions[0].status} />
      </Pressable>
      {open && sessions.map((s) => <SessionCard key={s.id} session={s} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.card,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  logo: {
    width: 44,
    height: 44,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 24,
  },
  divider: {
    height: 6,
    backgroundColor: Colors.border,
    marginHorizontal: -20,
    marginVertical: 24,
  },
  group: {
    marginBottom: 24,
    gap: 12,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  groupTime: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text,
  },
  empty: {
    textAlign: "center",
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 40,
  },
});
