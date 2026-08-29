import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";

import { PostingInfoIcon, type PostingInfoIconType } from "@/components/common/posting-info-icon";
import { Colors } from "@/features/admin/constants/theme";
import type { Posting } from "@/features/admin/types";

export function PostingSummary({ posting }: { posting: Posting }) {
  const description = posting.description.trim();
  const recruitTypeLabel = posting.recruitType === "fcfs" ? "선착순 모집" : "선발 모집";

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{posting.title}</Text>
      <Text style={styles.hours}>봉사 인정 시간 : 회차당 {posting.hoursPerSession}시간 인정</Text>

      <View style={styles.detailBlock}>
        <InfoRow icon="location" text={posting.location || "장소 정보 없음"} />
        <InfoRow icon="calendar" text={posting.period || "일자 정보 없음"} />
        <InfoRow
          icon="clock"
          text={
            posting.startTime || posting.endTime
              ? `${posting.startTime || "--:--"} ~ ${posting.endTime || "--:--"}`
              : "시간 정보 없음"
          }
        />
        <InfoRow
          icon="people-outline"
          text={`모집${posting.capacity}명 / 지원${posting.applicants}명`}
        />
      </View>

      <View style={styles.tags}>
        <Text style={[styles.tag, styles.recruitTag]}>{recruitTypeLabel}</Text>
        {posting.tags.map((tag) => (
          <Text key={tag} style={styles.tag}>
            {tag}
          </Text>
        ))}
      </View>

      {description ? (
        <View style={styles.descriptionBlock}>
          <Text style={styles.sectionTitle}>봉사 내용</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      ) : null}
    </View>
  );
}

function InfoRow({
  icon,
  text,
}: {
  icon: PostingInfoIconType | keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconSlot}>
        {icon === "location" || icon === "calendar" || icon === "clock" ? (
          <PostingInfoIcon type={icon} color={Colors.textSecondary} />
        ) : (
          <Ionicons name={icon} size={16} color={Colors.textSecondary} />
        )}
      </View>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
    lineHeight: 28,
  },
  hours: {
    fontSize: 14,
    color: Colors.text,
  },
  detailBlock: {
    gap: 8,
    marginTop: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoIconSlot: {
    width: 16,
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  tag: {
    backgroundColor: "#F1F1F1",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  recruitTag: {
    backgroundColor: "#E7F1FD",
    color: Colors.primary,
  },
  descriptionBlock: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
});
