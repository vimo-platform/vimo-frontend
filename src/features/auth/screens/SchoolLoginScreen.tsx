import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckIcon, LockIcon, LoginArrowIcon, SchoolIcon, WarningIcon } from '../components/LoginIcons';

// 웹에서 TextInput 포커스 시 나타나는 브라우저 기본 아웃라인 제거
const webOutlineReset: any =
  Platform.OS === 'web' ? { outlineWidth: 0, outlineStyle: 'none' } : null;

export type SchoolLoginSubmitValues = {
  studentId: string;
  password: string;
  saveId: boolean;
};

export type SchoolLoginScreenProps = {
  initialStudentId?: string;
  initialSaveId?: boolean;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onFieldChange?: () => void;
  onSubmit?: (values: SchoolLoginSubmitValues) => Promise<void> | void;
};

export default function SchoolLoginScreen({
  initialStudentId = '',
  initialSaveId = true,
  isSubmitting = false,
  errorMessage,
  onFieldChange,
  onSubmit,
}: SchoolLoginScreenProps) {
  const [studentId, setStudentId] = useState(initialStudentId);
  const [password, setPassword] = useState('');
  const [saveId, setSaveId] = useState(initialSaveId);
  const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setStudentId(initialStudentId);
  }, [initialStudentId]);

  useEffect(() => {
    setSaveId(initialSaveId);
  }, [initialSaveId]);

  const visibleErrorMessage = errorMessage ?? localErrorMessage;
  const isFailure = Boolean(visibleErrorMessage);
  const canSubmit = useMemo(
    () => studentId.trim().length > 0 && password.length > 0 && !isSubmitting,
    [isSubmitting, password, studentId]
  );

  const handleSubmit = async () => {
    const trimmedStudentId = studentId.trim();

    if (!trimmedStudentId || !password) {
      setLocalErrorMessage('학번과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setLocalErrorMessage(null);
    await onSubmit?.({
      studentId: trimmedStudentId,
      password,
      saveId,
    });
  };

  const handleStudentIdChange = (value: string) => {
    setStudentId(value);
    setLocalErrorMessage(null);
    onFieldChange?.();
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setLocalErrorMessage(null);
    onFieldChange?.();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        style={styles.screen}>
        <View style={styles.content}>
          {isFailure ? <WarningIcon /> : <LoginArrowIcon />}

          <View style={styles.copyGroup}>
            <Text style={styles.title}>
              {isFailure ? '로그인에 실패했어요.' : '학교 계정으로 로그인'}
            </Text>
            <Text style={styles.description}>
              {visibleErrorMessage ?? '학교에서 발급받은 계정으로 로그인하세요.'}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputBox}>
              <SchoolIcon />
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
                onChangeText={handleStudentIdChange}
                placeholder="학번을 입력하세요"
                placeholderTextColor="#818181"
                returnKeyType="next"
                style={[styles.input, webOutlineReset]}
                value={studentId}
              />
            </View>

            <View style={styles.inputBox}>
              <LockIcon />
              <TextInput
                autoCapitalize="none"
                onChangeText={handlePasswordChange}
                onSubmitEditing={handleSubmit}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor="#818181"
                returnKeyType="done"
                secureTextEntry
                style={[styles.input, webOutlineReset]}
                value={password}
              />
            </View>

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: saveId }}
              onPress={() => {
                setSaveId((current) => !current);
              }}
              style={styles.saveRow}>
              <View style={[styles.checkbox, !saveId && styles.checkboxUnchecked]}>
                {saveId && <CheckIcon />}
              </View>
              <Text style={styles.saveLabel}>아이디 저장</Text>
            </Pressable>

            <Text accessibilityLiveRegion="polite" style={styles.screenReaderError}>
              {visibleErrorMessage ?? ''}
            </Text>
          </View>
        </View>

        <View style={styles.bottomArea}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit, busy: isSubmitting }}
            disabled={!canSubmit}
            onPress={handleSubmit}
            style={[styles.loginButton, !canSubmit && styles.loginButtonDisabled]}>
            <Text style={styles.loginLabel}>{isSubmitting ? '로그인 중' : '로그인'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F9FB',
  },
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9F9FB',
  },
  content: {
    width: '100%',
    maxWidth: 393,
    alignItems: 'center',
    paddingTop: 77,
    paddingHorizontal: 30,
  },
  copyGroup: {
    alignItems: 'center',
    gap: 30,
    marginTop: 35,
    width: 333,
  },
  title: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: 0,
    textAlign: 'center',
  },
  description: {
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0,
    textAlign: 'center',
  },
  form: {
    width: 333,
    gap: 14,
    marginTop: 61,
  },
  inputBox: {
    height: 56,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  input: {
    flex: 1,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '300',
    height: 56,
    padding: 0,
  },
  saveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginLeft: 23,
  },
  checkbox: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
    backgroundColor: '#222222',
  },
  checkboxUnchecked: {
    borderWidth: 1,
    borderColor: '#818181',
    backgroundColor: 'transparent',
  },
  saveLabel: {
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 13,
    fontWeight: '500',
  },
  screenReaderError: {
    height: 0,
    opacity: 0,
  },
  bottomArea: {
    position: 'absolute',
    bottom: 36,
    width: '100%',
    maxWidth: 393,
    alignItems: 'center',
  },
  loginButton: {
    width: 326,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#222222',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  loginButtonDisabled: {
    opacity: 0.45,
  },
  loginLabel: {
    color: '#F5F5F5',
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.45,
    lineHeight: 26,
    textAlign: 'center',
  },
});
