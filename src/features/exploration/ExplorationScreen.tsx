import { Asset } from 'expo-asset';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, SvgUri } from 'react-native-svg';

import { AllLine, HeartImage } from '@/components/common';
import { UserGnb } from '@/components/navigation/user-gnb';
import { isUserAuthenticatedInCurrentSession } from '@/storage/auth-storage';

import { getVolunteerPosts, updateVolunteerFavorite } from './api';
import {
  getCustomizedVolunteerPosts,
  getScheduleRecommendationSnapshot,
  subscribeScheduleRecommendation,
} from './customized-recommendation-store';
import type { VolunteerPost } from './types';
import {
  getSearchableVolunteerText,
  getVolunteerInteractionsSnapshot,
  mergeVolunteerInteractionsFromPosts,
  setVolunteerFavorite,
  setVolunteerPostsSnapshot,
  subscribeVolunteerInteractions,
} from './volunteer-interaction-store';

const EXPLORATION_STAR = require('../../../assets/images/explorationimg/explorationstar.png');
const PARTICIPATION_COMPLETED_BUTTON = require('../../../assets/images/common/participationcompletedbutton.png');
const CUSTOMIZATION_VOLUNTEER_CARD = require('../../../assets/images/explorationimg/Customizationvolunteercard.svg');

