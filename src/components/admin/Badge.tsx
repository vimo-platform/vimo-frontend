import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/styles/admin/theme";

const TONES = {
  blue: { bg: "#E8F3FE", text: Colors.primary },
  gray: { bg: "#F3F4F6", text: Colors.textSecondary },
} as const;

type Props = {
  label: string;
  tone?: keyof typeof TONES;
};

export function Badge({ label, tone = "gray" }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: TONES[tone].bg }]}>
      <Text style={[styles.text, { color: TONES[tone].text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});
