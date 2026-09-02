import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { fetchParticipants } from "@/services/admin/participants";
import { Colors } from "@/styles/admin/theme";
import type { Participant, ParticipantStatus } from "@/types/admin";

const STATUS: Record<ParticipantStatus, { label: string; color: string }> = {
  ongoing: { label: "진행 중", color: Colors.success },
  done: { label: "완료", color: Colors.primary },
  none: { label: "미참여", color: Colors.textSecondary },
};

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    fetchParticipants(id).then(setParticipants);
  }, [id]);

  const count = (status: ParticipantStatus) =>
    participants.filter((p) => p.status === status).length;

  return (
    <View style={styles.container}>
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>참여자 현황</Text>
        <View style={styles.statsRow}>
          <Stat icon="person" color={Colors.textSecondary} label="총 참여" value={participants.length} />
          <Stat icon="play" color={Colors.success} label="진행 중" value={count("ongoing")} />
          <Stat icon="checkbox" color={Colors.primary} label="완료" value={count("done")} />
        </View>
      </View>

      <View style={styles.listCard}>
        <Text style={styles.listTitle}>참여자 목록</Text>
        <FlatList
          data={participants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.department}>{item.department}</Text>
              <Text style={[styles.status, { color: STATUS[item.status].color }]}>
                {STATUS[item.status].label}
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

function Stat({
  icon,
  color,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
  value: number;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
      <Text style={styles.statValue}>{value}명</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  statsCard: {
    // 봉사카드와 동일한 테두리/그림자로 통일, 박스 여백을 키워 참여자 현황이 답답하지 않게
    backgroundColor: Colors.card,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    paddingVertical: 24,
    paddingHorizontal: 22,
    shadowColor: "#D9DCE1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  statLabel: {
    fontSize: 13,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
  },
  listCard: {
    flex: 1,
    backgroundColor: Colors.card,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  department: {
    flex: 1.4,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  status: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
  },
});
