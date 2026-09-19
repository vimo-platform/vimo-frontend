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
import { ADMIN_APP_FRAME_MAX_WIDTH, Colors } from "@/styles/admin/theme";
import { pretendard } from "@/styles/common/fonts";
import type { Approval, ApprovalStatus } from "@/types/admin";

const STATUS: Record<
  ApprovalStatus,
  {
    tab: string;
    badge: string;
    accent: string;
    bannerBorder: string;
    countBackground: string;
    badgeBackground: string;
  }
> = {
  pending: {
    tab: "승인 대기",
    badge: "승인 대기",
    accent: "#222222",
    bannerBorder: "#606060",
    countBackground: "#F5F5F5",
    badgeBackground: "#818181",
  },
  approved: {
    tab: "승인 완료",
    badge: "승인 완료",
    accent: "#59A76A",
    bannerBorder: "#B8DB82",
    countBackground: "#ECFFC9",
    badgeBackground: "#59A76A",
  },
  rejected: {
    tab: "반려",
    badge: "반려 처리",
    accent: "#C07777",
    bannerBorder: "#F1B29D",
    countBackground: "#FFD5C7",
    badgeBackground: "#C07777",
  },
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
          <View style={[styles.banner, { borderColor: meta.bannerBorder }]}>
            <Text style={[styles.bannerTitle, { color: meta.accent }]}>{meta.tab}</Text>
            <View
              style={[
                styles.count,
                { backgroundColor: meta.countBackground, borderColor: meta.bannerBorder },
              ]}
            >
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
            right={
              <View style={styles.badgePosition}>
                <StatusBadge status={item.status} />
              </View>
            }
            cardStyle={[
              styles.approvalCard,
              item.status === "pending" ? styles.pendingCard : styles.resolvedCard,
            ]}
            titleRowStyle={styles.approvalTitleRow}
            hoursStyle={styles.approvalHours}
            infoRowStyle={styles.approvalInfoRow}
            infoIconSlotStyle={styles.approvalInfoIconSlot}
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
    <View style={[styles.badge, { backgroundColor: meta.badgeBackground }]}>
      <Text style={styles.badgeText}>{meta.badge}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    paddingTop: 12,
  },
  tab: {
    justifyContent: "center",
    backgroundColor: "#E8E8E8",
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  tabText: {
    fontFamily: pretendard(600),
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.35,
    color: "#818181",
  },
  tabTextOn: {
    color: Colors.white,
  },
  list: {
    paddingHorizontal: 39,
    paddingTop: 30,
    paddingBottom: 126,
    gap: 12,
  },
  banner: {
    height: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 30,
    width: 315,
    marginLeft: -2,
    marginBottom: 18,
  },
  bannerTitle: {
    fontFamily: pretendard(600),
    fontSize: 18,
  },
  count: {
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  countText: {
    fontFamily: pretendard(600),
    fontSize: 12,
    lineHeight: 17,
  },
  empty: {
    textAlign: "center",
    fontFamily: pretendard(400),
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 40,
  },
  approvalCard: {
    borderRadius: 29,
    paddingTop: 32.5,
    paddingBottom: 23.5,
    paddingHorizontal: 39,
  },
  approvalTitleRow: {
    alignItems: "flex-start",
  },
  approvalHours: {
    marginTop: 7,
    marginBottom: 17,
  },
  approvalInfoRow: {
    gap: 9.5,
    marginBottom: 8,
  },
  approvalInfoIconSlot: {
    width: 9,
  },
  pendingCard: {
    minHeight: 410,
  },
  resolvedCard: {
    minHeight: 345,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: pretendard(600),
    fontSize: 10,
    color: Colors.white,
  },
  badgePosition: {
    marginRight: -11,
    transform: [{ translateY: -4 }],
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 19.5,
    marginBottom: 16,
    marginHorizontal: -7,
  },
  studentName: {
    fontFamily: pretendard(700),
    fontSize: 21,
    lineHeight: 25,
    color: Colors.text,
    marginBottom: 12,
  },
  subLabel: {
    fontFamily: pretendard(500),
    fontSize: 13,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  subValue: {
    fontFamily: pretendard(500),
    fontSize: 13,
    lineHeight: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  note: {
    fontFamily: pretendard(500),
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 13,
    marginTop: 19.5,
    marginHorizontal: -3.5,
  },
  rejectBtn: {
    flex: 1,
    height: 49,
    backgroundColor: "#818181",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectText: {
    fontFamily: pretendard(600),
    color: Colors.white,
    fontSize: 15,
  },
  approveBtn: {
    flex: 1,
    height: 49,
    backgroundColor: "#222222",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  approveText: {
    fontFamily: pretendard(600),
    color: Colors.white,
    fontSize: 15,
  },
  pressed: {
    opacity: 0.85,
  },
  sheetBackdrop: {
    flex: 1,
    width: "100%",
    maxWidth: ADMIN_APP_FRAME_MAX_WIDTH,
    alignSelf: "center",
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
    width: "100%",
    maxWidth: ADMIN_APP_FRAME_MAX_WIDTH,
    alignSelf: "center",
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
