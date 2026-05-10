import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from '../../design/theme';
import { authStyles as styles } from './authStyles';
import { useAuthLayout } from './useAuthLayout';

export type LoginMode = 'personal' | 'agent';

export type AuthActionVerb = 'Log in' | 'Sign up';

export type AuthShellProps = {
  welcome: ReactNode;
  actionVerb: AuthActionVerb;
  footer: ReactNode;
  /** Login / sign-up: optional handler for the Google OAuth row */
  onGooglePress?: () => void;
  /** Login / sign-up: optional handler for the Apple OAuth row */
  onApplePress?: () => void;
  /** Login / sign-up: email modal is wired by the parent (signup vs login). */
  onEmailPress?: () => void;
};

export function AuthShell({
  welcome,
  actionVerb,
  footer,
  onGooglePress,
  onApplePress,
  onEmailPress,
}: AuthShellProps) {
  const insets = useSafeAreaInsets();
  const L = useAuthLayout();
  const [mode, setMode] = useState<LoginMode>('personal');
  const isPersonal = mode === 'personal';
  const toggleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(toggleAnim, {
      toValue: isPersonal ? 0 : 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isPersonal, toggleAnim]);

  const indicatorTranslateX = useMemo(
    () =>
      toggleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, L.pillW + L.pillGap],
      }),
    [toggleAnim, L.pillW, L.pillGap],
  );

  const googleLabel = `${actionVerb} with Google`;
  const appleLabel = `${actionVerb} with Apple`;
  const emailLabel = `${actionVerb} with Email`;

  return (
    <View style={styles.authRoot}>
      <StatusBar style='dark' />
      <ImageBackground
        source={
          isPersonal
            ? require('../../assets/img/user_banner.png')
            : require('../../assets/img/agent_banner.png')
        }
        style={[styles.authBanner, { height: L.authBannerHeight }]}
        resizeMode='cover'
      >
        <View style={{ height: insets.top + 8 }} />
      </ImageBackground>

      <View
        style={[
          styles.modeSwitchWrap,
          {
            marginTop: -L.toggleOverlap,
            marginBottom: L.modeSwitchMarginBottom,
          },
        ]}
      >
        <BlurView
          intensity={58}
          tint='dark'
          style={[
            styles.modeSwitchGlass,
            {
              borderRadius: L.glassRadius,
              padding: L.glassPad,
            },
          ]}
        >
          <View
            style={[
              styles.modeSwitchTrack,
              {
                width: L.trackWidth,
                padding: L.trackPad,
                gap: L.pillGap,
                borderRadius: L.trackRadius,
              },
            ]}
          >
            <Animated.View
              pointerEvents='none'
              style={[
                styles.modePillIndicator,
                {
                  left: L.trackPad,
                  top: L.trackPad,
                  bottom: L.trackPad,
                  width: L.pillW,
                  borderRadius: L.pillRadius,
                  transform: [{ translateX: indicatorTranslateX }],
                },
              ]}
            />
            <Pressable
              onPress={() => setMode('personal')}
              style={[
                styles.modePill,
                {
                  width: L.pillW,
                  paddingVertical: L.modePillPadV,
                },
              ]}
            >
              <Text
                style={[
                  styles.modeLabel,
                  { fontSize: L.modeLabelSize },
                  isPersonal && styles.modeLabelOnIndicator,
                ]}
              >
                Personal
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode('agent')}
              style={[
                styles.modePill,
                {
                  width: L.pillW,
                  paddingVertical: L.modePillPadV,
                },
              ]}
            >
              <Text
                style={[
                  styles.modeLabel,
                  { fontSize: L.modeLabelSize },
                  !isPersonal && styles.modeLabelOnIndicator,
                ]}
              >
                Agent
              </Text>
            </Pressable>
          </View>
        </BlurView>
      </View>

      <View
        style={[
          styles.sheet,
          {
            borderTopLeftRadius: L.sheetCornerRadius,
            borderTopRightRadius: L.sheetCornerRadius,
            marginTop: L.sheetMarginTop,
            paddingTop: L.sheetPaddingTop,
            paddingHorizontal: L.horizontalInset,
          },
        ]}
      >
        <View
          style={[
            styles.sheetBody,
            { paddingBottom: insets.bottom + space.md },
          ]}
        >
          <View
            style={[
              styles.authMain,
              {
                flex: 1,
                minHeight: 0,
                maxWidth: L.contentMaxWidth,
                alignSelf: 'center',
                marginBottom: Math.round(space.lg * Math.min(L.scale, 1.02)),
              },
            ]}
          >
            <View style={styles.brandBlock}>
              <Image
                accessibilityRole='image'
                accessibilityLabel='Ellieo'
                source={require('../../assets/img/ellieo_logo_hori.png')}
                style={[
                  styles.brandLogoHori,
                  { width: L.brandHoriW, height: L.brandHoriH },
                ]}
                resizeMode='contain'
              />
            </View>

            <View style={styles.welcomeRail}>{welcome}</View>

            <View
              style={[
                styles.loginActionsWrap,
                {
                  paddingHorizontal: L.loginActionsPadH,
                  paddingVertical: L.loginActionsPadV,
                },
              ]}
            >
              <View style={[styles.loginCol, { gap: L.gapLoginCol }]}>
                <Pressable
                  accessibilityRole='button'
                  accessibilityLabel={googleLabel}
                  onPress={onGooglePress}
                  style={({ pressed }) => [
                    styles.loginBtn,
                    styles.loginBtnGoogle,
                    {
                      minHeight: L.loginBtnMinHeight,
                      paddingVertical: L.loginBtnPadV,
                    },
                    pressed && styles.loginBtnPressed,
                  ]}
                >
                  <View style={styles.loginBtnRow}>
                    <View
                      style={[
                        styles.loginBtnIconSlot,
                        { width: L.loginIconSlotW },
                      ]}
                    >
                      <Ionicons
                        name='logo-google'
                        size={L.iconSize}
                        color='#4285F4'
                      />
                    </View>
                    <Text
                      style={[
                        styles.loginBtnText,
                        styles.loginBtnLabel,
                        { fontSize: L.loginBtnFontSize },
                      ]}
                    >
                      {googleLabel}
                    </Text>
                    <View
                      style={[
                        styles.loginBtnIconSlot,
                        { width: L.loginIconSlotW },
                      ]}
                    />
                  </View>
                </Pressable>

                <Pressable
                  accessibilityRole='button'
                  accessibilityLabel={appleLabel}
                  onPress={() => onApplePress?.()}
                  style={({ pressed }) => [
                    styles.loginBtn,
                    styles.loginBtnApple,
                    {
                      minHeight: L.loginBtnMinHeight,
                      paddingVertical: L.loginBtnPadV,
                    },
                    pressed && styles.loginBtnPressed,
                  ]}
                >
                  <View style={styles.loginBtnRow}>
                    <View
                      style={[
                        styles.loginBtnIconSlot,
                        { width: L.loginIconSlotW },
                      ]}
                    >
                      <Ionicons
                        name='logo-apple'
                        size={L.iconSize + 1}
                        color='#ffffff'
                      />
                    </View>
                    <Text
                      style={[
                        styles.loginBtnText,
                        styles.loginBtnTextLight,
                        styles.loginBtnLabel,
                        { fontSize: L.loginBtnFontSize },
                      ]}
                    >
                      {appleLabel}
                    </Text>
                    <View
                      style={[
                        styles.loginBtnIconSlot,
                        { width: L.loginIconSlotW },
                      ]}
                    />
                  </View>
                </Pressable>

                <Pressable
                  accessibilityRole='button'
                  accessibilityLabel={emailLabel}
                  onPress={() => onEmailPress?.()}
                  style={({ pressed }) => [
                    styles.loginBtn,
                    styles.loginBtnEmail,
                    {
                      minHeight: L.loginBtnMinHeight,
                      paddingVertical: L.loginBtnPadV,
                    },
                    pressed && styles.loginBtnPressed,
                  ]}
                >
                  <View style={styles.loginBtnRow}>
                    <View
                      style={[
                        styles.loginBtnIconSlot,
                        { width: L.loginIconSlotW },
                      ]}
                    >
                      <Ionicons
                        name='mail-outline'
                        size={L.iconMailSize}
                        color={colors.primary}
                      />
                    </View>
                    <Text
                      style={[
                        styles.loginBtnText,
                        styles.loginBtnTextPrimary,
                        styles.loginBtnLabel,
                        { fontSize: L.loginBtnFontSize },
                      ]}
                    >
                      {emailLabel}
                    </Text>
                    <View
                      style={[
                        styles.loginBtnIconSlot,
                        { width: L.loginIconSlotW },
                      ]}
                    />
                  </View>
                </Pressable>
              </View>
            </View>
          </View>

          {footer}

          <Text style={styles.disclaimer}>
            Ellieo may share your email address with third party vendors in
            order to communicate with you about cash back offers and app
            changes. By creating an account, you accept our Terms of Use and
            Privacy Policy.
          </Text>
        </View>
      </View>
    </View>
  );
}
