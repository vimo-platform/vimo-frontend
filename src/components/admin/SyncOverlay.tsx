import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import type { ComponentProps } from "react";
import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Text as SvgText } from "react-native-svg";

import { Figma } from "@/components/admin/Figma";
import { ADMIN_APP_FRAME_MAX_WIDTH, Colors } from "@/styles/admin/theme";
import { pretendard } from "@/styles/common/fonts";

const DESIGN_WIDTH = 393;
const DESIGN_HEIGHT = 852;
const ASSETS = {
  lowerBackground: require("@/assets/admin/sync/background-lower.png"),
  upperBackground: require("@/assets/admin/sync/background-upper.png"),
  close: require("@/assets/admin/sync/close.svg"),
};

type Step = {
  icon: ComponentProps<typeof Figma>["name"];
  label: string;
  imageTop: number;
  imageOffsetX: number;
};

const STEPS: Step[] = [
  { icon: "syncLog", label: "디지털 활동 로그 확인 완료", imageTop: 5, imageOffsetX: 0.17 },
  { icon: "syncClock", label: "출석 인증 완료", imageTop: 0, imageOffsetX: 0.36 },
  { icon: "syncPeople", label: "봉사 시간 계산 완료", imageTop: 5, imageOffsetX: 0.14 },
  { icon: "syncUpload", label: "학사 DB 전송 중...", imageTop: 5, imageOffsetX: 0.19 },
];

export function SyncOverlay({ visible, onComplete, onCancel }: {
  visible: boolean;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!visible) {
      const reset = setTimeout(() => {
        setStep(0);
        setProgress(0);
      }, 0);
      return () => clearTimeout(reset);
    }

    if (step >= STEPS.length) {
      const done = setTimeout(() => onCompleteRef.current(), 700);
      return () => clearTimeout(done);
    }

    // 첫 단계의 0%부터 마지막 단계의 100%까지 이어서 채운다.
    const from = step / STEPS.length;
    const to = (step + 1) / STEPS.length;
    const start = Date.now();
    const fill = setInterval(() => {
      const fraction = Math.min(1, (Date.now() - start) / 900);
      setProgress(from + (to - from) * fraction);
      if (fraction >= 1) clearInterval(fill);
    }, 30);

    const next = setTimeout(() => setStep((current) => current + 1), 1000);
    return () => {
      clearInterval(fill);
      clearTimeout(next);
    };
  }, [visible, step]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onCancel}>
      <SafeAreaProvider>
        <SyncOverlayView step={step} progress={progress} onCancel={onCancel} />
      </SafeAreaProvider>
    </Modal>
  );
}

function SyncOverlayView({ step, progress, onCancel }: {
  step: number;
  progress: number;
  onCancel: () => void;
}) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scale = Math.min(width, ADMIN_APP_FRAME_MAX_WIDTH) / DESIGN_WIDTH;
  const current = STEPS[step];
  const isUploading = step === STEPS.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View pointerEvents="none" style={[styles.backgroundCanvas, { transform: [{ scale }] }]}>
        <Image source={ASSETS.lowerBackground} contentFit="contain" style={styles.lowerBackground} />
        <Image source={ASSETS.upperBackground} contentFit="contain" style={styles.upperBackground} />
      </View>

      {current ? (
        <>
          <SafeAreaView edges={["top", "bottom", "left", "right"]} style={styles.safeArea}>
            <ScrollView
              bounces={false}
              contentInsetAdjustmentBehavior="never"
              automaticallyAdjustContentInsets={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingTop: 41 * scale,
                paddingHorizontal: 36 * scale,
                paddingBottom: 32 * scale,
              }}>
              <Text style={[styles.title, { fontSize: 21 * scale, lineHeight: 33 * scale }]}>
                학사 시스템과{"\n"}자동 연동하고 있어요
              </Text>
              <Text style={[styles.subtitle, { marginTop: 11 * scale, fontSize: 13 * scale, lineHeight: 20 * scale }]}>
                지금 화면을 나가면 인증이 중단될 수 있어요.{"\n"}잠시만 기다려주세요.
              </Text>

              <View style={[styles.stage, { marginTop: 123 * scale }]}>
                <View style={[styles.imageSlot, { height: 181 * scale }]}>
                  <Figma
                    name={current.icon}
                    scale={scale}
                    style={{
                      marginTop: current.imageTop * scale,
                      transform: [{ translateX: current.imageOffsetX * scale }],
                    }}
                  />
                </View>
                {isUploading ? (
                  <Svg accessibilityLabel={current.label} width={260 * scale} height={33 * scale}>
                    <Defs>
                      <SvgGradient id="sync-label" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0" stopColor="#5C5C5C" />
                        <Stop offset="1" stopColor="#B4B4B4" />
                      </SvgGradient>
                    </Defs>
                    <SvgText
                      x="50%"
                      y={22 * scale}
                      textAnchor="middle"
                      fontFamily={pretendard(800)}
                      fontSize={18 * scale}
                      fill="url(#sync-label)">
                      {current.label}
                    </SvgText>
                  </Svg>
                ) : (
                  <Text style={[styles.label, { fontSize: 18 * scale, lineHeight: 33 * scale }]}>
                    {current.label}
                  </Text>
                )}
                <View style={[styles.track, { marginTop: 34 * scale, width: 192 * scale, height: 7 * scale }]}>
                  <LinearGradient
                    colors={["#A9A9A9", "#6C6C6C"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.bar, { width: `${Math.min(1, Math.max(0, progress)) * 100}%` }]}
                  />
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="연동 화면 닫기"
            onPress={onCancel}
            style={[styles.close, { top: insets.top + 5, right: Math.max(0, 31 * scale - 22) }]}>
            <Image source={ASSETS.close} contentFit="contain" style={styles.closeIcon} />
          </Pressable>
        </>
      ) : (
        <View style={styles.doneWrap}>
          <Text style={[styles.doneText, { fontSize: 31 * scale, lineHeight: 33 * scale }]}>
            인증 완료!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: ADMIN_APP_FRAME_MAX_WIDTH,
    alignSelf: "center",
    overflow: "hidden",
    backgroundColor: Colors.card,
  },
  safeArea: { flex: 1 },
  backgroundCanvas: {
    position: "absolute",
    left: 0,
    top: 0,
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
    transformOrigin: "top left",
  },
  lowerBackground: {
    position: "absolute",
    left: 0,
    top: 0,
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
  },
  upperBackground: {
    position: "absolute",
    left: 0,
    top: 0,
    width: DESIGN_WIDTH,
    height: 771,
  },
  close: {
    position: "absolute",
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: { width: 15, height: 15 },
  title: { fontFamily: pretendard(700), color: "#222222", includeFontPadding: false },
  subtitle: { fontFamily: pretendard(500), color: "#818181", includeFontPadding: false },
  stage: { alignItems: "center" },
  imageSlot: { alignItems: "center", alignSelf: "stretch" },
  label: {
    fontFamily: pretendard(600),
    color: "#525252",
    textAlign: "center",
    includeFontPadding: false,
  },
  track: { borderRadius: 9, backgroundColor: "#D9D9D9", overflow: "hidden" },
  bar: { height: "100%", borderTopLeftRadius: 9, borderBottomLeftRadius: 9 },
  doneWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  doneText: {
    fontFamily: pretendard(700),
    color: "#222222",
    textAlign: "center",
    includeFontPadding: false,
    transform: [{ translateX: 0.5 }, { translateY: 0.5 }],
  },
});
