import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type LayoutAnimationType,
  Keyboard,
  LayoutAnimation,
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
import { PasswordMustIncludeGrid } from './PasswordMustIncludeGrid';
import { evaluatePassword } from './passwordStrength';

const ink = '#0f172a';
const slate = '#475569';
const muted = '#64748b';
const labelSecondary = '#636366';
const captionMuted = '#8E8E93';
const verifyInk = '#1C1C1C';
const sheetBg = '#ffffff';
const line = '#E2E7EF';
const danger = '#DC2626';
const SUCCESS_GREEN = '#16A34A';
const OTP_LEN = 6;
const RESET_SUCCESS_MS = 2000;
/** Success sheet height (~same feel as signup verified card). */
const RESET_SUCCESS_SHEET_MIN_H_RATIO = 2 / 3;

/** Extra space below Reset password when the keyboard is up (scroll runway; between 1.5× and 3× base). */
const RESET_PW_KEYBOARD_BOTTOM_GAP = (space.xxxl + space.xl) * 2.5;

export type ForgotPasswordFlowProps = {
  visible: boolean;
  onClose: () => void;
  /** After success message (~2s). Parent typically opens Log in with Email. */
  onFinished?: () => void;
  /** When true, shared `EmailAuthModal` ignores hardware back (success sheet). */
  onHardwareCloseBlockedChange?: (blocked: boolean) => void;
  /** Prefilled when user taps Forgot from email login with text in the email field. */
  initialEmail?: string;
};

type Step = 'email' | 'code' | 'newPassword' | 'resetSuccess';

/**
 * Match RN KeyboardAvoidingView: animate layout with the system keyboard so
 * bottom padding does not jump ahead of the keyboard (backdrop gap / “crack”).
 */
