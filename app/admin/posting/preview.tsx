import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, router, useFocusEffect } from "expo-router";
import Svg, { Path } from "react-native-svg";

import { isAuthError } from "@/api/client";
import { PostingInfoIcon, type PostingInfoIconType } from "@/components/common/posting-info-icon";
import { getWorkingPosting, setWorkingPosting, upsertPosting } from "@/features/admin/api/postings";
import { Colors } from "@/features/admin/constants/theme";
import type { Posting } from "@/features/admin/types";

export default function PostingPreviewScreen() {
  const [posting, setPosting] = useState<Posting | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setPosting(getWorkingPosting());
    }, []),
  );

  if (!posting) {
    return null;
  }

  const goList = (filter: "all" | "draft") =>
    router.replace({ pathname: "/admin/postings", params: { filter } });

  const saveDraft = async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      await upsertPosting({ ...posting, status: "draft" });
      goList("draft");
    } catch (error) {
      if (isAuthError(error)) {
        Alert.alert("로그인 만료", "로그인이 만료되었어요. 다시 로그인해 주세요.");
        router.replace("/");
        return;
      }
      Alert.alert("저장 실패", "공고 임시저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const register = async () => {
    if (isSaving) {
      return;
    }

    if (!isTimeOrderValid(posting.startTime, posting.endTime)) {
      setConfirming(false);
      Alert.alert("시간 확인", "종료 시간은 시작 시간보다 늦어야 합니다.");
      return;
    }

    setIsSaving(true);

    try {
      await upsertPosting({ ...posting, status: "open" });
      setConfirming(false);
      setDone(true);
    } catch (error) {
      setConfirming(false);

      if (isAuthError(error)) {
        Alert.alert("로그인 만료", "로그인이 만료되었어요. 다시 로그인해 주세요.");
        router.replace("/");
        return;
      }
      Alert.alert(
        "등록 실패",
        error instanceof Error ? error.message : "공고 등록에 실패했습니다.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const finishDone = () => {
    setDone(false);
    goList("all");
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "공고 작성",
          headerTitleAlign: "center",
        }}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{posting.title}</Text>
          <Pressable disabled={isSaving} onPress={saveDraft} hitSlop={10}>
            <DraftSaveIcon />
          </Pressable>
        </View>
        <Text style={styles.hours}>
          봉사 인정 시간 : 회차당 {posting.hoursPerSession}시간 인정
        </Text>

        <View style={styles.capacityPill}>
          <Text style={styles.capacityText}>
            모집 : {posting.capacity}명 ({posting.gender ?? "전체"})
          </Text>
        </View>

        <View style={styles.tags}>
          {posting.tags.map((tag) => (
            <Text key={tag} style={styles.tag}>
              {tag}
            </Text>
          ))}
          {posting.noCancel !== false && (
            <Text style={[styles.tag, styles.tagWarn]}>취소 불가</Text>
          )}
        </View>

        <View style={styles.thickDivider} />

        <InfoRow icon="location" text={posting.location} />
        <InfoRow
          icon="calendar"
          text={posting.period}
        />
        <InfoRow icon="clock" text={`${posting.startTime} ~ ${posting.endTime}`} />

        <View style={styles.thinDivider} />

        <Text style={styles.sectionTitle}>모집 안내</Text>
        <Text style={styles.description}>{posting.description}</Text>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
          onPress={() => {
            setWorkingPosting(posting);
            router.push("/admin/posting/edit");
          }}
        >
          <Text style={styles.editButtonText}>수정</Text>
        </Pressable>
          <Pressable
            disabled={isSaving}
            style={({ pressed }) => [styles.registerButton, pressed && styles.pressed]}
            onPress={() => setConfirming(true)}
        >
          <Text style={styles.registerButtonText}>이대로 공고 등록</Text>
        </Pressable>
      </View>

      <Modal visible={confirming} transparent animationType="fade" onRequestClose={() => setConfirming(false)}>
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <Ionicons name="warning-outline" size={54} color="#E78483" />
            <Text style={styles.dialogTitle}>공고를 등록하시겠어요?</Text>
            <Text style={styles.dialogBody}>
              공고를 등록하면{"\n"}수정할 수 없어요!
            </Text>
            <View style={styles.dialogButtons}>
              <Pressable
                style={({ pressed }) => [styles.dialogClose, pressed && styles.pressed]}
                onPress={() => setConfirming(false)}
              >
                <Text style={styles.dialogCloseText}>닫기</Text>
              </Pressable>
              <Pressable
                disabled={isSaving}
                style={({ pressed }) => [styles.dialogConfirm, pressed && styles.pressed]}
                onPress={register}
              >
                <Text style={styles.dialogConfirmText}>등록</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={done} transparent animationType="fade" onRequestClose={finishDone}>
        <View style={styles.centeredBackdrop}>
          <View style={styles.doneDialog}>
            <Pressable style={styles.closeX} onPress={finishDone} hitSlop={10}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </Pressable>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={30} color={Colors.white} />
            </View>
            <Text style={styles.dialogTitle}>공고 등록 완료</Text>
            <Text style={styles.dialogBody}>
              봉사 공고가 성공적으로{"\n"}등록되었습니다.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.doneButton, pressed && styles.pressed]}
              onPress={finishDone}
            >
              <Text style={styles.doneButtonText}>확인</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function isTimeOrderValid(startTime: string, endTime: string) {
  const startMinutes = getMinutes(startTime);
  const endMinutes = getMinutes(endTime);

  if (startMinutes === null || endMinutes === null) {
    return false;
  }

  return startMinutes < endMinutes;
}

