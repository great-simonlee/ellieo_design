import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ListingProgressBlock } from '../../components/ListingProgressBlock';
import { OnboardingNavHeader } from '../../components/OnboardingNavHeader';
import { useOnboardingCtaLayout } from '../../design/onboardingCtaLayout';
import { colors, radius, space, type } from '../../design/theme';
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
  embedInUnifiedList?: boolean;
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
  embedInUnifiedList = false,
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

  const chipsForm = (
        <View style={[styles.contentNarrow, { maxWidth: contentMaxW }]}>
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
  );

  if (embedInUnifiedList) {
    return (
      <ScrollView
        scrollEnabled={false}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: pageBg }}
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={{
          paddingTop: space.lg,
          paddingBottom: space.xxl,
          paddingHorizontal: padH,
        }}
      >
        {chipsForm}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style='dark' />
      <OnboardingNavHeader padH={padH} onBack={onBack} onClose={onClose} />

      <ListingProgressBlock
        padH={padH}
        step={step}
        title={progressCaptionSuffix}
        progressRatio={progressFraction}
      />

      <ScrollView
        style={styles.flex}
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={{
          paddingTop: space.sm,
          paddingBottom: insets.bottom + BOTTOM_CTA_SCROLL_CLEARANCE,
          paddingHorizontal: padH,
        }}
        showsVerticalScrollIndicator={false}
      >
        {chipsForm}
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
  flex: {
    flex: 1,
  },
  contentNarrow: {
    width: '100%',
    alignSelf: 'center',
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
