import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { Figma } from "@/components/figma";
import { Colors } from "@/constants/theme";

type Step = { icon: ComponentProps<typeof Figma>["name"]; label: string; progress?: boolean };

const STEPS: Step[] = [
  { icon: "syncLog", label: "디지털 활동 로그 확인 완료" },
  { icon: "syncClock", label: "출석 인증 완료" },
  { icon: "syncPeople", label: "봉사 시간 계산 완료" },
  { icon: "syncUpload", label: "학사 DB 전송 중...", progress: true },
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

  useEffect(() => {
    if (!visible) {
      setStep(0);
      return;
    }
    const t = setTimeout(() => {
      if (step >= STEPS.length) onComplete();
      else setStep(step + 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [visible, step, onComplete]);

  const done = step >= STEPS.length;
  const current = STEPS[step];

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.container}>
        {done ? (
          <Text style={styles.doneText}>인증 완료!</Text>
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
              {current.progress && (
                <View style={styles.track}>
                  <View style={styles.bar} />
                </View>
              )}
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
    width: "60%",
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#818181",
  },
  doneText: {
    flex: 1,
    fontSize: 26,
    fontWeight: "800",
    color: Colors.text,
    textAlignVertical: "center",
    textAlign: "center",
  },
});
