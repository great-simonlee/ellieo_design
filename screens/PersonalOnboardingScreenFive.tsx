import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OnboardingBottomCta } from '../components/OnboardingBottomCta';
import { useOnboardingCtaLayout } from '../design/onboardingCtaLayout';
import { colors, radius, space, type } from '../design/theme';

const ink = '#1C1C1E';
const labelSecondary = '#636366';
const captionMuted = '#8E8E93';
const fieldFill = '#F2F2F7';
const fieldBorder = 'rgba(60, 60, 67, 0.12)';
/** Minimum gap between the bio shell bottom and the scroll viewport bottom. */
const INPUT_SCROLL_BOTTOM_MARGIN = space.md + space.sm;
/** Don’t scroll the field’s top above this offset so the title/bullets stay visible when possible. */
const INPUT_SCROLL_TOP_GUARD = space.sm;
const MIN_INTRO_LENGTH = 150;
const MAX_INTRO_LENGTH = 1000;
/** Fixed typing area — content scrolls inside; shell must not grow with line count. */
const BIO_TEXT_INPUT_HEIGHT = 200;

type PersonalOnboardingScreenFiveProps = {
  onBack: () => void;
  onSkip?: () => void;
  onComplete?: () => void;
};

export function PersonalOnboardingScreenFive({
  onBack,
  onSkip,
  onComplete,
}: PersonalOnboardingScreenFiveProps) {
  const insets = useSafeAreaInsets();
  const { padH, contentMaxW, primaryButtonWidth } = useOnboardingCtaLayout();

  const ONBOARDING_TOTAL_STEPS = 5;
  const onboardingStepNumber = 4;
  const progressRatio = 4 / 5;

  const [bio, setBio] = useState('');
  const [bioFocused, setBioFocused] = useState(false);
  /** Same keyboard inset pattern as `PersonalOnboardingScreenThree` (CTA + scroll padding). */
  const [keyboardBottomInset, setKeyboardBottomInset] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  /** ScrollView visible height (not content height). */
  const scrollViewportHRef = useRef(0);
  /** Bio shell position/size inside scroll content (for scrollTo). */
  const inputShellYRef = useRef(0);
  const inputShellHRef = useRef(0);

  const scrollPaddingBottom =
    space.xl +
    (keyboardBottomInset > 0 ? space.xxl + space.md : 0);

  /**
   * Scroll the minimum amount so the bio shell clears the bottom of the viewport.
   * Uses the ScrollView height *after* KAV shrinks; if `vh` is stale (too small), `minY` blows up
   * and hides the title — so we only run this from `keyboardDidShow` + `ScrollView` `onLayout`.
   */
  const scrollBioIntoView = useCallback(() => {
    const inputY = inputShellYRef.current;
    const inputH = inputShellHRef.current;
    const vh = scrollViewportHRef.current;
    if (vh <= 0 || inputH <= 0) return;

    const needY = inputY + inputH - vh + INPUT_SCROLL_BOTTOM_MARGIN;
    const maxYToKeepFieldTopVisible = Math.max(0, inputY - INPUT_SCROLL_TOP_GUARD);
    const viewportFitsWholeField =
      vh >= inputH + INPUT_SCROLL_BOTTOM_MARGIN + INPUT_SCROLL_TOP_GUARD;

    let y = Math.max(0, needY);
    if (viewportFitsWholeField && needY > maxYToKeepFieldTopVisible) {
      y = maxYToKeepFieldTopVisible;
    }

    scrollRef.current?.scrollTo({ y, animated: false });
  }, []);

  const scheduleScrollBioIntoView = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(scrollBioIntoView);
    });
  }, [scrollBioIntoView]);

  useEffect(() => {
    const showEvt =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvt, (e) => {
      setKeyboardBottomInset(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvt, () => {
      setKeyboardBottomInset(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    const sub = Keyboard.addListener(
      'keyboardDidShow',
      scheduleScrollBioIntoView,
    );
    return () => sub.remove();
  }, [scheduleScrollBioIntoView]);

  const trimmedLen = bio.trim().length;
  const canSave =
    trimmedLen >= MIN_INTRO_LENGTH && bio.length <= MAX_INTRO_LENGTH;

  const counterLabel = useMemo(
    () => `${bio.length}/${MAX_INTRO_LENGTH} Characters`,
    [bio.length],
  );

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
          accessibilityLabel='Skip introduction'
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

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          onLayout={(e) => {
            scrollViewportHRef.current = e.nativeEvent.layout.height;
            if (keyboardBottomInset > 0) {
              scheduleScrollBioIntoView();
            }
          }}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: padH,
              paddingBottom: scrollPaddingBottom,
            },
          ]}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode={
            Platform.OS === 'ios' ? 'interactive' : 'on-drag'
          }
          showsVerticalScrollIndicator={keyboardBottomInset > 0}
        >
          <Text style={[styles.screenTitle, { maxWidth: contentMaxW }]}>
            Introduce Yourself
          </Text>

          <View style={[styles.introBullets, { width: contentMaxW }]}>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletGlyph} accessibilityElementsHidden>
                •
              </Text>
              <Text style={styles.introBulletText}>
                Write a short introduction to help future roommates get to know
                you better. (At least {MIN_INTRO_LENGTH} characters)
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletGlyph} accessibilityElementsHidden>
                •
              </Text>
              <Text style={styles.introBulletText}>
                You can skip this for now, but you&apos;ll need to upload at
                least 2 photos and write a short bio later to use the Roommate
                Matching service.
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.inputShell,
              bioFocused && styles.inputShellFocused,
              { maxWidth: contentMaxW },
            ]}
            onLayout={(e) => {
              const { y, height } = e.nativeEvent.layout;
              inputShellYRef.current = y;
              inputShellHRef.current = height;
            }}
          >
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder='e.g. I&apos;m a grad student who enjoys quiet evenings, cooking on weekends, and keeping shared spaces tidy.'
              placeholderTextColor={captionMuted}
              multiline
              scrollEnabled
              maxLength={MAX_INTRO_LENGTH}
              onSubmitEditing={() => Keyboard.dismiss()}
              onFocus={() => {
                setBioFocused(true);
                scheduleScrollBioIntoView();
              }}
              onBlur={() => setBioFocused(false)}
              style={styles.input}
              textAlignVertical='top'
              autoCorrect
              keyboardType={
                Platform.OS === 'ios' ? 'ascii-capable' : 'default'
              }
              selectionColor={colors.primary}
            />
            <Text style={styles.counter} accessibilityLiveRegion='polite'>
              {counterLabel}
            </Text>
          </View>
        </ScrollView>

        <OnboardingBottomCta
          label='Save'
          onPress={() => {
            if (canSave) onComplete?.();
          }}
          disabled={!canSave}
          padH={padH}
          safeBottomInset={
            keyboardBottomInset > 0 ? 0 : insets.bottom
          }
          buttonWidth={primaryButtonWidth}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: { flex: 1 },
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
  },
  /** Matches `PersonalOnboardingScreenFour` title. */
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
  /** Matches Four intro bullets. */
  introBullets: {
    alignSelf: 'center',
    marginBottom: space.lg,
    gap: space.sm + 2,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletGlyph: {
    width: 18,
    fontSize: type.body,
    lineHeight: 22,
    color: labelSecondary,
    fontWeight: '400',
    textAlign: 'center',
    paddingTop: 1,
  },
  introBulletText: {
    flex: 1,
    fontSize: type.body,
    lineHeight: 22,
    color: labelSecondary,
    fontWeight: '400',
    letterSpacing: -0.2,
  },
  inputShell: {
    alignSelf: 'center',
    width: '100%',
    height: space.md + BIO_TEXT_INPUT_HEIGHT + space.xl + space.sm,
    backgroundColor: fieldFill,
    borderRadius: radius.sm + 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: fieldBorder,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.xl + space.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  inputShellFocused: {
    borderWidth: 2,
    borderColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.22,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  input: {
    height: BIO_TEXT_INPUT_HEIGHT,
    fontSize: type.bodyLarge,
    lineHeight: 24,
    color: ink,
    fontWeight: '400',
    letterSpacing: -0.25,
    padding: 0,
    margin: 0,
  },
  counter: {
    position: 'absolute',
    right: space.lg,
    bottom: space.sm + 2,
    fontSize: type.caption,
    color: captionMuted,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
});
