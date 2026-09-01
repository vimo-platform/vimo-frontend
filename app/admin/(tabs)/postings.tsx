import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";

import { deletePosting, fetchMyPostings, setWorkingPosting } from "@/features/admin/api/postings";
import { ActivityCard } from "@/features/admin/components/activity-card";
import { Colors } from "@/features/admin/constants/theme";
import type { Posting, PostingStatus } from "@/features/admin/types";

type FilterKey = "all" | "open" | "closed" | "draft";

const FILTERS = [
  { key: "all", label: "전체" },
  { key: "open", label: "모집 중" },
  { key: "closed", label: "모집 마감" },
  { key: "draft", label: "임시저장" },
] as const;

const STATUS_LABEL: Record<PostingStatus, string> = {
  open: "모집 중",
  closed: "모집 마감",
  draft: "임시저장",
};

// assets/icons/delete.svg 를 옮긴 삭제 경고(삼각형 느낌표) 아이콘
function DeleteWarningIcon({ size = 54 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 54 54" fill="none">
      <Path
        d="M19.6424 7.67813C22.8689 1.94062 31.1309 1.94062 34.3574 7.67813L49.5314 34.6916C52.6904 40.3178 48.6235 47.2635 42.1739 47.2635H11.8225C5.3729 47.2635 1.30939 40.3178 4.4684 34.6916L19.6424 7.67813ZM31.4144 9.33188C30.9743 8.54793 30.3334 7.89531 29.5576 7.44111C28.7817 6.98691 27.8989 6.7475 26.9999 6.7475C26.1009 6.7475 25.2181 6.98691 24.4422 7.44111C23.6664 7.89531 23.0255 8.54793 22.5854 9.33188L7.40802 36.3488C6.97577 37.1191 6.75262 37.9892 6.76073 38.8725C6.76884 39.7558 7.00793 40.6216 7.45425 41.3839C7.90057 42.1462 8.53859 42.7785 9.30491 43.2178C10.0712 43.6572 10.9392 43.8884 11.8225 43.8885H42.1739C43.0573 43.8884 43.9252 43.6572 44.6915 43.2178C45.4578 42.7785 46.0959 42.1462 46.5422 41.3839C46.9885 40.6216 47.2276 39.7558 47.2357 38.8725C47.2438 37.9892 47.0207 37.1191 46.5884 36.3488L31.4144 9.33188ZM26.9999 32.0625C27.6712 32.0625 28.3151 32.3292 28.7898 32.8039C29.2645 33.2786 29.5312 33.9224 29.5312 34.5938C29.5312 35.2651 29.2645 35.9089 28.7898 36.3836C28.3151 36.8583 27.6712 37.125 26.9999 37.125C26.3286 37.125 25.6847 36.8583 25.21 36.3836C24.7353 35.9089 24.4687 35.2651 24.4687 34.5938C24.4687 33.9224 24.7353 33.2786 25.21 32.8039C25.6847 32.3292 26.3286 32.0625 26.9999 32.0625ZM26.9999 16.875C27.4475 16.875 27.8767 17.0528 28.1931 17.3693C28.5096 17.6857 28.6874 18.115 28.6874 18.5625V27C28.6874 27.4476 28.5096 27.8768 28.1931 28.1933C27.8767 28.5097 27.4475 28.6875 26.9999 28.6875C26.5524 28.6875 26.1231 28.5097 25.8067 28.1933C25.4902 27.8768 25.3124 27.4476 25.3124 27V18.5625C25.3124 18.115 25.4902 17.6857 25.8067 17.3693C26.1231 17.0528 26.5524 16.875 26.9999 16.875Z"
        fill="#E78483"
      />
    </Svg>
  );
}

