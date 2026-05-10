import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ImageBackground,
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
import { OnboardingBottomCta } from '../../components/OnboardingBottomCta';
import { useOnboardingCtaLayout } from '../../design/onboardingCtaLayout';
import { colors, radius, space, type } from '../../design/theme';

const ink = '#0f172a';
/** Matches `PersonalOnboardingScreenSix` school verification sheet. */
const verifyInk = '#1C1C1C';
const labelSecondary = '#636366';
const captionMuted = '#8E8E93';
const slate = '#475569';
const muted = '#64748b';
const danger = '#DC2626';
const SUCCESS_GREEN = '#16A34A';
const sheetBg = '#ffffff';
const line = '#E2E7EF';
const OTP_LEN = 6;
/** Retain ~40% of prior bottom padding under Continue (~60% reduction in empty space). */
const VERIFY_BOTTOM_FR = 0.4;
/** Success sheet: ~2× a short “bottom third” card (≈ ⅔ of screen height). */
const VERIFIED_SHEET_MIN_H_RATIO = 2 / 3;

export type EmailSignupFlowProps = {
  visible: boolean;
  onClose: () => void;
  /** Called after the post-verify success message (~2s). */
  onFinished?: () => void;
};

type Step = 'signup' | 'verify' | 'verifiedSuccess';

function evaluatePassword(pw: string) {
  const lenOk = pw.length >= 10;
  const upperOk = /[A-Z]/.test(pw);
  const lowerOk = /[a-z]/.test(pw);
  const numOk = /\d/.test(pw);
  const specialOk = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw);
  const score =
    [lenOk, upperOk, lowerOk, numOk, specialOk].filter(Boolean).length;
  let label = 'Weak';
  let hue: [string, string] = ['#FB923C', '#EA580C'];
  if (score >= 5) {
    label = 'Very Strong';
    hue = ['#34D399', '#059669'];
  } else if (score >= 4) {
    label = 'Strong';
    hue = ['#86EFAC', '#16A34A'];
  } else if (score >= 3) {
    label = 'Fair';
    hue = ['#FDE047', '#CA8A04'];
  }
  return {
    lenOk,
    upperOk,
    lowerOk,
    numOk,
    specialOk,
    score,
    label,
    hue,
    pct: score / 5,
  };
}

