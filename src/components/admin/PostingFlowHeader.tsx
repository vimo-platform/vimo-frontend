import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Colors } from '@/styles/admin/theme';
import { pretendard } from '@/styles/common/fonts';

type Props = {
  title: string;
  style?: StyleProp<ViewStyle>;
  barStyle?: StyleProp<ViewStyle>;
  backButtonStyle?: StyleProp<ViewStyle>;
  backIcon?: ReactNode;
  fallbackHref?: Href;
};

export function PostingFlowHeader({ title, style, barStyle, backButtonStyle, backIcon, fallbackHref = '/admin/postings' }: Props) {
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackHref);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, style]}>
      <View style={[styles.bar, barStyle]}>
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          <Pressable
            accessibilityLabel="뒤로가기"
            accessibilityRole="button"
            onPress={goBack}
            style={[styles.backButton, backButtonStyle]}>
            {backIcon ?? <Svg width={9} height={18} viewBox="0 0 9 18" fill="none">
              <Path
                d="M7.5 1.5L1.5 9L7.5 16.5"
                stroke="#111111"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>}
          </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.card,
    flexShrink: 0,
  },
  bar: {
    height: 44,
    justifyContent: 'center',
  },
  title: {
    color: '#111111',
    fontFamily: pretendard(500),
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'center',
    marginHorizontal: 64,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
