import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";
import type { Posting } from "@/types";

// 지원자 목록 화면 상단의 공고 요약 (제목 · 인정 시간 · 태그)
export function PostingSummary({ posting }: { posting: Posting }) {
  return (
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
        {posting.recruitType === "fcfs" && (
          <Text style={[styles.tag, styles.tagFcfs]}>선착순 모집</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  tagFcfs: {
    backgroundColor: "#E7F1FD",
    color: Colors.primary,
  },
});
