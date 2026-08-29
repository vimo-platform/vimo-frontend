import { Asset } from 'expo-asset';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Path,
  SvgUri,
} from 'react-native-svg';

// 온보딩 화면은 393x852(상단 안전영역 59) 프레임 기준 고정 좌표로 배치되어 있다.
// 이보다 노치/다이내믹 아일랜드가 큰 기기에서 상단이 상태바에 겹쳐 잘리므로,
// 디자인 기준(59)을 초과하는 만큼만 콘텐츠를 아래로 내린다.
const DESIGN_TOP_INSET = 59;

import {
  isUserAuthenticatedInCurrentSession,
  setUserOnboardingCompleted,
} from '@/storage/auth-storage';

const WELCOME_ASSETS = {
  object: require('../../assets/images/onboarding/onboarding1stpageimg/welcome-object.png'),
  backgroundLeft: require('../../assets/images/onboarding/onboarding1stpageimg/image 79.png'),
  backgroundRight: require('../../assets/images/onboarding/onboarding1stpageimg/image 78.png'),
  backgroundGlowLarge: require('../../assets/images/onboarding/onboarding1stpageimg/Vector 8.png'),
  backgroundGlowLower: require('../../assets/images/onboarding/onboarding1stpageimg/Vector 9.png'),
  backgroundGlowSmall: require('../../assets/images/onboarding/onboarding1stpageimg/Vector 10.png'),
  title: require('../../assets/images/onboarding/onboarding1stpageimg/VIMO에 오신 것을 환영합니다..png'),
  eyebrow: require('../../assets/images/onboarding/onboarding1stpageimg/Volunteer In Moments.png'),
} satisfies Record<string, ImageSourcePropType>;

const WELCOME_SVG_ASSETS = {
  sparkle: require('../../assets/images/onboarding/onboarding1stpageimg/Frame 37782.svg'),
  people: require('../../assets/images/onboarding/onboarding1stpageimg/Frame 37783.svg'),
  hand: require('../../assets/images/onboarding/onboarding1stpageimg/Frame 37784.svg'),
  orbit: require('../../assets/images/onboarding/onboarding1stpageimg/Vector 2480.svg'),
} satisfies Record<string, number | string>;

const MANAGEMENT_ASSETS = {
  notice: require('../../assets/images/onboarding/onboarding2ndpageimg/onboarding2ndpagestar.png'),
} satisfies Record<string, ImageSourcePropType>;

const PARTICIPATION_ASSETS = {
  backgroundGlowLarge: require('../../assets/images/onboarding/onboarding3rdpageimg/Vector 8.png'),
  backgroundGlowLower: require('../../assets/images/onboarding/onboarding3rdpageimg/Vector 9.png'),
  badge: require('../../assets/images/onboarding/onboarding3rdpageimg/Group 37784.png'),
  star: require('../../assets/images/onboarding/onboarding3rdpageimg/Frame 37783.png'),
  send: require('../../assets/images/onboarding/onboarding3rdpageimg/Frame 37784.png'),
  check: require('../../assets/images/onboarding/onboarding3rdpageimg/Frame 37785.png'),
} satisfies Record<string, ImageSourcePropType>;

const PARTICIPATION_SVG_ASSETS = {
  innerOrbit: require('../../assets/images/onboarding/onboarding3rdpageimg/Ellipse 1098.svg'),
  middleOrbit: require('../../assets/images/onboarding/onboarding3rdpageimg/Ellipse 1099.svg'),
  outerOrbit: require('../../assets/images/onboarding/onboarding3rdpageimg/Ellipse 1100.svg'),
} satisfies Record<string, number | string>;

const ONBOARDING_PAGES = [
  {
    description: 'VIMO는 도움이 필요한 순간을\n가장 빠르게 연결합니다.',
    visual: 'welcome',
  },
  {
    title: '봉사활동, 이제 더 쉽고\n체계적으로 관리하세요',
    description: '다양한 봉사활동 정보를 한눈에 확인하고\n간편하게 신청할 수 있어요.',
    visual: 'volunteer-management',
  },
  {
    title: '참여부터 인증까지\n한 번에 관리하세요',
    description: '봉사시간과 인증 현황까지\n한 곳에서 관리할 수 있어요.',
    visual: 'participation',
  },
] as const;

