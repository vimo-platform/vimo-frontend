import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";

import {
  generatePostingDraft,
  newPostingId,
  setWorkingPosting,
} from "@/features/admin/api/postings";
import { LoadingOverlay } from "@/features/admin/components/loading-overlay";
import { Colors } from "@/features/admin/constants/theme";
import type { RecruitType } from "@/features/admin/types";

const GENDERS = ["전체", "남성", "여성"] as const;

const RECRUIT_METHODS: { value: RecruitType; label: string }[] = [
  { value: "selection", label: "선발 모집" },
  { value: "fcfs", label: "선착순 모집" },
];

export default function CreatePostingScreen() {
  const [memo, setMemo] = useState("");
  const [location, setLocation] = useState("");
  const [count, setCount] = useState(3);
  const [gender, setGender] = useState<(typeof GENDERS)[number]>("전체");
  const [recruitType, setRecruitType] = useState<RecruitType>("selection");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [startTime, setStartTime] = useState("11:30");
  const [endTime, setEndTime] = useState("16:30");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!memo.trim()) {
      Alert.alert("공고 작성", "봉사 모집 내용을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const draft = await generatePostingDraft(memo);
      setWorkingPosting({
        id: newPostingId(),
        title: draft.title,
        description: draft.description,
        location: location.trim() || "장소 미정",
        period: dateFrom && dateTo ? `${dateFrom} ~ ${dateTo}` : "기간 미정",
        startTime,
        endTime,
        capacity: count,
        applicants: 0,
        hoursPerSession: 3,
        status: "draft",
        recruitType,
        tags: draft.keywords,
        gender,
        createdAt: new Date().toISOString().slice(0, 10),
      });
      router.replace("/admin/posting/preview");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting) {
    return <LoadingOverlay message="공고를 생성하고 있어요" />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>
          공고 내용을 입력해 주세요{"\n"}깔끔하게 정리해드릴게요
        </Text>

        <View style={[styles.memoBox, memo ? styles.filled : null]}>
          <TextInput
            style={[styles.memoInput, memo ? styles.textWhite : null]}
            placeholder={
              "봉사 모집 내용을 간단히 작성해주세요.\n(예시: 장애학우 도우미 모집합니다. 수업 보조)"
            }
            placeholderTextColor={Colors.textSecondary}
            multiline
            value={memo}
            onChangeText={setMemo}
          />
          <Ionicons name="pencil" size={16} color={memo ? Colors.white : Colors.textSecondary} />
        </View>

        <Text style={styles.label}>장소</Text>
        <TextInput
          style={[styles.input, location ? styles.filled : null]}
          placeholder="활동 장소를 입력해 주세요"
          placeholderTextColor={Colors.textSecondary}
          value={location}
          onChangeText={setLocation}
        />
        <Pressable style={styles.locationButton}>
          <Ionicons name="locate-outline" size={15} color={Colors.text} />
          <Text style={styles.locationButtonText}>현재 위치로 찾기</Text>
        </Pressable>

        <Text style={styles.label}>인원</Text>
        <View style={styles.stepper}>
          <Pressable onPress={() => setCount(Math.max(1, count - 1))} hitSlop={8}>
            <Text style={styles.stepperSign}>−</Text>
          </Pressable>
          <Text style={styles.stepperValue}>{count}</Text>
          <Pressable onPress={() => setCount(count + 1)} hitSlop={8}>
            <Text style={styles.stepperSign}>＋</Text>
          </Pressable>
        </View>
        <View style={styles.chips}>
          {GENDERS.map((g) => (
            <Pressable
              key={g}
              style={[styles.chip, gender === g && styles.chipOn]}
              onPress={() => setGender(g)}
            >
              <Text style={[styles.chipText, gender === g && styles.chipTextOn]}>{g}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>모집 방법</Text>
        <View style={styles.chips}>
          {RECRUIT_METHODS.map((m) => (
            <Pressable
              key={m.value}
              style={[styles.chip, recruitType === m.value && styles.chipOn]}
              onPress={() => setRecruitType(m.value)}
            >
              <Text
                style={[styles.chipText, recruitType === m.value && styles.chipTextOn]}
              >
                {m.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>날짜</Text>
        <View style={styles.rangeRow}>
          <TextInput
            style={[styles.input, styles.rangeInput, dateFrom ? styles.filled : null]}
            placeholder="YYYY / MM / DD"
            placeholderTextColor={Colors.textSecondary}
            value={dateFrom}
            onChangeText={setDateFrom}
          />
          <Text style={styles.rangeSep}>~</Text>
          <TextInput
            style={[styles.input, styles.rangeInput, dateTo ? styles.filled : null]}
            placeholder="YYYY / MM / DD"
            placeholderTextColor={Colors.textSecondary}
            value={dateTo}
            onChangeText={setDateTo}
          />
        </View>

        <Text style={styles.label}>시간</Text>
        <View style={styles.rangeRow}>
          <View style={styles.timeCol}>
            <Text style={styles.timeLabel}>시작</Text>
            <TextInput
              style={[styles.input, styles.timeInput, startTime ? styles.filled : null]}
              value={startTime}
              onChangeText={setStartTime}
            />
          </View>
          <Text style={styles.rangeSep}>→</Text>
          <View style={styles.timeCol}>
            <Text style={styles.timeLabel}>종료</Text>
            <TextInput
              style={[styles.input, styles.timeInput, endTime ? styles.filled : null]}
              value={endTime}
              onChangeText={setEndTime}
            />
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.submitButton, pressed && styles.submitButtonActive]}
          onPress={submit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? "AI가 작성 중…" : "AI 공고 생성"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
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
  heading: {
    fontSize: 19,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
    lineHeight: 28,
    marginVertical: 16,
  },
  memoBox: {
    flexDirection: "row",
    backgroundColor: "#F1F1F1",
    borderRadius: 16,
    padding: 16,
  },
  memoInput: {
    flex: 1,
    minHeight: 130,
    fontSize: 14,
    color: Colors.text,
    textAlignVertical: "top",
  },
  label: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 24,
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#F1F1F1",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 14,
    color: Colors.text,
  },
  filled: {
    backgroundColor: "#222222",
    color: Colors.white,
  },
  textWhite: {
    color: Colors.white,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 10,
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 20,
    backgroundColor: "#F1F1F1",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  stepperSign: {
    fontSize: 18,
    color: Colors.text,
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  chips: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipOn: {
    backgroundColor: "#222222",
    borderColor: "#222222",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
  },
  chipTextOn: {
    color: Colors.white,
  },
  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rangeInput: {
    flex: 1,
    textAlign: "center",
  },
  rangeSep: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  timeCol: {
    flex: 1,
    gap: 6,
  },
  timeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  timeInput: {
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#818181",
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
    marginTop: 36,
  },
  submitButtonActive: {
    backgroundColor: "#222222",
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
