import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/features/admin/constants/theme";

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

/** Date → "YYYY-MM-DD" (로컬 기준) */
export function dateKey(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** 해당 날짜가 속한 주(월~일)의 날짜 7개 */
function weekOf(date: Date) {
  const start = new Date(date);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

type Props = {
  selected: Date;
  onSelect: (date: Date) => void;
  /** 점 표시할 날짜들 ("YYYY-MM-DD") — 일정 있는 날 */
  marked?: string[];
};

export function WeekCalendar({ selected, onSelect, marked = [] }: Props) {
  return (
    <View>
      <Text style={styles.month}>
        {selected.getFullYear()}년 {selected.getMonth() + 1}월
      </Text>
      <View style={styles.week}>
        {weekOf(selected).map((d, i) => {
          const isSelected = dateKey(d) === dateKey(selected);
          return (
            <Pressable key={dateKey(d)} style={styles.day} onPress={() => onSelect(d)}>
              <View style={[styles.dot, marked.includes(dateKey(d)) && styles.dotOn]} />
              <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>
                {DAY_LABELS[i]}
              </Text>
              <View style={[styles.dateCircle, isSelected && styles.dateCircleSelected]}>
                <Text style={[styles.dateText, isSelected && styles.dateTextSelected]}>
                  {d.getDate()}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  month: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 16,
  },
  week: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  day: {
    alignItems: "center",
    gap: 6,
    width: 36,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "transparent",
  },
  dotOn: {
    backgroundColor: Colors.text,
  },
  dayLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  dayLabelSelected: {
    color: Colors.text,
    fontWeight: "700",
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dateCircleSelected: {
    borderWidth: 1.5,
    borderColor: Colors.text,
  },
  dateText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  dateTextSelected: {
    color: Colors.text,
    fontWeight: "700",
  },
});
