import { Asset } from 'expo-asset';
import type { ReactNode } from 'react';
import { Image, Pressable, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgUri } from 'react-native-svg';

import { Button } from '@/components/common';

const VECTOR_BACK = require('@/assets/images/explorationimg/Vector 8.svg');
const LEFT_LOOP = require('@/assets/images/explorationimg/image 79.svg');
const RIGHT_LOOP = require('@/assets/images/explorationimg/image 78.svg');

type VolunteerResultTone = 'light' | 'dark';

type VolunteerResultScreenProps = {
  characterSource: number;
  characterStyle?: object;
  description: ReactNode;
  onConfirm: () => void;
  postId?: number;
  title: string;
  tone?: VolunteerResultTone;
};

export function VolunteerResultScreen({
  characterSource,
  characterStyle,
  description,
  onConfirm,
  postId,
  title,
  tone = 'light',
}: VolunteerResultScreenProps) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 393);
  const isDark = tone === 'dark';

  const handleShare = () => {
    const shareUrl = Number.isFinite(postId) ? `vimo://volunteer-post/${postId}` : 'vimo://search';

    Share.share({
      title: 'VIMO \uBD09\uC0AC \uACF5\uACE0',
      message: `VIMO\uC5D0\uC11C \uBD09\uC0AC \uACF5\uACE0\uB97C \uAC19\uC774 \uD655\uC778\uD574\uBCF4\uC138\uC694.\n${shareUrl}`,
      url: shareUrl,
    }).catch(() => undefined);
  };

  return (
    <SafeAreaView edges={['left', 'right']} style={[styles.safeArea, isDark && styles.darkBackground]}>
      <View style={[styles.screen, isDark && styles.darkBackground, { width: contentWidth }]}>
        <SvgAsset asset={VECTOR_BACK} height={852} style={[styles.vectorBack, isDark && styles.darkVector]} width={393} />
        <SvgAsset asset={LEFT_LOOP} height={334} style={[styles.leftLoop, isDark && styles.darkLeftLoop]} width={234} />
        <SvgAsset asset={RIGHT_LOOP} height={335} style={[styles.rightLoop, isDark && styles.darkRightLoop]} width={206} />

        <Image
          resizeMode="contain"
          source={characterSource}
          style={[styles.character, characterStyle]}
        />

        <Text style={[styles.title, isDark && styles.darkTitle]}>{title}</Text>
        <Text style={[styles.description, isDark && styles.darkDescription]}>{description}</Text>

        <View style={styles.buttonArea}>
          <Button label={'\uD655\uC778'} style={styles.confirmButton} onPress={onConfirm} />
        </View>

        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.friendButton, pressed && styles.pressed]}
          onPress={handleShare}>
          <Text style={[styles.friendText, isDark && styles.darkFriendText]}>
            {'\uCE5C\uAD6C\uC5D0\uAC8C \uAC19\uC774\uD558\uC790\uACE0 \uD558\uAE30'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function SvgAsset({
  asset,
  height,
  style,
  width,
}: {
  asset: number;
  height: number;
  style: object;
  width: number;
}) {
  const uri = Asset.fromModule(asset).uri;

  return <SvgUri height={height} style={style} uri={uri} width={width} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  screen: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  darkBackground: {
    backgroundColor: '#222222',
  },
  vectorBack: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 0,
  },
  darkVector: {
    opacity: 0.78,
  },
  leftLoop: {
    position: 'absolute',
    left: -5,
    top: 7,
    zIndex: 1,
  },
  darkLeftLoop: {
    opacity: 0.26,
  },
  rightLoop: {
    position: 'absolute',
    left: 187,
    top: 121,
    zIndex: 1,
  },
  darkRightLoop: {
    opacity: 0.34,
  },
  character: {
    position: 'absolute',
    left: 67,
    top: 127,
    width: 216,
    height: 212,
    zIndex: 2,
  },
  title: {
    position: 'absolute',
    top: 347,
    left: 0,
    width: '100%',
    color: '#222222',
    fontFamily: 'Pretendard',
    fontSize: 27,
    fontWeight: '800',
    lineHeight: 34,
    textAlign: 'center',
    zIndex: 3,
  },
  darkTitle: {
    color: '#D0D0D0',
  },
  description: {
    position: 'absolute',
    top: 416,
    left: 0,
    width: '100%',
    color: '#818181',
    fontFamily: 'Pretendard',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 32,
    textAlign: 'center',
    zIndex: 3,
  },
  darkDescription: {
    color: '#F5F5F5',
  },
  buttonArea: {
    position: 'absolute',
    top: 682,
    left: 33,
    width: 326,
    height: 60,
    alignItems: 'center',
    zIndex: 3,
  },
  confirmButton: {
    width: 326,
    height: 60,
    borderRadius: 16,
  },
  friendButton: {
    position: 'absolute',
    top: 772,
    left: 109,
    width: 175,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    elevation: 3,
  },
  friendText: {
    color: 'rgba(129,129,129,0.6)',
    fontFamily: 'Pretendard',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    textAlign: 'center',
  },
  darkFriendText: {
    color: 'rgba(208,208,208,0.6)',
  },
  pressed: {
    opacity: 0.7,
  },
});
