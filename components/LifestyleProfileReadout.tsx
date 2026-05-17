import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  LIFESTYLE_SECTIONS,
  type LifestyleOptionConfig,
  type LifestyleSectionConfig,
} from '../screens/PersonalOnboardingScreenSeven';
import { colors, radius, space, type } from '../design/theme';

const ink = '#0F172A';
const inkSoft = '#64748B';

type Selections = Partial<Record<string, string>>;

function normalizeTag(value: string): string {
  return value.trim().toLowerCase();
}

/** Design-only mapping from roommate card tags → onboarding lifestyle picks. */
const TAG_TO_SELECTION: Record<string, { sectionId: string; optionId: string }> = {
  'early bird': { sectionId: 'sleep', optionId: 'early' },
  'night owl': { sectionId: 'sleep', optionId: 'night' },
  'flexible sleep': { sectionId: 'sleep', optionId: 'flex' },
  flexible: { sectionId: 'sleep', optionId: 'flex' },
  introvert: { sectionId: 'social', optionId: 'introvert' },
  extrovert: { sectionId: 'social', optionId: 'extrovert' },
  social: { sectionId: 'social', optionId: 'extrovert' },
  'very tidy': { sectionId: 'clean', optionId: 'tidy' },
  'moderate clean': { sectionId: 'clean', optionId: 'mod' },
  'relaxed clean': { sectionId: 'clean', optionId: 'relaxed' },
  'rarely hosts': { sectionId: 'guests', optionId: 'rarely' },
  'occasional guests': { sectionId: 'guests', optionId: 'sometimes' },
  active: { sectionId: 'workout', optionId: 'active' },
  quiet: { sectionId: 'noise', optionId: 'quiet' },
  'pet friendly': { sectionId: 'pet', optionId: 'dog' },
  'no pets': { sectionId: 'pet', optionId: 'other' },
  'sometimes cooks': { sectionId: 'cook', optionId: 'some' },
  'rarely cooks': { sectionId: 'cook', optionId: 'rare' },
  creative: { sectionId: 'noise', optionId: 'lively' },
};

function matchOptionByLabel(
  sections: LifestyleSectionConfig[],
  tag: string,
): { sectionId: string; optionId: string } | null {
  const norm = normalizeTag(tag);
  for (const section of sections) {
    for (const opt of section.options) {
      const label = normalizeTag(opt.label);
      if (norm === label || norm.includes(label) || label.includes(norm)) {
        return { sectionId: section.id, optionId: opt.id };
      }
    }
  }
  return null;
}

export function resolveLifestyleSelectionsFromTags(tags: string[]): Selections {
  const selections: Selections = {};

  for (const raw of tags) {
    const norm = normalizeTag(raw);
    const alias = TAG_TO_SELECTION[norm];
    const hit = alias ?? matchOptionByLabel(LIFESTYLE_SECTIONS, raw);
    if (hit) {
      selections[hit.sectionId] = hit.optionId;
    }
  }

  return selections;
}

function stableIndex(seed: string, modulo: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % modulo;
}

/** One pick per PersonalOnboardingScreenSeven category (tags + stable fill-ins). */
export function resolveFullLifestyleSelections(
  tags: string[],
  profileId = 'default',
): Selections {
  const selections = resolveLifestyleSelectionsFromTags(tags);

  for (const section of LIFESTYLE_SECTIONS) {
    if (selections[section.id]) continue;
    const idx = stableIndex(`${profileId}:${section.id}`, section.options.length);
    selections[section.id] = section.options[idx]!.id;
  }

  return selections;
}

function optionForSection(
  section: LifestyleSectionConfig,
  selections: Selections,
): LifestyleOptionConfig | null {
  const optionId = selections[section.id];
  if (!optionId) return null;
  return section.options.find((o) => o.id === optionId) ?? null;
}

type LifestyleProfileReadoutProps = {
  tags: string[];
  profileId: string;
};

/** Compact lifestyle tags — onboarding icons, one chip per category. */
export function LifestyleProfileReadout({ tags, profileId }: LifestyleProfileReadoutProps) {
  const selections = resolveFullLifestyleSelections(tags, profileId);

  return (
    <View style={styles.tagGrid}>
      {LIFESTYLE_SECTIONS.map((section) => {
        const opt = optionForSection(section, selections);
        if (!opt) return null;

        return (
          <View
            key={section.id}
            style={styles.tagChip}
            accessibilityLabel={`${section.title}: ${opt.label}`}
          >
            <View style={styles.tagIconWrap}>
              {opt.image ? (
                <Image source={opt.image} style={styles.tagIcon} resizeMode='contain' />
              ) : (
                <Ionicons name={opt.icon} size={16} color={colors.primary} />
              )}
            </View>
            <Text style={styles.tagChipText} numberOfLines={2}>
              <Text style={styles.tagCategory}>{section.title}: </Text>
              {opt.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(47,109,246,0.1)',
    maxWidth: '100%',
  },
  tagIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47,109,246,0.06)',
    overflow: 'hidden',
  },
  tagIcon: {
    width: 24,
    height: 24,
  },
  tagChipText: {
    flexShrink: 1,
    fontSize: type.caption,
    lineHeight: 18,
    fontWeight: '400',
    color: ink,
    letterSpacing: -0.08,
  },
  tagCategory: {
    fontWeight: '400',
    color: inkSoft,
  },
});
