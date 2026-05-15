import Ionicons from '@expo/vector-icons/Ionicons';
import { OnboardingProgressBlock } from '../components/OnboardingProgressBlock';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  type LayoutChangeEvent,
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
import { DatePickerSheet } from '../components/DatePickerSheet';
import { OnboardingBottomCta } from '../components/OnboardingBottomCta';
import { useOnboardingCtaLayout } from '../design/onboardingCtaLayout';
import { colors, radius, space, type } from '../design/theme';

const ink = '#1C1C1E';
const labelSecondary = '#636366';
const captionMuted = '#8E8E93';
const fieldFill = '#F2F2F7';
const fieldBorder = 'rgba(60, 60, 67, 0.12)';
const required = '#FF3B30';

type PersonalOnboardingScreenTwoProps = {
  onExit: () => void;
  onContinue?: () => void;
};

type FieldScrollKey =
  | 'legalFirst'
  | 'legalLast'
  | 'preferred'
  | 'birthday';

function parseBirthPart(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const n = Number.parseInt(t, 10);
  return Number.isFinite(n) ? n : null;
}

/** Letters A–Z / a–z and spaces only (no digits, punctuation, or other scripts). */
function sanitizeEnglishNameInput(input: string): string {
  return input.replace(/[^A-Za-z ]/g, '');
}

