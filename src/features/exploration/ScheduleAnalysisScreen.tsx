import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Tag } from '@/components/common';
import { useUserSessionGuard } from '@/hooks/use-user-session-guard';

import {
  analyzeScheduleImage,
  saveScheduleAnalysisSelection,
  type ScheduleAnalysisResult,
} from './schedule-analysis-api';
import { setScheduleRecommendationFromAnalysis } from './customized-recommendation-store';

const EXPLORATION_STAR = require('../../../assets/images/explorationimg/explorationstar.png');

type AnalysisPhase = 'loading' | 'complete';

export function ScheduleAnalysisScreen() {
  useUserSessionGuard();

  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 393);
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();
  const uploadedImageUri = typeof imageUri === 'string' && imageUri ? imageUri : undefined;
  const [phase, setPhase] = useState<AnalysisPhase>('loading');
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<ScheduleAnalysisResult | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [customKeyword, setCustomKeyword] = useState('');
  const [customInputVisible, setCustomInputVisible] = useState(false);

  useEffect(() => {
    let mounted = true;

    analyzeScheduleImage(uploadedImageUri).then((result) => {
      if (!mounted) {
        return;
      }

      setAnalysis(result);
      setSelectedKeywords([]);
    });

    return () => {
      mounted = false;
    };
  }, [uploadedImageUri]);

  useEffect(() => {
    if (phase !== 'loading') {
      return;
    }

    const timer = setInterval(() => {
      setProgress((current) => {
        const next = Math.min(100, current + (analysis ? 8 : 4));

        if (next >= 100 && analysis) {
          clearInterval(timer);
          setTimeout(() => setPhase('complete'), 180);
        }

        return next;
      });
    }, 120);

    return () => {
      clearInterval(timer);
    };
  }, [analysis, phase]);

  const recommendedKeywords = useMemo(
    () => analysis?.recommendedKeywords ?? [],
    [analysis],
  );
  const interestKeywords = useMemo(
    () => analysis?.interestKeywords ?? [],
    [analysis],
  );

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords((current) =>
      current.includes(keyword)
        ? current.filter((item) => item !== keyword)
        : [...current, keyword],
    );
  };

  const addCustomKeyword = () => {
    const normalized = customKeyword.trim();
    if (!normalized) {
      return;
    }

    if (!recommendedKeywords.includes(normalized)) {
      setAnalysis((current) =>
        current
          ? {
              ...current,
              recommendedKeywords: [...current.recommendedKeywords, normalized],
            }
          : current,
      );
    }

    setSelectedKeywords((current) =>
      current.includes(normalized) ? current : [...current, normalized],
    );
    setCustomKeyword('');
    setCustomInputVisible(false);
  };

  if (phase === 'loading') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.loadingScreen, { width: contentWidth }]}>
          <View style={styles.loadingContent}>
            <Image resizeMode="contain" source={EXPLORATION_STAR} style={styles.loadingStar} />
            <Text style={styles.loadingText}>시간표를 읽고 있어요...</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
          <View style={styles.homeIndicator} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.screen, { width: contentWidth }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <Image resizeMode="contain" source={EXPLORATION_STAR} style={styles.completeStar} />

          <View style={styles.headerTextGroup}>
            <Text style={styles.title}>시간표 분석이 완료되었어요!</Text>
            <Text style={styles.description}>수정이 필요한 경우 각 과목을 클릭해주세요</Text>
          </View>

          <View style={styles.timetableCard}>
            {uploadedImageUri ? (
              <Image
                resizeMode="cover"
                source={{ uri: uploadedImageUri }}
                style={styles.timetableImage}
              />
            ) : (
              <MockTimetable />
            )}
          </View>

          <SectionTitle
            description="관심 있는 키워드를 골라주세요"
            title="이런 분야에 관심 있어 보여요"
          />
          <View style={styles.interestKeywordRow}>
            {interestKeywords.map((keyword) => (
              <Tag key={keyword} disabled label={keyword} />
            ))}
          </View>

          <SectionTitle
            description="참여해보고 싶은 활동을 골라주세요"
            style={styles.recommendTitle}
            title="관심 키워드 기반 추천 활동이에요"
          />
          <View style={styles.keywordWrap}>
            {recommendedKeywords.map((keyword) => (
              <Tag
                key={keyword}
                label={keyword}
                selected={selectedKeywords.includes(keyword)}
                onPress={() => toggleKeyword(keyword)}
              />
            ))}
            {customInputVisible ? (
              <View style={styles.customInputWrap}>
                <TextInput
                  autoFocus
                  placeholder="키워드 입력"
                  placeholderTextColor="#818181"
                  returnKeyType="done"
                  style={styles.customInput}
                  value={customKeyword}
                  onChangeText={setCustomKeyword}
                  onSubmitEditing={addCustomKeyword}
                />
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.addCustomButton, pressed && styles.pressed]}
                  onPress={addCustomKeyword}>
                  <Text style={styles.addCustomText}>추가</Text>
                </Pressable>
              </View>
            ) : (
              <Tag
                label="직접 작성"
                variant="editable"
                onPress={() => setCustomInputVisible(true)}
              />
            )}
          </View>
        </ScrollView>

        <View style={styles.bottomButtonWrap}>
          <Button
            label="다음"
            style={styles.nextButton}
            onPress={async () => {
              await saveScheduleAnalysisSelection(analysis, selectedKeywords);
              setScheduleRecommendationFromAnalysis({
                availableRecommendationIds: analysis?.availableRecommendationIds,
                scheduleItems: analysis?.scheduleItems,
                selectedKeywords,
              });
              router.replace('/search');
            }}
          />
        </View>
        <View style={styles.completeHomeIndicator} />
      </View>
    </SafeAreaView>
  );
}

