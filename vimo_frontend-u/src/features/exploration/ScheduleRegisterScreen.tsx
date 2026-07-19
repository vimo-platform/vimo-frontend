import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Button } from '@/components/common';
import { useUserSessionGuard } from '@/hooks/use-user-session-guard';

const EXPLORATION_STAR = require('../../../assets/images/explorationimg/explorationstar.png');
const INPUT_TIMELINE_IMAGE = require('../../../assets/images/explorationimg/inputtimelineimg.png');

export function ScheduleRegisterScreen() {
  useUserSessionGuard();

  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 393);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [showUploadAlert, setShowUploadAlert] = useState(false);

  const closeScreen = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/search');
  };

  const pickScheduleImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setShowUploadAlert(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setSelectedImageUri(result.assets[0].uri);
    }
  };

  const goNext = () => {
    if (!selectedImageUri) {
      setShowUploadAlert(true);
      return;
    }

    router.push('/schedule-analysis');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.screen, { width: contentWidth }]}>
        <Pressable
          accessibilityLabel="닫기"
          accessibilityRole="button"
          hitSlop={12}
          style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
          onPress={closeScreen}>
          <CloseIcon />
        </Pressable>

        <View style={styles.content}>
          <Image resizeMode="contain" source={EXPLORATION_STAR} style={styles.star} />
          <Text style={styles.title}>
            VIMO가 공강 시간과{'\n'}
            교과목을 분석해{'\n'}
            나에게 맞는 봉사를 추천해드려요.
          </Text>

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.uploadBox, pressed && styles.pressed]}
            onPress={pickScheduleImage}>
            {selectedImageUri ? (
              <Image resizeMode="cover" source={{ uri: selectedImageUri }} style={styles.previewImage} />
            ) : (
              <Image
                resizeMode="contain"
                source={INPUT_TIMELINE_IMAGE}
                style={styles.uploadPlaceholderImage}
              />
            )}
          </Pressable>
        </View>

        <View style={styles.bottomButtonWrap}>
          <Button label="다음" style={styles.nextButton} onPress={goNext} />
        </View>

        <UploadRequiredModal
          visible={showUploadAlert}
          onConfirm={() => setShowUploadAlert(false)}
        />
      </View>
    </SafeAreaView>
  );
}

function UploadRequiredModal({
  visible,
  onConfirm,
}: {
  visible: boolean;
  onConfirm: () => void;
}) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onConfirm}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalDimmed} />
        <View style={styles.modalDialog}>
          <Text style={styles.modalTitle}>알림</Text>
          <Text style={styles.modalDescription}>학교 시간표 사진을 업로드 해주세요.</Text>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.modalButton, pressed && styles.pressed]}
            onPress={onConfirm}>
            <Text style={styles.modalButtonText}>확인</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function CloseIcon() {
  return (
    <Svg height={25} viewBox="0 0 25 25" width={25}>
      <Path
        d="M5 5l15 15M20 5 5 20"
        fill="none"
        stroke="#222222"
        strokeLinecap="round"
        strokeWidth={1.4}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    top: 35,
    right: 27,
    zIndex: 2,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingTop: 70,
    paddingHorizontal: 32,
  },
  star: {
    width: 45,
    height: 45,
    marginLeft: 4,
  },
  title: {
    marginTop: 29,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 23,
    fontWeight: '800',
    lineHeight: 35,
  },
  uploadBox: {
    width: '100%',
    height: 244,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 40,
    borderWidth: 2,
    borderColor: '#E3E3E3',
    borderRadius: 30,
    backgroundColor: '#F9F9F9',
  },
  uploadPlaceholderImage: {
    width: 190,
    height: 144,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  bottomButtonWrap: {
    position: 'absolute',
    right: 0,
    bottom: 27,
    left: 0,
    alignItems: 'center',
  },
  nextButton: {
    width: 326,
    height: 62,
    borderRadius: 16,
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDimmed: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(34, 34, 34, 0.5)',
  },
  modalDialog: {
    width: 270,
    alignItems: 'center',
    paddingTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 21,
    fontWeight: '800',
  },
  modalDescription: {
    marginTop: 18,
    color: '#606060',
    fontFamily: 'Pretendard',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    textAlign: 'center',
  },
  modalButton: {
    width: 216,
    height: 47,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    borderRadius: 13,
    backgroundColor: '#222222',
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
  modalButtonText: {
    color: '#F5F5F5',
    fontFamily: 'Pretendard',
    fontSize: 17,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.82,
  },
});
