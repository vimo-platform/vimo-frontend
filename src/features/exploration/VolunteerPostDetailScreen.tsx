import { Href, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { AllLine, Button, HeartImage } from '@/components/common';
import { BackIcon } from '@/components/common/icons';
import { useUserSessionGuard } from '@/hooks/use-user-session-guard';

import { createVolunteerApplication, getVolunteerPostById, updateVolunteerFavorite } from './api';
import type { VolunteerPost } from './types';
import {
  approveVolunteerApplication,
  getVolunteerInteractionsSnapshot,
  getVolunteerPostsSnapshot,
  setVolunteerFavorite,
  subscribeVolunteerInteractions,
} from './volunteer-interaction-store';

export function VolunteerPostDetailScreen() {
  useUserSessionGuard();

  const { id, mode } = useLocalSearchParams<{ id?: string; mode?: string }>();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 393);
  const { favoriteIds } = useSyncExternalStore(
    subscribeVolunteerInteractions,
    getVolunteerInteractionsSnapshot,
    getVolunteerInteractionsSnapshot,
  );
  const snapshotPost = useMemo(
    () => getVolunteerPostsSnapshot().find((item) => item.id === Number(id)) ?? null,
    [id],
  );
  const [remotePost, setRemotePost] = useState<VolunteerPost | null>(null);
  const post = remotePost ?? snapshotPost;

  useEffect(() => {
    const postId = Number(id);

    if (!Number.isFinite(postId) || snapshotPost) {
      return;
    }

    let mounted = true;

    getVolunteerPostById(postId)
      .then((nextPost) => {
        if (mounted) {
          setRemotePost(nextPost);
        }
      })
      .catch(() => {
        if (mounted) {
          setRemotePost(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id, snapshotPost]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/search');
  };

  if (!post) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.screen, styles.centered, { width: contentWidth }]}>
          <Text style={styles.emptyText}>공고를 찾을 수 없어요.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isFavorite = favoriteIds.includes(post.id);
  const isClosed = post.status !== 'RECRUITING';
  const bottomButtonLabel = isClosed ? '지원 마감' : mode === 'confirm' ? '확인' : '지원하기';
  const handleToggleFavorite = () => {
    const nextFavorite = !isFavorite;

    setVolunteerFavorite(post.id, nextFavorite);
    updateVolunteerFavorite(post.id, nextFavorite).catch(() => {
      setVolunteerFavorite(post.id, isFavorite);
    });
  };
  const handleBottomButtonPress = async () => {
    if (mode === 'confirm') {
      router.replace('/explore');
      return;
    }

    if (post.recruitType === 'fcfs') {
      await createVolunteerApplication(post.id);
      approveVolunteerApplication(post.id);
      router.push(`/volunteer-approval-confirmed?id=${post.id}` as Href);
      return;
    }

    router.push(`/volunteer-apply-complete?id=${post.id}` as Href);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.screen, { width: contentWidth }]}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityLabel="이전 화면으로 이동"
            accessibilityRole="button"
            hitSlop={10}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={goBack}>
            <BackIcon width={10} height={19} />
          </Pressable>
          <Text style={styles.topTitle}>지원공고</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text numberOfLines={3} style={styles.title}>
                {post.title}
              </Text>
              <Pressable
                accessibilityLabel={isFavorite ? '찜 해제' : '찜하기'}
                accessibilityRole="button"
                hitSlop={10}
                style={({ pressed }) => [styles.heartButton, pressed && styles.pressed]}
                onPress={handleToggleFavorite}>
                <HeartImage filled={isFavorite} style={styles.heart} />
              </Pressable>
            </View>

            <Text style={styles.credit}>봉사 인정 시간 : {formatCredit(post.creditHours)} 인정</Text>

            <View style={styles.chipRow}>
              <Text style={styles.infoChip}>{post.participationCondition}</Text>
              <Text style={styles.warningChip}>{post.cancelPolicy}</Text>
            </View>
          </View>

          <AllLine style={styles.divider} />

          <View style={styles.detailSection}>
            <DetailRow icon="location" text={post.location} />
            <DetailRow
              icon="calendar"
              text={`${formatDate(post.startDate)} ~ ${formatDate(post.endDate)}\n${getRepeatLabel(post)}`}
            />
            <DetailRow icon="clock" text={`${post.startTime} ~ ${post.endTime}`} />

            <View style={styles.thinDivider} />

            <Text style={styles.guideTitle}>{post.guideTitle}</Text>
            <Text style={styles.description}>{post.description}</Text>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Button
            label={bottomButtonLabel}
            disabled={isClosed}
            style={[styles.applyButton, isClosed && styles.closedButton]}
            onPress={handleBottomButtonPress}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ icon, text }: { icon: 'calendar' | 'clock' | 'location'; text: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIconSlot}>
        <InfoIcon type={icon} />
      </View>
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );
}