export function PersonalOnboardingScreenTwo({
  onExit,
  onContinue,
}: PersonalOnboardingScreenTwoProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { padH, primaryButtonWidth } = useOnboardingCtaLayout();

  /** Step 1 of 6 — lifestyle is `PersonalOnboardingScreenSeven`. */
  const ONBOARDING_TOTAL_STEPS = 6;
  const onboardingStepNumber = 1;
  const progressRatio = 1 / 6;

  const [legalFirst, setLegalFirst] = useState('');
  const [legalLast, setLegalLast] = useState('');
  const [preferred, setPreferred] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthdayPickerOpen, setBirthdayPickerOpen] = useState(false);

  const introValid =
    legalFirst.trim().length > 0 &&
    legalLast.trim().length > 0 &&
    birthMonth.trim().length > 0 &&
    birthDay.trim().length > 0 &&
    birthYear.trim().length === 4;

  const handlePrimary = () => {
    if (introValid) {
      onContinue?.();
    }
  };

  const birthdaySummary = useMemo(() => {
    const m = parseBirthPart(birthMonth);
    const d = parseBirthPart(birthDay);
    const y = parseBirthPart(birthYear);
    if (
      m == null ||
      d == null ||
      y == null ||
      birthYear.trim().length !== 4
    ) {
      return null;
    }
    return `${m} · ${d} · ${y}`;
  }, [birthMonth, birthDay, birthYear]);

  const scrollRef = useRef<ScrollView>(null);
  const fieldLayout = useRef<
    Partial<Record<FieldScrollKey, { y: number; h: number }>>
  >({});
  const [keyboardBottomInset, setKeyboardBottomInset] = useState(0);
  const keyboardInsetRef = useRef(0);

  useEffect(() => {
    keyboardInsetRef.current = keyboardBottomInset;
  }, [keyboardBottomInset]);

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
   * Small bottom inset when the keyboard is open — just enough to scroll the
   * last row above the pill (KeyboardAvoidingView already lifts the dock).
   * Avoid keyboard-sized padding; it caused huge empty gaps + bad scrollToEnd.
   */
  const scrollPaddingBottom =
    space.xl +
    (keyboardBottomInset > 0 ? space.xxl + space.md : 0);

  const captureFieldLayout =
    (key: FieldScrollKey) => (e: LayoutChangeEvent) => {
      const { y, height } = e.nativeEvent.layout;
      fieldLayout.current[key] = { y, h: height };
    };

  /**
   * Scroll the focused field into the visible band above the keyboard + CTA.
   * Uses measured layout.y / height within the scroll content.
   */
  const scrollToField = (key: FieldScrollKey) => {
    const delayMs = Platform.OS === 'ios' ? 72 : 96;
    const topGap = space.lg + space.sm;
    const bottomMargin = space.md;

    const applyScroll = () => {
      const kb = keyboardInsetRef.current;
      /** Space above scroll area: safe area + back + progress + small buffer. */
      const reservedTop = insets.top + 118;
      /** Space below scroll area: keyboard + docked pill + breathing room. */
      const reservedBottom =
        kb > 0 ? kb + 56 + space.md : insets.bottom + 72;
      const viewportH = Math.max(
        220,
        windowHeight - reservedTop - reservedBottom,
      );

      const meta = fieldLayout.current[key];
      const sv = scrollRef.current;
      if (!meta || !sv) return;
      const { y, h } = meta;
      let scrollY = y - topGap;
      const fieldBottom = y + h;
      const visibleBottom = scrollY + viewportH - bottomMargin;
      if (fieldBottom > visibleBottom) {
        scrollY = fieldBottom - viewportH + bottomMargin;
      }
      scrollY = Math.max(0, scrollY);
      sv.scrollTo({ y: scrollY, animated: true });
    };

    const tryLayout = (attempt: number) => {
      if (fieldLayout.current[key] && scrollRef.current) {
        applyScroll();
      } else if (attempt < 10) {
        setTimeout(() => tryLayout(attempt + 1), 45);
      }
    };

    requestAnimationFrame(() => {
      setTimeout(() => tryLayout(0), delayMs);
      /** Second pass: keyboard height often updates after first focus frame. */
      setTimeout(() => tryLayout(0), 300);
    });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style='dark' />

      <View style={[styles.headerRow, { paddingHorizontal: padH }]}>
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Go back'
          onPress={onExit}
          hitSlop={12}
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.backBtnPressed,
          ]}
        >
          <Ionicons name='chevron-back' size={26} color={ink} />
        </Pressable>
      </View>

      <OnboardingProgressBlock
        padH={padH}
        step={onboardingStepNumber}
        totalSteps={ONBOARDING_TOTAL_STEPS}
        title='Intro'
        progressRatio={progressRatio}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
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
          <Text style={styles.screenTitle}>Let&apos;s start with an intro</Text>
          <Text style={styles.screenSubtitle}>
            We&apos;ll use your legal name for verification. Your preferred name
            is what others see.
          </Text>

          <View
            style={styles.section}
            collapsable={false}
            onLayout={captureFieldLayout('legalFirst')}
          >
            <FieldLabel text='Legal first name' required />
            <TextInput
              value={legalFirst}
              onChangeText={(t) =>
                setLegalFirst(sanitizeEnglishNameInput(t))
              }
              onFocus={() => scrollToField('legalFirst')}
              placeholder='First name'
              placeholderTextColor={captionMuted}
              style={styles.input}
              autoCapitalize='words'
              autoCorrect={false}
              keyboardType={
                Platform.OS === 'ios' ? 'ascii-capable' : 'default'
              }
              selectionColor={colors.primary}
            />
          </View>

          <View
            style={styles.section}
            collapsable={false}
            onLayout={captureFieldLayout('legalLast')}
          >
            <FieldLabel text='Legal last name' required />
            <TextInput
              value={legalLast}
              onChangeText={(t) =>
                setLegalLast(sanitizeEnglishNameInput(t))
              }
              onFocus={() => scrollToField('legalLast')}
              placeholder='Last name'
              placeholderTextColor={captionMuted}
              style={styles.input}
              autoCapitalize='words'
              autoCorrect={false}
              keyboardType={
                Platform.OS === 'ios' ? 'ascii-capable' : 'default'
              }
              selectionColor={colors.primary}
            />
            <Text style={styles.helper}>
              Please note that changing your legal name later may be limited.
            </Text>
          </View>

          <View
            style={styles.section}
            collapsable={false}
            onLayout={captureFieldLayout('preferred')}
          >
            <FieldLabel text='Preferred name' required={false} />
            <TextInput
              value={preferred}
              onChangeText={(t) =>
                setPreferred(sanitizeEnglishNameInput(t))
              }
              onFocus={() => scrollToField('preferred')}
              placeholder='How should we call you?'
              placeholderTextColor={captionMuted}
              style={styles.input}
              autoCapitalize='words'
              autoCorrect={false}
              keyboardType={
                Platform.OS === 'ios' ? 'ascii-capable' : 'default'
              }
              selectionColor={colors.primary}
            />
            <Text style={styles.helper}>
              This is the name that will appear on your profile.
            </Text>
          </View>

          <View
            style={styles.section}
            collapsable={false}
            onLayout={captureFieldLayout('birthday')}
          >
            <FieldLabel text='Birthday' required />
            <Pressable
              accessibilityRole='button'
              accessibilityLabel={
                birthdaySummary
                  ? `Birthday ${birthdaySummary}`
                  : 'Select birthday'
              }
              onPress={() => {
                Keyboard.dismiss();
                setBirthdayPickerOpen(true);
                scrollToField('birthday');
              }}
              style={({ pressed }) => [
                styles.birthdayTrigger,
                pressed && styles.birthdayTriggerPressed,
              ]}
            >
              <Text
                style={[
                  styles.birthdayTriggerText,
                  !birthdaySummary && styles.birthdayTriggerPlaceholder,
                ]}
                numberOfLines={1}
              >
                {birthdaySummary ?? 'Select birthday'}
              </Text>
              <Ionicons
                name='chevron-down'
                size={20}
                color={labelSecondary}
              />
            </Pressable>
          </View>
        </ScrollView>

        <OnboardingBottomCta
          label='Continue'
          onPress={handlePrimary}
          disabled={!introValid}
          padH={padH}
          safeBottomInset={
            keyboardBottomInset > 0 ? 0 : insets.bottom
          }
          buttonWidth={primaryButtonWidth}
        />
      </KeyboardAvoidingView>

      <DatePickerSheet
        visible={birthdayPickerOpen}
        onClose={() => setBirthdayPickerOpen(false)}
        onConfirm={(m, d, y) => {
          setBirthMonth(String(m));
          setBirthDay(String(d));
          setBirthYear(String(y));
        }}
        initialMonth={parseBirthPart(birthMonth)}
        initialDay={parseBirthPart(birthDay)}
        initialYear={parseBirthPart(birthYear)}
        title='Birthday'
        hint='Scroll to set month, day, and year.'
        confirmLabel='Done'
        dismissAccessibilityLabel='Dismiss birthday picker'
        confirmAccessibilityLabel='Save birthday'
      />
    </View>
  );
}

