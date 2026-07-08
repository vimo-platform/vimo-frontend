import { Pressable } from "react-native";
import { Image, type ImageStyle } from "expo-image";

import { Badge } from "@/components/badge";
import type { SessionStatus } from "@/types";

const ASSETS = {
  gnb: [require("@/assets/GNB.svg"), 453, 162],
  statusBefore: [require("@/assets/시작 전.png"), 61, 32],
  statusOngoing: [require("@/assets/활동 중.svg"), 61, 32],
  qrCreated: [require("@/assets/새로운 QR이 생성되었습니다.svg"), 206, 31],
  toggleOff: [require("@/assets/버튼 클릭 전.svg"), 46, 32],
  toggleOn: [require("@/assets/버튼 클릭.svg"), 46, 32],
  loading: [require("@/assets/공고로딩중.svg"), 168, 160],
  bookmark: [require("@/assets/임시저장 이모티콘.svg"), 35, 35],
} as const;

type Props = {
  name: keyof typeof ASSETS;
  scale?: number;
  style?: ImageStyle;
};

export function Figma({ name, scale = 1, style }: Props) {
  const [source, width, height] = ASSETS[name];
  return (
    <Image
      source={source}
      style={[{ width: width * scale, height: height * scale }, style]}
      contentFit="contain"
    />
  );
}

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  if (status === "before") return <Figma name="statusBefore" scale={0.8} />;
  if (status === "ongoing") return <Figma name="statusOngoing" scale={0.8} />;
  return <Badge label="종료" />;
}

export function ImageToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle}>
      <Figma name={on ? "toggleOn" : "toggleOff"} />
    </Pressable>
  );
}