type OnboardingVisual = (typeof ONBOARDING_PAGES)[number]['visual'];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const extraTopInset = Math.max(insets.top - DESIGN_TOP_INSET, 0);
  const [pageIndex, setPageIndex] = useState(0);
  const canShowOnboarding = isUserAuthenticatedInCurrentSession();
  const currentPage = ONBOARDING_PAGES[pageIndex];
  const isLastPage = pageIndex === ONBOARDING_PAGES.length - 1;
  const buttonLabel = isLastPage ? '시작하기' : '다음';

  useEffect(() => {
    if (!isUserAuthenticatedInCurrentSession()) {
      router.replace('/');
    }
  }, []);

  const handleNext = async () => {
    if (!isLastPage) {
      setPageIndex((current) => current + 1);
      return;
    }

    await setUserOnboardingCompleted();
    router.replace('/explore');
  };

  if (!canShowOnboarding) {
    return null;
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar style="dark" />
      <LinearGradient colors={['#F8F8FA', '#FFFFFF', '#F5F5F7']} style={styles.screen}>
        <View style={[styles.content, { paddingTop: extraTopInset }]}>
          {currentPage.visual === 'welcome' ? <WelcomeBackground /> : null}
          {currentPage.visual === 'volunteer-management' ? <ManagementBackground /> : null}
          {currentPage.visual === 'participation' ? <ParticipationBackground /> : null}
          {currentPage.visual === 'welcome' ? (
            <WelcomeCopy description={currentPage.description} />
          ) : (
            <View style={styles.copyGroup}>
              <Text style={styles.title}>{currentPage.title}</Text>
              <Text
                style={[
                  styles.description,
                  currentPage.visual === 'volunteer-management' &&
                    styles.descriptionWithoutEyebrow,
                ]}>
                {currentPage.description}
              </Text>
            </View>
          )}

          <VisualArea variant={currentPage.visual} />
        </View>

        <View style={styles.bottomArea}>
          <View accessibilityRole="tablist" style={styles.pagination}>
            {ONBOARDING_PAGES.map((page, index) => (
              <View
                accessibilityLabel={`${index + 1}번째 온보딩 화면`}
                accessibilityState={{ selected: index === pageIndex }}
                key={page.visual}
                style={[styles.pageDot, index === pageIndex && styles.pageDotActive]}
              />
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleNext}
            style={({ pressed }) => [styles.nextButton, pressed && styles.nextButtonPressed]}>
            <Text style={styles.nextButtonLabel}>{buttonLabel}</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

function WelcomeBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image source={WELCOME_ASSETS.backgroundRight} style={styles.backgroundRightAsset} />
      <Image source={WELCOME_ASSETS.backgroundLeft} style={styles.backgroundLeftAsset} />
      <GlowBackground
        large={WELCOME_ASSETS.backgroundGlowLarge}
        lower={WELCOME_ASSETS.backgroundGlowLower}
        small={WELCOME_ASSETS.backgroundGlowSmall}
      />
    </View>
  );
}

function ParticipationBackground() {
  return (
    <GlowBackground
      large={PARTICIPATION_ASSETS.backgroundGlowLarge}
      lower={PARTICIPATION_ASSETS.backgroundGlowLower}
    />
  );
}

function ManagementBackground() {
  return (
    <GlowBackground
      large={WELCOME_ASSETS.backgroundGlowLarge}
      lower={WELCOME_ASSETS.backgroundGlowLower}
      small={WELCOME_ASSETS.backgroundGlowSmall}
    />
  );
}

function GlowBackground({
  large,
  lower,
  small,
}: {
  large: ImageSourcePropType;
  lower: ImageSourcePropType;
  small?: ImageSourcePropType;
}) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {small ? (
        <Image resizeMode="stretch" source={small} style={styles.backgroundGlowFullAsset} />
      ) : null}
      <Image resizeMode="stretch" source={large} style={styles.backgroundGlowFullAsset} />
      <Image resizeMode="stretch" source={lower} style={styles.backgroundGlowLowerAsset} />
    </View>
  );
}

function WelcomeCopy({ description }: { description: string }) {
  return (
    <View style={styles.welcomeCopy}>
      <Image resizeMode="contain" source={WELCOME_ASSETS.title} style={styles.welcomeTitleAsset} />
      <Image
        resizeMode="contain"
        source={WELCOME_ASSETS.eyebrow}
        style={styles.welcomeEyebrowAsset}
      />
      <Text style={styles.welcomeDescription}>{description}</Text>
    </View>
  );
}

