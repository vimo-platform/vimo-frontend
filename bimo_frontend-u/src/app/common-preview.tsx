import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ApplicationStatusButton,
  BottomActionBar,
  Button,
  Gnb,
  NoticeChip,
  ParticipationButton,
  ScheduleButton,
  StatusBadge,
  Tag,
  TopBar,
  VerificationBadge,
} from '@/components/common';

export default function CommonPreviewScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Common Components</Text>

        <Section title="Buttons">
          <Button />
          <View style={styles.row}>
            <Button label="취소" variant="scheduleCancel" />
            <Button label="이대로 등록" variant="scheduleSubmit" />
          </View>
          <View style={styles.row}>
            <ParticipationButton />
            <ParticipationButton variant="end" />
          </View>
        </Section>

        <Section title="Tags">
          <View style={styles.row}>
            <Tag label="디자인" />
            <Tag label="행사 운영" selected />
          </View>
          <View style={styles.row}>
            <Tag label="직접 작성" variant="editable" />
            <Tag label="직접 작성" variant="editable" selected />
          </View>
        </Section>

        <Section title="Badges">
          <View style={styles.row}>
            <StatusBadge status="before" />
            <StatusBadge status="active" />
          </View>
          <View style={styles.row}>
            <VerificationBadge status="pending" />
            <VerificationBadge status="completeWithCount" />
          </View>
          <View style={styles.row}>
            <VerificationBadge status="syncing" />
            <VerificationBadge status="complete" />
          </View>
        </Section>

        <Section title="Cards And Chips">
          <ScheduleButton />
          <NoticeChip label="매주 금요일 정기 참여 가능자 우대" />
          <View style={styles.row}>
            <ApplicationStatusButton />
            <ApplicationStatusButton hovered />
          </View>
        </Section>

        <Section title="Bars">
          <TopBar />
          <BottomActionBar />
          <Gnb />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  pageTitle: {
    alignSelf: 'stretch',
    color: '#111111',
    fontSize: 24,
    fontWeight: '700',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    alignSelf: 'stretch',
    color: '#606060',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionContent: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
});
