import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";

import { fetchApprovals, setApprovalStatus } from "@/services/admin/approvals";
import { ActivityCard } from "@/components/admin/ActivityCard";
import { SyncOverlay } from "@/components/admin/SyncOverlay";
import { Colors } from "@/styles/admin/theme";
import type { Approval, ApprovalStatus } from "@/types/admin";

const STATUS: Record<
  ApprovalStatus,
  { tab: string; badge: string; accent: string; soft: string }
> = {
  pending: { tab: "승인 대기", badge: "승인 대기", accent: "#5B6068", soft: "#EDEDED" },
  approved: { tab: "승인 완료", badge: "승인 완료", accent: "#4C9E63", soft: "#E4F5E9" },
  rejected: { tab: "반려", badge: "반려 처리", accent: "#C07777", soft: "#FBE3E3" },
};

const ORDER: ApprovalStatus[] = ["pending", "approved", "rejected"];

export default function ApprovalsScreen() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [tab, setTab] = useState<ApprovalStatus>("pending");
  const [syncId, setSyncId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [result, setResult] = useState<{ title: string; body: string } | null>(null);

  const load = () => fetchApprovals().then(setApprovals);
  useFocusEffect(useCallback(() => void load(), []));

  const finishApprove = async () => {
    if (syncId) await setApprovalStatus(syncId, "approved");
    setSyncId(null);
    await load();
    setResult({ title: "승인 완료", body: "해당 학생의\n승인 처리가 완료되었습니다." });
  };

  const submitReject = async () => {
    if (!rejectId || !reason.trim()) return;
    await setApprovalStatus(rejectId, "rejected", reason.trim());
    setRejectId(null);
    setReason("");
    await load();
    setResult({ title: "반려 처리 완료", body: "해당 학생의\n반려 처리가 완료되었습니다." });
  };

  const visible = approvals.filter((a) => a.status === tab);
  const meta = STATUS[tab];

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {ORDER.map((key) => {
          const on = tab === key;
          return (
            <Pressable
              key={key}
              style={[styles.tab, on && { backgroundColor: STATUS[key].accent }]}
              onPress={() => setTab(key)}
            >
              <Text style={[styles.tabText, on && styles.tabTextOn]}>{STATUS[key].tab}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={visible}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={[styles.banner, { borderColor: meta.accent }]}>
            <Text style={[styles.bannerTitle, { color: meta.accent }]}>{meta.tab}</Text>
            <View style={[styles.count, { backgroundColor: meta.soft }]}>
              <Text style={[styles.countText, { color: meta.accent }]}>{visible.length}건</Text>
            </View>
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>해당하는 항목이 없어요.</Text>}
        renderItem={({ item }) => (
          <ActivityCard
            title={item.postingTitle}
            hoursPerSession={item.hoursPerSession}
            location={item.location}
            period={item.period}
            time={`${item.startTime} ~ ${item.endTime}`}
            right={<StatusBadge status={item.status} />}
          >
            <View style={styles.divider} />
            <Text style={styles.studentName}>{item.studentName} 학생</Text>
            <Text style={styles.subLabel}>활동 시간</Text>
            <Text style={styles.subValue}>
              {item.startTime} ~ {item.endTime}
            </Text>
            <Text style={styles.note}>출석 QR 인증 완료{"\n"}활동 확인 완료</Text>

            {item.status === "pending" && (
              <View style={styles.buttonRow}>
                <Pressable
                  style={({ pressed }) => [styles.rejectBtn, pressed && styles.pressed]}
                  onPress={() => {
                    setReason("");
                    setRejectId(item.id);
                  }}
                >
                  <Text style={styles.rejectText}>반려</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.approveBtn, pressed && styles.pressed]}
                  onPress={() => setSyncId(item.id)}
                >
                  <Text style={styles.approveText}>승인</Text>
                </Pressable>
              </View>
            )}
          </ActivityCard>
        )}
      />

      <SyncOverlay
        visible={!!syncId}
        onComplete={finishApprove}
        onCancel={() => setSyncId(null)}
      />

      <Modal visible={!!rejectId} transparent animationType="slide" onRequestClose={() => setRejectId(null)}>
        <KeyboardAvoidingView
          style={styles.sheetBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.sheet}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>
                반려 사유 <Text style={styles.req}>*</Text>
              </Text>
              <Text style={styles.sheetHint}>반려 사유를 입력해주세요. (필수)</Text>
            </View>
            <TextInput
              style={styles.reasonInput}
              placeholder="예) 활동 확인이 어렵습니다."
              placeholderTextColor={Colors.textSecondary}
              multiline
              maxLength={100}
              value={reason}
              onChangeText={setReason}
            />
            <Text style={styles.counter}>{reason.length}/100</Text>
            <View style={styles.sheetButtons}>
              <Pressable style={styles.sheetClose} onPress={() => setRejectId(null)}>
                <Text style={styles.sheetCloseText}>닫기</Text>
              </Pressable>
              <Pressable style={styles.sheetSubmit} onPress={submitReject}>
                <Text style={styles.sheetSubmitText}>반려</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={!!result} transparent animationType="fade" onRequestClose={() => setResult(null)}>
        <View style={styles.resultBackdrop}>
          <View style={styles.resultCard}>
            <Pressable style={styles.resultClose} onPress={() => setResult(null)} hitSlop={10}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </Pressable>
            <View style={styles.resultCheck}>
              <Ionicons name="checkmark" size={30} color={Colors.white} />
            </View>
            <Text style={styles.resultTitle}>{result?.title}</Text>
            <Text style={styles.resultBody}>{result?.body}</Text>
            <Pressable style={styles.resultButton} onPress={() => setResult(null)}>
              <Text style={styles.resultButtonText}>확인</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const meta = STATUS[status];
  return (
    <View style={[styles.badge, { backgroundColor: meta.soft }]}>
      <Text style={[styles.badgeText, { color: meta.accent }]}>{meta.badge}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  tab: {
    height: 34,
    justifyContent: "center",
    backgroundColor: "#E8E8E8",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#818181",
  },
  tabTextOn: {
    color: Colors.white,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  banner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  count: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    fontSize: 12,
    fontWeight: "700",
  },
  empty: {
    textAlign: "center",
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 40,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 12,
    marginBottom: 14,
  },
  studentName: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 10,
  },
  subLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  subValue: {
    fontSize: 13,
    color: Colors.text,
    marginBottom: 10,
  },
  note: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: "#818181",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  rejectText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  approveBtn: {
    flex: 1,
    backgroundColor: "#222222",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  approveText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 8,
  },
  sheetHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text,
  },
  req: {
    color: "#E0526E",
  },
  sheetHint: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  reasonInput: {
    height: 150,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: Colors.text,
    textAlignVertical: "top",
  },
  counter: {
    alignSelf: "flex-end",
    fontSize: 11,
    color: Colors.textSecondary,
  },
  sheetButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  sheetClose: {
    flex: 1,
    backgroundColor: "#B9BEC6",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  sheetCloseText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  sheetSubmit: {
    flex: 1,
    backgroundColor: "#222222",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  sheetSubmitText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  resultBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  resultCard: {
    alignSelf: "stretch",
    backgroundColor: Colors.card,
    borderRadius: 20,
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    gap: 12,
  },
  resultClose: {
    position: "absolute",
    top: 14,
    right: 14,
  },
  resultCheck: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#9AA0A6",
    alignItems: "center",
    justifyContent: "center",
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
  },
  resultBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  resultButton: {
    alignSelf: "stretch",
    backgroundColor: "#222222",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 12,
  },
  resultButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});
