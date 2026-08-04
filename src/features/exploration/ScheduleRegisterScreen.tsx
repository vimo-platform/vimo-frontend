import * as ImagePicker from 'expo-image-picker';
import { Href, router } from 'expo-router';
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
import Svg, { Circle, Path } from 'react-native-svg';

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

    router.push(`/schedule-analysis?imageUri=${encodeURIComponent(selectedImageUri)}` as Href);
  };

  const removeSelectedImage = () => {
    setSelectedImageUri(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.screen, { width: contentWidth }]}>
        <View style={styles.content}>
          <Image resizeMode="contain" source={EXPLORATION_STAR} style={styles.star} />
          <Text style={styles.title}>
            VIMO가 공강 시간과{'\n'}
            교과목을 분석해{'\n'}
            나에게 맞는 봉사를 추천해드려요.
          </Text>

          {selectedImageUri ? (
            <View style={styles.selectedScheduleGroup}>
              <View style={styles.selectedImageCard}>
                <Image
                  resizeMode="contain"
                  source={{ uri: selectedImageUri }}
                  style={styles.selectedImage}
                />
                <Pressable
                  accessibilityLabel="선택한 시간표 사진 삭제"
                  accessibilityRole="button"
                  hitSlop={8}
                  style={({ pressed }) => [styles.removeImageButton, pressed && styles.pressed]}
                  onPress={removeSelectedImage}>
                  <RemoveImageIcon />
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.uploadBox, pressed && styles.pressed]}
              onPress={pickScheduleImage}>
              <Image
                resizeMode="contain"
                source={INPUT_TIMELINE_IMAGE}
                style={styles.uploadPlaceholderImage}
              />
            </Pressable>
          )}
        </View>

        <View style={styles.selectedBottomButtons}>
          <Button
            label="취소"
            variant="scheduleCancel"
            style={styles.cancelButton}
            onPress={closeScreen}
          />
          <Button
            label="이대로 등록"
            variant="scheduleSubmit"
            style={styles.registerButton}
            onPress={goNext}
          />
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

function RemoveImageIcon() {
  return (
    <Svg height={24} viewBox="0 0 24 24" width={24}>
      <Circle cx={12} cy={12} fill="#222222" r={12} />
      <Path
        d="M16.5 7.5L7.5 16.5M7.5 7.5L16.5 16.5"
        fill="none"
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
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
  content: {
    paddingTop: 59,
    paddingHorizontal: 29,
  },
  star: {
    width: 48,
    height: 48,
  },
  title: {
    marginTop: 22,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 30,
  },
  uploadBox: {
    width: 333,
    maxWidth: '100%',
    height: 238,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 76,
    borderWidth: 1.5,
    borderColor: '#E3E3E3',
    borderRadius: 28,
    backgroundColor: '#F9F9F9',
  },
  uploadPlaceholderImage: {
    width: 190,
    height: 144,
  },
  selectedScheduleGroup: {
    width: '100%',
    marginTop: 30,
  },
  selectedImageCard: {
    width: '100%',
    height: 430,
    overflow: 'hidden',
    borderRadius: 21,
    backgroundColor: '#F5F5F5',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 14,
    right: 15,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBottomButtons: {
    position: 'absolute',
    right: 30,
    bottom: 44,
    left: 30,
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    height: 60,
    borderRadius: 16,
  },
  registerButton: {
    height: 60,
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
