import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";

export default function ApprovalsScreen() {
  // TODO: 지원자/봉사시간 승인 목록 화면
  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle-outline" size={64} color={Colors.border} />
      <Text style={styles.text}>
        지원자 승인 기능이 여기에 들어갑니다.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  text: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
