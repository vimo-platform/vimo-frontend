import Ionicons from "@expo/vector-icons/Ionicons";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";

import { PostingInfoIcon, type PostingInfoIconType } from "@/components/common/PostingInfoIcon";
import { Colors } from "@/styles/admin/theme";
import { pretendard } from "@/styles/common/fonts";

type Props = {
  title: string;
  hoursPerSession: number;
  location: string;
  period: string;
  time: string;
  onPress?: () => void;
  right?: ReactNode;
  children?: ReactNode;
  cardStyle?: StyleProp<ViewStyle>;
  titleRowStyle?: StyleProp<ViewStyle>;
  hoursStyle?: StyleProp<TextStyle>;
  infoRowStyle?: StyleProp<ViewStyle>;
  infoIconSlotStyle?: StyleProp<ViewStyle>;
};

export function ActivityCard({
  title,
  hoursPerSession,
  location,
  period,
  time,
  onPress,
  right,
  children,
  cardStyle,
  titleRowStyle,
  hoursStyle,
  infoRowStyle,
  infoIconSlotStyle,
}: Props) {
  return (
    <View style={[styles.card, cardStyle]}>
      <Pressable style={[styles.titleRow, titleRowStyle]} onPress={onPress} disabled={!onPress}>
        <Text style={styles.title}>{title}</Text>
        {right ?? (onPress ? <Ionicons name="chevron-forward" size={20} color={Colors.text} /> : null)}
      </Pressable>
      <Text style={[styles.hours, hoursStyle]}>봉사 인정 시간 : 회차당 {hoursPerSession}시간 인정</Text>
      <InfoRow
        icon="location"
        text={location}
        rowStyle={infoRowStyle}
        iconSlotStyle={infoIconSlotStyle}
      />
      <InfoRow
        icon="calendar"
        text={period}
        rowStyle={infoRowStyle}
        iconSlotStyle={infoIconSlotStyle}
      />
      <InfoRow
        icon="clock"
        text={time}
        rowStyle={infoRowStyle}
        iconSlotStyle={infoIconSlotStyle}
      />
      {children}
    </View>
  );
}

function InfoRow({
  icon,
  text,
  rowStyle,
  iconSlotStyle,
}: {
  icon: PostingInfoIconType;
  text: string;
  rowStyle?: StyleProp<ViewStyle>;
  iconSlotStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.infoRow, rowStyle]}>
      <View style={[styles.infoIconSlot, iconSlotStyle]}>
        <PostingInfoIcon type={icon} color={Colors.textSecondary} />
      </View>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    // 유저 봉사카드(VolunteerPostCard)와 동일한 테두리/사이즈: 라운드 25 + 부드러운 그림자
    backgroundColor: Colors.card,
    borderRadius: 25,
    paddingVertical: 24,
    paddingHorizontal: 22,
    shadowColor: "#D9DCE1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    flex: 1,
    fontFamily: pretendard(800),
    fontSize: 15,
    color: Colors.text,
  },
  hours: {
    fontFamily: pretendard(500),
    fontSize: 12,
    color: Colors.text,
    marginTop: 4,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  infoIconSlot: {
    width: 16,
    alignItems: "center",
  },
  infoText: {
    fontFamily: pretendard(500),
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