export function EmailSignupFlow({
  visible,
  onClose,
  onFinished,
}: EmailSignupFlowProps) {
  const insets = useSafeAreaInsets();
  const { height: windowH } = useWindowDimensions();
  const { primaryButtonWidth } = useOnboardingCtaLayout();
  /** Taller inset = shorter sheet card (more hero visible). */
  const sheetTopGap = Math.round(windowH * 0.19);
  const codeInputRef = useRef<TextInput>(null);

  const [step, setStep] = useState<Step>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [focusedField, setFocusedField] = useState<
    'email' | 'password' | 'confirm' | null
  >(null);
  const [code, setCode] = useState('');
  const [resendSec, setResendSec] = useState(59);
  const [keyboardInset, setKeyboardInset] = useState(0);

  const verifyDockBottomInset = Math.max(
    space.xs,
    Math.round(insets.bottom * VERIFY_BOTTOM_FR),
  );
  const verifyDockPaddingTop = Math.max(
    space.xs,
    Math.round(space.sm * VERIFY_BOTTOM_FR),
  );
  const verifySheetPadBottom =
    keyboardInset > 0
      ? Math.max(space.xs, Math.round(space.sm * VERIFY_BOTTOM_FR))
      : Math.max(space.xs, Math.round(space.md * VERIFY_BOTTOM_FR));
  const verifyScrollPadBottom = Math.max(
    space.xs,
    Math.round(space.md * VERIFY_BOTTOM_FR),
  );

  const scrollRef = useRef<ScrollView>(null);
  const pwStudioY = useRef(0);
  const confirmSectionY = useRef(0);

  const pwMeta = useMemo(() => evaluatePassword(password), [password]);
  const emailOk = useMemo(() => {
    const t = email.trim();
    return t.includes('@') && t.includes('.') && t.length > 5;
  }, [email]);
  const matchOk =
    password.length > 0 && confirm.length > 0 && password === confirm;
  const mismatch =
    confirm.length > 0 && password.length > 0 && password !== confirm;

  const canCreate =
    emailOk &&
    pwMeta.score >= 5 &&
    matchOk;

  useEffect(() => {
    if (!visible || step !== 'verify') return;
    setResendSec(59);
    const id = setInterval(() => {
      setResendSec((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [visible, step]);

  useEffect(() => {
    if (!visible) {
      setStep('signup');
      setEmail('');
      setPassword('');
      setConfirm('');
      setCode('');
      setFocusedField(null);
      setKeyboardInset(0);
    }
  }, [visible]);

  useEffect(() => {
    const showEvt =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const s = Keyboard.addListener(showEvt, (e) =>
      setKeyboardInset(e.endCoordinates.height),
    );
    const h = Keyboard.addListener(hideEvt, () => setKeyboardInset(0));
    return () => {
      s.remove();
      h.remove();
    };
  }, []);

  /** After keyboard opens, scroll so Confirm password sits higher above the keyboard. */
  useEffect(() => {
    if (step !== 'signup' || focusedField !== 'confirm' || keyboardInset < 1) {
      return;
    }
    const topPadding = Math.min(140, Math.round(windowH * 0.11));
    const scrollUp = () => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, confirmSectionY.current - topPadding),
        animated: true,
      });
    };
    const t1 = requestAnimationFrame(scrollUp);
    const t2 = setTimeout(scrollUp, Platform.OS === 'ios' ? 280 : 120);
    const t3 = setTimeout(scrollUp, Platform.OS === 'ios' ? 520 : 300);
    return () => {
      cancelAnimationFrame(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [focusedField, keyboardInset, step, windowH]);

  useEffect(() => {
    if (!visible || step !== 'verifiedSuccess') return;
    Keyboard.dismiss();
    const t = setTimeout(() => {
      onFinished?.();
      onClose();
    }, 2000);
    return () => clearTimeout(t);
  }, [visible, step, onFinished, onClose]);

  const openVerify = () => {
    if (!canCreate) return;
    setStep('verify');
    setCode('');
    setTimeout(() => codeInputRef.current?.focus(), 320);
  };

  const finishVerify = () => {
    if (code.length !== OTP_LEN) return;
    Keyboard.dismiss();
    setStep('verifiedSuccess');
  };

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='fullScreen'
      onRequestClose={() => {
        if (step === 'verifiedSuccess') return;
        onClose();
      }}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <StatusBar style='light' />
        <ImageBackground
          source={require('../../assets/img/user_banner.png')}
          style={styles.heroBg}
          resizeMode='cover'
        >
          <BlurView intensity={55} tint='dark' style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={['rgba(15,23,42,0.25)', 'rgba(15,23,42,0.72)']}
            style={StyleSheet.absoluteFill}
          />
        </ImageBackground>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={
            Platform.OS === 'ios' ? insets.top + space.md : 0
          }
        >
          <View
            style={[
              styles.kavInner,
              (step === 'verify' || step === 'verifiedSuccess') &&
                styles.kavInnerDockEnd,
            ]}
          >
            {keyboardInset > 0 ? (
              <View
                pointerEvents='none'
                style={[
                  styles.keyboardGapFill,
                  { height: keyboardInset },
                ]}
              />
            ) : null}
            <View
              style={[
                styles.sheet,
                step === 'signup' ? styles.sheetSignup : styles.sheetVerify,
                step === 'signup'
                  ? { marginTop: sheetTopGap }
                  : {
                      marginTop: 0,
                      paddingBottom: verifySheetPadBottom,
                      maxHeight: windowH * 0.92,
                      ...(step === 'verifiedSuccess' && {
                        minHeight: Math.round(
                          windowH * VERIFIED_SHEET_MIN_H_RATIO,
                        ),
                      }),
                    },
              ]}
            >
            <View style={styles.sheetGrab}>
              <View style={styles.grabPill} />
            </View>

            <View style={styles.sheetHeader}>
              {step === 'verify' ? (
                <Pressable
                  accessibilityRole='button'
                  accessibilityLabel='Back'
                  hitSlop={12}
                  onPress={() => setStep('signup')}
                  style={({ pressed }) => [
                    styles.iconBtn,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Ionicons name='chevron-back' size={24} color={ink} />
                </Pressable>
              ) : (
                <View style={styles.iconBtn} />
              )}
              <Text style={styles.sheetTitle} accessibilityRole='header'>
                {step === 'signup'
                  ? 'Sign up with Email'
                  : step === 'verifiedSuccess'
                    ? 'Verified'
                    : 'Verify your email'}
              </Text>
              {step === 'verifiedSuccess' ? (
                <View style={styles.iconBtn} />
              ) : (
                <Pressable
                  accessibilityRole='button'
                  accessibilityLabel='Close'
                  hitSlop={12}
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.iconBtn,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Ionicons name='close' size={26} color={ink} />
                </Pressable>
              )}
            </View>

            {step === 'verifiedSuccess' ? null : (
              <LinearGradient
                colors={['#93C5FD', colors.primary, '#1D4ED8']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.titleAccentBar}
              />
            )}

            <View
              style={[
                styles.sheetMain,
                step === 'verify' && styles.sheetMainVerify,
                step === 'verifiedSuccess' && styles.sheetMainVerifiedFill,
              ]}
            >
              {step === 'verifiedSuccess' ? (
                <View
                  style={styles.verifiedSuccessBody}
                  accessibilityLiveRegion='polite'
                >
                  <Ionicons
                    name='checkmark-circle'
                    size={72}
                    color={SUCCESS_GREEN}
                  />
                  <Text
                    style={styles.verifiedSuccessMessage}
                    accessibilityRole='header'
                  >
                    Your email has been verified
                  </Text>
                </View>
              ) : (
              <ScrollView
                ref={scrollRef}
                style={[
                  styles.scrollFlex,
                  step === 'verify' && styles.scrollFlexVerify,
                ]}
                contentContainerStyle={[
                  styles.scrollContentSignup,
                  step === 'verify'
                    ? { paddingBottom: verifyScrollPadBottom }
                    : {
                        paddingBottom:
                          Math.round(space.md / 2) +
                          Math.min(keyboardInset * 0.06, 20),
                      },
                ]}
                keyboardShouldPersistTaps='handled'
                keyboardDismissMode='interactive'
                showsVerticalScrollIndicator={false}
              >
              {step === 'signup' ? (
                <>
                  <FieldLabel first>Email</FieldLabel>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    keyboardType='email-address'
                    autoCapitalize='none'
                    autoCorrect={false}
                    placeholder='you@example.com'
                    placeholderTextColor='#94a3b8'
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    style={[
                      styles.input,
                      focusedField === 'email' && styles.inputFocused,
                    ]}
                  />

                  <View
                    onLayout={(e) => {
                      pwStudioY.current = e.nativeEvent.layout.y;
                    }}
                  >
                    <FieldLabel>Password</FieldLabel>
                    <View style={styles.pwWrap}>
                      <TextInput
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPw}
                        placeholder='Create a password'
                        placeholderTextColor='#94a3b8'
                        onFocus={() => {
                          setFocusedField('password');
                          requestAnimationFrame(() => {
                            scrollRef.current?.scrollTo({
                              y: Math.max(0, pwStudioY.current - space.md),
                              animated: true,
                            });
                          });
                        }}
                        onBlur={() => setFocusedField(null)}
                        style={[
                          styles.input,
                          styles.inputPw,
                          focusedField === 'password' && styles.inputFocused,
                        ]}
                      />
                      <Pressable
                        accessibilityRole='button'
                        accessibilityLabel={
                          showPw ? 'Hide password' : 'Show password'
                        }
                        onPress={() => setShowPw((v) => !v)}
                        style={styles.eyeBtn}
                      >
                        <Ionicons
                          name={showPw ? 'eye-off-outline' : 'eye-outline'}
                          size={22}
                          color={muted}
                        />
                      </Pressable>
                    </View>

                    <View style={styles.pwExtras} accessibilityLiveRegion='polite'>
                      <Text style={styles.criteriaHint}>Must include</Text>
                      <View style={styles.criteriaGrid}>
                        <View style={styles.criteriaGridRow}>
                          <View style={styles.criteriaGridCell}>
                            <CriteriaRow
                              met={pwMeta.lenOk}
                              title='10+ characters'
                              hint='At least 10 characters'
                            />
                          </View>
                          <View style={styles.criteriaGridCell}>
                            <CriteriaRow
                              met={pwMeta.upperOk}
                              title='Uppercase'
                              hint='One uppercase letter A–Z'
                            />
                          </View>
                        </View>
                        <View style={styles.criteriaGridRow}>
                          <View style={styles.criteriaGridCell}>
                            <CriteriaRow
                              met={pwMeta.lowerOk}
                              title='Lowercase'
                              hint='One lowercase letter a–z'
                            />
                          </View>
                          <View style={styles.criteriaGridCell}>
                            <CriteriaRow
                              met={pwMeta.numOk}
                              title='A number'
                              hint='One digit 0–9'
                            />
                          </View>
                        </View>
                        <View style={styles.criteriaGridFullRow}>
                          <CriteriaRow
                            met={pwMeta.specialOk}
                            title='Special character'
                            hint='One special character such as ! @ #'
                            fullWidth
                          />
                        </View>
                      </View>
                    </View>
                  </View>

                  <View
                    onLayout={(e) => {
                      confirmSectionY.current = e.nativeEvent.layout.y;
                    }}
                  >
                    <FieldLabel>Confirm password</FieldLabel>
                    <TextInput
                      value={confirm}
                      onChangeText={setConfirm}
                      secureTextEntry={!showPw}
                      placeholder='Repeat your password'
                      placeholderTextColor='#94a3b8'
                      onFocus={() => {
                        setFocusedField('confirm');
                        const topPadding = Math.min(
                          140,
                          Math.round(windowH * 0.11),
                        );
                        requestAnimationFrame(() => {
                          scrollRef.current?.scrollTo({
                            y: Math.max(
                              0,
                              confirmSectionY.current - topPadding,
                            ),
                            animated: true,
                          });
                        });
                      }}
                      onBlur={() => setFocusedField(null)}
                      style={[
                        styles.input,
                        mismatch ? styles.inputErr : undefined,
                        focusedField === 'confirm' &&
                          !mismatch &&
                          styles.inputFocused,
                      ]}
                    />
                    {mismatch ? (
                      <Text style={styles.errText}>
                        Passwords do not match
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.signupFooterBlock}>
                    <Text style={styles.switchLineDock}>
                      Already have an account?{' '}
                      <Text
                        accessibilityRole='link'
                        onPress={onClose}
                        style={styles.switchLink}
                      >
                        Sign in
                      </Text>
                    </Text>
                    <OnboardingBottomCta
                      label='Create Account'
                      onPress={openVerify}
                      disabled={!canCreate}
                      padH={0}
                      safeBottomInset={insets.bottom}
                      buttonWidth={primaryButtonWidth}
                      dockBottomGap={0}
                      dockPaddingTop={space.sm}
                    />
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.verifySheetTitle}>
                    Enter verification code
                  </Text>
                  <Text style={styles.codeBody}>
                    We&apos;ve sent a {OTP_LEN}-digit code to{' '}
                    <Text style={styles.codeEmail}>
                      {email.trim() || 'your email'}
                    </Text>
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
                      value={code}
                      onChangeText={(t) =>
                        setCode(t.replace(/\D/g, '').slice(0, OTP_LEN))
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
                            {code[i] ?? '–'}
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

                  <OnboardingBottomCta
                    label='Continue'
                    onPress={finishVerify}
                    disabled={code.length !== OTP_LEN}
                    padH={0}
                    safeBottomInset={verifyDockBottomInset}
                    buttonWidth={primaryButtonWidth}
                    dockBottomGap={0}
                    dockPaddingTop={verifyDockPaddingTop}
                  />
                </>
              )}
              </ScrollView>
              )}
            </View>
          </View>
          </View>
        </KeyboardAvoidingView>
        {step === 'verifiedSuccess' ? (
          <View
            pointerEvents='auto'
            style={[StyleSheet.absoluteFillObject, styles.touchGuardOverlay]}
            accessible={false}
          />
        ) : null}
      </View>
    </Modal>
  );
}

function FieldLabel({
  children,
  first,
}: {
  children: string;
  first?: boolean;
}) {
  return (
    <Text style={[styles.fieldLabel, first && styles.fieldLabelFirst]}>
      {children}
    </Text>
  );
}

function CriteriaRow({
  met,
  title,
  hint,
  fullWidth,
}: {
  met: boolean;
  title: string;
  hint: string;
  fullWidth?: boolean;
}) {
  return (
    <View
      accessibilityRole='text'
      accessibilityLabel={`${hint}${met ? ', satisfied' : ', needed'}`}
      style={[
        styles.criteriaTile,
        met && styles.criteriaTileMet,
        fullWidth && styles.criteriaTileFull,
      ]}
    >
      <View style={[styles.criteriaIcon, met && styles.criteriaIconMet]}>
        {met ? (
          <Ionicons name='checkmark' size={11} color='#ffffff' />
        ) : (
          <View style={styles.criteriaIconHollow} />
        )}
      </View>
      <Text
        style={[styles.criteriaTitle, met && styles.criteriaTitleMet]}
        numberOfLines={2}
      >
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  /** Blocks all taps while the verified celebration is shown (no dismiss / stray presses). */
  touchGuardOverlay: {
    zIndex: 10000,
    backgroundColor: 'transparent',
    ...Platform.select({
      android: { elevation: 24 },
    }),
  },
  flex: { flex: 1 },
  /** Wraps sheet so a bottom band can match `KeyboardAvoidingView` inset padding (otherwise that strip is transparent and shows the hero). */
  kavInner: {
    flex: 1,
  },
  /** Like `PersonalOnboardingScreenSix` `modalStack` — dock sheet to bottom; height fits content. */
  kavInnerDockEnd: {
    justifyContent: 'flex-end',
  },
  keyboardGapFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: sheetBg,
    zIndex: 0,
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    zIndex: 1,
    backgroundColor: sheetBg,
    borderTopLeftRadius: radius.xl + 10,
    borderTopRightRadius: radius.xl + 10,
    paddingHorizontal: space.lg + space.sm,
    paddingTop: space.xs,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.08,
        shadowRadius: 28,
      },
      android: { elevation: 10 },
    }),
  },
  sheetSignup: {
    flex: 1,
  },
  sheetVerify: {
    flexGrow: 0,
    flexShrink: 1,
    alignSelf: 'stretch',
  },
  sheetMain: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
  },
  sheetMainVerify: {
    flex: 0,
    flexGrow: 0,
  },
  sheetMainVerifiedFill: {
    flex: 1,
    alignSelf: 'stretch',
    minHeight: 0,
  },
  verifiedSuccessBody: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.xxl,
    paddingHorizontal: space.lg,
  },
  verifiedSuccessMessage: {
    marginTop: space.lg,
    fontSize: type.title,
    fontWeight: '700',
    color: ink,
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  sheetGrab: {
    alignItems: 'center',
    paddingVertical: space.xs,
  },
  grabPill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CFD8E6',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    flex: 1,
    fontSize: type.display - 2,
    fontWeight: '700',
    color: ink,
    textAlign: 'center',
    letterSpacing: -0.7,
  },
  titleAccentBar: {
    height: 3,
    width: 52,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: space.md,
    opacity: 0.95,
  },
  scrollFlex: {
    flex: 1,
    minHeight: 0,
  },
  scrollFlexVerify: {
    flex: 0,
    flexGrow: 0,
  },
  /** Signup + verify: do not grow — avoids a huge empty gap below the CTA. */
  scrollContentSignup: {
    flexGrow: 0,
  },
  fieldLabel: {
    fontSize: type.caption,
    fontWeight: '600',
    color: slate,
    letterSpacing: -0.1,
    marginBottom: space.md,
    marginTop: space.md,
  },
  fieldLabelFirst: {
    marginTop: 0,
  },
  input: {
    borderWidth: 1,
    borderColor: line,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
    fontSize: type.bodyLarge,
    color: ink,
    backgroundColor: '#F8FAFC',
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: sheetBg,
  },
  inputErr: {
    borderColor: danger,
    borderWidth: 2,
  },
  pwWrap: {
    position: 'relative',
  },
  inputPw: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: 'absolute',
    right: space.sm,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: space.sm,
  },
  pwExtras: {
    marginTop: space.lg,
  },
  criteriaHint: {
    fontSize: type.micro,
    fontWeight: '700',
    color: muted,
    letterSpacing: 0.15,
    textTransform: 'uppercase',
    marginBottom: space.md,
  },
  criteriaGrid: {
    gap: space.sm + 2,
  },
  criteriaGridRow: {
    flexDirection: 'row',
    gap: space.sm + 2,
  },
  criteriaGridFullRow: {
    width: '100%',
  },
  criteriaGridCell: {
    flex: 1,
    minWidth: 0,
  },
  criteriaTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: line,
    backgroundColor: '#F1F5F9',
    flex: 1,
    minHeight: 38,
  },
  criteriaTileMet: {
    borderColor: 'rgba(22, 163, 74, 0.35)',
    backgroundColor: 'rgba(22, 163, 74, 0.06)',
  },
  criteriaTileFull: {
    width: '100%',
  },
  criteriaIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  criteriaIconMet: {
    borderColor: SUCCESS_GREEN,
    backgroundColor: SUCCESS_GREEN,
  },
  criteriaIconHollow: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  criteriaTitle: {
    flex: 1,
    fontSize: type.micro,
    lineHeight: 15,
    fontWeight: '600',
    color: slate,
    letterSpacing: -0.1,
  },
  criteriaTitleMet: {
    color: ink,
  },
  errText: {
    fontSize: type.caption,
    color: danger,
    fontWeight: '600',
    marginTop: space.xs,
  },
  signupFooterBlock: {
    marginTop: space.lg,
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(15, 23, 42, 0.08)',
  },
  switchLineDock: {
    textAlign: 'center',
    fontSize: type.body,
    color: slate,
    marginBottom: space.md,
    letterSpacing: -0.15,
  },
  switchLink: {
    color: colors.primary,
    fontWeight: '700',
  },
  /** Matches `PersonalOnboardingScreenSix` school code sheet title. */
  verifySheetTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: verifyInk,
    letterSpacing: -0.65,
    lineHeight: 32,
    marginBottom: space.xl,
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
    color: verifyInk,
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
    color: verifyInk,
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
