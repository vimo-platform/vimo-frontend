import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack, router } from "expo-router";

import { getWorkingPosting, setWorkingPosting } from "@/api/postings";
import { Colors } from "@/constants/theme";
import type { Gender } from "@/types";

const GENDERS: Gender[] = ["전체", "남성", "여성"];

export default function PostingEditScreen() {
  const base = getWorkingPosting();
  const [title, setTitle] = useState(base?.title ?? "");
  const [hoursText, setHoursText] = useState(
    base ? `회차당 ${base.hoursPerSession}시간 인정` : "",
  );
  const [location, setLocation] = useState(base?.location ?? "");
  const [period, setPeriod] = useState(base?.period ?? "");
  const [timeText, setTimeText] = useState(
    base ? `${base.startTime} ~ ${base.endTime}` : "",
  );
  const [capacity, setCapacity] = useState(base?.capacity ?? 1);
  const [gender, setGender] = useState<Gender>(base?.gender ?? "전체");
  const [description, setDescription] = useState(base?.description ?? "");

  if (!base) {
    return null;
  }

  const save = () => {
    const hours = Number(hoursText.match(/\d+/)?.[0] ?? base.hoursPerSession);
    const [start, end] = timeText.split("~").map((s) => s.trim());
    setWorkingPosting({
      ...base,
      title: title.trim(),
      hoursPerSession: hours,
      location: location.trim(),
      period: period.trim(),
      startTime: start || base.startTime,
      endTime: end || base.endTime,
      capacity,
      gender,
      description: description.trim(),
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ title: "공고 수정", headerTitleAlign: "center" }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Field label="공고 제목" value={title} onChangeText={setTitle} max={30} />
        <Field label="봉사 인증 시간" value={hoursText} onChangeText={setHoursText} max={30} />

        <Label text="키워드" />
        <View style={styles.tags}>
          {base.tags.map((tag) => (
            <Text key={tag} style={styles.tag}>
              {tag}
            </Text>
          ))}
          <Text style={[styles.tag, styles.tagWarn]}>취소 불가</Text>
        </View>

        <Label text="세부 내용" />
        <View style={styles.detailCard}>
          <EditRow icon="location-outline" caption="활동 장소" value={location} onChange={setLocation} />
          <EditRow icon="calendar-clear-outline" caption="활동 기간" value={period} onChange={setPeriod} />
          <EditRow icon="time-outline" caption="활동 시간" value={timeText} onChange={setTimeText} last />
        </View>

        <Label text="모집 인원" />
        <View style={styles.capacityRow}>
          <View style={styles.stepper}>
            <Pressable onPress={() => setCapacity(Math.max(1, capacity - 1))} hitSlop={8}>
              <Text style={styles.stepperSign}>−</Text>
            </Pressable>
            <Text style={styles.stepperValue}>{capacity}</Text>
            <Pressable onPress={() => setCapacity(capacity + 1)} hitSlop={8}>
              <Text style={styles.stepperSign}>＋</Text>
            </Pressable>
          </View>
          <View style={styles.genderChips}>
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
        </View>

        <Label text="모집 안내" />
        <View style={styles.textAreaWrap}>
          <TextInput
            style={styles.textArea}
            multiline
            value={description}
            onChangeText={setDescription}
          />
          <Text style={styles.counter}>{description.length}/30</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}
          onPress={save}
        >
          <Text style={styles.submitButtonText}>AI 공고 생성</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Label({ text }: { text: string }) {
  return (
    <Text style={styles.label}>
      {text}
      <Text style={styles.required}> *</Text>
    </Text>
  );
}

function Field({
  label,
  value,
  onChangeText,
  max,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  max: number;
}) {
  return (
    <>
      <Label text={label} />
      <View style={styles.fieldWrap}>
        <TextInput style={styles.field} value={value} onChangeText={onChangeText} />
        <Text style={styles.counter}>
          {value.length}/{max}
        </Text>
      </View>
    </>
  );
}

function EditRow({
  icon,
  caption,
  value,
  onChange,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  caption: string;
  value: string;
  onChange: (t: string) => void;
  last?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <View style={[styles.editRow, !last && styles.editRowBorder]}>
      <Ionicons name={icon} size={18} color={Colors.text} />
      <View style={styles.editRowBody}>
        <Text style={styles.editRowCaption}>{caption}</Text>
        {editing ? (
          <TextInput
            style={styles.editRowInput}
            value={value}
            onChangeText={onChange}
            autoFocus
            onBlur={() => setEditing(false)}
          />
        ) : (
          <Text style={styles.editRowValue}>{value}</Text>
        )}
      </View>
      <Pressable style={styles.editRowButton} onPress={() => setEditing((v) => !v)}>
        <Text style={styles.editRowButtonText}>수정</Text>
      </Pressable>
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
  label: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 22,
    marginBottom: 10,
  },
  required: {
    color: "#E0526E",
  },
  fieldWrap: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  field: {
    fontSize: 15,
    color: Colors.text,
  },
  counter: {
    alignSelf: "flex-end",
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 6,
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
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tagWarn: {
    backgroundColor: "#FDE8EC",
    color: "#E0526E",
  },
  detailCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
  },
  editRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  editRowBody: {
    flex: 1,
    gap: 2,
  },
  editRowCaption: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  editRowValue: {
    fontSize: 14,
    color: Colors.text,
  },
  editRowInput: {
    fontSize: 14,
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    paddingVertical: 2,
  },
  editRowButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  editRowButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
  },
  capacityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    backgroundColor: "#F1F1F1",
    borderRadius: 12,
    paddingHorizontal: 16,
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
  genderChips: {
    flexDirection: "row",
    gap: 6,
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipOn: {
    backgroundColor: "#222222",
    borderColor: "#222222",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
  },
  chipTextOn: {
    color: Colors.white,
  },
  textAreaWrap: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
  },
  textArea: {
    minHeight: 150,
    fontSize: 15,
    lineHeight: 23,
    color: Colors.text,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#222222",
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
    marginTop: 30,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
});
