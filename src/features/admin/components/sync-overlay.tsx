import type { ComponentProps } from "react";
import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { Figma } from "@/features/admin/components/figma";
import { Colors } from "@/features/admin/constants/theme";

type Step = { icon: ComponentProps<typeof Figma>["name"]; label: string };

const STEPS: Step[] = [
  { icon: "syncLog", label: "디지털 활동 로그 확인 완료" },
  { icon: "syncClock", label: "출석 인증 완료" },
  { icon: "syncPeople", label: "봉사 시간 계산 완료" },
  { icon: "syncUpload", label: "학사 DB 전송 중..." },
];

export function SyncOverlay({
  visible,
  onComplete,
  onCancel,
}: {
  visible: boolean;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(0);
  // 진행 바 채움 비율 (0~1). 단계가 넘어갈 때마다 다음 구간까지 부드럽게 채움
  const [progress, setProgress] = useState(0);

  // onComplete는 부모에서 매 렌더마다 새로 생성되므로 ref로 고정한다.
  // (effect 의존성에 넣으면 progress 갱신 리렌더마다 타이머가 리셋되어 단계가 멈춘다)
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!visible) {
      setStep(0);
      setProgress(0);
      return;
    }

    // 모든 단계 완료 → 잠시 "인증 완료!"를 보여준 뒤 콜백
    if (step >= STEPS.length) {
      const done = setTimeout(() => onCompleteRef.current(), 700);
      return () => clearTimeout(done);
    }

    // 현재 구간을 900ms 동안 부드럽게 채운다
    const from = step / STEPS.length;
    const to = (step + 1) / STEPS.length;
    const start = Date.now();
    const fill = setInterval(() => {
      const f = Math.min(1, (Date.now() - start) / 900);
      setProgress(from + (to - from) * f);
      if (f >= 1) clearInterval(fill);
    }, 30);

    // 1초마다 다음 단계(아이콘/문구)로 전환
    const next = setTimeout(() => setStep((s) => s + 1), 1000);

    return () => {
      clearInterval(fill);
      clearTimeout(next);
    };
  }, [visible, step]);

  const done = step >= STEPS.length;
  const current = STEPS[step];

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.container}>
        {done ? (
          <View style={styles.doneWrap}>
            <Text style={styles.doneText}>인증 완료!</Text>
          </View>
        ) : (
          <>
            <Pressable style={styles.close} onPress={onCancel} hitSlop={10}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </Pressable>
            <Text style={styles.title}>학사 시스템과{"\n"}자동 연동하고 있어요</Text>
            <Text style={styles.subtitle}>
              지금 화면을 나가면 인증이 중단될 수 있어요.{"\n"}잠시만 기다려주세요.
            </Text>
            <View style={styles.center}>
              <Figma name={current.icon} scale={0.7} />
              <Text style={styles.label}>{current.label}</Text>
              <View style={styles.track}>
                <View style={[styles.bar, { width: `${progress * 100}%` }]} />
              </View>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.card,
    paddingTop: 60,
    paddingHorizontal: 28,
    alignItems: "center",
  },
  close: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 19,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  track: {
    width: 180,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EDEDED",
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#818181",
  },
  doneWrap: {
    flex: 1,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
  },
  doneText: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
  },
});