function VisualArea({ variant }: { variant: OnboardingVisual }) {
  if (variant === 'volunteer-management') {
    return (
      <View style={styles.managementStage} pointerEvents="none">
        <View style={styles.featureCard}>
          <FeatureRow
            icon={<SearchIcon />}
            subtitle="관심 분야 활동을 한눈에 확인"
            title="다양한 봉사활동 정보"
          />
          <FeatureRow icon={<SendIcon />} subtitle="원하는 활동을 쉽게 신청" title="간편한 신청" />
          <FeatureRow
            icon={<ChartIcon />}
            subtitle="참여 내역과 인증을 한곳에서"
            title="체계적인 관리"
          />
        </View>

        <Image
          resizeMode="contain"
          source={MANAGEMENT_ASSETS.notice}
          style={styles.noticeCardAsset}
        />
      </View>
    );
  }

  if (variant === 'participation') {
    return (
      <View style={styles.participationStage} pointerEvents="none">
        <View style={styles.participationOuterOrbit}>
          <LocalSvgAsset height={331} source={PARTICIPATION_SVG_ASSETS.outerOrbit} width={331} />
        </View>
        <View style={styles.participationMiddleOrbit}>
          <LocalSvgAsset height={261} source={PARTICIPATION_SVG_ASSETS.middleOrbit} width={261} />
        </View>
        <View style={styles.participationInnerOrbit}>
          <LocalSvgAsset height={130} source={PARTICIPATION_SVG_ASSETS.innerOrbit} width={130} />
        </View>
        <Image resizeMode="contain" source={PARTICIPATION_ASSETS.badge} style={styles.badgeAsset} />
        <Image resizeMode="contain" source={PARTICIPATION_ASSETS.check} style={styles.checkAsset} />
        <Image resizeMode="contain" source={PARTICIPATION_ASSETS.send} style={styles.sendAsset} />
        <Image resizeMode="contain" source={PARTICIPATION_ASSETS.star} style={styles.starAsset} />
      </View>
    );
  }

  return (
    <View style={styles.welcomeStage} pointerEvents="none">
      <View style={styles.welcomeOrbitAsset}>
        <LocalSvgAsset height={344} source={WELCOME_SVG_ASSETS.orbit} width={393} />
      </View>
      <WelcomeVisual />
      <View style={[styles.welcomeIconAsset, styles.sparkleBubble]}>
        <LocalSvgAsset height={52} source={WELCOME_SVG_ASSETS.sparkle} width={52} />
      </View>
      <View style={[styles.welcomeIconAsset, styles.handBubble]}>
        <LocalSvgAsset height={52} source={WELCOME_SVG_ASSETS.hand} width={52} />
      </View>
      <View style={[styles.welcomeIconAsset, styles.peopleBubble]}>
        <LocalSvgAsset height={52} source={WELCOME_SVG_ASSETS.people} width={52} />
      </View>
    </View>
  );
}

function LocalSvgAsset({
  height,
  source,
  width,
}: {
  height: number;
  source: number | string;
  width: number;
}) {
  const uri = typeof source === 'string' ? source : Asset.fromModule(source).uri;

  if (Platform.OS === 'web') {
    return <Image resizeMode="contain" source={{ uri }} style={{ height, width }} />;
  }

  return <SvgUri height={height} uri={uri} width={width} />;
}

