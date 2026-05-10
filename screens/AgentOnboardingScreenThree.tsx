import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
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
const counterShortfall = '#FF3B30';

/** Agent profile onboarding (intro → bio → verify): 3 steps total. */
const ONBOARDING_TOTAL_STEPS = 3;
const onboardingStepNumber = 2;
const progressRatio = onboardingStepNumber / ONBOARDING_TOTAL_STEPS;

const MAX_BIO = 2000;
const MIN_BIO = 150;
/** Fixed typing area — text scrolls inside; shell does not stretch with the screen. */
const BIO_TEXT_INPUT_HEIGHT = 200;

type AgentOnboardingScreenThreeProps = {
  onBack: () => void;
  onContinue: () => void;
};

export function AgentOnboardingScreenThree({
  onBack,
  onContinue,
}: AgentOnboardingScreenThreeProps) {
  const insets = useSafeAreaInsets();
  const { padH, contentMaxW, primaryButtonWidth } = useOnboardingCtaLayout();

  const [bio, setBio] = useState('');
  const [bioFocused, setBioFocused] = useState(false);
  const [keyboardBottomInset, setKeyboardBottomInset] = useState(0);

  const scrollRef = useRef<ScrollView>(null);
  const scrollViewportHRef = useRef(0);
  const scrollContentHRef = useRef(0);
  const inputShellYRef = useRef(0);
  const inputShellHRef = useRef(0);

  const bioLen = bio.length;
  const bioTrim = bio.trim().length;
  const introValid = bioTrim >= MIN_BIO && bioLen <= MAX_BIO;

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

  /**
   * Scroll so the bio shell is vertically centered in the ScrollView viewport
   * (above the keyboard once KAV has applied). Clamped to valid scroll range.
   */
  const scrollBioToCenter = useCallback(() => {
    const inputY = inputShellYRef.current;
    const inputH = inputShellHRef.current;
    const vh = scrollViewportHRef.current;
    const contentH = scrollContentHRef.current;
    if (vh <= 0 || inputH <= 0 || contentH <= 0) return;

    const maxScrollY = Math.max(0, contentH - vh);
    const idealY = inputY + inputH / 2 - vh / 2;
    const y = Math.min(maxScrollY, Math.max(0, idealY));
    scrollRef.current?.scrollTo({ y, animated: true });
  }, []);

  const scheduleScrollBioToCenter = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(scrollBioToCenter);
    });
  }, [scrollBioToCenter]);

  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      scheduleScrollBioToCenter();
    });
    return () => sub.remove();
  }, [scheduleScrollBioToCenter]);

  const scrollPaddingBottom =
    space.xl + (keyboardBottomInset > 0 ? space.xxl + space.md : 0);

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

      <Text
        style={[styles.pageEyebrow, { paddingHorizontal: padH }]}
        accessibilityRole='header'
      >
        INTRODUCTION
      </Text>

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
              scheduleScrollBioToCenter();
            }
          }}
          onContentSizeChange={(_, h) => {
            scrollContentHRef.current = h;
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
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.heroBlock, { maxWidth: contentMaxW }]}>
              <Text style={styles.screenTitle}>
                Let&apos;s get to know you
              </Text>

              <View style={styles.introBullets}>
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletGlyph} accessibilityElementsHidden>
                    •
                  </Text>
                  <Text style={styles.introBulletText}>
                    Write a professional bio on helping renters and roommate
                    seekers. Include how many years you have been in the field,
                    and how many students and working professionals you have
                    helped. (At least {MIN_BIO} characters)
                  </Text>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>

          <View
            style={[
              styles.bioShell,
              bioFocused && styles.bioShellFocused,
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
              onChangeText={(t) => setBio(t.slice(0, MAX_BIO))}
              placeholder='Share your years of experience, how many students and working professionals you have helped, and how you guide renters and roommate seekers.'
              placeholderTextColor={captionMuted}
              style={styles.bioInput}
              multiline
              scrollEnabled
              textAlignVertical='top'
              selectionColor={colors.primary}
              onFocus={() => {
                setBioFocused(true);
                scheduleScrollBioToCenter();
              }}
              onBlur={() => setBioFocused(false)}
            />
            <Pressable
              accessibilityRole='button'
              accessibilityLabel='Dismiss keyboard'
              onPress={Keyboard.dismiss}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.counterHit}
            >
              <Text style={styles.bioCounter} accessibilityLiveRegion='polite'>
                <Text
                  style={
                    bioTrim < MIN_BIO ? styles.bioCounterWarn : undefined
                  }
                >
                  {bioLen}
                </Text>
                {`/${MAX_BIO} Characters`}
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <OnboardingBottomCta
          label='Continue'
          onPress={() => {
            if (introValid) onContinue();
          }}
          disabled={!introValid}
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
  scrollContent: {
    paddingTop: space.xs,
  },
  heroBlock: {
    width: '100%',
    alignSelf: 'center',
    marginBottom: 0,
  },
  headerRow: { paddingBottom: space.xs },
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
  backBtn: {
    alignSelf: 'flex-start',
    marginLeft: -space.xs,
    padding: space.xs,
    borderRadius: radius.sm,
  },
  backBtnPressed: { opacity: 0.55 },
  /** Between progress and screen title; matches verify eyebrow on other agent steps. */
  pageEyebrow: {
    fontSize: type.micro,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: space.sm,
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.8,
    lineHeight: 36,
    marginBottom: space.sm,
  },
  /** Matches `PersonalOnboardingScreenFive` intro bullets. */
  introBullets: {
    marginBottom: space.xl,
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
  bioShell: {
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
  bioShellFocused: {
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
  bioInput: {
    height: BIO_TEXT_INPUT_HEIGHT,
    fontSize: type.bodyLarge,
    lineHeight: 24,
    color: ink,
    fontWeight: '400',
    letterSpacing: -0.25,
    padding: 0,
    margin: 0,
  },
  counterHit: {
    position: 'absolute',
    right: space.lg,
    bottom: space.md,
  },
  bioCounter: {
    fontSize: type.caption,
    fontWeight: '500',
    color: captionMuted,
    letterSpacing: -0.1,
  },
  bioCounterWarn: {
    color: counterShortfall,
    fontWeight: '700',
  },
});
