import { analyzeTimetableOcr, saveUserSetup } from '@/api/user-setup';

export type ScheduleAnalysisResult = {
  scheduleItems?: {
    time: string;
    title: string;
  }[];
  interestKeywords: string[];
  recommendedKeywords: string[];
  selectedRecommendationKeywords: string[];
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
    interestKeywords: ['행정지원', '멘토링', '미디어'],
    recommendedKeywords: [
      '행사운영',
      '현장 관리',
      '행정지원',
      '디자인',
      '멘토링',
      '환경보호',
      '미디어',
      'IT',
      '수업 보조',
    ],
    selectedRecommendationKeywords: ['행정지원', '멘토링', '미디어'],
  };
}
