import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { isAuthError } from '@/api/client';
import {
  generatePostingDraft,
  newPostingId,
  setWorkingPosting,
  upsertPosting,
} from '@/features/admin/api/postings';
import { LoadingOverlay } from '@/features/admin/components/loading-overlay';
import { Colors } from '@/features/admin/constants/theme';
import type { Gender, RecruitType } from '@/features/admin/types';

const GENDERS: Gender[] = ['전체', '남성', '여성'];

const RECRUIT_METHODS: { value: RecruitType; label: string }[] = [
  { value: 'selection', label: '선발 모집' },
  { value: 'fcfs', label: '선착순 모집' },
];

const VOLUNTEER_LOCATIONS = [
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

const REQUIRED_MESSAGE = '필수 작성 문항입니다.';

// 웹에서 TextInput 포커스 시 나타나는 브라우저 기본 아웃라인 제거
const webOutlineReset: any =
  Platform.OS === 'web' ? { outlineWidth: 0, outlineStyle: 'none' } : null;

function DraftSaveIcon() {
  return (
    <Svg width={26} height={26} viewBox="0 0 35 35" fill="none">
      <Path
        d="M8.72656 9.01661C8.72656 7.38795 8.72656 6.57361 9.04357 5.95123C9.3224 5.40402 9.7673 4.95912 10.3145 4.68029C10.9369 4.36328 11.7512 4.36328 13.3799 4.36328H21.5232C23.1519 4.36328 23.9662 4.36328 24.5886 4.68029C25.1358 4.95912 25.5807 5.40402 25.8596 5.95123C26.1766 6.57361 26.1766 7.38795 26.1766 9.01661V28.3643C26.1766 29.071 26.1766 29.4244 26.0297 29.6178C25.9662 29.7019 25.8852 29.7712 25.7923 29.8209C25.6994 29.8707 25.5968 29.8996 25.4916 29.9057C25.2488 29.9203 24.9551 29.7239 24.3676 29.3328L17.4516 24.7216L10.5355 29.3313C9.94806 29.7239 9.65432 29.9203 9.41002 29.9057C9.30508 29.8994 9.20277 29.8703 9.11013 29.8206C9.0175 29.7709 8.93674 29.7017 8.87343 29.6178C8.72656 29.4244 8.72656 29.071 8.72656 28.3643V9.01661Z"
        fill="#28303F"
        stroke="#28303F"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function RequiredMessage({ visible }: { visible: boolean }) {
  if (!visible) {
    return null;
  }

  return <Text style={styles.requiredMessage}>{REQUIRED_MESSAGE}</Text>;
}

export default function CreatePostingScreen() {
  const [memo, setMemo] = useState('');
  const [location, setLocation] = useState('');
  const [count, setCount] = useState(3);
  const [creditHours, setCreditHours] = useState(3);
  const [gender, setGender] = useState<Gender>('전체');
  const [recruitType, setRecruitType] = useState<RecruitType>('selection');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [startTime, setStartTime] = useState('11:30');
  const [endTime, setEndTime] = useState('16:30');
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<'from' | 'to' | null>(null);
  const [timePickerTarget, setTimePickerTarget] = useState<'start' | 'end' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const missing = {
    memo: !memo.trim(),
    location: !location.trim(),
    dateFrom: !dateFrom.trim(),
    dateTo: !dateTo.trim(),
    startTime: !startTime.trim(),
    endTime: !endTime.trim(),
  };
  const hasMissing = Object.values(missing).some(Boolean);
  const selectedDateValue = datePickerTarget === 'from' ? dateFrom : dateTo;
  const selectedTimeValue = timePickerTarget === 'start' ? startTime : endTime;

  const submit = async () => {
    if (hasMissing) {
      setShowErrors(true);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const normalizedCreditHours = Math.max(1, creditHours);
      const normalizedCount = Math.max(1, count);
      const draft = await generatePostingDraft(memo);
      setWorkingPosting({
        id: newPostingId(),
        title: draft.title,
        description: draft.description,
        location: location.trim(),
        period: `${dateFrom.trim()} ~ ${dateTo.trim()}`,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        capacity: normalizedCount,
        applicants: 0,
        hoursPerSession: normalizedCreditHours,
        status: 'draft',
        recruitType,
        category: draft.category,
        tags: draft.keywords,
        gender,
        createdAt: new Date().toISOString().slice(0, 10),
      });
      router.replace('/admin/posting/preview');
    } catch (error) {
      if (isAuthError(error)) {
        setSubmitError('로그인이 만료되었어요. 다시 로그인해 주세요.');
        router.replace('/');
        return;
      }

      setSubmitError('공고 생성에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const saveDraft = async () => {
    if (isSavingDraft) {
      return;
    }

    if (!memo.trim()) {
      Alert.alert('임시저장', '봉사 모집 내용을 입력해 주세요.');
      return;
    }

    setIsSavingDraft(true);

    try {
      await upsertPosting({
        id: newPostingId(),
        title: memo.trim().split('\n')[0].slice(0, 24),
        description: memo.trim(),
        location: location.trim(),
        period: dateFrom.trim() && dateTo.trim() ? `${dateFrom.trim()} ~ ${dateTo.trim()}` : '',
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        capacity: Math.max(1, count),
        applicants: 0,
        hoursPerSession: Math.max(1, creditHours),
        status: 'draft',
        recruitType,
        tags: [],
        gender,
        createdAt: new Date().toISOString().slice(0, 10),
      });
      router.replace({ pathname: '/admin/postings', params: { filter: 'draft' } });
    } catch (error) {
      if (isAuthError(error)) {
        Alert.alert('로그인 만료', '로그인이 만료되었어요. 다시 로그인해 주세요.');
        router.replace('/');
        return;
      }

      Alert.alert(
        '저장 실패',
        error instanceof Error ? error.message : '공고 임시저장에 실패했습니다.',
      );
    } finally {
      setIsSavingDraft(false);
    }
  };

  if (submitting) {
    return <LoadingOverlay message="공고를 생성하고 있어요" />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Stack.Screen
        options={{
          title: '공고 작성',
          headerTitleAlign: 'center',
          headerRight: () => (
            <Pressable disabled={isSavingDraft} onPress={saveDraft} hitSlop={10}>
              <DraftSaveIcon />
            </Pressable>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>
          공고 내용을 입력해 주세요{'\n'}깔끔하게 정리해드릴게요
        </Text>

        <View
          style={[
            styles.memoBox,
            memo ? styles.filled : null,
            showErrors && missing.memo ? styles.fieldError : null,
          ]}
        >
          <TextInput
            multiline
            placeholder={'봉사 모집 내용을 간단히 작성해주세요.\n예: 장애학우 수업 도우미 모집'}
            placeholderTextColor={Colors.textSecondary}
            style={[styles.memoInput, memo ? styles.textWhite : null, webOutlineReset]}
            value={memo}
            onChangeText={setMemo}
          />
          <Ionicons name="pencil" size={16} color={memo ? Colors.white : Colors.textSecondary} />
        </View>
        <RequiredMessage visible={showErrors && missing.memo} />

        <Text style={styles.label}>장소</Text>
        <PickerButton
          icon="location-outline"
          label={location || '활동 장소를 선택해 주세요'}
          selected={Boolean(location)}
          style={showErrors && missing.location ? styles.fieldError : undefined}
          onPress={() => setLocationPickerVisible(true)}
        />
        <RequiredMessage visible={showErrors && missing.location} />

        <Text style={styles.label}>인원</Text>
        <View style={styles.stepper}>
          <Pressable hitSlop={8} onPress={() => setCount(Math.max(1, count - 1))}>
            <Text style={styles.stepperSign}>-</Text>
          </Pressable>
          <TextInput
            keyboardType="number-pad"
            selectTextOnFocus
            style={[styles.stepperValue, styles.stepperInput, webOutlineReset]}
            value={count ? String(count) : ''}
            onChangeText={(value) => {
              const numericValue = Number(value.replace(/\D/g, ''));
              setCount(Number.isFinite(numericValue) ? numericValue : 0);
            }}
          />
          <Pressable hitSlop={8} onPress={() => setCount(count + 1)}>
            <Text style={styles.stepperSign}>+</Text>
          </Pressable>
        </View>
        <View style={styles.chips}>
          {GENDERS.map((item) => (
            <Pressable
              key={item}
              style={[styles.chip, gender === item && styles.chipOn]}
              onPress={() => setGender(item)}
            >
              <Text style={[styles.chipText, gender === item && styles.chipTextOn]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>모집 방법</Text>
        <View style={styles.chips}>
          {RECRUIT_METHODS.map((method) => (
            <Pressable
              key={method.value}
              style={[styles.chip, recruitType === method.value && styles.chipOn]}
              onPress={() => setRecruitType(method.value)}
            >
              <Text
                style={[styles.chipText, recruitType === method.value && styles.chipTextOn]}
              >
                {method.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>봉사 인정 시간</Text>
        <View style={styles.creditInputRow}>
          <TextInput
            keyboardType="number-pad"
            placeholderTextColor={Colors.textSecondary}
            style={[styles.creditInput, webOutlineReset]}
            value={creditHours ? String(creditHours) : ''}
            onChangeText={(value) => {
              const numericValue = Number(value.replace(/\D/g, ''));
              setCreditHours(Number.isFinite(numericValue) ? numericValue : 0);
            }}
          />
          <Text style={styles.creditUnit}>시간</Text>
        </View>
        <Text style={styles.helperText}>회차당 인정되는 봉사 시간을 숫자로 입력해주세요.</Text>

        <Text style={styles.label}>날짜</Text>
        <View style={styles.rangeRow}>
          <View style={styles.rangeCol}>
            <PickerButton
              icon="calendar-clear-outline"
              label={dateFrom || '시작 날짜'}
              selected={Boolean(dateFrom)}
              style={[styles.rangeInput, showErrors && missing.dateFrom ? styles.fieldError : null]}
              onPress={() => setDatePickerTarget('from')}
            />
            <RequiredMessage visible={showErrors && missing.dateFrom} />
          </View>
          <Text style={[styles.rangeSep, styles.rangeSepDate]}>~</Text>
          <View style={styles.rangeCol}>
            <PickerButton
              icon="calendar-clear-outline"
              label={dateTo || '종료 날짜'}
              selected={Boolean(dateTo)}
              style={[styles.rangeInput, showErrors && missing.dateTo ? styles.fieldError : null]}
              onPress={() => setDatePickerTarget('to')}
            />
            <RequiredMessage visible={showErrors && missing.dateTo} />
          </View>
        </View>

        <Text style={styles.label}>시간</Text>
        <View style={styles.rangeRow}>
          <View style={styles.timeCol}>
            <Text style={styles.timeLabel}>시작</Text>
            <PickerButton
              icon="time-outline"
              label={startTime || '시작 시간'}
              selected={Boolean(startTime)}
              style={[styles.timeInput, showErrors && missing.startTime ? styles.fieldError : null]}
              onPress={() => setTimePickerTarget('start')}
            />
            <RequiredMessage visible={showErrors && missing.startTime} />
          </View>
          <Text style={[styles.rangeSep, styles.rangeSepTime]}>~</Text>
          <View style={styles.timeCol}>
            <Text style={styles.timeLabel}>종료</Text>
            <PickerButton
              icon="time-outline"
              label={endTime || '종료 시간'}
              selected={Boolean(endTime)}
              style={[styles.timeInput, showErrors && missing.endTime ? styles.fieldError : null]}
              onPress={() => setTimePickerTarget('end')}
            />
            <RequiredMessage visible={showErrors && missing.endTime} />
          </View>
        </View>

        {showErrors && hasMissing && (
          <Text style={styles.formErrorSummary}>
            필수 항목을 모두 작성해 주세요.
          </Text>
        )}

        {submitError && (
          <Text style={styles.formErrorSummary}>{submitError}</Text>
        )}

        <Pressable
          disabled={submitting}
          style={({ pressed }) => [
            styles.submitButton,
            !hasMissing && styles.submitButtonActive,
            pressed && styles.pressed,
          ]}
          onPress={submit}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'AI가 작성 중...' : 'AI 공고 생성'}
          </Text>
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
          if (datePickerTarget === 'from') {
            setDateFrom(date);
            if (!dateTo) {
              setDateTo(date);
            }
          }

          if (datePickerTarget === 'to') {
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
          if (timePickerTarget === 'start') {
            setStartTime(time);
          }

          if (timePickerTarget === 'end') {
            setEndTime(time);
          }

          setTimePickerTarget(null);
        }}
      />
    </KeyboardAvoidingView>
  );
}

function PickerButton({
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
      <Ionicons
        name={icon}
        size={16}
        color={selected ? Colors.white : Colors.textSecondary}
      />
      <Text
        numberOfLines={1}
        style={[styles.pickerButtonText, selected && styles.pickerButtonTextSelected]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function LocationSelectModal({
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

function DateSelectModal({
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

function TimeSelectModal({
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
                    style={[
                      styles.timeOptionText,
                      item === hour && styles.timeOptionTextSelected,
                    ]}
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

function parseDateValue(value: string) {
  const [year, month, day] = value.match(/\d+/g) ?? [];

  if (!year || !month || !day) {
    return null;
  }

  return new Date(Number(year), Number(month) - 1, Number(day));
}

function formatDateKey(date: Date) {
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
  container: {
    flex: 1,
    backgroundColor: Colors.card,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    marginVertical: 16,
    color: Colors.text,
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 28,
    textAlign: 'center',
  },
  memoBox: {
    flexDirection: 'row',
    backgroundColor: '#F1F1F1',
    borderRadius: 16,
    padding: 16,
  },
  memoInput: {
    flex: 1,
    minHeight: 130,
    color: Colors.text,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  label: {
    marginTop: 24,
    marginBottom: 10,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#F1F1F1',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: Colors.text,
    fontSize: 14,
  },
  filled: {
    backgroundColor: '#222222',
    color: Colors.white,
  },
  fieldError: {
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  requiredMessage: {
    marginTop: 6,
    color: Colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  formErrorSummary: {
    marginTop: 24,
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  textWhite: {
    color: Colors.white,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 20,
    backgroundColor: '#F1F1F1',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  stepperSign: {
    color: Colors.text,
    fontSize: 18,
  },
  stepperValue: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  stepperInput: {
    minWidth: 32,
    paddingVertical: 0,
    paddingHorizontal: 0,
    textAlign: 'center',
  },
  helperText: {
    marginTop: 8,
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  creditInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
  },
  creditInput: {
    width: 96,
    backgroundColor: '#F1F1F1',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  creditUnit: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    backgroundColor: '#222222',
    borderColor: '#222222',
  },
  chipText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextOn: {
    color: Colors.white,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  rangeCol: {
    flex: 1,
  },
  rangeInput: {
    justifyContent: 'center',
  },
  rangeSep: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  rangeSepDate: {
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
  timeInput: {
    justifyContent: 'center',
  },
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
  submitButton: {
    alignItems: 'center',
    marginTop: 36,
    backgroundColor: '#818181',
    borderRadius: 16,
    paddingVertical: 17,
  },
  submitButtonActive: {
    backgroundColor: '#222222',
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
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
