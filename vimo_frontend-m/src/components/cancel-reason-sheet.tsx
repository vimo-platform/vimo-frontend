import Ionicons from "@expo/vector-icons/Ionicons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";
import type { Applicant } from "@/types";

const Pink = "#E0526E";

// 지원을 취소한 학생의 취소 사유를 보여주는 바텀 시트
export function CancelReasonSheet({
  applicant,
  onClose,
}: {
  applicant: Applicant | null;
  onClose: () => void;
}) {
  if (!applicant?.cancel) {
    return null;
  }

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>취소 사유 확인</Text>
        <Ionicons name="warning-outline" size={44} color={Pink} />
        <Text style={styles.message}>
          <Text style={styles.messageName}>{applicant.name}</Text> 학생이 지원을
          취소했어요
        </Text>
        <Text style={styles.date}>{applicant.cancel.at} 취소</Text>
        <View style={styles.reasonBox}>
          <Text style={styles.reasonText}>{applicant.cancel.reason}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
          onPress={onClose}
        >
          <Text style={styles.closeBtnText}>닫기</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: "center",
    gap: 14,
  },
  sheetTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  message: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text,
  },
  messageName: {
    color: Pink,
  },
  date: {
    fontSize: 12,
    fontWeight: "600",
    color: Pink,
  },
  reasonBox: {
    alignSelf: "stretch",
    minHeight: 110,
    backgroundColor: "#F4F5F7",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    marginTop: 6,
  },
  reasonText: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  closeBtn: {
    alignSelf: "stretch",
    backgroundColor: "#B4B9BF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 6,
  },
  closeBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
});