function getMinutes(time: string) {
  const [hour, minute] = time.match(/\d+/g) ?? [];

  if (!hour || !minute) {
    return null;
  }

  return Number(hour) * 60 + Number(minute);
}

function DraftSaveIcon() {
  return (
    <Svg width={26} height={26} viewBox="0 0 35 35" fill="none">
      <Path
        d="M8.72656 9.01661C8.72656 7.38795 8.72656 6.57361 9.04357 5.95123C9.3224 5.40402 9.7673 4.95912 10.3145 4.68029C10.9369 4.36328 11.7512 4.36328 13.3799 4.36328H21.5232C23.1519 4.36328 23.9662 4.36328 24.5886 4.68029C25.1358 4.95912 25.5807 5.40402 25.8596 5.95123C26.1766 6.57361 26.1766 7.38795 26.1766 9.01661V28.3643C26.1766 29.071 26.1766 29.4244 26.0297 29.6178C25.9662 29.7019 25.8852 29.7712 25.7923 29.8209C25.6994 29.8707 25.5968 29.8996 25.4916 29.9057C25.2488 29.9203 24.9551 29.7239 24.3676 29.3328L17.4516 24.7216L10.5355 29.3313C9.94806 29.7239 9.65432 29.9203 9.41002 29.9057C9.30508 29.8994 9.20277 29.8703 9.11013 29.8206C9.0175 29.7709 8.93674 29.7017 8.87343 29.6178C8.72656 29.4244 8.72656 29.071 8.72656 28.3643V9.01661Z"
        fill="#28303F"
        stroke="#28303F"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function InfoRow({ icon, text }: { icon: PostingInfoIconType; text: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconSlot}>
        <PostingInfoIcon type={icon} />
      </View>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.card,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
  },
  hours: {
    fontSize: 14,
    color: Colors.text,
    marginTop: 8,
    marginBottom: 12,
  },
  capacityPill: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  capacityText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: "600",
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    backgroundColor: "#F1F1F1",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tagWarn: {
    backgroundColor: "#FDE8EC",
    color: "#E0526E",
  },
  thickDivider: {
    height: 6,
    backgroundColor: Colors.border,
    marginHorizontal: -20,
    marginVertical: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  infoIconSlot: {
    width: 16,
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  thinDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 10,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.text,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#818181",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  editButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  registerButton: {
    flex: 1.6,
    backgroundColor: "#222222",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  registerButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  dialog: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 24,
    gap: 12,
  },
  warnCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "#F5B5C1",
    alignItems: "center",
    justifyContent: "center",
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
  },
  dialogBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  dialogButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    justifyContent: "center",
  },
  dialogClose: {
    width: 143,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#818181",
    borderRadius: 14,
  },
  dialogCloseText: {
    color: "#F5F5F5",
    fontSize: 15,
    fontWeight: "700",
  },
  dialogConfirm: {
    width: 143,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222222",
    borderRadius: 14,
  },
  dialogConfirmText: {
    color: "#F5F5F5",
    fontSize: 15,
    fontWeight: "700",
  },
  centeredBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  doneDialog: {
    alignSelf: "stretch",
    backgroundColor: Colors.card,
    borderRadius: 20,
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    gap: 12,
  },
  closeX: {
    position: "absolute",
    top: 14,
    right: 14,
  },
  checkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#9AA0A6",
    alignItems: "center",
    justifyContent: "center",
  },
  doneButton: {
    alignSelf: "stretch",
    backgroundColor: "#222222",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 12,
  },
  doneButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
});
