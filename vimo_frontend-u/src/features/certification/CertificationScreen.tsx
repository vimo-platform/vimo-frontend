import { Asset } from 'expo-asset';
import { router, type Href } from 'expo-router';
import { useMemo, useRef, useSyncExternalStore } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Polyline, SvgUri } from 'react-native-svg';

import { AllLine } from '@/components/common';
import { UserGnb } from '@/components/navigation/user-gnb';
import { useUserSessionGuard } from '@/hooks/use-user-session-guard';

import type { VolunteerPost } from '@/features/exploration/types';
import {
  getVolunteerInteractionsSnapshot,
  getVolunteerPostsSnapshot,
  subscribeVolunteerInteractions,
} from '@/features/exploration/volunteer-interaction-store';

const REQUIRED_GRADUATION_HOURS = 30;
const CERTIFICATION_RECTANGLE = require('../../../assets/images/certificationimg/certificationRectangle.svg');

type CertificationVolunteerItem = {
  post: VolunteerPost;
  status: 'pending' | 'complete';
};

export function CertificationScreen() {
  useUserSessionGuard();

  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 393);
  const scrollRef = useRef<ScrollView>(null);
  const pendingSectionY = useRef(0);
  const completedSectionY = useRef(0);
  const interactions = useSyncExternalStore(
    subscribeVolunteerInteractions,
    getVolunteerInteractionsSnapshot,
    getVolunteerInteractionsSnapshot,
  );

  const posts = getVolunteerPostsSnapshot();
  const activity = useMemo(
    () => buildCertificationActivity(posts, interactions),
    [interactions, posts],
  );
  const remainingHours = Math.max(0, REQUIRED_GRADUATION_HOURS - activity.completedHours);
  const progressRatio = Math.min(activity.completedHours / REQUIRED_GRADUATION_HOURS, 1);

  const openCertificationProgress = (item: CertificationVolunteerItem) => {
    router.push(
      item.status === 'complete'
        ? (`/verification-complete/${item.post.id}` as Href)
        : (`/verification-pending/${item.post.id}` as Href),
    );
  };
  const scrollToSection = (section: 'pending' | 'complete') => {
    const y = section === 'pending' ? pendingSectionY.current : completedSectionY.current;
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 14), animated: true });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.screen, { width: contentWidth }]}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>인증</Text>

          <View style={styles.progressCard}>
            <CertificationRectangleBackground />
            <Text style={styles.progressTitle}>
              졸업 요건 충족까지{'\n'}
              {remainingHours}시간 남았어요
            </Text>

            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
              </View>
              <Text style={styles.progressHours}>
                {activity.completedHours}
                <Text style={styles.progressTotal}> / {REQUIRED_GRADUATION_HOURS}</Text>
              </Text>
            </View>

            <View style={styles.quickFilters}>
              <CertificationFilterChip
                count={activity.pendingItems.length}
                label="대기"
                type="pending"
                onPress={() => scrollToSection('pending')}
              />
              <CertificationFilterChip
                count={activity.completedItems.length}
                label="인증 완료"
                type="complete"
                onPress={() => scrollToSection('complete')}
              />
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>총 활동 요약</Text>
            <View style={styles.summaryItems}>
              <SummaryItem color="#BEECD0" count={activity.appliedCount} icon="send" label="지원한 봉사" />
              <SummaryItem color="#ECD2BE" count={activity.plannedCount} icon="clock" label="활동 예정" />
              <SummaryItem color="#BED8EC" count={activity.activityCompletedCount} icon="check" label="활동 완료" />
              <SummaryItem color="#ECE9BE" count={activity.completedItems.length} icon="star" label="완료한 봉사" />
            </View>
          </View>

          <AllLine style={styles.sectionDivider} />

          <CertificationSection
            items={activity.pendingItems}
            title={`인증 대기 : ${activity.pendingItems.length}`}
            onLayout={(y) => {
              pendingSectionY.current = y;
            }}
            onPressItem={openCertificationProgress}
          />

          <View style={styles.thinDivider} />

          <CertificationSection
            items={activity.completedItems}
            title={`인증 완료 : ${activity.completedItems.length}`}
            onLayout={(y) => {
              completedSectionY.current = y;
            }}
            onPressItem={openCertificationProgress}
          />
        </ScrollView>

        <UserGnb activeKey="verification" />
      </View>
    </SafeAreaView>
  );
}

function buildCertificationActivity(
  posts: VolunteerPost[],
  interactions: ReturnType<typeof getVolunteerInteractionsSnapshot>,
) {
  const completedIds = new Set(interactions.certificationCompletedIds);
  const activityCompletedIds = new Set(interactions.activityCompletedIds);

  const pendingItems = posts
    .filter((post) => activityCompletedIds.has(post.id) && !completedIds.has(post.id))
    .map((post) => ({ post, status: 'pending' as const }));
  const completedItems = posts
    .filter((post) => completedIds.has(post.id))
    .map((post) => ({ post, status: 'complete' as const }));
  const plannedCount = interactions.approvedIds.filter(
    (id) => !activityCompletedIds.has(id) && !completedIds.has(id),
  ).length;
  const completedHours = completedItems.reduce((total, item) => total + item.post.creditHours, 0);

  return {
    appliedCount: interactions.appliedIds.length,
    plannedCount,
    activityCompletedCount: interactions.activityCompletedIds.length,
    completedHours,
    pendingItems,
    completedItems,
  };
}

