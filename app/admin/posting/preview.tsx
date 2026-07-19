import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, router, useFocusEffect } from "expo-router";

import { getWorkingPosting, setWorkingPosting, upsertPosting } from "@/features/admin/api/postings";
import { Figma } from "@/features/admin/components/figma";
import { Colors } from "@/features/admin/constants/theme";
import type { Posting } from "@/features/admin/types";

export default function PostingPreviewScreen() {
  const [posting, setPosting] = useState<Posting | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

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
    await upsertPosting({ ...posting, status: "draft" });
    goList("draft");
  };

  const register = async () => {
    await upsertPosting({ ...posting, status: "open" });
    setConfirming(false);
    setDone(true);
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
          headerRight: () => (
            <Pressable onPress={saveDraft} hitSlop={10}>
              <Figma name="bookmark" />
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{posting.title}</Text>
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
          <Text style={[styles.tag, styles.tagWarn]}>취소 불가</Text>
        </View>

        <View style={styles.thickDivider} />

        <InfoRow icon="location-outline" text={posting.location} />
        <InfoRow
          icon="calendar-clear-outline"
          text={posting.period}
        />
        <InfoRow icon="time-outline" text={`${posting.startTime} ~ ${posting.endTime}`} />

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
          style={({ pressed }) => [styles.registerButton, pressed && styles.pressed]}
          onPress={() => setConfirming(true)}
        >
          <Text style={styles.registerButtonText}>이대로 공고 등록</Text>
        </Pressable>
      </View>

      <Modal visible={confirming} transparent animationType="fade" onRequestClose={() => setConfirming(false)}>
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <View style={styles.warnCircle}>
              <Ionicons name="alert" size={26} color="#E0526E" />
            </View>
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

function InfoRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={Colors.text} />
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
  title: {
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
    alignSelf: "stretch",
  },
  dialogClose: {
    flex: 1,
    backgroundColor: "#B9BEC6",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  dialogCloseText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  dialogConfirm: {
    flex: 1,
    backgroundColor: "#222222",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  dialogConfirmText: {
    color: Colors.white,
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