function SectionTitle({
  title,
  description,
  style,
}: {
  title: string;
  description: string;
  style?: object;
}) {
  return (
    <View style={[styles.sectionTitleGroup, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>
    </View>
  );
}

function MockTimetable() {
  const classes = [
    { label: '국제비즈\n니스영어\n실801', style: styles.classOrange },
    { label: '골프\n전409', style: styles.classRed },
    { label: '서비스리\n빙디자인\n예404', style: styles.classGreen },
    { label: '비주얼콘\n텐츠디자\n인\n예406', style: styles.classBlue },
    { label: 'UX/UI디\n자인\n전302', style: styles.classYellow },
    { label: '서비스디\n자인\n특강', style: styles.classMint },
    { label: '알바', style: styles.classPurpleTall },
    { label: '알바', style: styles.classPurpleRight },
  ];

  return (
    <View style={styles.mockTimetable}>
      {Array.from({ length: 8 }).map((_, index) => (
        <View key={`row-${index}`} style={[styles.gridLineHorizontal, { top: 34 + index * 37 }]} />
      ))}
      {Array.from({ length: 6 }).map((_, index) => (
        <View key={`column-${index}`} style={[styles.gridLineVertical, { left: 34 + index * 35 }]} />
      ))}
      {classes.map((item, index) => (
        <View key={`${item.label}-${index}`} style={[styles.classBlock, item.style]}>
          <Text style={styles.classText}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContent: {
    position: 'absolute',
    top: 220,
    alignSelf: 'center',
    width: 223,
    alignItems: 'center',
  },
  loadingStar: {
    width: 166,
    height: 160,
  },
  loadingText: {
    marginTop: 30,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 30,
    textAlign: 'center',
  },
  progressTrack: {
    width: 192,
    height: 7,
    overflow: 'hidden',
    marginTop: 30,
    borderRadius: 9,
    backgroundColor: '#D9D9D9',
  },
  progressFill: {
    height: 7,
    borderTopLeftRadius: 9,
    borderBottomLeftRadius: 9,
    backgroundColor: '#6C6C6C',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: '#626877',
  },
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 77,
    paddingBottom: 144,
  },
  completeStar: {
    width: 80,
    height: 78,
  },
  headerTextGroup: {
    width: 269,
    marginTop: 23,
    gap: 10,
  },
  title: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 23,
    fontWeight: '700',
    lineHeight: 31,
  },
  description: {
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 26,
  },
  timetableCard: {
    width: 247,
    height: 340,
    overflow: 'hidden',
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#9C9C9C',
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
  },
  timetableImage: {
    width: '100%',
    height: '100%',
  },
  mockTimetable: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#E8E8E8',
  },
  classBlock: {
    position: 'absolute',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingTop: 5,
    paddingLeft: 5,
  },
  classText: {
    color: '#FFFFFF',
    fontFamily: 'Pretendard',
    fontSize: 8,
    fontWeight: '700',
    lineHeight: 11,
  },
  classOrange: {
    top: 31,
    left: 179,
    width: 49,
    height: 75,
    backgroundColor: '#E29958',
  },
  classRed: {
    top: 123,
    left: 68,
    width: 43,
    height: 74,
    backgroundColor: '#D57063',
  },
  classGreen: {
    top: 123,
    left: 111,
    width: 46,
    height: 74,
    backgroundColor: '#A6CD70',
  },
  classBlue: {
    top: 123,
    left: 157,
    width: 43,
    height: 74,
    backgroundColor: '#6F95CF',
  },
  classYellow: {
    top: 204,
    left: 68,
    width: 43,
    height: 74,
    backgroundColor: '#F0C356',
  },
  classMint: {
    top: 204,
    left: 111,
    width: 46,
    height: 74,
    backgroundColor: '#7BD1C0',
  },
  classPurpleTall: {
    top: 106,
    left: 200,
    width: 43,
    height: 224,
    backgroundColor: '#9A77DA',
  },
  classPurpleRight: {
    top: 31,
    left: 228,
    width: 42,
    height: 224,
    backgroundColor: '#8D71C8',
  },
  sectionTitleGroup: {
    width: 301,
    alignItems: 'center',
    gap: 10,
    marginTop: 50,
  },
  sectionTitle: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 23,
    fontWeight: '700',
    lineHeight: 31,
    textAlign: 'center',
  },
  sectionDescription: {
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 26,
    textAlign: 'center',
  },
  interestKeywordRow: {
    width: 333,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 19,
    marginTop: 31,
    flexWrap: 'wrap',
  },
  recommendTitle: {
    marginTop: 55,
  },
  keywordWrap: {
    width: 333,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 7,
    rowGap: 13,
    marginTop: 31,
  },
  customInputWrap: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customInput: {
    width: 105,
    height: 32,
    paddingHorizontal: 11,
    paddingVertical: 0,
    borderWidth: 1,
    borderColor: '#767676',
    borderRadius: 12,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontWeight: '600',
  },
  addCustomButton: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 11,
    borderRadius: 12,
    backgroundColor: '#222222',
  },
  addCustomText: {
    color: '#F5F5F5',
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomButtonWrap: {
    position: 'absolute',
    right: 0,
    bottom: 44,
    left: 0,
    alignItems: 'center',
  },
  nextButton: {
    width: 326,
  },
  completeHomeIndicator: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    width: 134,
    height: 5,
    borderRadius: 100,
    backgroundColor: '#626877',
  },
  pressed: {
    opacity: 0.86,
  },
});