export function ExplorationScreen() {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 393);
  const [posts, setPosts] = useState<VolunteerPost[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const { appliedIds, favoriteIds } = useSyncExternalStore(
    subscribeVolunteerInteractions,
    getVolunteerInteractionsSnapshot,
    getVolunteerInteractionsSnapshot,
  );
  const scheduleRecommendation = useSyncExternalStore(
    subscribeScheduleRecommendation,
    getScheduleRecommendationSnapshot,
    getScheduleRecommendationSnapshot,
  );

  useEffect(() => {
    if (!isUserAuthenticatedInCurrentSession()) {
      router.replace('/');
      return;
    }

    getVolunteerPosts()
      .then((nextPosts) => {
        setPosts(nextPosts);
        setVolunteerPostsSnapshot(nextPosts);
        mergeVolunteerInteractionsFromPosts(nextPosts);
        setErrorMessage('');
      })
      .catch((error: unknown) => {
        setErrorMessage(error instanceof Error ? error.message : '봉사 공고를 불러오지 못했어요.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return posts;
    }

    return posts.filter((post) => getSearchableVolunteerText(post).includes(normalizedQuery));
  }, [posts, query]);
  const customizedPosts = useMemo(
    () => getCustomizedVolunteerPosts(posts),
    [posts, scheduleRecommendation],
  );

  const openPostDetail = (postId: number) => {
    router.push(`/volunteer-post/${postId}` as Href);
  };

  const handleToggleFavorite = (postId: number) => {
    const previousFavorite = favoriteIds.includes(postId);
    const nextFavorite = !previousFavorite;

    setVolunteerFavorite(postId, nextFavorite);
    updateVolunteerFavorite(postId, nextFavorite).catch(() => {
      setVolunteerFavorite(postId, previousFavorite);
    });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <View style={[styles.screen, { width: contentWidth }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <SearchInput query={query} onChangeQuery={setQuery} />
            {scheduleRecommendation.hasAnalyzedSchedule ? (
              <CustomizedScheduleHero
                customizedPosts={customizedPosts}
                hasAvailableRecommendations={scheduleRecommendation.availableRecommendationIds.length > 0}
                scheduleItems={scheduleRecommendation.scheduleItems}
              />
            ) : (
              <UnregisteredScheduleHero />
            )}
          </View>

          <AllLine style={styles.divider} />

          <View style={styles.cardSection}>
            {isLoading ? (
              <View style={styles.feedback}>
                <ActivityIndicator color="#222222" />
              </View>
            ) : errorMessage ? (
              <View style={styles.feedback}>
                <Text style={styles.feedbackTitle}>{errorMessage}</Text>
              </View>
            ) : filteredPosts.length > 0 ? (
              <View style={styles.cardList}>
                {filteredPosts.map((post) => (
                  <VolunteerPostCard
                    key={post.id}
                    applied={appliedIds.includes(post.id)}
                    favorite={favoriteIds.includes(post.id)}
                    post={post}
                    onPress={() => openPostDetail(post.id)}
                    onToggleFavorite={() => handleToggleFavorite(post.id)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.feedback}>
                <Text style={styles.feedbackTitle}>
                  {query.trim() ? '검색 결과가 없어요.' : '현재 올라온 봉사 공고가 없습니다.'}
                </Text>
                {query.trim() ? (
                  <Text style={styles.feedbackText}>다른 봉사명이나 장소로 다시 찾아보세요.</Text>
                ) : null}
              </View>
            )}
          </View>
        </ScrollView>

        <UserGnb activeKey="search" />
      </View>
    </SafeAreaView>
  );
}

function SearchInput({
  query,
  onChangeQuery,
}: {
  query: string;
  onChangeQuery: (query: string) => void;
}) {
  return (
    <LinearGradient
      colors={['#C1C1C1', '#FFFFFF', '#222222', '#EFEFEF']}
      locations={[0.15, 0.42, 0.73, 1]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.searchGradient}>
      <View style={styles.searchWrapper}>
        <TextInput
          accessibilityLabel="봉사 검색"
          placeholder="어떤 봉사를 찾으시나요?"
          placeholderTextColor="#818181"
          returnKeyType="search"
          style={styles.searchInput}
          value={query}
          onChangeText={onChangeQuery}
        />
        <View pointerEvents="none" style={styles.searchIcon}>
          <SearchIcon />
        </View>
      </View>
    </LinearGradient>
  );
}

function UnregisteredScheduleHero() {
  return (
    <>
      <View style={styles.scheduleTitleRow}>
        <Image resizeMode="contain" source={EXPLORATION_STAR} style={styles.star} />
        <Text style={styles.scheduleTitle}>시간표를 아직 등록하지 않았어요.</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.scheduleRegisterBox,
          pressed && styles.scheduleRegisterBoxPressed,
        ]}
        onPress={() => router.push('/schedule-register')}>
        <Text style={styles.scheduleRegisterText}>
          ※ 시간표를 등록하고 맞춤형 봉사 추천과 관심 분야 분석을 받아보세요.
        </Text>
      </Pressable>
    </>
  );
}

function CustomizedScheduleHero({
  customizedPosts,
  hasAvailableRecommendations,
  scheduleItems,
}: {
  customizedPosts: VolunteerPost[];
  hasAvailableRecommendations: boolean;
  scheduleItems: { time: string; title: string }[];
}) {
  const hasPosts = hasAvailableRecommendations && customizedPosts.length > 0;

  return (
    <>
      <View style={styles.customTitleRow}>
        <Image resizeMode="contain" source={EXPLORATION_STAR} style={styles.customStar} />
        <Text style={styles.customTitle}>
          {hasPosts
            ? '11:50 수업 이후, 다음 수업 전까지\n참여 가능한 교내 봉사가 있어요!'
            : '지금 참여 가능한 맞춤 봉사가 없어요'}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.todayScheduleBox, pressed && styles.pressed]}
        onPress={() => router.push('/schedule-register')}>
        <View>
          <Text style={styles.todayScheduleTitle}>오늘 시간표</Text>
          {scheduleItems.map((item) => (
            <Text key={`${item.time}-${item.title}`} style={styles.todayScheduleText}>
              {item.time} {item.title}
            </Text>
          ))}
        </View>
        <View style={styles.scheduleEditGroup}>
          <ScheduleEditIcon />
          <Text style={styles.scheduleEditText}>시간표 수정하기</Text>
        </View>
      </Pressable>

      {hasPosts ? (
        <View style={styles.customMiniCardRow}>
          {customizedPosts.slice(0, 2).map((post, index) => (
            <CustomizedVolunteerMiniCard
              key={post.id}
              post={post}
              subtitle={index === 0 ? '12:30 - 15:30' : '13:00 - 15:00'}
            />
          ))}
        </View>
      ) : (
        <View style={styles.noCustomBox}>
          <Text style={styles.noCustomText}>※ 지금 참여 가능한 맞춤 봉사가 없어요</Text>
        </View>
      )}
    </>
  );
}

function CustomizedVolunteerMiniCard({
  post,
  subtitle,
}: {
  post: VolunteerPost;
  subtitle: string;
}) {
  const title = post.id === 101 ? '🎨 학생회 홍보물 디자인' : '🌏 유학생 캠퍼스 안내';

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.customMiniCard, pressed && styles.pressed]}
      onPress={() => router.push(`/volunteer-post/${post.id}` as Href)}>
      <CustomizationVolunteerCardBackground />
      <View style={styles.customMiniContent}>
        <Text numberOfLines={1} style={styles.customMiniTitle}>
          {title}
        </Text>
        <Text style={styles.customMiniTime}>{subtitle}</Text>
        <View style={styles.customMiniMore}>
          <Text style={styles.customMiniMoreText}>자세히 보기</Text>
          <TinyChevronIcon />
        </View>
      </View>
    </Pressable>
  );
}

