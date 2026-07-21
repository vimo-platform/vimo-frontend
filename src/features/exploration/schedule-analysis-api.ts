import { analyzeTimetableOcr, saveUserSetup } from '@/api/user-setup';

export type ScheduleAnalysisResult = {
  scheduleItems?: {
    time: string;
    title: string;
  }[];
  interestKeywords: string[];
  recommendedKeywords: string[];
  selectedRecommendationKeywords: string[];
  availableRecommendationIds?: number[];
};

const USE_MOCK_SCHEDULE_ANALYSIS =
  process.env.EXPO_PUBLIC_USE_MOCK_SCHEDULE_ANALYSIS !== 'false';

export async function analyzeScheduleImage(imageUri?: string): Promise<ScheduleAnalysisResult> {
  if (!USE_MOCK_SCHEDULE_ANALYSIS && imageUri) {
    try {
      const formData = new FormData();

      formData.append('timetableImage', {
        uri: imageUri,
        name: 'timetable.jpg',
        type: 'image/jpeg',
      } as unknown as Blob);

      const data = await analyzeTimetableOcr(formData);

      return {
        scheduleItems: data.scheduleItems,
        interestKeywords: data.interestKeywords,
        recommendedKeywords: data.recommendedKeywords,
        selectedRecommendationKeywords: data.selectedRecommendationKeywords ?? [],
        availableRecommendationIds: data.availableRecommendationIds,
      };
    } catch {
      return getMockScheduleAnalysisResult();
    }
  }

  return getMockScheduleAnalysisResult();
}

export async function saveScheduleAnalysisSelection(
  analysis: ScheduleAnalysisResult | null,
  selectedKeywords: string[],
) {
  if (USE_MOCK_SCHEDULE_ANALYSIS || !analysis) {
    return;
  }

  await saveUserSetup({
    scheduleItems: analysis.scheduleItems ?? [],
    interestKeywords: analysis.interestKeywords,
    selectedRecommendationKeywords: selectedKeywords,
  }).catch(() => undefined);
}

async function getMockScheduleAnalysisResult() {
  await new Promise((resolve) => setTimeout(resolve, 2200));

  return {
    scheduleItems: [
      { time: '09:00 - 11:50', title: '국제비즈니스영어' },
      { time: '15:30 - 16:30', title: '인성과 학문 III' },
    ],
    interestKeywords: ['디자인', '실무 영어', '스포츠', '콘텐츠 제작'],
    recommendedKeywords: [
      '디자인',
      '영어멘토링',
      '행사 운영',
      '커뮤니케이션',
      '글로벌 교류',
      '포스터 디자인',
      '국제행사 운영',
      '스포츠 행사 스태프',
      '현장 운영 지원',
    ],
    selectedRecommendationKeywords: [],
    availableRecommendationIds: [101, 102],
  };
}
