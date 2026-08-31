import { Href, router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AllLine, HeartImage, TopBar } from '@/components/common';
import { UserGnb } from '@/components/navigation/user-gnb';
import { useUserSessionGuard } from '@/hooks/use-user-session-guard';

import {
  deleteVolunteerApplication,
  getVolunteerPosts,
  updateVolunteerFavorite,
} from '@/features/exploration/api';
import {
  cancelVolunteerApplication,
  getVolunteerInteractionsSnapshot,
  getVolunteerPostsSnapshot,
  mergeVolunteerInteractionsFromPosts,
  setVolunteerPostsSnapshot,
  setVolunteerFavorite,
  subscribeVolunteerInteractions,
} from '@/features/exploration/volunteer-interaction-store';
import type { VolunteerPost } from '@/features/exploration/types';

import type { ApplicationVolunteerCard as ApplicationVolunteerCardType } from './application-status-types';
import { ApplicationVolunteerCard } from './components/ApplicationVolunteerCard';
import { CancelApplicationSheet } from './components/CancelApplicationSheet';
import { CancelCompleteModal } from './components/CancelCompleteModal';

export function ApplicationStatusScreen() {
  useUserSessionGuard();

  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 393);
  const { appliedIds, favoriteIds } = useSyncExternalStore(
    subscribeVolunteerInteractions,
    getVolunteerInteractionsSnapshot,
    getVolunteerInteractionsSnapshot,
  );
  const [posts, setPosts] = useState(() => getVolunteerPostsSnapshot());
  const cards = useMemo(
    () => buildApplicationStatusCards(posts, favoriteIds, appliedIds),
    [appliedIds, favoriteIds, posts],
  );
  const [cancelTarget, setCancelTarget] = useState<ApplicationVolunteerCardType | null>(null);
  const [cancelCompleteTarget, setCancelCompleteTarget] =
    useState<ApplicationVolunteerCardType | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      getVolunteerPosts().then((nextPosts) => {
        if (!mounted) {
          return;
        }

        setPosts(nextPosts);
        setVolunteerPostsSnapshot(nextPosts);
        mergeVolunteerInteractionsFromPosts(nextPosts);
      });

      return () => {
        mounted = false;
      };
    }, []),
  );

  const appliedCards = useMemo(() => cards.filter((card) => card.applied), [cards]);
  const favoriteCards = useMemo(() => buildFavoriteCards(cards), [cards]);

  const handleToggleLike = (id: number) => {
    const previousFavorite = favoriteIds.includes(id);
    const nextFavorite = !previousFavorite;

    setVolunteerFavorite(id, nextFavorite);
    updateVolunteerFavorite(id, nextFavorite).catch(() => {
      setVolunteerFavorite(id, previousFavorite);
    });
  };

  const openVolunteerPost = (item: ApplicationVolunteerCardType) => {
    router.push(`/volunteer-post/${item.id}` as Href);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={[styles.screen, { width: contentWidth }]}>
        <TopBar
          title="지원 현황"
          onBackPress={() => {
            if (router.canGoBack()) {
              router.back();
              return;
            }

            router.replace('/explore');
          }}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <StatusSection
            count={appliedCards.length}
            icon="dot"
            items={appliedCards}
            title="지원"
            onCancelPress={setCancelTarget}
            onToggleLike={handleToggleLike}
          />

          <AllLine style={styles.sectionDivider} />

          <StatusSection
            count={favoriteCards.length}
            icon="heart"
            items={favoriteCards}
            title="찜"
            onCancelPress={setCancelTarget}
            onCardPress={openVolunteerPost}
            onToggleLike={handleToggleLike}
          />
        </ScrollView>

        <UserGnb activeKey="participation" />

        <CancelApplicationSheet
          visible={cancelTarget !== null}
          onClose={() => {
            setCancelTarget(null);
          }}
          onConfirm={(reason) => {
            if (!cancelTarget) {
              return;
            }

            setCancelReason(reason);
            setCancelCompleteTarget(cancelTarget);
            setCancelTarget(null);
          }}
        />

        <CancelCompleteModal
          visible={cancelCompleteTarget !== null}
          onClose={() => {
            setCancelCompleteTarget(null);
          }}
          onConfirm={async () => {
            if (cancelCompleteTarget) {
              try {
                await deleteVolunteerApplication(cancelCompleteTarget.id, {
                  cancelReason,
                });
              } catch {
                return;
              }

              cancelVolunteerApplication(cancelCompleteTarget.id);
            }

            setCancelReason('');
            setCancelCompleteTarget(null);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

function buildFavoriteCards(cards: ApplicationVolunteerCardType[]) {
  return cards
    .filter((card) => card.favorite)
    .map((card) => {
      if (!card.applied) {
        return card;
      }

      return {
        ...card,
        applied: false,
        actionLabel: '지원완료',
        actionDisabled: true,
        progressStep: undefined,
      };
    });
}

function buildApplicationStatusCards(
  posts: VolunteerPost[],
  favoriteIds: number[],
  appliedIds: number[],
): ApplicationVolunteerCardType[] {
  return posts
    .filter((post) => favoriteIds.includes(post.id) || isTrackableApplication(post, appliedIds))
    .map((post) => {
      const applied = isTrackableApplication(post, appliedIds);
      const progressStep = getApplicationProgressStep(post);

      return {
        id: post.id,
        status: post.status,
        title: post.title,
        credit: `봉사 인정 시간 : ${formatCredit(post.creditHours)} 인정`,
        location: post.location,
        period: `${formatDate(post.startDate)} ~ ${formatDate(post.endDate)}${post.id === 101 ? ' (매주 금요일)' : ''}`,
        time: `${post.startTime} ~ ${post.endTime}`,
        recruitCount: post.neededCount,
        applicantCount: post.appliedCount,
        favorite: favoriteIds.includes(post.id),
        applied,
        actionLabel: post.status !== 'RECRUITING' ? '지원 마감' : '지원하기',
        actionDisabled: post.status !== 'RECRUITING',
        hasPreferredCondition: hasPreferredCondition(post),
        progressStep: applied ? progressStep : undefined,
      };
    });
}

function isTrackableApplication(post: VolunteerPost, appliedIds: number[]) {
  if (!appliedIds.includes(post.id)) {
    return false;
  }

  const status = post.applicationStatus;

  return (
    !status ||
    status === 'PENDING' ||
    status === 'APPROVED' ||
    status === 'ATTENDED' ||
    status === 'COMPLETED' ||
    status === 'CERTIFIED'
  );
}

function getApplicationProgressStep(post: VolunteerPost): ApplicationVolunteerCardType['progressStep'] {
  if (post.recruitType === 'fcfs') {
    return 3;
  }

  if (post.applicationStatus === 'APPROVED') {
    return 3;
  }

  if (post.applicationStatus === 'ATTENDED') {
    return 4;
  }

  if (post.applicationStatus === 'COMPLETED' || post.applicationStatus === 'CERTIFIED') {
    return 5;
  }

  return 2;
}

function hasPreferredCondition(post: VolunteerPost) {
  const conditionTexts = [post.participationCondition, ...post.requirements]
    .filter(Boolean)
    .join(' ');

  return /우대|조건|가능자/.test(conditionTexts);
}

function formatCredit(hours: number) {
  return hours >= 6 ? `일 최대 ${hours}시간` : `회차당 ${hours}시간`;
}

function formatDate(date: string) {
  const [year, month, day] = date.split('-');
  return `${year}.${month}.${day}`;
}

function StatusSection({
  count,
  icon,
  items,
  title,
  onCancelPress,
  onCardPress,
  onToggleLike,
}: {
  count: number;
  icon: 'dot' | 'heart';
  items: ApplicationVolunteerCardType[];
  title: string;
  onCancelPress: (item: ApplicationVolunteerCardType) => void;
  onCardPress?: (item: ApplicationVolunteerCardType) => void;
  onToggleLike: (id: number) => void;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        {icon === 'heart' ? (
          <HeartImage filled style={styles.sectionHeart} />
        ) : (
          <View style={styles.sectionDot} />
        )}
        <Text style={styles.sectionTitle}>
          {title} {count}
        </Text>
      </View>

      {items.length > 0 ? (
        <View style={styles.cardList}>
          {items.map((item) => (
            <ApplicationVolunteerCard
              key={item.id}
              item={item}
              onCancelPress={onCancelPress}
              onCardPress={onCardPress}
              onToggleLike={onToggleLike}
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{title}한 봉사 공고가 없어요.</Text>
        </View>
      )}
    </View>
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
    paddingTop: 26,
    paddingBottom: 126,
  },
  section: {
    alignItems: 'center',
  },
  sectionTitleRow: {
    width: 316,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 13,
    paddingLeft: 25,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#111111',
  },
  sectionHeart: {
    width: 10,
    height: 9,
  },
  sectionTitle: {
    color: '#111111',
    fontFamily: 'Pretendard',
    fontSize: 13,
    fontWeight: '700',
  },
  cardList: {
    gap: 22,
  },
  sectionDivider: {
    marginTop: 10,
    marginBottom: 27,
  },
  emptyState: {
    width: 316,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 13,
    fontWeight: '500',
  },
});
