import Ionicons from "@expo/vector-icons/Ionicons";
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { Colors } from "@/styles/admin/theme";
import type { Applicant } from "@/types/admin";

const SoftPink = "#EF858B";

// 지원을 취소한 학생의 취소 사유를 보여주는 바텀 시트
export function CancelReasonSheet({
  applicant,
  onClose,
}: {
  applicant: Applicant | null;
  onClose: () => void;
}) {
  const { width } = useWindowDimensions();
  const sheetWidth = Math.min(width, 393);

  if (!applicant?.cancel) {
    return null;
  }

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.overlay} onPress={onClose} />
        <View style={[styles.sheet, { width: sheetWidth }]}>
          <Text style={styles.sheetTitle}>취소 사유 확인</Text>
          <View style={styles.iconCircle}>
            <Ionicons name="warning-outline" size={42} color={SoftPink} />
          </View>
          <Text style={styles.message}>
            <Text style={styles.messageName}>{applicant.name}</Text> 학생이 지원을 취소했어요
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 36,
    paddingTop: 30,
    paddingBottom: 34,
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
  },
  iconCircle: {
    marginTop: 28,
    marginBottom: 22,
  },
  message: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
    lineHeight: 26,
    textAlign: "center",
  },
  messageName: {
    color: SoftPink,
  },
  date: {
    marginTop: 22,
    fontSize: 13,
    fontWeight: "600",
    color: SoftPink,
  },
  reasonBox: {
    alignSelf: "stretch",
    minHeight: 132,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6D2D4",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 36,
  },
  reasonText: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  closeBtn: {
    alignSelf: "stretch",
    backgroundColor: "#8F8F8F",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 32,
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
