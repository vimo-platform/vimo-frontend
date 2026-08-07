import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

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
            <Ionicons name="warning-outline" size={54} color="#E78483" />
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 24,
    paddingHorizontal: 18,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.text,
  },
  chips: {
    flexDirection: "row",
    gap: 8,
  },
  chip: {
    backgroundColor: "#EDEDED",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipOn: {
    backgroundColor: "#222222",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
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
