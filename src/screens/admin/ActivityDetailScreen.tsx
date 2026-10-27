import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { ActivityDetailNavigation } from '@/components/admin/ActivityDetailNavigation';
import { PostingFlowHeader } from '@/components/admin/PostingFlowHeader';
import { fetchParticipants } from '@/services/admin/participants';
import { pretendard } from '@/styles/common/fonts';
import type { Participant, ParticipantStatus } from '@/types/admin';

const ICONS = {
  total: require('@/assets/admin/activity-detail/participants.svg'),
  ongoing: require('@/assets/admin/activity-detail/ongoing.svg'),
  done: require('@/assets/admin/activity-detail/completed.svg'),
  back: require('@/assets/admin/activity-detail/back.svg'),
  divider: require('@/assets/admin/activity-detail/divider.svg'),
};

const STATUS: Record<ParticipantStatus, { label: string; color: string }> = {
  ongoing: { label: '진행 중', color: '#59A76A' },
  done: { label: '완료', color: '#5972A7' },
  none: { label: '미참여', color: '#606060' },
};

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    let mounted = true;
    fetchParticipants(id).then((result) => {
      if (mounted) setParticipants(result);
    });
    return () => { mounted = false; };
  }, [id]);

  return <ActivityDetailView participants={participants} />;
}

export function ActivityDetailView({ participants }: { participants: Participant[] }) {
  const count = (status: ParticipantStatus) =>
    participants.filter((participant) => participant.status === status).length;

  return (
    <View style={styles.container}>
      <PostingFlowHeader
        title="상세보기"
        fallbackHref="/admin"
        style={styles.header}
        barStyle={styles.headerBar}
        backButtonStyle={styles.backButton}
        backIcon={<Image source={ICONS.back} style={styles.backIcon} contentFit="contain" />}
      />
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>참여자 현황</Text>
        <View style={styles.statsRow}>
          <Stat icon={ICONS.total} label="총 참여" value={participants.length} labelColor="#606060" valueColor="#222222" />
          <Stat icon={ICONS.ongoing} label="진행 중" value={count('ongoing')} labelColor={STATUS.ongoing.color} valueColor={STATUS.ongoing.color} />
          <Stat icon={ICONS.done} label="완료" value={count('done')} labelColor={STATUS.done.color} valueColor={STATUS.done.color} />
        </View>
      </View>

      <View style={styles.listCard}>
        <Text style={styles.listTitle}>참여자 목록</Text>
        <FlatList
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false}
          data={participants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text numberOfLines={1} style={styles.name}>{item.name}</Text>
              <Text numberOfLines={1} style={styles.department}>{item.department}</Text>
              <Text style={[styles.status, { color: STATUS[item.status].color }]}>{STATUS[item.status].label}</Text>
              <View pointerEvents="none" style={styles.dividerSlot}>
                <Image source={ICONS.divider} contentFit="contain" style={styles.divider} />
              </View>
            </View>
          )}
        />
      </View>
      <ActivityDetailNavigation />
    </View>
  );
}

function Stat({ icon, label, value, labelColor, valueColor }: {
  icon: number;
  label: string;
  value: number;
  labelColor: string;
  valueColor: string;
}) {
  return (
    <View style={styles.stat}>
      <Image source={icon} contentFit="contain" style={styles.statIcon} />
      <Text style={[styles.statLabel, { color: labelColor }]}>{label}</Text>
      <Text style={[styles.statValue, { color: valueColor }]}>{value}명</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9FB' },
  header: { backgroundColor: '#F9F9FB' },
  headerBar: { height: 50 },
  backButton: { left: 2.5 },
  backIcon: { width: 10.5, height: 19.5 },
  statsCard: {
    height: 170,
    flexShrink: 0,
    marginLeft: 34,
    marginRight: 26,
    marginTop: 30,
    marginBottom: 22,
    paddingTop: 18,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D2D2D2',
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statsTitle: {
    fontFamily: pretendard(600),
    fontSize: 13,
    lineHeight: 18.2,
    letterSpacing: -0.325,
    color: '#000000',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingRight: 25,
    marginTop: 23.8,
  },
  stat: { width: 54, alignItems: 'center', gap: 8 },
  statIcon: { width: 24, height: 24 },
  statLabel: {
    fontFamily: pretendard(500),
    fontSize: 12,
    lineHeight: 16.8,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  statValue: {
    fontFamily: pretendard(600),
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  listCard: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    paddingTop: 20,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  listTitle: {
    fontFamily: pretendard(600),
    fontSize: 13,
    lineHeight: 18.2,
    letterSpacing: -0.325,
    color: '#000000',
    marginBottom: 19.8,
  },
  row: { height: 38, flexDirection: 'row', alignItems: 'flex-start' },
  name: {
    width: '39.46%',
    fontFamily: pretendard(600),
    fontSize: 13,
    lineHeight: 18.2,
    letterSpacing: -0.325,
    color: '#222222',
  },
  department: {
    flex: 1,
    fontFamily: pretendard(400),
    fontSize: 13,
    lineHeight: 18.2,
    letterSpacing: -0.325,
    color: '#606060',
  },
  status: {
    width: 40,
    fontFamily: pretendard(400),
    fontSize: 13,
    lineHeight: 18.2,
    letterSpacing: -0.325,
    textAlign: 'center',
  },
  dividerSlot: { position: 'absolute', top: 28, left: 0, right: 0, overflow: 'hidden' },
  divider: { width: 332.5, height: 0.5 },
});
