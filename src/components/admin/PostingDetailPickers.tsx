import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/styles/admin/theme';

export const VOLUNTEER_LOCATIONS = [
  '샬롬관',
  '인문사회관',
  '대운동장',
  '목양관',
  '교육관',
  '천은관',
  '본관',
  '예술관',
  '우원기념관',
  '경천관',
  '후생관',
  '이공관',
  '다솔관',
  '심전산학관',
  '심전제1관',
  '심전제2관',
  '용인강남학교',
  '추후공개',
];

export function PickerButton({
  icon,
  label,
  selected,
  style,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  selected: boolean;
  style?: object;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.pickerButton,
        selected && styles.pickerButtonSelected,
        style,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={16} color={selected ? Colors.white : Colors.textSecondary} />
      <Text
        numberOfLines={1}
        style={[styles.pickerButtonText, selected && styles.pickerButtonTextSelected]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function LocationSelectModal({
  visible,
  selectedLocation,
  onClose,
  onSelect,
}: {
  visible: boolean;
  selectedLocation: string;
  onClose: () => void;
  onSelect: (location: string) => void;
}) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.selectorCard}>
          <Text style={styles.selectorTitle}>장소 선택</Text>
          <ScrollView style={styles.locationList} showsVerticalScrollIndicator={false}>
            {VOLUNTEER_LOCATIONS.map((item) => {
              const selected = item === selectedLocation;

              return (
                <Pressable
                  accessibilityRole="button"
                  key={item}
                  style={[styles.locationOption, selected && styles.locationOptionSelected]}
                  onPress={() => onSelect(item)}
                >
                  <Text
                    style={[
                      styles.locationOptionText,
                      selected && styles.locationOptionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {selected ? (
                    <Ionicons name="checkmark" size={18} color={Colors.white} />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable style={styles.selectorCancelButton} onPress={onClose}>
            <Text style={styles.selectorCancelText}>취소</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export function DateSelectModal({
  visible,
  selectedDate,
  onClose,
  onSelect,
}: {
  visible: boolean;
  selectedDate: string;
  onClose: () => void;
  onSelect: (date: string) => void;
}) {
  const initialDate = parseDateValue(selectedDate) ?? new Date();
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  );
  const days = getCalendarDays(visibleMonth);
  const selectedDateKey = selectedDate ? formatDateKey(initialDate) : '';
  const todayKey = formatDateKey(new Date());

  const moveMonth = (offset: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.selectorCard}>
          <View style={styles.selectorHeader}>
            <Pressable hitSlop={10} onPress={() => moveMonth(-1)}>
              <Ionicons name="chevron-back" size={22} color={Colors.text} />
            </Pressable>
            <Text style={styles.selectorTitle}>
              {visibleMonth.getFullYear()}년 {visibleMonth.getMonth() + 1}월
            </Text>
            <Pressable hitSlop={10} onPress={() => moveMonth(1)}>
              <Ionicons name="chevron-forward" size={22} color={Colors.text} />
            </Pressable>
          </View>

          <View style={styles.weekdayRow}>
            {['일', '월', '화', '수', '목', '금', '토'].map((weekday) => (
              <Text key={weekday} style={styles.calendarWeekday}>
                {weekday}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {days.map((date, index) => {
              const dateKey = date ? formatDateKey(date) : '';
              const isSelected = dateKey === selectedDateKey;
              const isToday = dateKey === todayKey;

              return (
                <View key={`${dateKey}-${index}`} style={styles.calendarCell}>
                  {date ? (
                    <Pressable
                      accessibilityRole="button"
                      style={[
                        styles.calendarDay,
                        isToday && !isSelected && styles.calendarDayToday,
                        isSelected && styles.calendarDaySelected,
                      ]}
                      onPress={() => onSelect(dateKey)}
                    >
                      <Text
                        style={[
                          styles.calendarDayText,
                          isToday && !isSelected && styles.calendarDayTextToday,
                          isSelected && styles.calendarDayTextSelected,
                        ]}
                      >
                        {date.getDate()}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>

          <Pressable style={styles.selectorCancelButton} onPress={onClose}>
            <Text style={styles.selectorCancelText}>취소</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export function TimeSelectModal({
  visible,
  selectedTime,
  onClose,
  onSelect,
}: {
  visible: boolean;
  selectedTime: string;
  onClose: () => void;
  onSelect: (time: string) => void;
}) {
  const initial = parseTimeValue(selectedTime);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const hours = Array.from({ length: 24 }, (_, index) => index);
  const minutes = [0, 10, 20, 30, 40, 50];

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.selectorCard}>
          <Text style={styles.selectorTitle}>시간 선택</Text>
          <View style={styles.timePickerRow}>
            <ScrollView style={styles.timeOptionColumn} showsVerticalScrollIndicator={false}>
              {hours.map((item) => (
                <Pressable
                  key={item}
                  style={[styles.timeOption, item === hour && styles.timeOptionSelected]}
                  onPress={() => setHour(item)}
                >
                  <Text
                    style={[styles.timeOptionText, item === hour && styles.timeOptionTextSelected]}
                  >
                    {String(item).padStart(2, '0')}시
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <ScrollView style={styles.timeOptionColumn} showsVerticalScrollIndicator={false}>
              {minutes.map((item) => (
                <Pressable
                  key={item}
                  style={[styles.timeOption, item === minute && styles.timeOptionSelected]}
                  onPress={() => setMinute(item)}
                >
                  <Text
                    style={[
                      styles.timeOptionText,
                      item === minute && styles.timeOptionTextSelected,
                    ]}
                  >
                    {String(item).padStart(2, '0')}분
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.selectorActionRow}>
            <Pressable style={styles.selectorCancelButtonInline} onPress={onClose}>
              <Text style={styles.selectorCancelText}>취소</Text>
            </Pressable>
            <Pressable
              style={styles.selectorConfirmButton}
              onPress={() =>
                onSelect(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)
              }
            >
              <Text style={styles.selectorConfirmText}>선택</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function parseDateValue(value: string) {
  const [year, month, day] = value.match(/\d+/g) ?? [];

  if (!year || !month || !day) {
    return null;
  }

  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function getCalendarDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDate = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const blanks = Array.from<null>({ length: firstDay.getDay() }).fill(null);
  const dates = Array.from({ length: lastDate }, (_, index) =>
    new Date(month.getFullYear(), month.getMonth(), index + 1),
  );

  return [...blanks, ...dates];
}

function parseTimeValue(value: string) {
  const [hour, minute] = value.match(/\d+/g) ?? [];

  return {
    hour: Number(hour ?? 11),
    minute: Number(minute ?? 30),
  };
}

const styles = StyleSheet.create({
  pickerButton: {
    minHeight: 47,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F1F1F1',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 13,
  },
  pickerButtonSelected: {
    backgroundColor: '#222222',
  },
  pickerButtonText: {
    minWidth: 0,
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  pickerButtonTextSelected: {
    color: Colors.white,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  selectorCard: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 18,
  },
  selectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginTop: 18,
  },
  calendarWeekday: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  calendarCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDay: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDaySelected: {
    backgroundColor: '#222222',
  },
  calendarDayToday: {
    borderWidth: 1.5,
    borderColor: Colors.danger,
  },
  calendarDayText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  calendarDayTextSelected: {
    color: Colors.white,
  },
  calendarDayTextToday: {
    color: Colors.danger,
    fontWeight: '700',
  },
  selectorCancelButton: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 12,
  },
  selectorCancelText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
  locationList: {
    maxHeight: 360,
    marginTop: 18,
  },
  locationOption: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  locationOptionSelected: {
    backgroundColor: '#222222',
  },
  locationOptionText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  locationOptionTextSelected: {
    color: Colors.white,
  },
  timePickerRow: {
    height: 220,
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  timeOptionColumn: {
    flex: 1,
  },
  timeOption: {
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 12,
  },
  timeOptionSelected: {
    backgroundColor: '#222222',
  },
  timeOptionText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  timeOptionTextSelected: {
    color: Colors.white,
  },
  selectorActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  selectorCancelButtonInline: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#F1F1F1',
    paddingVertical: 14,
  },
  selectorConfirmButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#222222',
    paddingVertical: 14,
  },
  selectorConfirmText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
});
