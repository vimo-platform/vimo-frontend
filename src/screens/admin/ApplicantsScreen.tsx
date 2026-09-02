import { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { approveApplicant, fetchApplicants } from "@/services/admin/applicants";
import { closePosting, fetchPosting } from "@/services/admin/postings";
import { CancelReasonSheet } from "@/components/admin/CancelReasonSheet";
import { PostingSummary } from "@/components/admin/PostingSummary";
import { Colors } from "@/styles/admin/theme";
import type { Applicant, Posting } from "@/types/admin";

export default function ApplicantsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [posting, setPosting] = useState<Posting | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  // 취소 사유 시트에 표시할 지원자 (null이면 닫힘)
  const [cancelTarget, setCancelTarget] = useState<Applicant | null>(null);

  useEffect(() => {
    fetchPosting(id).then((p) => setPosting(p ?? null));
    fetchApplicants(id).then(setApplicants);
  }, [id]);

  // 채택: 신청(PENDING)을 실제로 서버에 채택 반영. 이미 채택된 건은 되돌릴 수 없음(백엔드 제약).
  const selectApplicant = async (applicant: Applicant) => {
    if (applicant.selected) {
      return;
    }

    try {
      await approveApplicant(applicant.id);
      setApplicants((prev) =>
        prev.map((a) => (a.id === applicant.id ? { ...a, selected: true } : a)),
      );
    } catch {
      Alert.alert("채택 실패", "잠시 후 다시 시도해 주세요.");
    }
  };

  const selectedCount = applicants.filter((a) => a.selected).length;

  const close = async () => {
    await closePosting(id);
    Alert.alert("모집 마감", "공고가 마감되었습니다.");
    router.back();
  };

  if (!posting) {
    return null;
  }

  const countColor =
    selectedCount < posting.capacity
      ? "#59A76A"
      : selectedCount > posting.capacity
        ? "#C07777"
        : Colors.text;

  return (
    <View style={styles.container}>
      <PostingSummary posting={posting} />

      <View style={styles.divider} />

      <View style={styles.listArea}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>지원자 목록</Text>
          <Text style={styles.count}>
            <Text style={[styles.countSelected, { color: countColor }]}>{selectedCount}</Text> /{" "}
            {posting.capacity}
          </Text>
        </View>
        <FlatList
          data={applicants}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.department}>{item.department}</Text>
              {item.cancel ? (
                <Pressable
                  style={[styles.selectBtn, styles.cancelBtn]}
                  onPress={() => setCancelTarget(item)}
                >
                  <Text style={styles.cancelText}>취소 사유 확인</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.selectBtn, item.selected && styles.selectBtnOn]}
                  onPress={() => selectApplicant(item)}
                >
                  <Text style={[styles.selectText, item.selected && styles.selectTextOn]}>
                    {item.selected ? "채택됨" : "채택"}
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        />
      </View>

      <Pressable
        style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
        onPress={close}
      >
        <Text style={styles.closeButtonText}>모집 마감</Text>
      </Pressable>

      <CancelReasonSheet applicant={cancelTarget} onClose={() => setCancelTarget(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.card,
  },
  divider: {
    height: 6,
    backgroundColor: Colors.border,
  },
  listArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.text,
  },
  count: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  countSelected: {
    color: Colors.success,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
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
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  selectBtn: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 9,
    backgroundColor: "#E8E8E8",
  },
  selectBtnOn: {
    backgroundColor: "#222222",
  },
  selectText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  selectTextOn: {
    color: Colors.white,
  },
  cancelBtn: {
    backgroundColor: "#FDE8EC",
    paddingHorizontal: 14,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E0526E",
  },
  closeButton: {
    backgroundColor: "#222222",
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
    margin: 16,
  },
  closeButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
});