function FieldLabel({
  text,
  required: req,
}: {
  text: string;
  required?: boolean;
}) {
  return (
    <Text style={styles.fieldLabel}>
      {text}
      {req ? <Text style={styles.asterisk}> *</Text> : null}
    </Text>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  headerRow: {
    paddingBottom: space.xs,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginLeft: -space.xs,
    padding: space.xs,
    borderRadius: radius.sm,
  },
  backBtnPressed: {
    opacity: 0.55,
  },
  scrollContent: {
    paddingTop: space.xs,
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.8,
    lineHeight: 36,
    marginBottom: space.sm,
  },
  screenSubtitle: {
    fontSize: type.body,
    lineHeight: 22,
    color: labelSecondary,
    fontWeight: '400',
    letterSpacing: -0.2,
    marginBottom: space.xl,
  },
  section: {
    marginBottom: space.lg + space.sm,
  },
  fieldLabel: {
    fontSize: type.caption,
    fontWeight: '600',
    color: labelSecondary,
    letterSpacing: -0.1,
    marginBottom: space.sm,
    textTransform: 'uppercase',
  },
  asterisk: {
    color: required,
    fontWeight: '600',
  },
  input: {
    backgroundColor: fieldFill,
    borderRadius: radius.sm + 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: fieldBorder,
    paddingHorizontal: space.lg,
    paddingVertical: Platform.select({ ios: 15, default: 14 }),
    fontSize: type.bodyLarge,
    color: ink,
    fontWeight: '400',
    letterSpacing: -0.3,
  },
  helper: {
    marginTop: space.sm,
    fontSize: type.micro,
    lineHeight: 16,
    color: captionMuted,
    letterSpacing: -0.05,
  },
  birthdayTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    backgroundColor: fieldFill,
    borderRadius: radius.sm + 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: fieldBorder,
    paddingHorizontal: space.lg,
    paddingVertical: Platform.select({ ios: 15, default: 14 }),
    minHeight: Platform.select({ ios: 52, default: 50 }),
  },
  birthdayTriggerPressed: {
    opacity: 0.88,
  },
  birthdayTriggerText: {
    flex: 1,
    fontSize: type.bodyLarge,
    color: ink,
    fontWeight: '500',
    letterSpacing: -0.25,
    lineHeight: 22,
  },
  birthdayTriggerPlaceholder: {
    color: captionMuted,
    fontWeight: '400',
  },
});
