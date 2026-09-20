import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";

import { fetchSessionCalendar } from "@/services/admin/sessions";
import { AllLine } from "@/components/common";
import { SessionStatusBadge } from "@/components/admin/Figma";
import { SessionCard } from "@/components/admin/SessionCard";
import { WeekCalendar, dateKey } from "@/components/admin/WeekCalendar";
import { ParticipationLogo } from "@/components/join/ParticipationLogo";
import { Colors } from "@/styles/admin/theme";
import { pretendard } from "@/styles/common/fonts";
import { useAuth } from "@/hooks/admin/use-admin-auth";
import type { Session } from "@/types/admin";

export default function FieldQrScreen() {
  const { user } = useAuth();
  const [selected, setSelected] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [markedDates, setMarkedDates] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchSessionCalendar(dateKey(selected)).then((data) => {
        setSessions(data.sessions);
        setMarkedDates(data.markedDates);
      });
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
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <ParticipationLogo width={92.156} height={97.53} compactLayout />
          </View>
          <Text style={styles.greeting}>{user?.name}님, 안녕하세요!</Text>
        </View>

        <WeekCalendar
          selected={selected}
          onSelect={setSelected}
          marked={markedDates}
        />

        <AllLine style={styles.divider} />

        <View style={styles.sessionSection}>
          {groups.map(([time, list]) => (
            <SessionGroup key={time} time={time} sessions={list} />
          ))}
          {groups.length === 0 && (
            <Text style={styles.empty}>이 날짜에 예정된 봉사 회차가 없어요.</Text>
          )}
        </View>
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
    // 유저 참여 화면과 동일한 배경색으로 맞춘다.
    backgroundColor: "#F9F9FB",
  },
  scroll: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 30,
  },
  logoRow: {
    marginBottom: 45,
  },
  greeting: {
    fontFamily: pretendard(400),
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.5,
    color: Colors.text,
    // 유저 화면은 인사말 옆에 34px짜리 "지원 현황" 버튼이 나란히 있어 줄 높이가
    // 28이 아닌 34가 된다. 그 버튼이 없는 관리자 화면에서도 같은 세로 간격을
    // 맞추기 위해 marginBottom에 6(=34-28)을 더한다.
    marginBottom: 28,
  },
  divider: {
    marginTop: 9,
  },
  sessionSection: {
    paddingTop: 30,
    paddingHorizontal: 30,
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
    fontFamily: pretendard(700),
    fontSize: 18,
    lineHeight: 25,
    letterSpacing: -0.45,
    color: Colors.text,
  },
  empty: {
    color: "#222222",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
