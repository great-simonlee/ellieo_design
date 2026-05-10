import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { type ComponentProps, useMemo, useState } from 'react';
import {
  Image,
  type ImageSourcePropType,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboardingCtaLayout } from '../design/onboardingCtaLayout';
import { colors, radius, space, type } from '../design/theme';

/** Matches `PersonalOnboardingScreenFive` text tokens. */
const ink = '#1C1C1E';
const labelSecondary = '#636366';
const captionMuted = '#8E8E93';
const white = '#FFFFFF';
const groupBorder = '#E5E7EB';
const rowDivider = '#F1F5F9';
const iconMutedBg = '#F1F5F9';

export type LifestyleOptionConfig = {
  id: string;
  label: string;
  /** Optional — set to `require('...')` when you add artwork per option. */
  image?: ImageSourcePropType;
  icon: ComponentProps<typeof Ionicons>['name'];
};

export type LifestyleSectionConfig = {
  id: string;
  title: string;
  columns: 2 | 3;
  options: LifestyleOptionConfig[];
};

/** Edit labels / order here; drop in `image` per option when assets are ready. */
export const LIFESTYLE_SECTIONS: LifestyleSectionConfig[] = [
  {
    id: 'sleep',
    title: 'Sleep schedule',
    columns: 3,
    options: [
      {
        id: 'early',
        label: 'Early bird',
        icon: 'sunny-outline',
        image: require('../assets/img/icon/sleep_schedule_1.png'),
      },
      {
        id: 'night',
        label: 'Night owl',
        icon: 'moon-outline',
        image: require('../assets/img/icon/sleep_schedule_2.png'),
      },
      {
        id: 'flex',
        label: 'Flexible',
        icon: 'sync-outline',
        image: require('../assets/img/icon/sleep_schedule_3.png'),
      },
    ],
  },
  {
    id: 'social',
    title: 'Social style',
    columns: 2,
    options: [
      {
        id: 'extrovert',
        label: 'Extrovert',
        icon: 'people-outline',
        image: require('../assets/img/icon/social_style_1.png'),
      },
      {
        id: 'introvert',
        label: 'Introvert',
        icon: 'person-outline',
        image: require('../assets/img/icon/social_style_2.png'),
      },
    ],
  },
  {
    id: 'guests',
    title: 'Guests at home',
    columns: 3,
    options: [
      {
        id: 'rarely',
        label: 'Rarely',
        icon: 'home-outline',
        image: require('../assets/img/icon/gues_1.png'),
      },
      {
        id: 'sometimes',
        label: 'Occasionally',
        icon: 'people-circle-outline',
        image: require('../assets/img/icon/gues_2.png'),
      },
      {
        id: 'often',
        label: 'Frequently',
        icon: 'globe-outline',
        image: require('../assets/img/icon/gues_3.png'),
      },
    ],
  },
  {
    id: 'clean',
    title: 'Cleanliness',
    columns: 3,
    options: [
      {
        id: 'tidy',
        label: 'Very tidy',
        icon: 'sparkles-outline',
        image: require('../assets/img/icon/clean_1.png'),
      },
      {
        id: 'mod',
        label: 'Moderate',
        icon: 'water-outline',
        image: require('../assets/img/icon/clean_2.png'),
      },
      {
        id: 'relaxed',
        label: 'Relaxed',
        icon: 'leaf-outline',
        image: require('../assets/img/icon/clean_3.png'),
      },
    ],
  },
  {
    id: 'cook',
    title: 'Cooking',
    columns: 3,
    options: [
      {
        id: 'rare',
        label: 'Rarely',
        icon: 'restaurant-outline',
        image: require('../assets/img/icon/cooking_1.png'),
      },
      {
        id: 'some',
        label: 'Sometimes',
        icon: 'flame-outline',
        image: require('../assets/img/icon/cooking_2.png'),
      },
      {
        id: 'regular',
        label: 'Regularly',
        icon: 'nutrition-outline',
        image: require('../assets/img/icon/cooking_3.png'),
      },
    ],
  },
  {
    id: 'noise',
    title: 'Noise tolerance',
    columns: 3,
    options: [
      {
        id: 'quiet',
        label: 'Quiet',
        icon: 'volume-mute-outline',
        image: require('../assets/img/icon/noise_1.png'),
      },
      {
        id: 'chill',
        label: 'Relaxed',
        icon: 'musical-notes-outline',
        image: require('../assets/img/icon/noise_2.png'),
      },
      {
        id: 'lively',
        label: 'Lively',
        icon: 'radio-outline',
        image: require('../assets/img/icon/noise_3.png'),
      },
    ],
  },
  {
    id: 'workout',
    title: 'Workout',
    columns: 3,
    options: [
      {
        id: 'active',
        label: 'Active',
        icon: 'barbell-outline',
        image: require('../assets/img/icon/workout_1.png'),
      },
      {
        id: 'often',
        label: 'Often',
        icon: 'walk-outline',
        image: require('../assets/img/icon/workout_2.png'),
      },
      {
        id: 'never',
        label: 'Never',
        icon: 'cafe-outline',
        image: require('../assets/img/icon/workout_3.png'),
      },
    ],
  },
  {
    id: 'pet',
    title: 'Pet',
    columns: 3,
    options: [
      {
        id: 'dog',
        label: 'Dog',
        icon: 'paw-outline',
        image: require('../assets/img/icon/pet_1.png'),
      },
      {
        id: 'cat',
        label: 'Cat',
        icon: 'heart-outline',
        image: require('../assets/img/icon/pet_2.png'),
      },
      {
        id: 'other',
        label: 'Others',
        icon: 'ellipsis-horizontal-outline',
        image: require('../assets/img/icon/pet_3.png'),
      },
    ],
  },
];