function InfoIcon({ type }: { type: 'calendar' | 'clock' | 'location' }) {
  if (type === 'location') {
    return (
      <Svg height={13} viewBox="0 0 12 14" width={11}>
        <Path d="M6 13s4-4.16 4-7A4 4 0 1 0 2 6c0 2.84 4 7 4 7Z" fill="#555555" />
        <Circle cx={6} cy={6} fill="#FFFFFF" r={1.5} />
      </Svg>
    );
  }

  if (type === 'calendar') {
    return (
      <Svg height={12} viewBox="0 0 14 14" width={12}>
        <Path
          d="M2 3h10v9H2V3Zm2-2v3m6-3v3M2 6h10"
          fill="none"
          stroke="#555555"
          strokeWidth={1.7}
        />
      </Svg>
    );
  }

  return (
    <Svg height={12} viewBox="0 0 14 14" width={12}>
      <Circle cx={7} cy={7} fill="#555555" r={6} />
      <Path d="M7 3.5V7l2.5 1.5" fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeWidth={1.3} />
    </Svg>
  );
}

function formatCredit(hours: number) {
  return hours >= 6 ? `일 최대 ${hours}시간` : `회차당 ${hours}시간`;
}

function formatDate(date: string) {
  const [year, month, day] = date.split('-');
  return `${year}.${month}.${day}`;
}

function getRepeatLabel(post: VolunteerPost) {
  return post.id === 101 ? '(매주 금요일)' : '';
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
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    height: 57,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 17,
    top: 0,
    width: 40,
    height: 57,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 25,
  },
  scrollContent: {
    paddingBottom: 126,
  },
  header: {
    paddingTop: 34,
    paddingRight: 39,
    paddingBottom: 16,
    paddingLeft: 42,
  },
  titleRow: {
    minHeight: 31,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 18,
  },
  title: {
    flex: 1,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
  },
  heartButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  heart: {
    width: 29,
    height: 27,
  },
  credit: {
    marginTop: 7,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginTop: 16,
  },
  infoChip: {
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#EAEAEA',
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
  warningChip: {
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#F2F2F2',
    color: '#E97171',
    fontFamily: 'Pretendard',
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 15,
  },
  divider: {
    height: 9,
  },
  detailSection: {
    paddingTop: 22,
    paddingRight: 42,
    paddingLeft: 42,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 13,
  },
  detailIconSlot: {
    width: 17,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  detailText: {
    flex: 1,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 27,
  },
  thinDivider: {
    height: 1,
    marginTop: 4,
    marginBottom: 17,
    backgroundColor: '#BDBDBD',
  },
  guideTitle: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 24,
  },
  description: {
    marginTop: 12,
    color: '#606060',
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 28,
  },
  bottomBar: {
    position: 'absolute',
    right: 0,
    bottom: 47,
    left: 0,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  applyButton: {
    width: 302,
    height: 62,
    borderRadius: 12,
  },
  closedButton: {
    backgroundColor: '#CECECE',
  },
  emptyText: {
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.78,
  },
});
