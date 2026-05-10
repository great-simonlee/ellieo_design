import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OnboardingBottomCta } from '../../components/OnboardingBottomCta';
import { useOnboardingCtaLayout } from '../../design/onboardingCtaLayout';
import { colors, radius, space, type } from '../../design/theme';

/** Aligned with `EmailSignupFlow` sheet + fields for one cohesive auth system. */
const ink = '#0f172a';
const slate = '#475569';
const muted = '#64748b';
const sheetBg = '#ffffff';
const line = '#E2E7EF';

export type EmailLoginFlowProps = {
  visible: boolean;
  onClose: () => void;
  onSwitchToSignup?: () => void;
  onLoggedIn?: () => void;
  /** Pass current email field so forgot flow can pre-fill (design-only). */
  onForgotPasswordPress?: (emailFromLogin: string) => void;
};

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

export function EmailLoginFlow({
  visible,
  onClose,
  onSwitchToSignup,
  onLoggedIn,
  onForgotPasswordPress,
}: EmailLoginFlowProps) {
  const insets = useSafeAreaInsets();
  const { primaryButtonWidth } = useOnboardingCtaLayout();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(
    null,
  );
  const [keyboardInset, setKeyboardInset] = useState(0);

  const emailOk = useMemo(() => {
    const t = email.trim();
    return t.includes('@') && t.includes('.') && t.length > 5;
  }, [email]);

  const canLogIn = emailOk && password.trim().length > 0;

  useEffect(() => {
    if (!visible) {
      setEmail('');
      setPassword('');
      setShowPw(false);
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

  const submitLogin = () => {
    if (!canLogIn) return;
    Keyboard.dismiss();
    onLoggedIn?.();
  };

  const handleSwitchToSignup = () => {
    Keyboard.dismiss();
    onSwitchToSignup?.();
  };

  const handleForgotPassword = () => {
    Keyboard.dismiss();
    onForgotPasswordPress?.(email.trim());
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.layerFill} pointerEvents='box-none'>
      {/*
        Sheet only — hero lives in `EmailAuthModal`. Keyboard: listener height as paddingBottom only.
      */}
      <View
        style={[
          styles.flex,
          keyboardInset > 0 ? { paddingBottom: keyboardInset } : null,
        ]}
      >
        <View style={styles.kavInner}>
          <View style={styles.sheet}>
              <View style={styles.sheetGrab}>
                <View style={styles.grabPill} />
              </View>

              <View style={styles.sheetHeader}>
                <View style={styles.iconBtn} />
                <Text style={styles.sheetTitle} accessibilityRole='header'>
                  Log in with Email
                </Text>
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
              </View>

              <LinearGradient
                colors={['#93C5FD', colors.primary, '#1D4ED8']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.titleAccentBar}
              />

              <View style={styles.sheetMain}>
                <ScrollView
                  contentContainerStyle={[
                    styles.scrollContent,
                    {
                      paddingBottom:
                        keyboardInset > 0
                          ? space.sm
                          : Math.round(space.md / 2),
                    },
                  ]}
                  keyboardShouldPersistTaps='handled'
                  keyboardDismissMode='interactive'
                  showsVerticalScrollIndicator={false}
                >
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

                  <FieldLabel>Password</FieldLabel>
                  <View style={styles.pwWrap}>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPw}
                      placeholder='Your password'
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

                  <Pressable
                    accessibilityRole='link'
                    accessibilityLabel='Forgot password'
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    onPress={handleForgotPassword}
                    style={({ pressed }) => [
                      styles.forgotRow,
                      pressed && { opacity: 0.65 },
                    ]}
                  >
                    <Text style={styles.forgotLink}>Forgot password?</Text>
                  </Pressable>

                  <View style={styles.loginFooterBlock}>
                    <Text style={styles.switchLineDock}>
                      Don&apos;t have an account?{' '}
                      <Text
                        accessibilityRole='link'
                        onPress={handleSwitchToSignup}
                        style={styles.switchLink}
                      >
                        Sign up
                      </Text>
                    </Text>
                    <OnboardingBottomCta
                      label='Log In'
                      onPress={submitLogin}
                      disabled={!canLogIn}
                      padH={0}
                      safeBottomInset={
                        keyboardInset > 0 ? 0 : insets.bottom
                      }
                      buttonWidth={primaryButtonWidth}
                      dockBottomGap={0}
                      dockPaddingTop={space.sm}
                    />
                  </View>
                </ScrollView>
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
  sheetMain: {
    position: 'relative',
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
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: space.md,
    marginBottom: space.lg,
  },
  forgotLink: {
    fontSize: type.caption,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: -0.05,
  },
  loginFooterBlock: {
    marginTop: space.md,
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
});