type Selections = Partial<Record<string, string>>;

type PersonalOnboardingScreenSevenProps = {
  onBack: () => void;
  onSkip?: () => void;
  onComplete?: () => void;
};

export function PersonalOnboardingScreenSeven({
  onBack,
  onSkip,
  onComplete,
}: PersonalOnboardingScreenSevenProps) {
  const insets = useSafeAreaInsets();
  const { width: windowW } = useWindowDimensions();
  const { padH, contentMaxW } = useOnboardingCtaLayout();

  const ONBOARDING_TOTAL_STEPS = 6;
  const onboardingStepNumber = 6;
  const progressRatio = 6 / 6;

  const [selections, setSelections] = useState<Selections>({});

  const contentW = useMemo(
    () => Math.min(contentMaxW, windowW - padH * 2),
    [contentMaxW, windowW, padH],
  );

  const allPicked = useMemo(
    () => LIFESTYLE_SECTIONS.every((s) => selections[s.id] != null),
    [selections],
  );

  const pick = (sectionId: string, optionId: string) => {
    setSelections((prev) => ({ ...prev, [sectionId]: optionId }));
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style='dark' />

      <View style={[styles.headerRow, { paddingHorizontal: padH }]}>
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Go back'
          onPress={onBack}
          hitSlop={12}
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.backBtnPressed,
          ]}
        >
          <Ionicons name='chevron-back' size={26} color={ink} />
        </Pressable>
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Skip lifestyle preferences'
          onPress={() => onSkip?.()}
          hitSlop={12}
          style={({ pressed }) => [
            styles.skipBtn,
            pressed && styles.skipPressed,
          ]}
        >
          <Text style={styles.skipLabel}>Skip</Text>
        </Pressable>
      </View>

      <View
        style={[styles.progressBlock, { paddingHorizontal: padH }]}
        accessibilityRole='progressbar'
        accessibilityValue={{
          min: 1,
          max: ONBOARDING_TOTAL_STEPS,
          now: onboardingStepNumber,
        }}
        accessibilityLabel={`Onboarding step ${onboardingStepNumber} of ${ONBOARDING_TOTAL_STEPS}`}
      >
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={['#7BA6FF', colors.primary]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[
              styles.progressFill,
              { width: `${Math.min(1, progressRatio) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressCaption}>
          Step {onboardingStepNumber} of {ONBOARDING_TOTAL_STEPS}
        </Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: padH,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
      >
        <View style={[styles.titleBlock, { maxWidth: contentMaxW }]}>
          <Text style={[styles.screenTitle, { maxWidth: contentMaxW }]}>
            What is your lifestyle?
          </Text>
          <Text style={[styles.screenSubtitle, { maxWidth: contentMaxW }]}>
            Choose one answer per section. You can edit these anytime.
          </Text>
        </View>

        {LIFESTYLE_SECTIONS.map((section, si) => (
          <View
            key={section.id}
            style={[
              styles.sectionBlock,
              { width: contentW, maxWidth: contentMaxW },
              si === 0 && styles.sectionBlockFirst,
            ]}
          >
            <Text style={styles.sectionHeading}>{section.title}</Text>
            <View style={styles.groupCard}>
              {section.options.map((opt, oi) => {
                const selected = selections[section.id] === opt.id;
                const isLast = oi === section.options.length - 1;
                return (
                  <Pressable
                    key={opt.id}
                    accessibilityRole='button'
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${section.title}: ${opt.label}${selected ? ', selected' : ''}`}
                    onPress={() => pick(section.id, opt.id)}
                    style={({ pressed }) => [
                      styles.listRow,
                      !isLast && styles.listRowBorder,
                      selected && styles.listRowSelected,
                      pressed && styles.listRowPressed,
                    ]}
                  >
                    <View style={styles.leadMark}>
                      {opt.image ? (
                        <Image
                          source={opt.image}
                          style={styles.leadImage}
                          resizeMode='contain'
                        />
                      ) : (
                        <View style={styles.leadIcon}>
                          <Ionicons
                            name={opt.icon}
                            size={22}
                            color={colors.primary}
                          />
                        </View>
                      )}
                    </View>
                    <Text
                      style={[styles.listLabel, selected && styles.listLabelSelected]}
                      numberOfLines={2}
                    >
                      {opt.label}
                    </Text>
                    <View
                      style={[
                        styles.choiceMark,
                        selected && styles.choiceMarkOn,
                      ]}
                      accessibilityElementsHidden
                    >
                      {selected ? (
                        <Ionicons name='checkmark' size={15} color={white} />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <View
        style={[
          styles.ctaDock,
          {
            paddingHorizontal: padH,
            paddingBottom: insets.bottom + space.sm,
          },
        ]}
      >
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Looks good'
          accessibilityState={{ disabled: !allPicked }}
          onPress={() => allPicked && onComplete?.()}
          disabled={!allPicked}
          style={({ pressed }) => [
            styles.ctaOuter,
            { maxWidth: contentMaxW },
            !allPicked && styles.ctaOuterDisabled,
            allPicked && pressed && styles.ctaOuterPressed,
          ]}
        >
          <View
            style={[styles.ctaInner, !allPicked && styles.ctaInnerDisabled]}
          >
            <Text
              style={[styles.ctaLabel, !allPicked && styles.ctaLabelDisabled]}
            >
              Looks good!
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: white,
  },
  flex: { flex: 1, backgroundColor: white },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: space.xs,
  },
  backBtn: {
    marginLeft: -space.xs,
    padding: space.xs,
    borderRadius: radius.sm,
  },
  backBtnPressed: { opacity: 0.55 },
  skipBtn: {
    paddingVertical: space.xs,
    paddingHorizontal: space.sm,
  },
  skipPressed: { opacity: 0.55 },
  skipLabel: {
    fontSize: type.body,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: -0.2,
  },
  /** Matches `PersonalOnboardingScreenFive` progress chrome. */
  progressBlock: {
    paddingBottom: space.md,
    width: '100%',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E5EA',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressCaption: {
    marginTop: space.sm,
    fontSize: type.caption,
    fontWeight: '600',
    color: captionMuted,
    letterSpacing: -0.1,
  },
  scrollContent: {
    paddingTop: space.sm,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  titleBlock: {
    marginBottom: space.xxl,
    alignSelf: 'center',
    width: '100%',
  },
  /** Matches `PersonalOnboardingScreenFive` hero title. */
  screenTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.8,
    lineHeight: 36,
    marginBottom: space.sm,
    alignSelf: 'center',
    width: '100%',
  },
  /** Matches `PersonalOnboardingScreenFive` intro body copy. */
  screenSubtitle: {
    fontSize: type.body,
    lineHeight: 22,
    color: labelSecondary,
    fontWeight: '400',
    letterSpacing: -0.2,
    marginBottom: 0,
    alignSelf: 'center',
    width: '100%',
  },
  sectionBlock: {
    marginBottom: space.xxl,
  },
  sectionBlockFirst: {
    marginTop: 0,
  },
  sectionHeading: {
    fontSize: type.title,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.45,
    marginBottom: space.md,
  },
  groupCard: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: groupBorder,
    backgroundColor: white,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
      },
      android: { elevation: 1 },
    }),
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    backgroundColor: white,
  },
  listRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: rowDivider,
  },
  listRowSelected: {
    backgroundColor: '#F4F8FF',
  },
  listRowPressed: {
    opacity: 0.88,
  },
  leadMark: {
    width: 48,
    height: 48,
    marginRight: space.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadImage: {
    width: 44,
    height: 44,
  },
  leadIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.sm + 2,
    backgroundColor: iconMutedBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listLabel: {
    flex: 1,
    fontSize: type.bodyLarge,
    fontWeight: '300',
    color: '#334155',
    letterSpacing: -0.3,
    lineHeight: 22,
    paddingRight: space.sm,
  },
  listLabelSelected: {
    fontWeight: '700',
    color: ink,
  },
  choiceMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: white,
  },
  choiceMarkOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ctaDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: space.lg,
    backgroundColor: white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: rowDivider,
    alignItems: 'center',
  },
  ctaOuter: {
    width: '100%',
    borderRadius: radius.pill,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },
  ctaOuterDisabled: {
    ...Platform.select({
      ios: { shadowOpacity: 0 },
      android: { elevation: 0 },
    }),
  },
  ctaOuterPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  ctaInner: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    minHeight: 54,
  },
  ctaInnerDisabled: {
    backgroundColor: '#CBD5E1',
  },
  ctaLabel: {
    color: white,
    fontSize: type.bodyLarge,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  ctaLabelDisabled: {
    color: 'rgba(255,255,255,0.95)',
  },
});
