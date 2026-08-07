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

import { getWorkingPosting, setWorkingPosting } from "@/features/admin/api/postings";
import {
  DateSelectModal,
  LocationSelectModal,
  PickerButton,
  TimeSelectModal,
} from "@/features/admin/components/posting-detail-pickers";
import { Colors } from "@/features/admin/constants/theme";
import type { Gender } from "@/features/admin/types";

const GENDERS: Gender[] = ["전체", "남성", "여성"];

function splitPeriod(period?: string) {
  const [from = "", to = ""] = (period ?? "").split("~").map((part) => part.trim());

  return { from, to: to || from };
}

export default function PostingEditScreen() {
  const base = getWorkingPosting();
  const initialPeriod = splitPeriod(base?.period);
  const [title, setTitle] = useState(base?.title ?? "");
  const [hoursText, setHoursText] = useState(
    base ? `회차당 ${base.hoursPerSession}시간 인정` : "",
  );
  const [location, setLocation] = useState(base?.location ?? "");
  const [dateFrom, setDateFrom] = useState(initialPeriod.from);
  const [dateTo, setDateTo] = useState(initialPeriod.to);
  const [startTime, setStartTime] = useState(base?.startTime ?? "");
  const [endTime, setEndTime] = useState(base?.endTime ?? "");
  const [capacity, setCapacity] = useState(base?.capacity ?? 1);
  const [gender, setGender] = useState<Gender>(base?.gender ?? "전체");
  const [description, setDescription] = useState(base?.description ?? "");
  const [tags, setTags] = useState<string[]>(base?.tags ?? []);
  const [noCancel, setNoCancel] = useState(base?.noCancel !== false);

  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<"from" | "to" | null>(null);
  const [timePickerTarget, setTimePickerTarget] = useState<"start" | "end" | null>(null);

  if (!base) {
    return null;
  }

  const selectedDateValue = datePickerTarget === "from" ? dateFrom : dateTo;
  const selectedTimeValue = timePickerTarget === "start" ? startTime : endTime;

  const save = () => {
    const hours = Number(hoursText.match(/\d+/)?.[0] ?? base.hoursPerSession);
    const period =
      dateFrom && dateTo ? `${dateFrom} ~ ${dateTo}` : dateFrom || dateTo || base.period;

    setWorkingPosting({
      ...base,
      title: title.trim(),
      hoursPerSession: hours,
      location: location.trim(),
      period,
      startTime: startTime || base.startTime,
      endTime: endTime || base.endTime,
      capacity: Math.max(1, capacity),
      gender,
      description: description.trim(),
      tags,
      noCancel,
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
          {tags.map((tag) => (
            <KeywordChip
              key={tag}
              label={tag}
              onRemove={() => setTags((prev) => prev.filter((t) => t !== tag))}
            />
          ))}
          {noCancel && (
            <KeywordChip label="취소 불가" warn onRemove={() => setNoCancel(false)} />
          )}
        </View>

        <Label text="세부 내용" />
        <Text style={styles.subCaption}>활동 장소</Text>
        <PickerButton
          icon="location-outline"
          label={location || "활동 장소를 선택해 주세요"}
          selected={Boolean(location)}
          onPress={() => setLocationPickerVisible(true)}
        />

        <Text style={styles.subCaption}>활동 기간</Text>
        <View style={styles.rangeRow}>
          <View style={styles.rangeCol}>
            <PickerButton
              icon="calendar-clear-outline"
              label={dateFrom || "시작 날짜"}
              selected={Boolean(dateFrom)}
              onPress={() => setDatePickerTarget("from")}
            />
          </View>
          <Text style={styles.rangeSep}>~</Text>
          <View style={styles.rangeCol}>
            <PickerButton
              icon="calendar-clear-outline"
              label={dateTo || "종료 날짜"}
              selected={Boolean(dateTo)}
              onPress={() => setDatePickerTarget("to")}
            />
          </View>
        </View>

        <Text style={styles.subCaption}>활동 시간</Text>
        <View style={styles.rangeRow}>
          <View style={styles.timeCol}>
            <Text style={styles.timeLabel}>시작</Text>
            <PickerButton
              icon="time-outline"
              label={startTime || "시작 시간"}
              selected={Boolean(startTime)}
              onPress={() => setTimePickerTarget("start")}
            />
          </View>
          <Text style={[styles.rangeSep, styles.rangeSepTime]}>~</Text>
          <View style={styles.timeCol}>
            <Text style={styles.timeLabel}>종료</Text>
            <PickerButton
              icon="time-outline"
              label={endTime || "종료 시간"}
              selected={Boolean(endTime)}
              onPress={() => setTimePickerTarget("end")}
            />
          </View>
        </View>

        <Label text="모집 인원" />
        <View style={styles.capacityRow}>
          <View style={styles.stepper}>
            <Pressable onPress={() => setCapacity(Math.max(1, capacity - 1))} hitSlop={8}>
              <Text style={styles.stepperSign}>−</Text>
            </Pressable>
            <TextInput
              keyboardType="number-pad"
              selectTextOnFocus
              style={[styles.stepperValue, styles.stepperInput]}
              value={capacity ? String(capacity) : ""}
              onChangeText={(value) => {
                const numericValue = Number(value.replace(/\D/g, ""));
                setCapacity(Number.isFinite(numericValue) ? numericValue : 0);
              }}
            />
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

      <LocationSelectModal
        selectedLocation={location}
        visible={locationPickerVisible}
        onClose={() => setLocationPickerVisible(false)}
        onSelect={(nextLocation) => {
          setLocation(nextLocation);
          setLocationPickerVisible(false);
        }}
      />

      <DateSelectModal
        selectedDate={selectedDateValue}
        visible={datePickerTarget !== null}
        onClose={() => setDatePickerTarget(null)}
        onSelect={(date) => {
          if (datePickerTarget === "from") {
            setDateFrom(date);
            if (!dateTo) {
              setDateTo(date);
            }
          }

          if (datePickerTarget === "to") {
            setDateTo(date);
          }

          setDatePickerTarget(null);
        }}
      />

      <TimeSelectModal
        selectedTime={selectedTimeValue}
        visible={timePickerTarget !== null}
        onClose={() => setTimePickerTarget(null)}
        onSelect={(time) => {
          if (timePickerTarget === "start") {
            setStartTime(time);
          }

          if (timePickerTarget === "end") {
            setEndTime(time);
          }

          setTimePickerTarget(null);
        }}
      />
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

function KeywordChip({
  label,
  warn,
  onRemove,
}: {
  label: string;
  warn?: boolean;
  onRemove: () => void;
}) {
  return (
    <View style={[styles.tag, warn && styles.tagWarn]}>
      <Text style={[styles.tagText, warn && styles.tagWarnText]}>{label}</Text>
      <Pressable
        onPress={onRemove}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={`${label} 키워드 삭제`}
      >
        <Ionicons name="close" size={15} color={warn ? "#E0526E" : Colors.textSecondary} />
      </Pressable>
    </View>
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
  subCaption: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 14,
    marginBottom: 8,
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
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F1F1F1",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tagWarn: {
    backgroundColor: "#FDE8EC",
  },
  tagWarnText: {
    color: "#E0526E",
  },
  rangeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  rangeCol: {
    flex: 1,
  },
  rangeSep: {
    color: Colors.textSecondary,
    fontSize: 15,
    marginTop: 14,
  },
  rangeSepTime: {
    marginTop: 39,
  },
  timeCol: {
    flex: 1,
    gap: 6,
  },
  timeLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
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
  stepperInput: {
    minWidth: 32,
    paddingVertical: 0,
    paddingHorizontal: 0,
    textAlign: "center",
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
