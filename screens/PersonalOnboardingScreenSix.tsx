import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OnboardingBottomCta } from '../components/OnboardingBottomCta';
import { useOnboardingCtaLayout } from '../design/onboardingCtaLayout';
import { colors, radius, space, type } from '../design/theme';

const ink = '#1C1C1C';
const labelSecondary = '#636366';
const captionMuted = '#8E8E93';
const successGreen = '#34C759';
const OTP_LEN = 6;

const GRADIENT_ON: [string, string] = ['#7BA6FF', colors.primary];
const GRADIENT_OFF: [string, string] = ['#C7C7CC', '#AEAEB2'];

/** Matches `PersonalOnboardingScreenFive` — CTA uses `safeBottomInset=0` + `space.sm` when keyboard is up. */
const sheetPaddingBottom = (keyboardOpen: boolean, bottomInset: number) =>
  keyboardOpen ? space.sm : bottomInset + space.md;

function looksLikeEmail(s: string): boolean {
  const t = s.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

function UnavailableVerificationRow({
  title,
  meta,
  icon,
  compact,
}: {
  title: string;
  meta: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  compact?: boolean;
}) {
  return (
    <Pressable
      disabled
      accessibilityRole='button'
      accessibilityState={{ disabled: true }}
      accessibilityLabel={`${title}, coming soon`}
      style={[
        styles.optionCard,
        styles.optionCardUnavailable,
        compact && styles.optionCardCompact,
      ]}
    >
      <View
        style={[
          styles.optionIconRing,
          styles.optionIconRingMuted,
          compact && styles.optionIconRingCompact,
        ]}
      >
        <Ionicons name={icon} size={compact ? 20 : 22} color={captionMuted} />
      </View>
      <View style={styles.optionCopy}>
        <Text style={styles.optionTitleMuted}>{title}</Text>
        <Text style={styles.optionMetaMuted}>{meta}</Text>
      </View>
      <View style={[styles.soonPill, compact && styles.soonPillCompact]}>
        <Text style={styles.soonPillText}>Coming soon</Text>
      </View>
    </Pressable>
  );
}

type SheetState = null | { flow: 'school'; step: 'email' | 'code' };

type PersonalOnboardingScreenSixProps = {
  onBack: () => void;
  onSkip?: () => void;
  onComplete?: () => void;
};

export function PersonalOnboardingScreenSix({
  onBack,
  onSkip,
  onComplete,
}: PersonalOnboardingScreenSixProps) {
  const insets = useSafeAreaInsets();
  const { width: windowW, height: windowH } = useWindowDimensions();
  const { padH, contentMaxW, primaryButtonWidth } = useOnboardingCtaLayout();
  const compactHub = windowH < 720;

  const ONBOARDING_TOTAL_STEPS = 5;
  const onboardingStepNumber = 5;
  const progressRatio = 1;

  const [schoolDone, setSchoolDone] = useState(false);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [additionalSheetOpen, setAdditionalSheetOpen] = useState(false);
  const [schoolEmail, setSchoolEmail] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [resendSec, setResendSec] = useState(0);
  const [keyboardBottomInset, setKeyboardBottomInset] = useState(0);

  const codeInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);

  const successOpacity = useRef(new Animated.Value(0)).current;
  const successTranslate = useRef(new Animated.Value(14)).current;
  const ambientPulse = useRef(new Animated.Value(0)).current;

  const canNext = schoolDone;
  const sheetOpen = sheet != null;
  const modalButtonW = Math.min(contentMaxW, windowW - padH * 2);

  const closeSheet = useCallback(() => {
    setSheet(null);
    setSchoolCode('');
    Keyboard.dismiss();
  }, []);

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

  const openSchool = () => {
    setSchoolCode('');
    setSheet({ flow: 'school', step: 'email' });
  };

  useEffect(() => {
    if (sheet?.flow !== 'school' || sheet.step !== 'code') return;
    setResendSec(59);
    const id = setInterval(() => {
      setResendSec((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    const t = setTimeout(() => codeInputRef.current?.focus(), 280);
    return () => {
      clearInterval(id);
      clearTimeout(t);
    };
  }, [sheet]);

  useEffect(() => {
    if (sheet?.flow === 'school' && sheet.step === 'email') {
      const t = setTimeout(() => emailInputRef.current?.focus(), 320);
      return () => clearTimeout(t);
    }
  }, [sheet]);

  const onSchoolEmailContinue = () => {
    if (!looksLikeEmail(schoolEmail)) return;
    setSchoolCode('');
    setSheet({ flow: 'school', step: 'code' });
  };

  const onSchoolCodeContinue = () => {
    if (schoolCode.length !== OTP_LEN) return;
    setSchoolDone(true);
    closeSheet();
  };

  useEffect(() => {
    if (!schoolDone) {
      successOpacity.setValue(0);
      successTranslate.setValue(14);
      ambientPulse.setValue(0);
      return;
    }
    successOpacity.setValue(0);
    successTranslate.setValue(18);
    Animated.parallel([
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(successTranslate, {
        toValue: 0,
        friction: 8,
        tension: 68,
        useNativeDriver: true,
      }),
    ]).start();
  }, [schoolDone, successOpacity, successTranslate]);

  useEffect(() => {
    if (!schoolDone) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ambientPulse, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(ambientPulse, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [schoolDone, ambientPulse]);

  const ambientRingScale = ambientPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });
  const ambientRingOpacity = ambientPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.28, 0.5],
  });

  const hubCardSchool = (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={
        schoolDone ? 'School email verified' : 'Start school email verification'
      }
      onPress={() => (schoolDone ? undefined : openSchool())}
      disabled={schoolDone}
      style={({ pressed }) => [
        styles.optionCard,
        compactHub && styles.optionCardCompact,
        schoolDone && styles.optionCardDoneSchool,
        !schoolDone && styles.optionCardAvailable,
        !schoolDone && pressed && styles.optionCardAvailablePressed,
      ]}
    >
      <View
        style={[
          styles.optionIconRing,
          schoolDone && styles.optionIconRingDone,
          !schoolDone && styles.optionIconRingAvailable,
          compactHub && styles.optionIconRingCompact,
        ]}
      >
        <Ionicons
          name={schoolDone ? 'checkmark' : 'school-outline'}
          size={compactHub ? 20 : 22}
          color={schoolDone ? '#FFFFFF' : colors.primary}
        />
      </View>
      <View style={styles.optionCopy}>
        <Text style={styles.optionTitle}>School email</Text>
        <Text style={styles.optionMeta}>
          {schoolDone
            ? 'Verified — credits will apply soon'
            : '.edu address · about a minute'}
        </Text>
      </View>
      {schoolDone ? (
        <Ionicons
          name='checkmark-circle'
          size={compactHub ? 24 : 26}
          color={successGreen}
          style={styles.optionTrailIcon}
        />
      ) : (
        <Ionicons
          name='chevron-forward'
          size={compactHub ? 20 : 22}
          color={colors.primary}
          style={styles.optionTrailIcon}
        />
      )}
    </Pressable>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style={sheetOpen || additionalSheetOpen ? 'light' : 'dark'} />

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
          accessibilityLabel='Skip and continue'
          onPress={() => {
            closeSheet();
            Keyboard.dismiss();
            (onComplete ?? onSkip)?.();
          }}
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

      <View style={[styles.flex, styles.mainColumn]}>
        <View
          style={[
            styles.mainContent,
            {
              paddingHorizontal: padH,
              paddingTop: compactHub ? space.xs : space.sm,
            },
          ]}
        >
          <View
            style={[
              styles.mainContentInner,
              { maxWidth: contentMaxW },
              compactHub && styles.mainContentInnerCompact,
              schoolDone && styles.mainContentInnerVerified,
            ]}
          >
            {schoolDone ? (
              <Animated.View
                style={[
                  styles.celebrateWrap,
                  {
                    opacity: successOpacity,
                    transform: [{ translateY: successTranslate }],
                  },
                ]}
              >
                <ScrollView
                  style={styles.celebrateScrollView}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                  contentContainerStyle={[
                    styles.celebrateScroll,
                    compactHub && styles.celebrateScrollCompact,
                  ]}
                >
                  <View
                    style={[
                      styles.celebrateCard,
                      compactHub && styles.celebrateCardCompact,
                    ]}
                  >
                    <LinearGradient
                      colors={['#F4F8FF', '#EEF4FF', '#F8FAFF']}
                      locations={[0, 0.45, 1]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.celebrateMeshA} pointerEvents='none'>
                      <LinearGradient
                        colors={[
                          'rgba(123, 166, 255, 0.35)',
                          'rgba(47, 109, 246, 0.08)',
                          'rgba(255,255,255,0)',
                        ]}
                        start={{ x: 0.2, y: 0 }}
                        end={{ x: 0.9, y: 0.85 }}
                        style={styles.celebrateMeshBlob}
                      />
                    </View>
                    <View style={styles.celebrateMeshB} pointerEvents='none'>
                      <LinearGradient
                        colors={[
                          'rgba(168, 85, 247, 0.12)',
                          'rgba(34, 211, 238, 0.1)',
                          'rgba(255,255,255,0)',
                        ]}
                        start={{ x: 0.8, y: 0.1 }}
                        end={{ x: 0.1, y: 0.95 }}
                        style={styles.celebrateMeshBlobB}
                      />
                    </View>

                    <View style={styles.celebrateInner}>
                      <LinearGradient
                        colors={['#E8F0FF', '#D4E4FF']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.celebrateCreditChip}
                      >
                        <Ionicons
                          name='sparkles'
                          size={15}
                          color={colors.primary}
                        />
                        <Text style={styles.celebrateCreditChipText}>
                          Credits unlocked
                        </Text>
                      </LinearGradient>

                      <View style={styles.celebrateHeroMark}>
                        <Animated.View
                          pointerEvents='none'
                          style={[
                            styles.celebratePulseRing,
                            {
                              opacity: ambientRingOpacity,
                              transform: [{ scale: ambientRingScale }],
                            },
                          ]}
                        />
                        <LinearGradient
                          colors={['#9BB9FF', colors.primary, '#1E4FC4']}
                          locations={[0, 0.5, 1]}
                          start={{ x: 0.2, y: 0 }}
                          end={{ x: 0.85, y: 1 }}
                          style={[
                            styles.celebrateSealRing,
                            compactHub && styles.celebrateSealRingCompact,
                          ]}
                        >
                          <View
                            style={[
                              styles.celebrateSealCore,
                              compactHub && styles.celebrateSealCoreCompact,
                            ]}
                          >
                            <Ionicons
                              name='checkmark'
                              size={compactHub ? 34 : 40}
                              color='#FFFFFF'
                              accessibilityLabel='Verified'
                            />
                          </View>
                        </LinearGradient>
                        <View
                          style={styles.celebrateSealBadge}
                          pointerEvents='none'
                        >
                          <Ionicons
                            name='ribbon'
                            size={18}
                            color={colors.amber}
                          />
                        </View>
                      </View>

                      <Text
                        style={[
                          styles.celebrateTitle,
                          compactHub && styles.celebrateTitleCompact,
                        ]}
                      >
                        You&apos;re verified
                      </Text>
                      <Text style={styles.celebrateSubtitle}>
                        School email is on file — bonus credits will land on
                        your account shortly. You can keep going or layer on
                        more trust signals whenever you like.
                      </Text>

                      <View style={styles.celebrateEmailShell}>
                        {Platform.OS === 'ios' ? (
                          <BlurView
                            intensity={36}
                            tint='light'
                            style={styles.celebrateBlurFill}
                          />
                        ) : (
                          <View
                            style={[
                              StyleSheet.absoluteFill,
                              styles.celebrateEmailAndroidBg,
                            ]}
                          />
                        )}
                        <View style={styles.celebrateEmailRow}>
                          <LinearGradient
                            colors={[
                              'rgba(47,109,246,0.14)',
                              'rgba(47,109,246,0.06)',
                            ]}
                            style={styles.celebrateEmailIcon}
                          >
                            <Ionicons
                              name='mail'
                              size={22}
                              color={colors.primary}
                            />
                          </LinearGradient>
                          <View style={styles.celebrateEmailCopy}>
                            <Text style={styles.celebrateEmailLabel}>
                              School email
                            </Text>
                            <Text
                              style={styles.celebrateEmailValue}
                              numberOfLines={1}
                              ellipsizeMode='middle'
                            >
                              {schoolEmail.trim() || 'Verified'}
                            </Text>
                          </View>
                          <View style={styles.celebrateEmailTrail}>
                            <Ionicons
                              name='shield-checkmark'
                              size={26}
                              color={successGreen}
                              accessibilityLabel='School email confirmed'
                            />
                          </View>
                        </View>
                      </View>

                      <Text style={styles.celebrateFootnote}>
                        LinkedIn, Instagram, and phone checks are rolling out
                        next — optional extras to help roommates recognize you
                        faster.
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              </Animated.View>
            ) : (
              <>
                <Text style={styles.screenTitle}>
                  Unlock your free credits!
                </Text>
                <Text
                  style={[
                    styles.screenSubtitle,
                    compactHub && styles.screenSubtitleCompact,
                  ]}
                >
                  Verify with your school email to earn bonus credits and start
                  matching faster. LinkedIn, Instagram, and phone options are
                  coming soon.
                </Text>

                <View style={styles.verifyBlock}>
                  <LinearGradient
                    colors={['#7BA6FF', colors.primary]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={[
                      styles.verifyAccentBar,
                      compactHub && styles.verifyAccentBarCompact,
                    ]}
                  />
                  <Text
                    style={[
                      styles.verifyKicker,
                      compactHub && styles.verifyKickerCompact,
                    ]}
                  >
                    How would you like to verify?
                  </Text>
                  <Text
                    style={[
                      styles.verifySubtle,
                      compactHub && styles.verifySubtleCompact,
                    ]}
                  >
                    One method is enough to unlock credits. You can add another
                    later.
                  </Text>
                  <View
                    style={[
                      styles.optionList,
                      compactHub && styles.optionListCompact,
                    ]}
                  >
                    {hubCardSchool}
                    <UnavailableVerificationRow
                      title='LinkedIn'
                      meta='Professional profile · one tap'
                      icon='logo-linkedin'
                      compact={compactHub}
                    />
                    <UnavailableVerificationRow
                      title='Instagram'
                      meta='Connect your handle'
                      icon='logo-instagram'
                      compact={compactHub}
                    />
                    <UnavailableVerificationRow
                      title='Phone number'
                      meta='SMS verification'
                      icon='call-outline'
                      compact={compactHub}
                    />
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {schoolDone ? (
          <View
            style={[
              styles.completionDock,
              {
                paddingHorizontal: padH,
                paddingBottom: insets.bottom + space.sm,
              },
            ]}
          >
            <Pressable
              accessibilityRole='button'
              accessibilityLabel='Additional verification options'
              onPress={() => setAdditionalSheetOpen(true)}
              style={({ pressed }) => [
                styles.completionSecondary,
                pressed && styles.completionSecondaryPressed,
              ]}
            >
              <Ionicons
                name='shield-half-outline'
                size={18}
                color={colors.primary}
                style={styles.completionSecondaryIcon}
              />
              <Text style={styles.completionSecondaryLabel} numberOfLines={1}>
                Add verification
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole='button'
              accessibilityLabel='Continue to next step'
              onPress={() => onComplete?.()}
              style={({ pressed }) => [
                styles.completionPrimaryOuter,
                pressed && styles.completionPrimaryPressed,
              ]}
            >
              <LinearGradient
                colors={GRADIENT_ON}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.completionPrimaryGrad}
              >
                <Text style={styles.completionPrimaryLabel}>Next</Text>
                <Ionicons
                  name='arrow-forward'
                  size={18}
                  color='#FFFFFF'
                  style={styles.completionPrimaryChevron}
                />
              </LinearGradient>
            </Pressable>
          </View>
        ) : (
          <OnboardingBottomCta
            label='Next'
            onPress={() => {
              if (canNext) onComplete?.();
            }}
            disabled={!canNext}
            padH={padH}
            safeBottomInset={insets.bottom}
            buttonWidth={primaryButtonWidth}
          />
        )}
      </View>

      <Modal
        visible={sheetOpen}
        transparent
        animationType='fade'
        onRequestClose={closeSheet}
        statusBarTranslucent
      >
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <View style={styles.modalStack}>
            <Pressable
              accessibilityLabel='Dismiss'
              style={styles.modalBackdrop}
              onPress={closeSheet}
            >
              {Platform.OS === 'ios' ? (
                <BlurView
                  intensity={42}
                  tint='dark'
                  style={StyleSheet.absoluteFill}
                />
              ) : (
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: 'rgba(24, 28, 35, 0.62)' },
                  ]}
                />
              )}
            </Pressable>

            <View
              style={[
                styles.sheet,
                {
                  paddingBottom: sheetPaddingBottom(
                    keyboardBottomInset > 0,
                    insets.bottom,
                  ),
                  maxHeight: windowW * 1.15,
                },
              ]}
            >
              {sheet?.flow === 'school' && sheet.step === 'email' ? (
                <>
                  <View style={styles.sheetGrab} />
                  <View style={styles.sheetHeaderRow}>
                    <View style={styles.sheetHeaderSpacer} />
                    <Pressable
                      accessibilityLabel='Close'
                      hitSlop={14}
                      onPress={closeSheet}
                      style={({ pressed }) => pressed && { opacity: 0.6 }}
                    >
                      <Ionicons name='close' size={28} color={labelSecondary} />
                    </Pressable>
                  </View>
                  <Text style={styles.sheetTitle}>School Email Connect</Text>
                  <Text style={styles.fieldCaption}>School email</Text>
                  <TextInput
                    ref={emailInputRef}
                    value={schoolEmail}
                    onChangeText={setSchoolEmail}
                    placeholder='Enter your school email'
                    placeholderTextColor={captionMuted}
                    keyboardType={
                      Platform.OS === 'ios' ? 'ascii-capable' : 'email-address'
                    }
                    autoCapitalize='none'
                    autoCorrect={false}
                    autoComplete='email'
                    textContentType='emailAddress'
                    selectionColor={colors.primary}
                    style={styles.sheetInput}
                  />
                  <Text style={styles.sheetHelper}>
                    Finding a roommate can be stressful. Verifying your school
                    email makes it safer and easier.
                  </Text>
                  <SheetPrimaryButton
                    label='Continue'
                    disabled={!looksLikeEmail(schoolEmail)}
                    width={modalButtonW}
                    onPress={onSchoolEmailContinue}
                  />
                </>
              ) : null}

              {sheet?.flow === 'school' && sheet.step === 'code' ? (
                <>
                  <View style={styles.sheetGrab} />
                  <View style={styles.sheetHeaderRow}>
                    <Pressable
                      accessibilityLabel='Back'
                      hitSlop={14}
                      onPress={() => {
                        setSchoolCode('');
                        setSheet({ flow: 'school', step: 'email' });
                      }}
                      style={({ pressed }) => pressed && { opacity: 0.6 }}
                    >
                      <Ionicons name='chevron-back' size={28} color={ink} />
                    </Pressable>
                    <Pressable
                      accessibilityLabel='Close'
                      hitSlop={14}
                      onPress={closeSheet}
                      style={({ pressed }) => pressed && { opacity: 0.6 }}
                    >
                      <Ionicons name='close' size={26} color={labelSecondary} />
                    </Pressable>
                  </View>
                  <Text style={styles.sheetTitle}>Enter verification code</Text>
                  <Text style={styles.codeBody}>
                    We&apos;ve sent a {OTP_LEN}-digit code to{' '}
                    <Text style={styles.codeEmail}>{schoolEmail.trim()}</Text>
                  </Text>
                  <Text style={styles.codeSpam}>
                    If you don&apos;t see the email, check Spam or Junk.
                  </Text>

                  <Pressable
                    style={styles.otpTouch}
                    onPress={() => codeInputRef.current?.focus()}
                  >
                    <TextInput
                      ref={codeInputRef}
                      value={schoolCode}
                      onChangeText={(t) =>
                        setSchoolCode(t.replace(/\D/g, '').slice(0, OTP_LEN))
                      }
                      keyboardType='number-pad'
                      maxLength={OTP_LEN}
                      caretHidden
                      style={styles.otpHiddenInput}
                    />
                    <View style={styles.otpRow}>
                      {Array.from({ length: OTP_LEN }, (_, i) => (
                        <View key={i} style={styles.otpCell}>
                          <Text style={styles.otpChar}>
                            {schoolCode[i] ?? '–'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </Pressable>

                  <View style={styles.resendRow}>
                    <Text style={styles.resendLine}>
                      Didn&apos;t receive the code?{' '}
                    </Text>
                    {resendSec > 0 ? (
                      <Text style={styles.resendMuted}>
                        Resend in {resendSec}s
                      </Text>
                    ) : (
                      <Pressable
                        accessibilityRole='button'
                        accessibilityLabel='Resend verification code'
                        onPress={() => setResendSec(59)}
                        hitSlop={8}
                      >
                        <Text style={styles.resendActive}>Resend</Text>
                      </Pressable>
                    )}
                  </View>

                  <SheetPrimaryButton
                    label='Continue'
                    disabled={schoolCode.length !== OTP_LEN}
                    width={modalButtonW}
                    onPress={onSchoolCodeContinue}
                  />
                </>
              ) : null}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={additionalSheetOpen}
        transparent
        animationType='fade'
        onRequestClose={() => setAdditionalSheetOpen(false)}
        statusBarTranslucent
      >
        <View style={styles.modalRoot}>
          <View style={styles.modalStack}>
            <Pressable
              accessibilityLabel='Dismiss'
              style={styles.modalBackdrop}
              onPress={() => setAdditionalSheetOpen(false)}
            >
              {Platform.OS === 'ios' ? (
                <BlurView
                  intensity={42}
                  tint='dark'
                  style={StyleSheet.absoluteFill}
                />
              ) : (
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: 'rgba(24, 28, 35, 0.62)' },
                  ]}
                />
              )}
            </Pressable>

            <View
              style={[
                styles.sheet,
                {
                  paddingBottom: insets.bottom + space.xl,
                  maxHeight: windowH * 0.72,
                },
              ]}
            >
              <View style={styles.sheetGrab} />
              <View style={styles.additionalSheetTitleRow}>
                <Text
                  style={[styles.sheetTitle, styles.sheetTitleInRow]}
                  numberOfLines={2}
                >
                  Add verification
                </Text>
                <Pressable
                  accessibilityLabel='Close'
                  hitSlop={14}
                  onPress={() => setAdditionalSheetOpen(false)}
                  style={({ pressed }) => [
                    styles.additionalSheetCloseWrap,
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <Ionicons name='close' size={28} color={labelSecondary} />
                </Pressable>
              </View>
              <Text style={[styles.sheetHelper, { marginBottom: space.lg }]}>
                Optional — your school email already unlocks credits. Layer on
                more proof when these channels go live so roommates recognize
                you instantly.
              </Text>
              <View style={styles.optionList}>
                <UnavailableVerificationRow
                  title='LinkedIn'
                  meta='Professional profile · one tap'
                  icon='logo-linkedin'
                />
                <UnavailableVerificationRow
                  title='Instagram'
                  meta='Connect your handle'
                  icon='logo-instagram'
                />
                <UnavailableVerificationRow
                  title='Phone number'
                  meta='SMS verification'
                  icon='call-outline'
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function SheetPrimaryButton({
  label,
  disabled,
  width,
  onPress,
}: {
  label: string;
  disabled: boolean;
  width: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole='button'
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.sheetBtnOuter,
        { width },
        disabled && styles.sheetBtnOuterDisabled,
        !disabled && pressed && { transform: [{ scale: 0.985 }] },
      ]}
    >
      <LinearGradient
        colors={disabled ? GRADIENT_OFF : GRADIENT_ON}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.sheetBtnGrad}
      >
        <Text
          style={[styles.sheetBtnLabel, disabled && styles.sheetBtnLabelDis]}
        >
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
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
    backgroundColor: '#FFFFFF',
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
    color: captionMuted,
    letterSpacing: -0.2,
  },
  progressBlock: {
    paddingBottom: space.sm,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: '#EBEBED',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressCaption: {
    marginTop: space.xs + 2,
    fontSize: type.caption,
    fontWeight: '600',
    color: captionMuted,
    letterSpacing: -0.1,
  },
  mainColumn: {
    flex: 1,
    minHeight: 0,
  },
  mainContent: {
    flex: 1,
    minHeight: 0,
    justifyContent: 'flex-start',
  },
  mainContentInner: {
    width: '100%',
    alignSelf: 'center',
  },
  mainContentInnerCompact: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  mainContentInnerVerified: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    minHeight: 0,
  },
  celebrateWrap: {
    flex: 1,
    width: '100%',
    minHeight: 0,
  },
  celebrateScrollView: {
    flex: 1,
    width: '100%',
  },
  celebrateScroll: {
    paddingTop: space.sm,
    paddingBottom: space.sm,
    alignItems: 'center',
  },
  celebrateScrollCompact: {
    paddingTop: 0,
    paddingBottom: space.xs,
  },
  celebrateCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: radius.xl + 10,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(47, 109, 246, 0.12)',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.12,
        shadowRadius: 36,
      },
      android: { elevation: 5 },
    }),
  },
  celebrateCardCompact: {
    borderRadius: radius.xl + 4,
  },
  celebrateMeshA: {
    position: 'absolute',
    top: -40,
    right: -60,
    width: 220,
    height: 220,
    transform: [{ rotate: '-12deg' }],
  },
  celebrateMeshB: {
    position: 'absolute',
    bottom: -30,
    left: -50,
    width: 200,
    height: 200,
    transform: [{ rotate: '18deg' }],
  },
  celebrateMeshBlob: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  celebrateMeshBlobB: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  celebrateInner: {
    paddingHorizontal: space.xl,
    paddingTop: space.xl + 4,
    paddingBottom: space.lg,
    alignItems: 'center',
  },
  celebrateCreditChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 8,
    paddingHorizontal: space.md + 2,
    borderRadius: radius.pill,
    marginBottom: space.xl,
    borderWidth: 1,
    borderColor: 'rgba(47, 109, 246, 0.18)',
  },
  celebrateCreditChipText: {
    fontSize: type.caption,
    fontWeight: '700',
    color: '#1A3A8A',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  celebrateHeroMark: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.xl,
    position: 'relative',
    width: 120,
    height: 120,
  },
  celebratePulseRing: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 2,
    borderColor: 'rgba(47, 109, 246, 0.35)',
  },
  celebrateSealRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    padding: 3,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
    }),
  },
  celebrateSealRingCompact: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 3,
  },
  celebrateSealCore: {
    flex: 1,
    borderRadius: 51,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrateSealCoreCompact: {
    borderRadius: 45,
  },
  celebrateSealBadge: {
    position: 'absolute',
    top: -4,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.45)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  celebrateTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F1729',
    letterSpacing: -1.1,
    lineHeight: 38,
    marginBottom: space.sm + 2,
    textAlign: 'center',
  },
  celebrateTitleCompact: {
    fontSize: 27,
    lineHeight: 33,
    letterSpacing: -0.85,
  },
  celebrateSubtitle: {
    fontSize: type.body,
    lineHeight: 23,
    color: '#4A5568',
    fontWeight: '400',
    letterSpacing: -0.22,
    marginBottom: space.xl,
    textAlign: 'center',
    maxWidth: 328,
  },
  celebrateEmailShell: {
    width: '100%',
    borderRadius: radius.lg + 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(47, 109, 246, 0.14)',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#1e293b',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
      },
      android: { elevation: 2 },
    }),
  },
  celebrateBlurFill: {
    ...StyleSheet.absoluteFillObject,
  },
  celebrateEmailAndroidBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
  },
  celebrateEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md + 4,
    paddingHorizontal: space.lg,
  },
  celebrateEmailIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrateEmailCopy: {
    flex: 1,
    minWidth: 0,
  },
  celebrateEmailLabel: {
    fontSize: type.caption,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: -0.05,
    marginBottom: 4,
  },
  celebrateEmailValue: {
    fontSize: type.bodyLarge,
    fontWeight: '600',
    color: '#0F1729',
    letterSpacing: -0.4,
  },
  celebrateEmailTrail: {
    flexShrink: 0,
  },
  celebrateFootnote: {
    marginTop: space.lg + 4,
    fontSize: type.caption,
    lineHeight: 18,
    color: '#64748B',
    fontWeight: '500',
    letterSpacing: -0.08,
    textAlign: 'center',
    maxWidth: 310,
  },
  completionDock: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: space.sm + 2,
    paddingTop: space.sm + 2,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(15, 23, 41, 0.06)',
  },
  completionSecondary: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: 'rgba(47, 109, 246, 0.45)',
    backgroundColor: '#FFFFFF',
  },
  completionSecondaryPressed: {
    backgroundColor: 'rgba(47, 109, 246, 0.06)',
    transform: [{ scale: 0.99 }],
  },
  completionSecondaryIcon: {
    flexShrink: 0,
  },
  completionSecondaryLabel: {
    fontSize: type.body,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.28,
    flexShrink: 1,
  },
  completionPrimaryOuter: {
    flex: 1,
    minWidth: 0,
    borderRadius: radius.pill,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.32,
        shadowRadius: 14,
      },
      android: { elevation: 6 },
    }),
  },
  completionPrimaryPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.96,
  },
  completionPrimaryGrad: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
  },
  completionPrimaryLabel: {
    color: '#FFFFFF',
    fontSize: type.bodyLarge,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  completionPrimaryChevron: {
    marginTop: 1,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.75,
    lineHeight: 34,
    marginBottom: space.xs + 2,
    width: '100%',
  },
  screenSubtitle: {
    fontSize: type.body,
    lineHeight: 21,
    color: labelSecondary,
    fontWeight: '400',
    letterSpacing: -0.2,
    marginBottom: space.lg,
    width: '100%',
  },
  screenSubtitleCompact: {
    marginBottom: space.md,
    lineHeight: 20,
  },
  verifyBlock: {
    alignSelf: 'center',
    width: '100%',
  },
  verifyAccentBar: {
    width: 32,
    height: 3,
    borderRadius: 2,
    marginBottom: space.md,
  },
  verifyAccentBarCompact: {
    marginBottom: space.sm,
  },
  verifyKicker: {
    fontSize: 20,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.5,
    lineHeight: 25,
    marginBottom: 6,
  },
  verifyKickerCompact: {
    fontSize: 18,
    lineHeight: 22,
    marginBottom: 4,
  },
  verifySubtle: {
    fontSize: type.caption,
    lineHeight: 18,
    color: captionMuted,
    fontWeight: '500',
    letterSpacing: -0.05,
    marginBottom: space.md,
    maxWidth: 340,
  },
  verifySubtleCompact: {
    marginBottom: space.sm,
    lineHeight: 17,
  },
  optionList: {
    gap: space.sm,
  },
  optionListCompact: {
    gap: space.xs + 2,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 76,
    paddingVertical: 0,
    paddingHorizontal: space.md,
    borderRadius: radius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(60, 60, 67, 0.1)',
    gap: space.sm,
  },
  optionCardCompact: {
    height: 62,
    paddingHorizontal: space.sm + 2,
    gap: space.sm,
  },
  optionCardDoneSchool: {
    borderColor: 'rgba(52, 199, 89, 0.45)',
    backgroundColor: 'rgba(52, 199, 89, 0.04)',
  },
  optionCardAvailable: {
    backgroundColor: 'rgba(47, 109, 246, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(47, 109, 246, 0.32)',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  optionCardAvailablePressed: {
    backgroundColor: 'rgba(47, 109, 246, 0.11)',
    borderColor: 'rgba(47, 109, 246, 0.45)',
    transform: [{ scale: 0.992 }],
  },
  optionCardUnavailable: {
    opacity: 0.78,
    backgroundColor: '#F9F9FA',
    borderColor: 'rgba(60, 60, 67, 0.06)',
  },
  optionIconRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(60, 60, 67, 0.12)',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconRingCompact: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  optionIconRingDone: {
    borderColor: successGreen,
    backgroundColor: successGreen,
  },
  optionIconRingAvailable: {
    borderColor: 'rgba(47, 109, 246, 0.45)',
    backgroundColor: 'rgba(47, 109, 246, 0.1)',
  },
  optionIconRingMuted: {
    borderColor: 'rgba(60, 60, 67, 0.08)',
    backgroundColor: '#F2F2F7',
  },
  optionCopy: {
    flex: 1,
    gap: 3,
  },
  optionTitle: {
    fontSize: type.bodyLarge,
    fontWeight: '600',
    color: ink,
    letterSpacing: -0.35,
  },
  optionMeta: {
    fontSize: type.caption,
    lineHeight: 18,
    color: labelSecondary,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  optionTitleMuted: {
    fontSize: type.bodyLarge,
    fontWeight: '600',
    color: '#AEAEB2',
    letterSpacing: -0.35,
  },
  optionMetaMuted: {
    fontSize: type.caption,
    lineHeight: 18,
    color: '#C7C7CC',
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  optionTrailIcon: {
    flexShrink: 0,
  },
  soonPill: {
    paddingHorizontal: space.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: '#ECECEF',
  },
  soonPillCompact: {
    paddingVertical: 4,
    paddingHorizontal: space.sm,
  },
  soonPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: captionMuted,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  modalRoot: {
    flex: 1,
  },
  modalStack: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.07,
        shadowRadius: 24,
      },
      android: { elevation: 12 },
    }),
  },
  sheetGrab: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D1D6',
    marginBottom: space.lg,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.sm,
  },
  sheetHeaderSpacer: { width: 28 },
  /** “Add verification” sheet — title + close on one baseline. */
  additionalSheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: space.md,
    gap: space.sm,
  },
  sheetTitleInRow: {
    flex: 1,
    minWidth: 0,
    marginBottom: 0,
  },
  additionalSheetCloseWrap: {
    flexShrink: 0,
  },
  sheetTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.65,
    lineHeight: 32,
    marginBottom: space.xl,
  },
  fieldCaption: {
    fontSize: type.caption,
    fontWeight: '600',
    color: labelSecondary,
    marginBottom: space.sm,
    letterSpacing: -0.1,
  },
  sheetInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: radius.md,
    borderWidth: 0,
    paddingHorizontal: space.lg,
    paddingVertical: Platform.select({ ios: 17, default: 15 }),
    fontSize: type.bodyLarge,
    color: ink,
    marginBottom: space.md,
    fontWeight: '500',
  },
  sheetHelper: {
    fontSize: type.caption,
    lineHeight: 20,
    color: captionMuted,
    marginBottom: space.xxl,
    fontWeight: '500',
    letterSpacing: -0.05,
  },
  sheetBtnOuter: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    alignSelf: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  sheetBtnOuterDisabled: {
    ...Platform.select({
      ios: { shadowOpacity: 0 },
      android: { elevation: 0 },
    }),
  },
  sheetBtnGrad: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  sheetBtnLabel: {
    color: '#FFFFFF',
    fontSize: type.bodyLarge,
    fontWeight: '700',
    letterSpacing: -0.25,
  },
  sheetBtnLabelDis: {
    color: 'rgba(255,255,255,0.95)',
  },
  codeBody: {
    fontSize: type.body,
    lineHeight: 22,
    color: labelSecondary,
    marginBottom: space.sm,
    letterSpacing: -0.2,
  },
  codeEmail: {
    fontWeight: '700',
    color: ink,
  },
  codeSpam: {
    fontSize: type.caption,
    color: captionMuted,
    marginBottom: space.lg,
    lineHeight: 18,
    fontWeight: '500',
  },
  otpTouch: {
    marginBottom: space.md,
    position: 'relative',
  },
  otpHiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.02,
    zIndex: 2,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  otpCell: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(60, 60, 67, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    maxWidth: 50,
  },
  otpChar: {
    fontSize: 19,
    fontWeight: '600',
    color: ink,
    letterSpacing: 0,
  },
  resendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: space.xl,
    gap: 4,
  },
  resendLine: {
    fontSize: type.caption,
    color: captionMuted,
    fontWeight: '500',
  },
  resendMuted: {
    color: captionMuted,
    fontWeight: '600',
  },
  resendActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
