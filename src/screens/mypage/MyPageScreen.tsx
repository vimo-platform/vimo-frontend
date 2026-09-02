import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MenuSection } from '@/components/common';
import { logout as requestLogout } from '@/services/common/auth';
import { UserGnb } from '@/components/navigation/UserGnb';
import { resetVolunteerInteractions } from '@/services/exploration/volunteer-interaction-store';
import {
  clearUserSession,
  getCurrentUser,
  isUserAuthenticatedInCurrentSession,
} from '@/services/common/auth-storage';

const BASIC_PROFILE = require('@/assets/images/mypageimg/basicprofile.png');

const INFO_ITEMS = ['이름 / 학번', '시간표', '관심 키워드', '내 정보 설정'];
const ACTIVITY_ITEMS = ['지원 내역', '확정 내역', '활동 내역', '봉사 인증서'];
const SETTING_ITEMS = ['알림 설정', '약관 및 정책'];

export function MyPageScreen() {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 393);
  const [userName, setUserName] = useState('사용자');
  const [userStudentId, setUserStudentId] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!isUserAuthenticatedInCurrentSession()) {
      router.replace('/');
      return;
    }

    getCurrentUser().then((user) => {
      if (user?.name?.trim()) {
        setUserName(user.name.trim());
      }

      if (user?.studentId?.trim()) {
        setUserStudentId(user.studentId.trim());
      }
    });
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await requestLogout();
    } catch {
      // Even if the server logout request fails, clear the local session.
    } finally {
      clearUserSession();
      resetVolunteerInteractions();
      router.replace('/');
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={[styles.screen, { width: contentWidth }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>마이페이지</Text>

          <View style={styles.profileRow}>
            <Image resizeMode="contain" source={BASIC_PROFILE} style={styles.profileImage} />
            <View style={styles.profileTextArea}>
              <Text numberOfLines={1} style={styles.name}>
                {userName}
              </Text>
              <Text numberOfLines={1} style={styles.studentId}>
                {userStudentId}
              </Text>
              <View style={styles.accountActionRow}>
                <Pressable
                  accessibilityRole="button"
                  disabled={isLoggingOut}
                  hitSlop={8}
                  style={({ pressed }) => [styles.logoutButton, pressed && styles.textButtonPressed]}
                  onPress={handleLogout}>
                  <Text style={styles.logoutText}>로그아웃</Text>
                </Pressable>
                <View style={styles.accountDivider} />
                <Pressable
                  accessibilityRole="button"
                  hitSlop={8}
                  style={({ pressed }) => [styles.authButton, pressed && styles.textButtonPressed]}
                  onPress={() => {}}>
                  <Text style={styles.authText}>본인인증</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.sections}>
            <MenuSection items={INFO_ITEMS} title="내 정보" />
            <MenuSection items={ACTIVITY_ITEMS} title="활동 관리" />
            <MenuSection items={SETTING_ITEMS} title="앱 설정" />
          </View>
        </ScrollView>

        <UserGnb activeKey="myPage" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9F9FB',
  },
  screen: {
    flex: 1,
    backgroundColor: '#F9F9FB',
  },
  scrollContent: {
    paddingBottom: 126,
  },
  title: {
    marginTop: 39,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 25,
    fontWeight: '500',
    lineHeight: 35,
    textAlign: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 36,
    paddingHorizontal: 37,
  },
  profileImage: {
    width: 78,
    height: 78,
  },
  profileTextArea: {
    flex: 1,
    marginLeft: 22,
  },
  name: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 23,
  },
  studentId: {
    marginTop: 2,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  accountActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  logoutButton: {
    minHeight: 19,
    justifyContent: 'center',
  },
  authButton: {
    minHeight: 19,
    justifyContent: 'center',
  },
  textButtonPressed: {
    opacity: 0.5,
  },
  logoutText: {
    color: '#FF8B8B',
    fontFamily: 'Pretendard',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
  authText: {
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
  accountDivider: {
    width: 1,
    height: 11,
    marginHorizontal: 16,
    backgroundColor: '#818181',
  },
  sections: {
    marginTop: 24,
    gap: 12,
  },
});
