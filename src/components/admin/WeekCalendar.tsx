import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { MonthPickerModal } from "@/components/calendar/MonthPickerModal";
import { Colors } from "@/styles/admin/theme";

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
const WEEK_COUNT = 157;
const INITIAL_WEEK_INDEX = Math.floor(WEEK_COUNT / 2);

/** Date -> "YYYY-MM-DD" */
export function dateKey(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

type Props = {
  selected: Date;
  onSelect: (date: Date) => void;
  /** 표시할 날짜 키("YYYY-MM-DD") */
  marked?: string[];
};

export function WeekCalendar({ selected, onSelect, marked = [] }: Props) {
  const { width } = useWindowDimensions();
  const calendarWidth = Math.max(320, width - 40);
  const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);
  const listRef = useRef<FlatList<Date[]>>(null);
  const weeks = useMemo(() => {
    const currentWeekStart = startOfWeek(new Date());
    return Array.from({ length: WEEK_COUNT }, (_, weekIndex) =>
      Array.from({ length: 7 }, (__, dayIndex) =>
        addDays(currentWeekStart, (weekIndex - INITIAL_WEEK_INDEX) * 7 + dayIndex),
      ),
    );
  }, []);
  const scrollToDate = useCallback(
    (date: Date) => {
      const targetKey = dateKey(date);
      const weekIndex = weeks.findIndex((week) =>
        week.some((day) => dateKey(day) === targetKey),
      );

      if (weekIndex >= 0) {
        listRef.current?.scrollToIndex({ index: weekIndex, animated: true });
      }
    },
    [weeks],
  );
  const selectMonth = useCallback(
    (date: Date) => {
      const nextDate = startOfDay(date);
      onSelect(nextDate);
      scrollToDate(nextDate);
    },
    [onSelect, scrollToDate],
  );

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="월 선택"
        hitSlop={8}
        style={styles.monthRow}
        onPress={() => setIsMonthPickerVisible(true)}
      >
        <Text style={styles.month}>
          {selected.getFullYear()}년 {selected.getMonth() + 1}월
        </Text>
        <Ionicons name="caret-down" size={14} color={Colors.text} />
      </Pressable>
      <FlatList
        ref={listRef}
        data={weeks}
        getItemLayout={(_, index) => ({
          index,
          length: calendarWidth,
          offset: calendarWidth * index,
        })}
        horizontal
        initialScrollIndex={INITIAL_WEEK_INDEX}
        keyExtractor={(_, index) => String(index)}
        pagingEnabled
        renderItem={({ item: week }) => (
          <View style={[styles.week, { width: calendarWidth }]}>
            {week.map((d, i) => {
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
        )}
        showsHorizontalScrollIndicator={false}
        style={styles.weekList}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            listRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          }, 50);
        }}
        onMomentumScrollEnd={(event) => {
          const pageIndex = Math.round(event.nativeEvent.contentOffset.x / calendarWidth);
          const visibleWeek = weeks[pageIndex];
          if (!visibleWeek) {
            return;
          }

          const selectedWeekdayIndex = (selected.getDay() + 6) % 7;
          onSelect(visibleWeek[selectedWeekdayIndex] ?? visibleWeek[3]);
        }}
      />
      <MonthPickerModal
        selectedDate={selected}
        visible={isMonthPickerVisible}
        onClose={() => setIsMonthPickerVisible(false)}
        onSelectMonth={selectMonth}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    marginBottom: 16,
  },
  month: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
  },
  weekList: {
    flexGrow: 0,
    flexShrink: 0,
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