function CertificationSection({
  items,
  title,
  onLayout,
  onPressItem,
}: {
  items: CertificationVolunteerItem[];
  title: string;
  onLayout: (y: number) => void;
  onPressItem: (item: CertificationVolunteerItem) => void;
}) {
  return (
    <View
      style={styles.section}
      onLayout={(event) => {
        onLayout(event.nativeEvent.layout.y);
      }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.cardList}>
        {items.map((item) => (
          <CertificationVolunteerCard
            key={`${item.status}-${item.post.id}`}
            item={item}
            onPress={() => onPressItem(item)}
          />
        ))}
      </View>
    </View>
  );
}

function CertificationVolunteerCard({
  item,
  onPress,
}: {
  item: CertificationVolunteerItem;
  onPress: () => void;
}) {
  const isComplete = item.status === 'complete';

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.volunteerCard,
        isComplete && styles.completedVolunteerCard,
        pressed && styles.pressed,
      ]}
      onPress={onPress}>
      <View style={styles.cardContent}>
        <CertificationStatusPill status={isComplete ? 'complete' : 'syncing'} />
        <View style={styles.cardTextGroup}>
          <Text numberOfLines={1} style={styles.cardTitle}>
            {item.post.title}
          </Text>
          <Text numberOfLines={1} style={styles.cardCredit}>
            봉사 인정 시간 : {formatCredit(item.post.creditHours)} 인정
          </Text>
        </View>
      </View>
      <ChevronRightIcon />
    </Pressable>
  );
}

function CertificationRectangleBackground() {
  const uri = Asset.fromModule(CERTIFICATION_RECTANGLE).uri;

  if (Platform.OS === 'web') {
    return (
      <Image
        resizeMode="stretch"
        source={{ uri }}
        style={styles.progressCardBackground}
      />
    );
  }

  return (
    <SvgUri
      height={160}
      style={styles.progressCardBackground}
      uri={uri}
      width={332}
    />
  );
}

function CertificationFilterChip({
  count,
  label,
  type,
  onPress,
}: {
  count: number;
  label: string;
  type: 'pending' | 'complete';
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.filterChip,
        type === 'pending' ? styles.pendingFilterChip : styles.completeFilterChip,
        pressed && styles.pressed,
      ]}
      onPress={onPress}>
      {type === 'pending' ? <PendingDotsIcon /> : <CheckIcon />}
      <Text style={styles.filterChipText}>{label}</Text>
      <Text style={styles.filterChipCount}>{count}</Text>
    </Pressable>
  );
}

function CertificationStatusPill({ status }: { status: 'syncing' | 'complete' }) {
  const isComplete = status === 'complete';

  return (
    <View style={[styles.statusPill, isComplete ? styles.completeStatusPill : styles.syncingStatusPill]}>
      <Text style={styles.statusPillText}>
        {isComplete ? '인증 완료' : '학사 시스템 연동 중'}
      </Text>
    </View>
  );
}

function SummaryItem({
  color,
  count,
  icon,
  label,
}: {
  color: string;
  count: number;
  icon: 'send' | 'clock' | 'check' | 'star';
  label: string;
}) {
  return (
    <View style={styles.summaryItem}>
      <View style={[styles.summaryIconCircle, { backgroundColor: color }]}>
        <SummaryIcon type={icon} />
      </View>
      <Text numberOfLines={1} style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryCount}>{count}건</Text>
    </View>
  );
}

function PendingDotsIcon() {
  return (
    <Svg height={4} viewBox="0 0 16 4" width={16}>
      <Circle cx={2} cy={2} fill="#222222" r={2} />
      <Circle cx={8} cy={2} fill="#222222" r={2} />
      <Circle cx={14} cy={2} fill="#222222" r={2} />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg height={9} viewBox="0 0 13 9" width={13}>
      <Path
        d="M1 4.5 4.7 8 12 1"
        fill="none"
        stroke="#222222"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.6}
      />
    </Svg>
  );
}

