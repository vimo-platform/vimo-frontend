import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { ActivityCard } from "@/components/admin/ActivityCard";
import type { Session } from "@/types/admin";

export function SessionCard({ session }: { session: Session }) {
  const goQr = (type: "start" | "end") =>
    router.push({ pathname: "/admin/qr/[sessionId]", params: { sessionId: session.id, type } });

  return (
    <ActivityCard
      title={session.title}
      hoursPerSession={session.hoursPerSession}
      location={session.location}
      period={session.period}
      time={`${session.startTime} ~ ${session.endTime}`}
      onPress={() =>
        router.push({ pathname: "/admin/activity/[id]", params: { id: session.postingId } })
      }
    >
      <View style={styles.buttonRow}>
        <QrButton label="시작 QR 생성" onPress={() => goQr("start")} />
        <QrButton label="종료 QR 생성" onPress={() => goQr("end")} />
      </View>
    </ActivityCard>
  );
}

function QrButton({ label, onPress }: { label: string; onPress: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      style={({ pressed }) => [
        styles.qrButton,
        (hovered || pressed) && styles.qrButtonActive,
      ]}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={onPress}
    >
      <Text style={styles.qrButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  qrButton: {
    flex: 1,
    backgroundColor: "#818181",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  qrButtonActive: {
    backgroundColor: "#222222",
  },
  qrButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
