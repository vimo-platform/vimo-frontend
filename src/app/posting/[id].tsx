import { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { fetchApplicants } from "@/api/applicants";
import { closePosting, fetchPosting } from "@/api/postings";
import { ImageToggle } from "@/components/figma";
import { Colors } from "@/constants/theme";
import type { Applicant, Posting } from "@/types";

export default function ApplicantsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [posting, setPosting] = useState<Posting | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  useEffect(() => {
    fetchPosting(id).then((p) => setPosting(p ?? null));
    fetchApplicants(id).then(setApplicants);
  }, [id]);

  const toggle = (applicantId: string) =>
    setApplicants((prev) =>
      prev.map((a) => (a.id === applicantId ? { ...a, selected: !a.selected } : a)),
    );

  const selectedCount = applicants.filter((a) => a.selected).length;

  const close = async () => {
    await closePosting(id);
    Alert.alert("모집 마감", "공고가 마감되었습니다.");
    router.back();
  };

  if (!posting) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{posting.title}</Text>
        <Text style={styles.hours}>
          봉사 인정 시간 : 회차당 {posting.hoursPerSession}시간 인정
        </Text>
        <View style={styles.tags}>
          {posting.tags.map((tag) => (
            <Text key={tag} style={styles.tag}>
              {tag}
            </Text>
          ))}
          <Text style={[styles.tag, styles.tagWarn]}>취소 불가</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.listArea}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>지원자 목록</Text>
          <Text style={styles.count}>
            <Text style={styles.countSelected}>{selectedCount}</Text> / {posting.capacity}
          </Text>
        </View>
        <FlatList
          data={applicants}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.department}>{item.department}</Text>
              <ImageToggle on={item.selected} onToggle={() => toggle(item.id)} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.card,
  },
  header: {
    padding: 20,
    gap: 6,
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    color: Colors.text,
  },
  hours: {
    fontSize: 13,
    color: Colors.text,
  },
  tags: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
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
