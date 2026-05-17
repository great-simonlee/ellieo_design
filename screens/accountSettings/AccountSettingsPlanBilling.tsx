import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, space, type } from '../../design/theme';
import {
  SettingsInsetCard,
  SettingsScaffold,
  captionMuted,
  fieldFill,
  ink,
  muted,
} from './AccountSettingsShared';

export function AccountSettingsPlanBilling({ onBack }: { onBack: () => void }) {
  return (
    <SettingsScaffold title='Plan & Billing' onBack={onBack}>
      <SettingsInsetCard>
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>Current plan</Text>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>No active plan</Text>
          </View>
        </View>

        <View style={styles.statsBox}>
          <View style={styles.statCol}>
            <Ionicons name='cash-outline' size={18} color={captionMuted} />
            <Text style={styles.statLabel}>Credits</Text>
            <Text style={styles.statValue}>0</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Ionicons name='calendar-outline' size={18} color={captionMuted} />
            <Text style={styles.statLabel}>Next billing</Text>
            <Text style={styles.statValue}>—</Text>
          </View>
        </View>

        <View style={styles.linkDivider} />
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='View plans'
          style={({ pressed }) => [styles.linkRow, pressed && styles.linkRowPressed]}
        >
          <Text style={styles.linkLabel}>View plans</Text>
          <Ionicons name='chevron-forward' size={20} color='rgba(60,60,67,0.45)' />
        </Pressable>
        <View style={styles.innerDivider} />
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Billing activity'
          style={({ pressed }) => [styles.linkRow, pressed && styles.linkRowPressed]}
        >
          <Text style={styles.linkLabel}>Billing activity</Text>
          <Ionicons name='chevron-forward' size={20} color='rgba(60,60,67,0.45)' />
        </Pressable>
      </SettingsInsetCard>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.md,
  },
  planTitle: {
    fontSize: type.bodyLarge,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.25,
  },
  planBadge: {
    paddingVertical: 4,
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    backgroundColor: fieldFill,
  },
  planBadgeText: {
    fontSize: type.micro,
    fontWeight: '700',
    color: muted,
    letterSpacing: -0.02,
  },
  statsBox: {
    flexDirection: 'row',
    marginHorizontal: space.lg,
    marginBottom: space.lg,
    borderRadius: radius.md,
    backgroundColor: fieldFill,
    overflow: 'hidden',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: space.md,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(60,60,67,0.14)',
  },
  statLabel: {
    fontSize: type.micro,
    fontWeight: '600',
    color: muted,
    letterSpacing: -0.02,
  },
  statValue: {
    fontSize: type.title,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.35,
  },
  linkDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(60,60,67,0.12)',
    marginHorizontal: space.lg,
  },
  innerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(60,60,67,0.12)',
    marginHorizontal: space.lg,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.md + 2,
    paddingHorizontal: space.lg,
  },
  linkRowPressed: {
    backgroundColor: 'rgba(47,109,246,0.05)',
  },
  linkLabel: {
    fontSize: type.body,
    fontWeight: '600',
    color: ink,
    letterSpacing: -0.12,
  },
});
