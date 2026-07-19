import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { fetchParticipants } from "@/features/admin/api/participants";
import { Colors } from "@/features/admin/constants/theme";
import type { Participant, ParticipantStatus } from "@/features/admin/types";

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
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    margin: 16,
    padding: 20,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 18,
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
