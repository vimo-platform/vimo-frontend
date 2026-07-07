import Ionicons from "@expo/vector-icons/Ionicons";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";

type Props = {
  title: string;
  hoursPerSession: number;
  location: string;
  period: string;
  time: string;
  onPress: () => void;
  children?: ReactNode;
};

export function ActivityCard({ title, hoursPerSession, location, period, time, onPress, children }: Props) {
  return (
    <View style={styles.card}>
      <Pressable style={styles.titleRow} onPress={onPress}>
        <Text style={styles.title}>{title}</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.text} />
      </Pressable>
      <Text style={styles.hours}>봉사 인정 시간 : 회차당 {hoursPerSession}시간 인정</Text>
      <InfoRow icon="location-outline" text={location} />
      <InfoRow icon="calendar-clear-outline" text={period} />
      <InfoRow icon="time-outline" text={time} />
      {children}
    </View>
  );
}

function InfoRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={15} color={Colors.textSecondary} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text,
  },
  hours: {
    fontSize: 13,
    color: Colors.text,
    marginTop: 4,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
