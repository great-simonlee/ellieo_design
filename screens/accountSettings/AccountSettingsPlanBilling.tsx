import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  colors,
  gradientPrimaryHorizontal,
  radius,
  space,
  type,
} from '../../design/theme';
import {
  SettingsInsetCard,
  SettingsScaffold,
  captionMuted,
  ink,
  labelSecondary,
  muted,
} from './AccountSettingsShared';

const planCardShadow = Platform.select({
  ios: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
  },
  android: { elevation: 4 },
});

function PlanMetric({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metricTile}>
      <View style={styles.metricIconWrap}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

export function AccountSettingsPlanBilling({ onBack }: { onBack: () => void }) {
  const hasActivePlan = false;
  const credits = 0;
  const nextBilling = '—';

  return (
    <SettingsScaffold
      heroHeader
      title='Plan & Billing'
      subtitle='See your current plan, credits, and billing activity.'
      onBack={onBack}
    >
      <View style={styles.planCard}>
        <LinearGradient
          colors={['#EEF3FF', '#F7FAFF', '#FFFFFF']}
          locations={[0, 0.45, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.planCardInner}>
          <View style={styles.planTopRow}>
            <Text style={styles.planKicker}>Current plan</Text>
            <View
              style={[
                styles.statusPill,
                hasActivePlan && styles.statusPillActive,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  hasActivePlan && styles.statusDotActive,
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  hasActivePlan && styles.statusTextActive,
                ]}
              >
                {hasActivePlan ? 'Active' : 'No plan'}
              </Text>
            </View>
          </View>

          <View style={styles.planHero}>
            <LinearGradient
              colors={gradientPrimaryHorizontal}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.planHeroIconRing}
            >
              <View style={styles.planHeroIconCore}>
                <Ionicons
                  name={hasActivePlan ? 'ribbon-outline' : 'sparkles'}
                  size={28}
                  color={colors.primary}
                />
              </View>
            </LinearGradient>
            <Text style={styles.planHeroTitle}>
              {hasActivePlan ? 'Ellieo Plus' : 'No active plan yet'}
            </Text>
            <Text style={styles.planHeroHint}>
              {hasActivePlan
                ? 'Your subscription renews automatically each month.'
                : 'Choose a plan to unlock credits and start matching faster.'}
            </Text>
          </View>

          <View style={styles.metricsRow}>
            <PlanMetric
              icon='flash-outline'
              label='Credits'
              value={String(credits)}
            />
            <View style={styles.metricDivider} />
            <PlanMetric
              icon='calendar-outline'
              label='Next billing'
              value={nextBilling}
            />
          </View>

          <Pressable
            accessibilityRole='button'
            accessibilityLabel='View plans'
            style={({ pressed }) => [
              styles.planCta,
              pressed && styles.planCtaPressed,
            ]}
          >
            <LinearGradient
              colors={gradientPrimaryHorizontal}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.planCtaGrad}
            >
              <Text style={styles.planCtaLabel}>View plans</Text>
              <Ionicons name='arrow-forward' size={18} color='#FFFFFF' />
            </LinearGradient>
          </Pressable>
        </View>
      </View>

      <SettingsInsetCard>
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Billing activity'
          style={({ pressed }) => [
            styles.activityRow,
            pressed && styles.activityRowPressed,
          ]}
        >
          <View style={styles.activityIconWrap}>
            <Ionicons name='receipt-outline' size={20} color={colors.primary} />
          </View>
          <View style={styles.activityCopy}>
            <Text style={styles.activityTitle}>Billing activity</Text>
            <Text style={styles.activityMeta}>
              Invoices, payments, and receipts
            </Text>
          </View>
          <Ionicons
            name='chevron-forward'
            size={20}
            color='rgba(60,60,67,0.45)'
          />
        </Pressable>
      </SettingsInsetCard>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  planCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(47, 109, 246, 0.14)',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    ...planCardShadow,
  },
  planCardInner: {
    padding: space.lg,
    gap: space.lg,
  },
  planTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planKicker: {
    fontSize: type.micro,
    fontWeight: '700',
    color: captionMuted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: space.sm + 2,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(60, 60, 67, 0.08)',
  },
  statusPillActive: {
    backgroundColor: 'rgba(47, 109, 246, 0.1)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: captionMuted,
  },
  statusDotActive: {
    backgroundColor: colors.primary,
  },
  statusText: {
    fontSize: type.micro,
    fontWeight: '700',
    color: muted,
    letterSpacing: -0.02,
  },
  statusTextActive: {
    color: colors.primary,
  },
  planHero: {
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.xs,
  },
  planHeroIconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    marginBottom: space.xs,
  },
  planHeroIconCore: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planHeroTitle: {
    fontSize: type.title,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.45,
    textAlign: 'center',
  },
  planHeroHint: {
    fontSize: type.caption,
    lineHeight: 18,
    fontWeight: '400',
    color: labelSecondary,
    letterSpacing: -0.1,
    textAlign: 'center',
    maxWidth: 280,
    paddingHorizontal: space.md,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(47, 109, 246, 0.08)',
  },
  metricTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
    gap: 4,
  },
  metricIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(47, 109, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: type.micro,
    fontWeight: '600',
    color: muted,
    letterSpacing: -0.02,
  },
  metricValue: {
    fontSize: type.bodyLarge,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.35,
  },
  metricDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(47, 109, 246, 0.12)',
    marginVertical: space.md,
  },
  planCta: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  planCtaPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  planCtaGrad: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.xl,
  },
  planCtaLabel: {
    fontSize: type.body,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md + 2,
    paddingHorizontal: space.lg,
  },
  activityRowPressed: {
    backgroundColor: 'rgba(47, 109, 246, 0.05)',
  },
  activityIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(47, 109, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCopy: {
    flex: 1,
    gap: 2,
  },
  activityTitle: {
    fontSize: type.body,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.15,
  },
  activityMeta: {
    fontSize: type.caption,
    fontWeight: '400',
    color: labelSecondary,
    letterSpacing: -0.08,
  },
});
