import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/features/admin/constants/theme";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const pad = (n: number) => String(n).padStart(2, "0");
const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
const MINUTES = Array.from({ length: 12 }, (_, i) => pad(i * 5)); // 5분 단위

type FieldProps = { value: string; onChange: (v: string) => void; invalid?: boolean };

// 날짜 칸: 누르면 달력이 떠서 날짜를 고른다. 값 형식은 "YYYY / MM / DD".
export function DateField({ value, onChange, invalid }: FieldProps) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const seed = value.split("/").map((s) => Number(s.trim()));
  const [year, setYear] = useState(seed[0] || today.getFullYear());
  const [month, setMonth] = useState((seed[1] || today.getMonth() + 1) - 1);

  const firstWeekday = new Date(year, month, 1).getDay();
  const dayCount = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstWeekday).fill(0), ...Array.from({ length: dayCount }, (_, i) => i + 1)];
  const shiftMonth = (delta: number) => {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        style={[styles.field, value ? styles.filled : null, invalid ? styles.error : null]}
        onPress={() => setOpen(true)}
      >
        <Text style={value ? styles.filledText : styles.placeholder}>{value || "YYYY / MM / DD"}</Text>
        <Ionicons name="calendar-outline" size={16} color={value ? Colors.white : Colors.textSecondary} />
      </Pressable>

      <Modal transparent visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.calHeader}>
              <Pressable onPress={() => shiftMonth(-1)} hitSlop={8}>
                <Ionicons name="chevron-back" size={20} color={Colors.text} />
              </Pressable>
              <Text style={styles.calTitle}>{year}. {pad(month + 1)}</Text>
              <Pressable onPress={() => shiftMonth(1)} hitSlop={8}>
                <Ionicons name="chevron-forward" size={20} color={Colors.text} />
              </Pressable>
            </View>
            <View style={styles.week}>
              {WEEK.map((w) => <Text key={w} style={styles.weekText}>{w}</Text>)}
            </View>
            <View style={styles.grid}>
              {cells.map((d, i) => (
                <Pressable
                  key={i}
                  accessibilityRole="button"
                  accessibilityLabel={d ? `${d}일` : undefined}
                  style={styles.cell}
                  disabled={!d}
                  onPress={() => { setOpen(false); onChange(`${year} / ${pad(month + 1)} / ${pad(d)}`); }}
                >
                  <Text style={styles.cellText}>{d || ""}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// 시간 칸: 아래 화살표를 누르면 시/분 목록이 떠서 고른다. 값 형식은 "HH:MM".
export function TimeField({ value, onChange, invalid }: FieldProps) {
  const [open, setOpen] = useState(false);
  const [h, m] = value.split(":");

  return (
    <>
      <Pressable
        accessibilityRole="button"
        style={[styles.field, value ? styles.filled : null, invalid ? styles.error : null]}
        onPress={() => setOpen(true)}
      >
        <Text style={value ? styles.filledText : styles.placeholder}>{value || "HH:MM"}</Text>
        <Ionicons name="chevron-down" size={16} color={value ? Colors.white : Colors.textSecondary} />
      </Pressable>

      <Modal transparent visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.timeSheet} onPress={() => {}}>
            <View style={styles.timeCols}>
              <ScrollView style={styles.timeCol} showsVerticalScrollIndicator={false}>
                {HOURS.map((hh) => (
                  <Pressable key={hh} accessibilityRole="button" accessibilityLabel={`${hh}시`} style={[styles.opt, hh === h && styles.optOn]} onPress={() => onChange(`${hh}:${m || "00"}`)}>
                    <Text style={[styles.optText, hh === h && styles.optTextOn]}>{hh}시</Text>
                  </Pressable>
                ))}
              </ScrollView>
              <ScrollView style={styles.timeCol} showsVerticalScrollIndicator={false}>
                {MINUTES.map((mm) => (
                  <Pressable key={mm} accessibilityRole="button" accessibilityLabel={`${mm}분`} style={[styles.opt, mm === m && styles.optOn]} onPress={() => onChange(`${h || "00"}:${mm}`)}>
                    <Text style={[styles.optText, mm === m && styles.optTextOn]}>{mm}분</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
            <Pressable accessibilityRole="button" style={styles.done} onPress={() => setOpen(false)}>
              <Text style={styles.doneText}>확인</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F1F1F1",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  filled: { backgroundColor: "#222222" },
  error: { borderWidth: 1, borderColor: Colors.danger },
  placeholder: { fontSize: 14, color: Colors.textSecondary },
  filledText: { fontSize: 14, fontWeight: "600", color: Colors.white },
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: { width: 300, padding: 16, borderRadius: 18, backgroundColor: Colors.card },
  calHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  calTitle: { fontSize: 16, fontWeight: "800", color: Colors.text },
  week: { flexDirection: "row" },
  weekText: { flex: 1, textAlign: "center", fontSize: 11, color: Colors.textSecondary, marginBottom: 6 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "14.28%", aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  cellText: { fontSize: 13, color: Colors.text },
  timeSheet: { width: 240, padding: 12, borderRadius: 18, backgroundColor: Colors.card },
  timeCols: { flexDirection: "row", height: 200, gap: 8 },
  timeCol: { flex: 1 },
  opt: { paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  optOn: { backgroundColor: "#222222" },
  optText: { fontSize: 15, color: Colors.text },
  optTextOn: { fontWeight: "700", color: Colors.white },
  done: { marginTop: 10, paddingVertical: 12, alignItems: "center", borderRadius: 12, backgroundColor: "#222222" },
  doneText: { fontSize: 15, fontWeight: "700", color: Colors.white },
});