function FeatureRow({
  icon,
  subtitle,
  title,
}: {
  icon: ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIconCircle}>{icon}</View>
      <View style={styles.featureCopy}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function WelcomeVisual() {
  return (
    <View style={styles.welcomeVisualWrap}>
      <Image resizeMode="contain" source={WELCOME_ASSETS.object} style={styles.welcomeObjectAsset} />
    </View>
  );
}

function SearchIcon() {
  return (
    <Svg height="26" viewBox="0 0 26 26" width="26">
      <Circle cx="11.5" cy="11.5" fill="none" r="6" stroke="#777777" strokeWidth={2.5} />
      <Path d="M16 16L21 21" stroke="#777777" strokeLinecap="round" strokeWidth={2.5} />
    </Svg>
  );
}

function SendIcon() {
  return (
    <Svg height="26" viewBox="0 0 26 26" width="26">
      <Path
        d="M21.4 5.1L5.1 11.6C4 12 4 13.5 5.2 13.9L11.6 16.1L13.8 22.4C14.2 23.6 15.8 23.6 16.2 22.5L22.9 6.2C23.2 5.4 22.2 4.8 21.4 5.1Z"
        fill="none"
        stroke="#777777"
        strokeLinejoin="round"
        strokeWidth={2.2}
      />
      <Path d="M11.6 16.1L16 11.7" stroke="#777777" strokeLinecap="round" strokeWidth={2.2} />
    </Svg>
  );
}

function ChartIcon() {
  return (
    <Svg height="26" viewBox="0 0 26 26" width="26">
      <Path d="M5 4.5V21H22" fill="none" stroke="#777777" strokeLinecap="round" strokeWidth={2.2} />
      <Path
        d="M8 17L12 13L15.5 15.5L21 9"
        fill="none"
        stroke="#777777"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.2}
      />
      <Circle cx="12" cy="13" fill="#777777" r="1.3" />
      <Circle cx="15.5" cy="15.5" fill="#777777" r="1.3" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8FA',
  },
  screen: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 393,
    flex: 1,
    position: 'relative',
  },
  copyGroup: {
    left: 40,
    position: 'absolute',
    top: 70,
    width: 313,
  },
  title: {
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 23,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 31,
  },
  description: {
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 26,
    marginTop: 20,
  },
  descriptionWithoutEyebrow: {
    marginTop: 20,
  },
  welcomeCopy: {
    left: 40,
    position: 'absolute',
    top: 70,
    width: 260,
  },
  backgroundRightAsset: {
    width: 213,
    height: 335,
    position: 'absolute',
    right: 0,
    top: 135,
  },
  backgroundLeftAsset: {
    width: 234,
    height: 334,
    left: 0,
    position: 'absolute',
    top: 72,
  },
  backgroundGlowFullAsset: {
    width: 393,
    height: 852,
    left: 0,
    position: 'absolute',
    top: -44,
  },
  backgroundGlowLowerAsset: {
    width: 393,
    height: 771,
    left: 0,
    position: 'absolute',
    top: 37,
  },
  welcomeTitleAsset: {
    width: 223,
    height: 67,
  },
  welcomeEyebrowAsset: {
    width: 164,
    height: 18,
    marginTop: 23,
  },
  welcomeDescription: {
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 26,
    marginTop: 10,
  },
  welcomeStage: {
    height: 359,
    left: 0,
    position: 'absolute',
    top: 233,
    width: '100%',
  },
  managementStage: {
    height: 383,
    left: 0,
    position: 'absolute',
    top: 222,
    width: '100%',
  },
  participationStage: {
    height: 331,
    left: 0,
    position: 'absolute',
    top: 216,
    width: '100%',
  },
  participationOuterOrbit: {
    height: 331,
    left: 31,
    position: 'absolute',
    top: 0,
    width: 331,
  },
  participationMiddleOrbit: {
    height: 261,
    left: 66,
    position: 'absolute',
    top: 35,
    width: 261,
  },
  participationInnerOrbit: {
    height: 130,
    left: 131,
    position: 'absolute',
    top: 101,
    width: 130,
  },
  badgeAsset: {
    height: 190.5,
    left: 101.25,
    position: 'absolute',
    top: 70.75,
    width: 190.5,
  },
  checkAsset: {
    height: 65,
    left: 244,
    position: 'absolute',
    top: 3,
    width: 65,
  },
  sendAsset: {
    height: 65,
    left: 29,
    position: 'absolute',
    top: 206,
    width: 65,
  },
  starAsset: {
    height: 65,
    left: 250,
    position: 'absolute',
    top: 269,
    width: 65,
  },
  featureCard: {
    left: 41,
    position: 'absolute',
    top: 0,
    width: 310,
    height: 260,
    justifyContent: 'center',
    gap: 20,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 24,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.24,
    shadowRadius: 4,
    elevation: 2,
  },
  featureRow: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  featureIconCircle: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 27,
    backgroundColor: '#E3E3E3',
  },
  featureCopy: {
    width: 170,
    gap: 7,
  },
  featureTitle: {
    color: '#606060',
    fontFamily: 'Pretendard',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 19,
  },
  featureSubtitle: {
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 14,
  },
  noticeCardAsset: {
    width: 330,
    height: 105,
    left: 31,
    position: 'absolute',
    top: 268,
  },
  welcomeOrbitAsset: {
    width: 393.5,
    height: 342.37,
    left: -1,
    position: 'absolute',
    top: 3.5,
  },
  welcomeVisualWrap: {
    alignItems: 'center',
    height: 330,
    justifyContent: 'center',
    left: 31,
    position: 'absolute',
    top: 29,
    width: 330,
  },
  welcomeObjectAsset: {
    width: 331,
    height: 320,
  },
  welcomeIconAsset: {
    width: 52,
    height: 52,
    position: 'absolute',
  },
  sparkleBubble: {
    left: 42,
    top: 264,
  },
  handBubble: {
    left: 260,
    top: 311,
  },
  peopleBubble: {
    left: 308,
    top: -4,
  },
  bottomArea: {
    alignItems: 'center',
    maxWidth: 393,
    position: 'absolute',
    top: 656,
    width: '100%',
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    height: 8,
    marginBottom: 40,
  },
  pageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D2D2D2',
  },
  pageDotActive: {
    width: 32,
    backgroundColor: '#222222',
  },
  nextButton: {
    width: 326,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#222222',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  nextButtonPressed: {
    opacity: 0.9,
  },
  nextButtonLabel: {
    color: '#F5F5F5',
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0,
    lineHeight: 26,
    textAlign: 'center',
  },
});