export default function PostingsScreen() {
  const params = useLocalSearchParams<{ filter?: FilterKey }>();
  const [postings, setPostings] = useState<Posting[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [deleteTarget, setDeleteTarget] = useState<Posting | null>(null);
  const [showDeleteDone, setShowDeleteDone] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const reload = useCallback(() => {
    fetchMyPostings().then(setPostings);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      const deletedPostingId = deleteTarget.id;
      await deletePosting(deletedPostingId);
      setPostings((current) => current.filter((posting) => posting.id !== deletedPostingId));
      setDeleteTarget(null);
      setShowDeleteDone(true);
      reload();
    } catch (error) {
      setDeleteTarget(null);
      Alert.alert(
        "삭제 실패",
        error instanceof Error ? error.message : "공고 삭제에 실패했습니다.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (params.filter) {
      setFilter(params.filter);
    }
  }, [params.filter]);

  const visible = postings.filter(
    (p) => (filter === "all" || p.status === filter) && p.title.includes(query.trim()),
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={visible}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <LinearGradient
              colors={["#C1C1C1", "#FFFFFF", "#222222", "#EFEFEF"]}
              locations={[0.15, 0.42, 0.73, 1]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.searchGradient}
            >
              <View style={styles.searchBar}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="어떤 봉사를 찾으시나요?"
                  placeholderTextColor={Colors.textSecondary}
                  value={query}
                  onChangeText={setQuery}
                />
                <Ionicons name="search" size={20} color={Colors.textSecondary} />
              </View>
            </LinearGradient>
            <View style={styles.chips}>
              {FILTERS.map((f) => (
                <Pressable
                  key={f.key}
                  style={[styles.chip, filter === f.key && styles.chipOn]}
                  onPress={() => setFilter(f.key)}
                >
                  <Text style={[styles.chipText, filter === f.key && styles.chipTextOn]}>
                    {f.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>조건에 맞는 공고가 없어요.</Text>}
        renderItem={({ item }) => {
          const isDraft = item.status === "draft";
          const openDraft = () => {
            setWorkingPosting(item);
            router.push("/admin/posting/preview");
          };
          return (
            <ActivityCard
              title={item.title}
              hoursPerSession={item.hoursPerSession}
              location={item.location}
              period={item.period}
              time={`${item.startTime} ~ ${item.endTime}`}
              onPress={() =>
                isDraft
                  ? openDraft()
                  : router.push({
                      pathname:
                        item.recruitType === "fcfs"
                          ? "/admin/posting/fcfs/[id]"
                          : "/admin/posting/[id]",
                      params: { id: item.id },
                    })
              }
            >
              <View style={styles.cardFooter}>
                <Text style={styles.countText}>
                  모집{item.capacity}명 / 지원{item.applicants}명
                </Text>
                {isDraft ? (
                  <View style={styles.draftActions}>
                    <Pressable
                      style={({ pressed }) => [styles.deletePill, pressed && styles.pressed]}
                      onPress={() => setDeleteTarget(item)}
                    >
                      <Text style={styles.deletePillText}>삭제</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [styles.editPill, pressed && styles.pressed]}
                      onPress={openDraft}
                    >
                      <Text style={styles.editPillText}>수정</Text>
                    </Pressable>
                  </View>
                ) : item.status === "closed" ? (
                  <View style={styles.draftActions}>
                    <Pressable
                      style={({ pressed }) => [styles.deletePill, pressed && styles.pressed]}
                      onPress={() => setDeleteTarget(item)}
                    >
                      <Text style={styles.deletePillText}>삭제</Text>
                    </Pressable>
                    <View style={[styles.pill, styles.pillOff]}>
                      <Text style={styles.pillText}>{STATUS_LABEL[item.status]}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>{STATUS_LABEL[item.status]}</Text>
                  </View>
                )}
              </View>
            </ActivityCard>
          );
        }}
      />
      <Pressable
        style={({ pressed }) => [styles.createButton, pressed && styles.pressed]}
        onPress={() => router.push("/admin/posting/create")}
      >
        <Text style={styles.createButtonText}>＋ 공고 작성</Text>
      </Pressable>

      <Modal
        animationType="fade"
        transparent
        visible={deleteTarget !== null}
        onRequestClose={() => setDeleteTarget(null)}
      >
        <View style={styles.sheetOverlay}>
          <View style={styles.sheetCard}>
            <DeleteWarningIcon size={54} />
            <Text style={styles.dialogTitle}>공고를 삭제하시겠어요?</Text>
            <Text style={styles.dialogDesc}>삭제 후에는 복구할 수 없습니다.</Text>
            <View style={styles.dialogButtons}>
              <Pressable
                style={({ pressed }) => [styles.dialogCancel, pressed && styles.pressed]}
                onPress={() => setDeleteTarget(null)}
              >
                <Text style={styles.dialogCancelText}>닫기</Text>
              </Pressable>
              <Pressable
                disabled={isDeleting}
                style={({ pressed }) => [styles.dialogDelete, pressed && styles.pressed]}
                onPress={confirmDelete}
              >
                <Text style={styles.dialogDeleteText}>삭제</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={showDeleteDone}
        onRequestClose={() => setShowDeleteDone(false)}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogCard}>
            <Pressable
              style={styles.doneClose}
              hitSlop={10}
              onPress={() => setShowDeleteDone(false)}
            >
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </Pressable>
            <View style={styles.doneCircle}>
              <Ionicons name="checkmark" size={28} color={Colors.white} />
            </View>
            <Text style={styles.dialogTitle}>공고 삭제 완료</Text>
            <Text style={styles.dialogDesc}>봉사 공고가 성공적으로{"\n"}삭제되었습니다.</Text>
            <Pressable
              style={({ pressed }) => [styles.doneConfirm, pressed && styles.pressed]}
              onPress={() => setShowDeleteDone(false)}
            >
              <Text style={styles.doneConfirmText}>확인</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
    gap: 12,
  },
  header: {
    gap: 14,
    marginBottom: 4,
  },
  // 유저 공고페이지 검색창과 동일한 그라데이션 테두리
  searchGradient: {
    height: 52,
    borderRadius: 26,
    padding: 1.4,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 25,
    paddingHorizontal: 18,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    fontSize: 15,
    color: Colors.text,
  },
  chips: {
    flexDirection: "row",
    gap: 10,
  },
  chip: {
    height: 34,
    justifyContent: "center",
    backgroundColor: "#E8E8E8",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  chipOn: {
    backgroundColor: "#222222",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#818181",
  },
  chipTextOn: {
    color: Colors.white,
  },
  empty: {
    textAlign: "center",
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 60,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  countText: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  pill: {
    width: 105,
    height: 31,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222222",
    borderRadius: 18,
  },
  draftActions: {
    flexDirection: "row",
    gap: 10,
  },
  editPill: {
    width: 105,
    height: 31,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222222",
    borderRadius: 18,
    paddingTop: 7,
    paddingBottom: 8,
    paddingHorizontal: 30,
  },
  editPillText: {
    color: "#F5F5F5",
    fontSize: 13,
    fontWeight: "700",
  },
  deletePill: {
    width: 105,
    height: 31,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFE0E0",
    borderRadius: 18,
    paddingTop: 7,
    paddingBottom: 8,
    paddingHorizontal: 30,
  },
  deletePillText: {
    color: "#E87070",
    fontSize: 13,
    fontWeight: "700",
  },
  pillOff: {
    backgroundColor: "#B9BEC6",
  },
  pillText: {
    color: "#F5F5F5",
    fontSize: 13,
    fontWeight: "700",
  },
  createButton: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: "#222222",
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
  dialogOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(17, 17, 17, 0.56)",
    paddingHorizontal: 40,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(17, 17, 17, 0.56)",
  },
  sheetCard: {
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: Colors.card,
  },
  dialogCard: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: Colors.card,
  },
  warnCircle: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    backgroundColor: "#FCE4E5",
  },
  dialogTitle: {
    marginTop: 18,
    fontSize: 19,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
  },
  dialogDesc: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 21,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  dialogButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 26,
    justifyContent: "center",
  },
  dialogCancel: {
    width: 143,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#818181",
  },
  dialogCancelText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F5F5F5",
  },
  dialogDelete: {
    width: 143,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#FFE0E0",
  },
  dialogDeleteText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#EB7E7E",
  },
  doneClose: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  doneCircle: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 27,
    backgroundColor: "#757575",
  },
  doneConfirm: {
    alignSelf: "stretch",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
    borderRadius: 14,
    backgroundColor: "#222222",
  },
  doneConfirmText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
});
