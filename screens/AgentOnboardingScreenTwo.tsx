import Ionicons from '@expo/vector-icons/Ionicons';
import { OnboardingProgressBlock } from '../components/OnboardingProgressBlock';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
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
import { OnboardingBottomCta } from '../components/OnboardingBottomCta';
import { useOnboardingCtaLayout } from '../design/onboardingCtaLayout';
import { colors, radius, space, type } from '../design/theme';

const ink = '#1C1C1E';
const labelSecondary = '#636366';
const captionMuted = '#8E8E93';
const fieldFill = '#F2F2F7';
const fieldBorder = 'rgba(60, 60, 67, 0.12)';
const required = '#FF3B30';

/** Agent profile onboarding (intro → bio → verify): 3 steps total. */
const TOTAL_STEPS = 3;

function sanitizeDigitsOnly(input: string): string {
  return input.replace(/\D/g, '');
}

type AgentOnboardingScreenTwoProps = {
  onBackToRules: () => void;
  onIntroContinue?: () => void;
};

type FieldScrollKey =
  | 'legalFirst'
  | 'legalLast'
  | 'preferred'
  | 'brokerage'
  | 'licenseNum';

export function AgentOnboardingScreenTwo({
  onBackToRules,
  onIntroContinue,
}: AgentOnboardingScreenTwoProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { padH, contentMaxW, primaryButtonWidth } = useOnboardingCtaLayout();
  const [keyboardBottomInset, setKeyboardBottomInset] = useState(0);
  const keyboardInsetRef = useRef(0);
  const scrollRef = useRef<ScrollView>(null);
  const fieldLayout = useRef<
    Partial<Record<FieldScrollKey, { y: number; h: number }>>
  >({});

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [brokerage, setBrokerage] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  useEffect(() => {
    keyboardInsetRef.current = keyboardBottomInset;
  }, [keyboardBottomInset]);

  useEffect(() => {
    const show =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hide =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const s = Keyboard.addListener(show, (e) =>
      setKeyboardBottomInset(e.endCoordinates.height),
    );
    const h = Keyboard.addListener(hide, () => setKeyboardBottomInset(0));
    return () => {
      s.remove();
      h.remove();
    };
  }, []);

  const captureFieldLayout =
    (key: FieldScrollKey) => (e: LayoutChangeEvent) => {
      const { y, height } = e.nativeEvent.layout;
      fieldLayout.current[key] = { y, h: height };
    };

  const scrollToField = (key: FieldScrollKey) => {
    const delayMs = Platform.OS === 'ios' ? 72 : 96;
    const topGap = space.lg + space.sm;
    const bottomMargin = space.md;

    const applyScroll = () => {
      const kb = keyboardInsetRef.current;
      const reservedTop = insets.top + 118;
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
      setTimeout(() => tryLayout(0), 300);
    });
  };

  const progressStepNumber = 1;
  const progressRatio = progressStepNumber / TOTAL_STEPS;

  const canContinue = useMemo(
    () =>
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      brokerage.trim().length > 0 &&
      licenseNumber.trim().length > 0,
    [firstName, lastName, brokerage, licenseNumber],
  );

  const goBack = () => {
    onBackToRules();
  };

  const goNext = () => {
    if (!canContinue) return;
    onIntroContinue?.();
  };

  const scrollPadBottom =
    space.xl + (keyboardBottomInset > 0 ? space.xxl + space.md : 0);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style='dark' />

      <View style={[styles.headerRow, { paddingHorizontal: padH }]}>
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Go back'
          onPress={goBack}
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
        step={progressStepNumber}
        totalSteps={TOTAL_STEPS}
        title='Intro'
        progressRatio={progressRatio}
      />

      <Text
        style={[styles.pageEyebrow, { paddingHorizontal: padH }]}
        accessibilityRole='header'
      >
        PROFILE
      </Text>

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
              paddingBottom: scrollPadBottom,
            },
          ]}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode={
            Platform.OS === 'ios' ? 'interactive' : 'on-drag'
          }
          showsVerticalScrollIndicator={keyboardBottomInset > 0}
        >
          <>
              <View style={[styles.heroBlock, { maxWidth: contentMaxW }]}>
                <Text style={styles.screenTitle}>
                  Let&apos;s start with an intro
                </Text>
                <Text style={styles.screenSubtitle}>
                  We use your legal name for identity verification and your
                  brokerage and license number to confirm your license.
                </Text>
              </View>
              <View
                collapsable={false}
                onLayout={captureFieldLayout('legalFirst')}
              >
                <FieldBlock label='Legal first name' required>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    onFocus={() => scrollToField('legalFirst')}
                    placeholder='First name'
                    placeholderTextColor={captionMuted}
                    style={styles.input}
                    autoCapitalize='words'
                    selectionColor={colors.primary}
                  />
                </FieldBlock>
              </View>
              <View
                collapsable={false}
                onLayout={captureFieldLayout('legalLast')}
              >
                <FieldBlock label='Legal last name' required>
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    onFocus={() => scrollToField('legalLast')}
                    placeholder='Last name'
                    placeholderTextColor={captionMuted}
                    style={styles.input}
                    autoCapitalize='words'
                    selectionColor={colors.primary}
                  />
                </FieldBlock>
              </View>
              <View
                collapsable={false}
                onLayout={captureFieldLayout('preferred')}
              >
                <FieldBlock label='Preferred name'>
                  <TextInput
                    value={preferredName}
                    onChangeText={setPreferredName}
                    onFocus={() => scrollToField('preferred')}
                    placeholder='How should we call you?'
                    placeholderTextColor={captionMuted}
                    style={styles.input}
                    autoCapitalize='words'
                    selectionColor={colors.primary}
                  />
                </FieldBlock>
              </View>
              <View
                collapsable={false}
                onLayout={captureFieldLayout('brokerage')}
              >
                <FieldBlock label='Brokerage' required>
                  <TextInput
                    value={brokerage}
                    onChangeText={setBrokerage}
                    onFocus={() => scrollToField('brokerage')}
                    placeholder='Enter your brokerage'
                    placeholderTextColor={captionMuted}
                    style={styles.input}
                    selectionColor={colors.primary}
                  />
                </FieldBlock>
              </View>
              <View
                collapsable={false}
                onLayout={captureFieldLayout('licenseNum')}
              >
                <FieldBlock label='License number' required>
                  <TextInput
                    value={licenseNumber}
                    onChangeText={(t) =>
                      setLicenseNumber(sanitizeDigitsOnly(t))
                    }
                    onFocus={() => scrollToField('licenseNum')}
                    placeholder='Enter your license number'
                    placeholderTextColor={captionMuted}
                    style={styles.input}
                    keyboardType='number-pad'
                    autoCorrect={false}
                    selectionColor={colors.primary}
                  />
                </FieldBlock>
              </View>
          </>
        </ScrollView>

        <OnboardingBottomCta
          label='Continue'
          onPress={goNext}
          disabled={!canContinue}
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

function FieldBlock({
  label,
  required: req,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>
        {label}
        {req ? <Text style={styles.asterisk}> *</Text> : null}
      </Text>
      {children}
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
    paddingBottom: space.xs,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginLeft: -space.xs,
    padding: space.xs,
    borderRadius: radius.sm,
  },
  backBtnPressed: { opacity: 0.55 },
  scrollContent: {
    paddingTop: space.xs,
  },
  heroBlock: {
    width: '100%',
    alignSelf: 'center',
    marginBottom: 0,
  },
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
  screenSubtitle: {
    fontSize: type.body,
    lineHeight: 22,
    color: labelSecondary,
    fontWeight: '400',
    letterSpacing: -0.2,
    marginBottom: space.xl,
  },
  fieldBlock: {
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
});
