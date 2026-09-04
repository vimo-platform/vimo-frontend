import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { MonthPickerModal } from "@/components/calendar/MonthPickerModal";
import { CalendarCircle } from "@/components/join/CalendarCircle";
import { Colors } from "@/styles/admin/theme";

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
const WEEK_COUNT = 157;
const INITIAL_WEEK_INDEX = Math.floor(WEEK_COUNT / 2);

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
  marked?: string[];
};

export function WeekCalendar({ selected, onSelect, marked = [] }: Props) {
  const { width } = useWindowDimensions();
  const calendarWidth = Math.max(320, width - 40);
  const today = useMemo(() => startOfDay(new Date()), []);
  const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);
  const listRef = useRef<FlatList<Date[]>>(null);

  const weeks = useMemo(() => {
    const currentWeekStart = startOfWeek(today);
    return Array.from({ length: WEEK_COUNT }, (_, weekIndex) =>
      Array.from({ length: 7 }, (__, dayIndex) =>
        addDays(currentWeekStart, (weekIndex - INITIAL_WEEK_INDEX) * 7 + dayIndex),
      ),
    );
  }, [today]);

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
            {week.map((day, index) => {
              const dayKey = dateKey(day);
              const isSelected = dayKey === dateKey(selected);
              const isToday = dayKey === dateKey(today);
              const hasEvent = marked.includes(dayKey);

              return (
                <Pressable key={dayKey} style={styles.day} onPress={() => onSelect(day)}>
                  <View style={styles.eventDotSlot}>
                    {hasEvent ? (
                      <View style={[styles.eventDot, isToday && styles.todayEventDot]} />
                    ) : null}
                  </View>
                  <Text style={[styles.weekday, isToday && styles.todayText]}>
                    {DAY_LABELS[index]}
                  </Text>
                  <View style={styles.dateSlot}>
                    {isSelected ? <CalendarCircle /> : null}
                    <Text style={[styles.date, isToday && styles.todayText]}>
                      {day.getDate()}
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
            listRef.current?.scrollToIndex({ index: info.index, animated: true });
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
    height: 143,
    flexGrow: 0,
    flexShrink: 0,
  },
  week: {
    height: 143,
    flexDirection: "row",
    paddingHorizontal: 22,
    paddingTop: 30,
  },
  day: {
    flex: 1,
    alignItems: "center",
  },
  eventDotSlot: {
    height: 12,
    justifyContent: "flex-start",
  },
  eventDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#C7C7C7",
  },
  todayEventDot: {
    backgroundColor: "#222222",
  },
  weekday: {
    color: "#818181",
    opacity: 0.5,
    fontFamily: "Pretendard",
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 24,
    letterSpacing: -0.425,
  },
  dateSlot: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  date: {
    color: "#818181",
    opacity: 0.5,
    fontFamily: "Pretendard",
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 24,
    letterSpacing: -0.425,
  },
  todayText: {
    color: "#222222",
    opacity: 1,
    fontWeight: "700",
  },
});