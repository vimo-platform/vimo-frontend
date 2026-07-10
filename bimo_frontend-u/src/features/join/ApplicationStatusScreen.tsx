import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AllLine, TopBar } from '@/components/common';
import { UserGnb } from '@/components/navigation/user-gnb';
import { useUserSessionGuard } from '@/hooks/use-user-session-guard';

import { mockApplicationStatusCards } from './application-status-mock';
import type { ApplicationVolunteerCard as ApplicationVolunteerCardType } from './application-status-types';
import { ApplicationVolunteerCard } from './components/ApplicationVolunteerCard';
import { CancelApplicationSheet } from './components/CancelApplicationSheet';
import { CancelCompleteModal } from './components/CancelCompleteModal';

export function ApplicationStatusScreen() {
  useUserSessionGuard();

  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 393);
  const [cards, setCards] = useState<ApplicationVolunteerCardType[]>(mockApplicationStatusCards);
  const [cancelTarget, setCancelTarget] = useState<ApplicationVolunteerCardType | null>(null);
  const [cancelCompleteTarget, setCancelCompleteTarget] =
    useState<ApplicationVolunteerCardType | null>(null);

  const appliedCards = useMemo(() => cards.filter((card) => card.applied), [cards]);
  const favoriteCards = useMemo(
    () => cards.filter((card) => card.liked && !card.applied),
    [cards],
  );

  const handleToggleLike = (id: number) => {
    setCards((currentCards) =>
      currentCards.map((card) => (card.id === id ? { ...card, liked: !card.liked } : card)),
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
            items={appliedCards}
            title="지원"
            onCancelPress={setCancelTarget}
            onToggleLike={handleToggleLike}
          />

          <AllLine style={styles.sectionDivider} />

          <StatusSection
            count={favoriteCards.length}
            items={favoriteCards}
            title="찜"
            onCancelPress={setCancelTarget}
            onToggleLike={handleToggleLike}
          />
        </ScrollView>

        <UserGnb activeKey="participation" />

        <CancelApplicationSheet
          visible={cancelTarget !== null}
          onClose={() => {
            setCancelTarget(null);
          }}
          onConfirm={() => {
            if (!cancelTarget) {
              return;
            }

            setCancelCompleteTarget(cancelTarget);
            setCancelTarget(null);
          }}
        />

        <CancelCompleteModal
          visible={cancelCompleteTarget !== null}
          onClose={() => {
            setCancelCompleteTarget(null);
          }}
          onConfirm={() => {
            if (cancelCompleteTarget) {
              setCards((currentCards) =>
                currentCards.map((card) =>
                  card.id === cancelCompleteTarget.id
                    ? { ...card, applied: false, progressStep: undefined }
                    : card,
                ),
              );
            }

            setCancelCompleteTarget(null);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

function StatusSection({
  count,
  items,
  title,
  onCancelPress,
  onToggleLike,
}: {
  count: number;
  items: ApplicationVolunteerCardType[];
  title: string;
  onCancelPress: (item: ApplicationVolunteerCardType) => void;
  onToggleLike: (id: number) => void;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionDot} />
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
    paddingBottom: 90,
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