function configureIosKeyboardLayoutAnimation(e: {
  duration?: number;
  easing?: string;
}): void {
  if (Platform.OS !== 'ios' || e.duration == null || !e.easing) return;
  const duration = e.duration > 10 ? e.duration : 10;
  const types = LayoutAnimation.Types as Record<string, LayoutAnimationType>;
  const layoutType =
    types[e.easing] ?? (LayoutAnimation.Types.keyboard as LayoutAnimationType);
  LayoutAnimation.configureNext({
    duration,
    update: {
      duration,
      type: layoutType,
    },
  });
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

export function ForgotPasswordFlow({
  visible,
  onClose,
  onFinished,
  onHardwareCloseBlockedChange,
  initialEmail,
}: ForgotPasswordFlowProps) {
  const insets = useSafeAreaInsets();
  const { height: windowH } = useWindowDimensions();
  const { primaryButtonWidth } = useOnboardingCtaLayout();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [focusedField, setFocusedField] = useState<
    'email' | 'password' | 'confirm' | null
  >(null);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [resendSec, setResendSec] = useState(59);

  /** Prevent tall sheets + keyboard from pushing the header under the notch / status bar. */
  const maxSheetWhenKeyboard = useMemo(() => {
    if (keyboardInset <= 0) return undefined;
    return Math.max(260, windowH - keyboardInset - insets.top - space.sm);
  }, [keyboardInset, windowH, insets.top]);

  const codeInputRef = useRef<TextInput>(null);
  const sheetScrollRef = useRef<ScrollView>(null);

  /** Scroll tall new-password content so confirm + CTA stay above the keyboard. */
  const scrollNewPasswordToBottom = useCallback(() => {
    const run = () => sheetScrollRef.current?.scrollToEnd({ animated: true });
    requestAnimationFrame(() => {
      requestAnimationFrame(run);
    });
  }, []);

  const emailOk = useMemo(() => {
    const t = email.trim();
    return t.includes('@') && t.includes('.') && t.length > 5;
  }, [email]);

  const pwMeta = useMemo(() => evaluatePassword(password), [password]);

  const mismatch =
    confirm.length > 0 && password.length > 0 && password !== confirm;
  const matchOk =
    password.length > 0 && confirm.length > 0 && password === confirm;
  const canReset = pwMeta.score >= 5 && matchOk;

  useEffect(() => {
    if (!visible) {
      setStep('email');
      setEmail('');
      setCode('');
      setPassword('');
      setConfirm('');
      setShowPw(false);
      setFocusedField(null);
      setKeyboardInset(0);
      setResendSec(59);
      return;
    }
    const pre = initialEmail?.trim();
    if (pre) setEmail(pre);
  }, [visible, initialEmail]);

  useEffect(() => {
    if (!visible) {
      onHardwareCloseBlockedChange?.(false);
      return;
    }
    onHardwareCloseBlockedChange?.(step === 'resetSuccess');
  }, [visible, step, onHardwareCloseBlockedChange]);

  useEffect(() => {
    if (!visible || step !== 'resetSuccess') return;
    Keyboard.dismiss();
    const t = setTimeout(() => {
      onFinished?.();
    }, RESET_SUCCESS_MS);
    return () => clearTimeout(t);
  }, [visible, step, onFinished]);

  useEffect(() => {
    const showEvt =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const s = Keyboard.addListener(showEvt, (e) => {
      configureIosKeyboardLayoutAnimation(e);
      setKeyboardInset(e.endCoordinates.height);
    });
    const h = Keyboard.addListener(hideEvt, (e) => {
      configureIosKeyboardLayoutAnimation(e);
      setKeyboardInset(0);
    });
    return () => {
      s.remove();
      h.remove();
    };
  }, []);

  useEffect(() => {
    if (!visible || step !== 'code') return;
    setResendSec(59);
    const id = setInterval(() => {
      setResendSec((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [visible, step]);

  useEffect(() => {
    if (!visible || step !== 'newPassword') return;
    if (keyboardInset <= 0 || focusedField !== 'confirm') return;
    const delay = Platform.OS === 'ios' ? 280 : 120;
    const id = setTimeout(scrollNewPasswordToBottom, delay);
    return () => clearTimeout(id);
  }, [keyboardInset, focusedField, step, visible, scrollNewPasswordToBottom]);

  const sendCode = () => {
    if (!emailOk) return;
    Keyboard.dismiss();
    setStep('code');
    setCode('');
    setTimeout(() => codeInputRef.current?.focus(), 320);
  };

  const continueAfterCode = () => {
    if (code.length !== OTP_LEN) return;
    Keyboard.dismiss();
    setStep('newPassword');
    setPassword('');
    setConfirm('');
  };

  const submitNewPassword = () => {
    if (!canReset) return;
    Keyboard.dismiss();
    setStep('resetSuccess');
  };

  const goBack = () => {
    if (step === 'resetSuccess') return;
    Keyboard.dismiss();
    if (step === 'code') setStep('email');
    else if (step === 'newPassword') setStep('code');
  };

  const sheetTitle =
    step === 'email'
      ? 'Reset password'
      : step === 'code'
        ? 'Check your email'
        : step === 'resetSuccess'
          ? 'Password updated'
          : 'Create new password';

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.layerFill} pointerEvents='box-none'>
      <View
        style={[
          styles.flex,
          keyboardInset > 0 ? { paddingBottom: keyboardInset } : null,
        ]}
      >
        <View style={styles.kavInner}>
          <View
            style={[
              styles.sheet,
              maxSheetWhenKeyboard != null &&
                step !== 'resetSuccess' && {
                  maxHeight: maxSheetWhenKeyboard,
                },
              step === 'resetSuccess' && {
                minHeight: Math.round(
                  windowH * RESET_SUCCESS_SHEET_MIN_H_RATIO,
                ),
              },
            ]}
          >
            <View style={styles.sheetGrab}>
              <View style={styles.grabPill} />
            </View>

            <View style={styles.sheetHeader}>
              {step === 'email' || step === 'resetSuccess' ? (
                <View style={styles.iconBtn} />
              ) : (
                <Pressable
                  accessibilityRole='button'
                  accessibilityLabel='Back'
                  hitSlop={12}
                  onPress={goBack}
                  style={({ pressed }) => [
                    styles.iconBtn,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Ionicons name='chevron-back' size={24} color={ink} />
                </Pressable>
              )}
              <Text style={styles.sheetTitle} accessibilityRole='header'>
                {sheetTitle}
              </Text>
              {step === 'resetSuccess' ? (
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

            {step === 'resetSuccess' ? null : (
              <LinearGradient
                colors={['#93C5FD', colors.primary, '#1D4ED8']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.titleAccentBar}
              />
            )}

            {step === 'email' ? (
              <Text style={styles.intro}>
                Enter the email for your account. We&apos;ll send a code to
                verify it&apos;s you.
              </Text>
            ) : null}

            <View
              style={[
                styles.sheetMain,
                keyboardInset > 0 &&
                  step !== 'resetSuccess' &&
                  styles.sheetMainKeyboard,
                step === 'resetSuccess' && styles.sheetMainResetSuccess,
              ]}
            >
              {step === 'resetSuccess' ? (
                <View
                  style={styles.resetSuccessBody}
                  accessibilityLiveRegion='polite'
                >
                  <Ionicons
                    name='checkmark-circle'
                    size={72}
                    color={SUCCESS_GREEN}
                  />
                  <Text
                    style={styles.resetSuccessMessage}
                    accessibilityRole='header'
                  >
                    Your password has been reset. You can log in with your new
                    password.
                  </Text>
                </View>
              ) : (
                <ScrollView
                  ref={sheetScrollRef}
                  style={keyboardInset > 0 ? styles.scrollFlexKb : undefined}
                  contentContainerStyle={[
                    styles.scrollContent,
                    {
                      paddingBottom:
                        keyboardInset > 0 ? space.md : Math.round(space.md / 2),
                    },
                  ]}
                  keyboardShouldPersistTaps='handled'
                  keyboardDismissMode='interactive'
                  showsVerticalScrollIndicator={false}
                >
                  {step === 'email' ? (
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
                        selectionColor={colors.primary}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        style={[
                          styles.input,
                          focusedField === 'email' && styles.inputFocused,
                        ]}
                      />
                      <OnboardingBottomCta
                        label='Send verification code'
                        onPress={sendCode}
                        disabled={!emailOk}
                        padH={0}
                        safeBottomInset={keyboardInset > 0 ? 0 : insets.bottom}
                        buttonWidth={primaryButtonWidth}
                        dockBottomGap={0}
                        dockPaddingTop={space.lg}
                      />
                    </>
                  ) : step === 'code' ? (
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
                        onPress={continueAfterCode}
                        disabled={code.length !== OTP_LEN}
                        padH={0}
                        safeBottomInset={keyboardInset > 0 ? 0 : insets.bottom}
                        buttonWidth={primaryButtonWidth}
                        dockBottomGap={0}
                        dockPaddingTop={space.lg}
                      />
                    </>
                  ) : (
                    <>
                      <Text style={styles.introNewPw}>
                        Choose a new password for{' '}
                        <Text style={styles.introEmailStrong}>
                          {email.trim() || 'your account'}
                        </Text>
                        .
                      </Text>
                      <FieldLabel first>New password</FieldLabel>
                      <View style={styles.pwWrap}>
                        <TextInput
                          value={password}
                          onChangeText={setPassword}
                          secureTextEntry={!showPw}
                          placeholder='Create a password'
                          placeholderTextColor='#94a3b8'
                          selectionColor={colors.primary}
                          onFocus={() => setFocusedField('password')}
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

                      <PasswordMustIncludeGrid password={password} />

                      <FieldLabel>Confirm password</FieldLabel>
                      <TextInput
                        value={confirm}
                        onChangeText={setConfirm}
                        secureTextEntry={!showPw}
                        placeholder='Repeat new password'
                        placeholderTextColor='#94a3b8'
                        selectionColor={colors.primary}
                        onFocus={() => {
                          setFocusedField('confirm');
                          scrollNewPasswordToBottom();
                          setTimeout(
                            scrollNewPasswordToBottom,
                            Platform.OS === 'ios' ? 320 : 140,
                          );
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

                      <OnboardingBottomCta
                        label='Reset password'
                        onPress={submitNewPassword}
                        disabled={!canReset}
                        padH={0}
                        safeBottomInset={keyboardInset > 0 ? 0 : insets.bottom}
                        buttonWidth={primaryButtonWidth}
                        dockBottomGap={
                          keyboardInset > 0 ? RESET_PW_KEYBOARD_BOTTOM_GAP : 0
                        }
                        dockPaddingTop={space.lg}
                      />
                    </>
                  )}
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layerFill: {
    ...StyleSheet.absoluteFillObject,
  },
  flex: { flex: 1 },
  kavInner: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    zIndex: 1,
    alignSelf: 'stretch',
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
  intro: {
    textAlign: 'center',
    fontSize: type.body,
    lineHeight: 22,
    color: slate,
    letterSpacing: -0.15,
    marginBottom: space.md,
    paddingHorizontal: space.xs,
  },
  introNewPw: {
    fontSize: type.body,
    lineHeight: 22,
    color: labelSecondary,
    marginBottom: space.lg,
    letterSpacing: -0.2,
  },
  introEmailStrong: {
    fontWeight: '700',
    color: verifyInk,
  },
  sheetMain: {
    position: 'relative',
    backgroundColor: sheetBg,
  },
  /** Lets the header stay pinned while form scrolls under keyboard + notch. */
  sheetMainKeyboard: {
    flex: 1,
    minHeight: 0,
  },
  scrollFlexKb: {
    flex: 1,
    minHeight: 0,
    backgroundColor: sheetBg,
  },
  sheetMainResetSuccess: {
    flex: 1,
    alignSelf: 'stretch',
    minHeight: 0,
  },
  resetSuccessBody: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.xxl,
    paddingHorizontal: space.lg,
  },
  resetSuccessMessage: {
    marginTop: space.lg,
    fontSize: type.title,
    fontWeight: '700',
    color: ink,
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  scrollContent: {
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
  errText: {
    fontSize: type.caption,
    color: danger,
    fontWeight: '600',
    marginTop: space.xs,
  },
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
    alignItems: 'center',
    marginBottom: space.md,
  },
  resendLine: {
    fontSize: type.caption,
    color: labelSecondary,
  },
  resendMuted: {
    fontSize: type.caption,
    color: captionMuted,
    fontWeight: '500',
  },
  resendActive: {
    fontSize: type.caption,
    fontWeight: '700',
    color: colors.primary,
  },
});