function SummaryIcon({ type }: { type: 'send' | 'clock' | 'check' | 'star' }) {
  if (type === 'send') {
    return (
      <Svg height={20} viewBox="0 0 24 24" width={20}>
        <Path
          d="M20.5 4.5 9.8 15.2M20.5 4.5 16.8 20 9.8 15.2 4 12.2 20.5 4.5Z"
          fill="none"
          stroke="#62C98D"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </Svg>
    );
  }

  if (type === 'clock') {
    return (
      <Svg height={20} viewBox="0 0 24 24" width={20}>
        <Circle cx={12} cy={12} fill="none" r={8} stroke="#D89468" strokeWidth={2} />
        <Path d="M12 7.5V12l3 2" fill="none" stroke="#D89468" strokeLinecap="round" strokeWidth={2} />
      </Svg>
    );
  }

  if (type === 'check') {
    return (
      <Svg height={20} viewBox="0 0 24 24" width={20}>
        <Circle cx={12} cy={12} fill="none" r={8} stroke="#6DA8D6" strokeWidth={2} />
        <Path d="m8.5 12 2.2 2.3 4.8-5" fill="none" stroke="#6DA8D6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
      </Svg>
    );
  }

  return (
    <Svg height={20} viewBox="0 0 24 24" width={20}>
      <Path
        d="m12 4.5 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7L12 4.5Z"
        fill="none"
        stroke="#C9BD55"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
}

function ChevronRightIcon() {
  return (
    <Svg height={18} viewBox="0 0 10 18" width={9}>
      <Polyline
        fill="none"
        points="1 1 8 9 1 17"
        stroke="#222222"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.6}
      />
    </Svg>
  );
}

function formatCredit(hours: number) {
  return hours >= 6 ? `일 최대 ${hours}시간` : `회차당 ${hours}시간`;
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
    paddingTop: 38,
    paddingBottom: 104,
  },
  title: {
    alignSelf: 'center',
    color: '#111111',
    fontFamily: 'Pretendard',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 28,
  },
  progressCard: {
    width: 332,
    height: 160,
    alignSelf: 'center',
    marginTop: 38,
    paddingTop: 24,
    paddingHorizontal: 31,
    borderRadius: 24,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  progressCardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 332,
    height: 160,
  },
  progressTitle: {
    position: 'absolute',
    top: 19,
    left: 31.63,
    width: 130,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 25,
  },
  progressRow: {
    position: 'absolute',
    top: 74,
    left: 31.63,
    width: 268.75,
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTrack: {
    width: 192.88,
    height: 7,
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: '#D2D2D2',
  },
  progressFill: {
    height: 7,
    borderRadius: 4,
    backgroundColor: '#555555',
  },
  progressHours: {
    width: 78,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 20,
    fontWeight: '800',
  },
  progressTotal: {
    color: '#818181',
    fontSize: 15,
    fontWeight: '500',
  },
  quickFilters: {
    position: 'absolute',
    top: 120,
    left: 31.63,
    width: 188.5,
    height: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterChip: {
    height: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderWidth: 0.5,
    borderColor: '#222222',
    borderRadius: 6,
  },
  pendingFilterChip: {
    width: 83,
    gap: 7,
  },
  completeFilterChip: {
    width: 95.5,
    gap: 7,
  },
  filterChipText: {
    flex: 1,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },
  filterChipCount: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 14,
  },
  summaryCard: {
    width: 333,
    height: 170,
    alignSelf: 'center',
    marginTop: 20,
    paddingTop: 21,
    borderWidth: 1,
    borderColor: '#D2D2D2',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  summaryTitle: {
    marginLeft: 20,
    color: '#000000',
    fontFamily: 'Pretendard',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  summaryItems: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 30,
  },
  summaryItem: {
    width: 68,
    alignItems: 'center',
  },
  summaryIconCircle: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
  },
  summaryLabel: {
    marginTop: 7,
    color: '#000000',
    fontFamily: 'Pretendard',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
    textAlign: 'center',
  },
  summaryCount: {
    marginTop: 2,
    color: '#000000',
    fontFamily: 'Pretendard',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 17,
    textAlign: 'center',
  },
  sectionDivider: {
    height: 9,
    marginTop: 30,
  },
  section: {
    width: 315,
    alignSelf: 'center',
    paddingTop: 26,
  },
  sectionTitle: {
    color: '#111111',
    fontFamily: 'Pretendard',
    fontSize: 14,
    fontWeight: '700',
  },
  cardList: {
    gap: 20,
    marginTop: 20,
  },
  volunteerCard: {
    width: 315,
    height: 130,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 24,
    paddingRight: 18,
    borderWidth: 1,
    borderColor: '#D2D2D2',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#F5F5F5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  completedVolunteerCard: {
    borderColor: 'transparent',
    backgroundColor: '#CECECE',
  },
  cardContent: {
    width: 238.96,
    gap: 17,
  },
  statusPill: {
    minHeight: 22,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    opacity: 0.8,
  },
  syncingStatusPill: {
    backgroundColor: '#555555',
  },
  completeStatusPill: {
    backgroundColor: '#9C9C9C',
  },
  statusPillText: {
    color: '#FFFFFF',
    fontFamily: 'Pretendard',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    textAlign: 'center',
  },
  cardTextGroup: {
    width: 164,
    gap: 11,
  },
  cardTitle: {
    width: 164,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 15,
    fontWeight: '800',
  },
  cardCredit: {
    minWidth: 210,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 12,
    fontWeight: '500',
  },
  thinDivider: {
    width: '100%',
    height: 1,
    marginTop: 26,
    backgroundColor: '#D2D2D2',
  },
  pressed: {
    opacity: 0.86,
  },
});
