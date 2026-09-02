import { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { fetchFcfsApplicants } from "@/services/admin/applicants";
import { closePosting, fetchPosting } from "@/services/admin/postings";
import { PostingSummary } from "@/components/admin/PostingSummary";
import { Colors } from "@/styles/admin/theme";
import type { Applicant, Posting } from "@/types/admin";

export default function FcfsApplicantsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [posting, setPosting] = useState<Posting | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  useEffect(() => {
    Promise.all([fetchPosting(id), fetchFcfsApplicants(id)]).then(([p, list]) => {
      // 선착순: 정원이 다 차 있으면 자동으로 마감 처리
      if (p && p.status !== "closed" && list.length >= p.capacity) {
        closePosting(p.id);
        p = { ...p, status: "closed" };
      }
      setPosting(p ?? null);
      setApplicants(list);
    });
  }, [id]);

  const closed =
    posting?.status === "closed" || applicants.length >= (posting?.capacity ?? 0);
  // 선착순은 정원까지만 확정, 정원을 넘겨 지원한 인원은 마감 처리
  const confirmedCount = Math.min(applicants.length, posting?.capacity ?? 0);

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
      <PostingSummary posting={posting} />

      <View style={styles.divider} />

      <View style={styles.listArea}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>지원자 목록</Text>
          <Text style={styles.count}>
            <Text style={{ color: closed ? Colors.text : Colors.success }}>
              {confirmedCount}
            </Text>{" "}
            / {posting.capacity}
          </Text>
        </View>

        {closed && (
          <Text style={styles.closedNotice}>
            선착순 {posting.capacity}명이 모두 채워져 모집이 마감되었습니다.
          </Text>
        )}

        <FlatList
          data={applicants}
          keyExtractor={(a) => a.id}
          renderItem={({ item, index }) => {
            const confirmed = index < posting.capacity;

            return (
              <View style={styles.row}>
                <Text style={styles.order}>{String(index + 1).padStart(2, "0")}.</Text>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.department}>{item.department}</Text>
                <View style={[styles.badge, !confirmed && styles.badgeOff]}>
                  <Text style={[styles.badgeText, !confirmed && styles.badgeTextOff]}>
                    {confirmed ? "참여확정" : "모집 마감"}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.closeButton,
          closed && styles.closeButtonOff,
          pressed && !closed && styles.pressed,
        ]}
        onPress={close}
        disabled={closed}
      >
        <Text style={[styles.closeButtonText, closed && styles.closeButtonTextOff]}>
          {closed ? "모집 마감됨" : "모집 마감"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.card,
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
  closedNotice: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.danger,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  order: {
    width: 36,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
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
  badge: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: "#222222",
  },
  badgeOff: {
    backgroundColor: "#E8E8E8",
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.white,
  },
  badgeTextOff: {
    color: "#B9BEC6",
  },
  closeButton: {
    backgroundColor: "#222222",
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
    margin: 16,
  },
  closeButtonOff: {
    backgroundColor: "#E8E8E8",
  },
  closeButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  closeButtonTextOff: {
    color: "#B9BEC6",
  },
  pressed: {
    opacity: 0.85,
  },
});
