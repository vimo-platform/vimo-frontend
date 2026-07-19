import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { fetchMyPostings, setWorkingPosting } from "@/api/postings";
import { ActivityCard } from "@/components/activity-card";
import { Colors } from "@/constants/theme";
import type { Posting, PostingStatus } from "@/types";

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

  useFocusEffect(
    useCallback(() => {
      fetchMyPostings().then(setPostings);
    }, []),
  );

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
            router.push("/posting/preview");
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
                  : router.push({ pathname: "/posting/[id]", params: { id: item.id } })
              }
            >
              <View style={styles.cardFooter}>
                <Text style={styles.countText}>
                  모집{item.capacity}명 / 지원{item.applicants}명
                </Text>
                {isDraft ? (
                  <Pressable
                    style={({ pressed }) => [styles.editPill, pressed && styles.pressed]}
                    onPress={openDraft}
                  >
                    <Text style={styles.pillText}>수정</Text>
                  </Pressable>
                ) : (
                  <View style={[styles.pill, item.status !== "open" && styles.pillOff]}>
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
        onPress={() => router.push("/posting/create")}
      >
        <Text style={styles.createButtonText}>＋ 공고 작성</Text>
      </Pressable>
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
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  pill: {
    backgroundColor: "#222222",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editPill: {
    backgroundColor: "#222222",
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  pillOff: {
    backgroundColor: "#B9BEC6",
  },
  pillText: {
    color: Colors.white,
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
});