function CustomizationVolunteerCardBackground() {
  const uri = Asset.fromModule(CUSTOMIZATION_VOLUNTEER_CARD).uri;

  if (Platform.OS === 'web') {
    return (
      <Image
        resizeMode="stretch"
        source={{ uri }}
        style={styles.customMiniBackground}
      />
    );
  }

  return (
    <SvgUri
      height={61}
      style={styles.customMiniBackground}
      uri={uri}
      width={152}
    />
  );
}

function VolunteerPostCard({
  post,
  applied,
  favorite,
  onToggleFavorite,
  onPress,
}: {
  post: VolunteerPost;
  applied: boolean;
  favorite: boolean;
  onToggleFavorite: () => void;
  onPress: () => void;
}) {
  const isClosed = post.status !== 'RECRUITING';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.cardTitlePressable, pressed && styles.cardPressed]}
          onPress={onPress}>
          <Text numberOfLines={3} style={styles.cardTitle}>
            {post.title}
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel={favorite ? '찜 해제' : '찜하기'}
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.heartButton, pressed && styles.pressed]}
          onPress={onToggleFavorite}>
          <HeartImage filled={favorite} style={styles.heart} />
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.cardContentPressable, pressed && styles.cardPressed]}
        onPress={onPress}>
        <Text style={styles.credit}>봉사 인정 시간 : {formatCredit(post.creditHours)} 인정</Text>

        <View style={styles.details}>
          <DetailRow icon="location" text={post.location} />
          <DetailRow
            icon="calendar"
            text={`${formatDate(post.startDate)} ~ ${formatDate(post.endDate)}${getRepeatLabel(post)}`}
          />
          <DetailRow icon="clock" text={`${post.startTime} ~ ${post.endTime}`} />
        </View>
      </Pressable>

      <View style={styles.cardFooter}>
        <Text style={styles.counts}>
          모집{post.neededCount}명 / 지원{post.appliedCount}명
        </Text>
        {applied ? (
          <View
            accessibilityLabel="지원완료"
            accessibilityState={{ disabled: true }}
            style={styles.completedButton}>
            <Image
              resizeMode="contain"
              source={PARTICIPATION_COMPLETED_BUTTON}
              style={styles.completedButtonImage}
            />
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            style={[styles.applyButton, isClosed && styles.applyButtonDisabled]}
            onPress={onPress}>
            <Text style={[styles.applyText, isClosed && styles.applyTextDisabled]}>
              {isClosed ? '지원마감' : '지원하기'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
function DetailRow({ icon, text }: { icon: 'calendar' | 'clock' | 'location'; text: string }) {
  return (
    <View style={styles.detailRow}>
      <InfoIcon type={icon} />
      <Text numberOfLines={1} style={styles.detailText}>
        {text}
      </Text>
    </View>
  );
}

function SearchIcon() {
  return (
    <Svg height={24} viewBox="0 0 24 24" width={24}>
      <Path
        d="M21 21 16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
        fill="none"
        stroke="#818181"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
}

function ScheduleEditIcon() {
  return (
    <Svg height={20} viewBox="0 0 24 24" width={20}>
      <Path
        d="M7 3v3M17 3v3M4.5 9h15M6.5 5h11A2.5 2.5 0 0 1 20 7.5v8"
        fill="none"
        stroke="#818181"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.6}
      />
      <Circle cx={17} cy={17} fill="none" r={4} stroke="#818181" strokeWidth={1.6} />
      <Path d="M17 14.8V17l1.6 1" fill="none" stroke="#818181" strokeLinecap="round" strokeWidth={1.4} />
    </Svg>
  );
}

function TinyChevronIcon() {
  return (
    <Svg height={6} viewBox="0 0 4 7" width={3}>
      <Path
        d="M0.8 1 3 3.5 0.8 6"
        fill="none"
        stroke="#222222"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={0.6}
      />
    </Svg>
  );
}

function InfoIcon({ type }: { type: 'calendar' | 'clock' | 'location' }) {
  if (type === 'location') {
    return (
      <Svg height={11} viewBox="0 0 12 14" width={9}>
        <Path d="M6 13s4-4.16 4-7A4 4 0 1 0 2 6c0 2.84 4 7 4 7Z" fill="#818181" />
        <Circle cx={6} cy={6} fill="#FFFFFF" r={1.5} />
      </Svg>
    );
  }

  if (type === 'calendar') {
    return (
      <Svg height={10} viewBox="0 0 14 14" width={9}>
        <Path
          d="M2 3h10v9H2V3Zm2-2v3m6-3v3M2 6h10"
          fill="none"
          stroke="#818181"
          strokeWidth={1.5}
        />
      </Svg>
    );
  }

  return (
    <Svg height={9} viewBox="0 0 14 14" width={9}>
      <Circle cx={7} cy={7} fill="#818181" r={6} />
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
  return post.id === 101 ? ' (매주 금요일)' : '';
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
  hero: {
    paddingTop: 24,
    paddingBottom: 20,
  },
  searchGradient: {
    width: 315,
    height: 50,
    alignSelf: 'center',
    padding: 1.2,
    borderRadius: 25,
    shadowColor: '#F5F5F5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  searchWrapper: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: '#F2F2F4',
  },
  searchIcon: {
    position: 'absolute',
    right: 25,
  },
  searchInput: {
    height: 50,
    paddingRight: 60,
    paddingLeft: 24,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 17,
    fontWeight: '600',
  },
  scheduleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 36,
  },
  star: {
    width: 39,
    height: 39,
    marginRight: 14,
  },
  scheduleTitle: {
    flex: 1,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 27,
  },
  scheduleRegisterBox: {
    width: 335,
    minHeight: 69,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#818181',
    borderStyle: 'dashed',
    borderRadius: 19,
  },
  scheduleRegisterBoxPressed: {
    opacity: 0.75,
  },
  scheduleRegisterText: {
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 15,
    textAlign: 'center',
  },
  customTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingHorizontal: 32,
  },
  customStar: {
    width: 43,
    height: 43,
    marginRight: 16,
  },
  customTitle: {
    flex: 1,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 30,
  },
  todayScheduleBox: {
    width: 324,
    minHeight: 72,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#606060',
    borderRadius: 18,
  },
  todayScheduleTitle: {
    color: '#606060',
    fontFamily: 'Pretendard',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 14,
  },
  todayScheduleText: {
    color: '#606060',
    fontFamily: 'Pretendard',
    fontSize: 9,
    fontWeight: '500',
    lineHeight: 14,
  },
  scheduleEditGroup: {
    width: 57,
    alignItems: 'center',
    gap: 8,
  },
  scheduleEditText: {
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
  customMiniCardRow: {
    width: 329,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  customMiniCard: {
    width: 152,
    height: 61,
  },
  customMiniBackground: {
    position: 'absolute',
    width: 152,
    height: 61,
  },
  customMiniContent: {
    flex: 1,
    paddingTop: 13,
    paddingRight: 14,
    paddingBottom: 9,
    paddingLeft: 14,
  },
  customMiniTitle: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 14,
  },
  customMiniTime: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 9,
    fontWeight: '500',
    lineHeight: 14,
  },
  customMiniMore: {
    position: 'absolute',
    right: 14,
    bottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  customMiniMoreText: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 6,
    fontWeight: '500',
  },
  noCustomBox: {
    width: 324,
    height: 61,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#818181',
    borderStyle: 'dashed',
    borderRadius: 18,
  },
  noCustomText: {
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
    textAlign: 'center',
  },
  divider: {
    height: 9,
  },
  cardSection: {
    minHeight: 560,
    paddingTop: 29,
    paddingBottom: 34,
    backgroundColor: '#F9F9FB',
  },
  cardList: {
    gap: 16,
    alignItems: 'center',
  },
  card: {
    width: 316,
    minHeight: 237,
    paddingTop: 33,
    paddingRight: 28,
    paddingBottom: 31,
    paddingLeft: 31,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    shadowColor: '#F5F5F5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.94,
  },
  cardHeader: {
    minHeight: 19,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitlePressable: {
    flex: 1,
  },
  cardTitle: {
    flex: 1,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 18,
  },
  cardContentPressable: {
    width: '100%',
  },
  heartButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -3,
  },
  heart: {
    width: 24,
    height: 22,
  },
  pressed: {
    opacity: 0.82,
  },
  credit: {
    marginTop: 11,
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 12,
    fontWeight: '500',
  },
  details: {
    gap: 8,
    marginTop: 17,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    flex: 1,
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 13,
    fontWeight: '500',
  },
  cardFooter: {
    minHeight: 31,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  counts: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 13,
    fontWeight: '500',
  },
  applyButton: {
    width: 105,
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#222222',
  },
  completedButton: {
    width: 105,
    height: 31,
  },
  completedButtonImage: {
    width: 105,
    height: 31,
  },
  applyButtonDisabled: {
    backgroundColor: '#CECECE',
  },
  applyText: {
    color: '#F5F5F5',
    fontFamily: 'Pretendard',
    fontSize: 13,
    fontWeight: '500',
  },
  applyTextDisabled: {
    color: '#F5F5F5',
  },
  feedback: {
    minHeight: 230,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  feedbackTitle: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  feedbackText: {
    marginTop: 10,
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});

