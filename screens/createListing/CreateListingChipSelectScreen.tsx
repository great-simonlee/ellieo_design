import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboardingCtaLayout } from '../../design/onboardingCtaLayout';
import { colors, gradientPrimaryHorizontal, radius, space, type } from '../../design/theme';
import { CreateListingPrimaryCta } from './CreateListingPrimaryCta';
import {
  BOTTOM_CTA_SCROLL_CLEARANCE,
  captionMuted,
  fieldBorder,
  fieldFill,
  ink,
  labelSecondary,
  LISTING_TOTAL_STEPS,
  pageBg,
  progressTrackBg,
  white,
} from './createListingTokens';
import type { ListingChipDef } from './listingStepChipsData';

export type ChipSection = { title: string; items: ListingChipDef[] };

export type CreateListingChipSelectScreenProps = {
  step: number;
  progressCaptionSuffix: string;
  sections: ChipSection[];
  onClose: () => void;
  onBack: () => void;
  onContinue: () => void;
  requireAtLeastOne?: boolean;
  requireEachSection?: boolean;
};

export function CreateListingChipSelectScreen({
  step,
  progressCaptionSuffix,
  sections,
  onClose,
  onBack,
  onContinue,
  requireAtLeastOne = true,
  requireEachSection = false,
}: CreateListingChipSelectScreenProps) {
  const insets = useSafeAreaInsets();
  const { padH, contentMaxW, primaryButtonWidth } = useOnboardingCtaLayout();
  const innerW = contentMaxW;

  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const stepValid = useMemo(() => {
    if (requireEachSection && sections.length > 0) {
      return sections.every((sec) => sec.items.some((item) => selected.has(item.id)));
    }
    if (!requireAtLeastOne) return true;
    return selected.size > 0;
  }, [requireAtLeastOne, requireEachSection, sections, selected]);

  const progressFraction = step / LISTING_TOTAL_STEPS;
  const chipGap = space.sm;

  return (
    <View style={styles.root}>
      <StatusBar style='dark' />
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: insets.top + space.md,
            paddingHorizontal: padH,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Go back'
            hitSlop={10}
            onPress={onBack}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.headerButtonPressed,
            ]}
          >
            <Ionicons name='arrow-back' size={22} color={ink} />
          </Pressable>
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Close'
            hitSlop={10}
            onPress={onClose}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.headerButtonPressed,
            ]}
          >
            <Ionicons name='close' size={22} color={ink} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: space.sm,
          paddingBottom: insets.bottom + BOTTOM_CTA_SCROLL_CLEARANCE,
          paddingHorizontal: padH,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentNarrow, { maxWidth: contentMaxW }]}>
          <View style={[styles.progressBlock, { width: innerW, alignSelf: 'center' }]}>
            <View style={styles.progressTrackShell}>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={gradientPrimaryHorizontal}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, progressFraction * 100)}%` },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.progressCaption}>
              {`Step ${step} of ${LISTING_TOTAL_STEPS} · ${progressCaptionSuffix}`}
            </Text>
          </View>

          {sections.map((section, sectionIndex) => (
            <View
              key={section.title}
              style={[
                styles.sectionBlock,
                { width: innerW, alignSelf: 'center' },
                sectionIndex < sections.length - 1 && styles.sectionBlockSpacing,
              ]}
            >
              <Text style={styles.sectionTitle}>{section.title}</Text>

              <View style={[styles.pillWrap, { gap: chipGap }]}>
                {section.items.map((item) => {
                  const isOn = selected.has(item.id);
                  return (
                    <Pressable
                      key={item.id}
                      accessibilityRole='checkbox'
                      accessibilityState={{ checked: isOn }}
                      onPress={() => toggle(item.id)}
                      style={({ pressed }) => [
                        styles.pill,
                        isOn && styles.pillSelected,
                        pressed && styles.pillPressed,
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={17}
                        color={isOn ? colors.primary : captionMuted}
                        style={styles.pillIcon}
                      />
                      <Text style={[styles.pillLabel, isOn && styles.pillLabelSelected]} numberOfLines={2}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View
        pointerEvents='box-none'
        style={[styles.bottomDock, { paddingBottom: insets.bottom + space.md }]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.97)', white]}
          style={StyleSheet.absoluteFill}
        />
        <CreateListingPrimaryCta
          label='Continue'
          disabled={!stepValid}
          onPress={onContinue}
          width={primaryButtonWidth}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: pageBg,
  },
  headerBar: {
    backgroundColor: pageBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60, 60, 67, 0.1)',
    zIndex: 2,
  },
  headerRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: fieldFill,
    borderWidth: 1,
    borderColor: 'rgba(60, 60, 67, 0.08)',
  },
  headerButtonPressed: {
    opacity: 0.75,
  },
  contentNarrow: {
    width: '100%',
    alignSelf: 'center',
  },
  progressBlock: {
    marginBottom: space.xl,
  },
  progressTrackShell: {
    padding: 2,
    borderRadius: 6,
    backgroundColor: fieldFill,
    borderWidth: 1,
    borderColor: fieldBorder,
  },
  progressTrack: {
    height: 4,
    borderRadius: 3,
    backgroundColor: progressTrackBg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressCaption: {
    marginTop: space.sm,
    fontSize: type.caption,
    fontWeight: '600',
    color: labelSecondary,
    letterSpacing: -0.08,
  },
  /** No card border — sections sit flush on the page like the reference. */
  sectionBlock: {},
  sectionBlockSpacing: {
    marginBottom: space.xxl,
  },
  sectionTitle: {
    fontSize: type.bodyLarge,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.35,
    marginBottom: space.md,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingVertical: 11,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: white,
    borderWidth: 1,
    borderColor: fieldBorder,
  },
  pillSelected: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    backgroundColor: 'rgba(47, 109, 246, 0.04)',
  },
  pillPressed: {
    opacity: 0.88,
  },
  pillIcon: {
    marginRight: space.sm,
  },
  pillLabel: {
    flexShrink: 1,
    fontSize: type.body,
    fontWeight: '500',
    color: ink,
    letterSpacing: -0.2,
  },
  pillLabelSelected: {
    fontWeight: '600',
    color: ink,
  },
  bottomDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingTop: space.xl,
  },
});
