import { Pressable } from "react-native";
import { Image, type ImageStyle } from "expo-image";

import { Badge } from "@/features/admin/components/badge";
import type { SessionStatus } from "@/features/admin/types";

const ASSETS = {
  gnb: [require("@/assets/admin/GNB.svg"), 453, 162],
  statusBefore: [require("@/assets/admin/시작 전.png"), 61, 32],
  statusOngoing: [require("@/assets/admin/활동 중.svg"), 61, 32],
  qrCreated: [require("@/assets/admin/새로운 QR이 생성되었습니다.svg"), 206, 31],
  toggleOff: [require("@/assets/admin/버튼 클릭 전.svg"), 46, 32],
  toggleOn: [require("@/assets/admin/버튼 클릭.svg"), 46, 32],
  loading: [require("@/assets/admin/공고로딩중.svg"), 168, 160],
  bookmark: [require("@/assets/admin/임시저장 이모티콘.svg"), 35, 35],
  syncLog: [require("@/assets/admin/Mask.svg"), 228, 152],
  syncClock: [require("@/assets/admin/clock.svg"), 244, 163],
  syncPeople: [require("@/assets/admin/time.svg"), 228, 152],
  syncUpload: [require("@/assets/admin/upload.svg"), 228, 152],
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
      contentFit={name === "gnb" ? "fill" : "contain"}
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
