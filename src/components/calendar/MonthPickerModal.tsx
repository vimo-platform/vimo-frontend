import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

type Props = {
  visible: boolean;
  selectedDate: Date;
  onClose: () => void;
  onSelectMonth: (date: Date) => void;
};

export function MonthPickerModal({
  visible,
  selectedDate,
  onClose,
  onSelectMonth,
}: Props) {
  const [year, setYear] = useState(selectedDate.getFullYear());

  useEffect(() => {
    if (visible) {
      setYear(selectedDate.getFullYear());
    }
  }, [selectedDate, visible]);

  const selectMonth = (monthIndex: number) => {
    const lastDate = new Date(year, monthIndex + 1, 0).getDate();
    const nextDate = new Date(
      year,
      monthIndex,
      Math.min(selectedDate.getDate(), lastDate),
    );

    onSelectMonth(nextDate);
    onClose();
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="이전 연도"
              hitSlop={8}
              style={styles.yearButton}
              onPress={() => setYear((value) => value - 1)}>
              <Ionicons name="chevron-back" size={20} color="#222222" />
            </Pressable>
            <Text style={styles.year}>{year}년</Text>
            <Pressable
              accessibilityLabel="다음 연도"
              hitSlop={8}
              style={styles.yearButton}
              onPress={() => setYear((value) => value + 1)}>
              <Ionicons name="chevron-forward" size={20} color="#222222" />
            </Pressable>
          </View>

          <View style={styles.monthGrid}>
            {MONTHS.map((month, index) => {
              const selected =
                year === selectedDate.getFullYear() && index === selectedDate.getMonth();

              return (
                <Pressable
                  key={month}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.monthButton, selected && styles.monthButtonSelected]}
                  onPress={() => selectMonth(index)}>
                  <Text style={[styles.monthText, selected && styles.monthTextSelected]}>
                    {month}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    paddingHorizontal: 30,
  },
  sheet: {
    width: '100%',
    maxWidth: 333,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingVertical: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  yearButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
  },
  year: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 20,
    fontWeight: '800',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  monthButton: {
    width: '30.5%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
  },
  monthButtonSelected: {
    backgroundColor: '#222222',
  },
  monthText: {
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontWeight: '700',
  },
  monthTextSelected: {
    color: '#FFFFFF',
  },
});
