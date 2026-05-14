import { LinearGradient } from 'expo-linear-gradient';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, gradientPrimaryHorizontal, radius, space, type } from '../design/theme';

const GRADIENT_ENABLED = gradientPrimaryHorizontal;
const GRADIENT_DISABLED: [string, string] = ['#C7C7CC', '#AEAEB2'];

export type OnboardingBottomCtaProps = {
  label: string;
  onPress: () => void;
  /** When true, gray gradient and no shadow (same footprint as enabled). */
  disabled?: boolean;
  padH: number;
  safeBottomInset: number;
  buttonWidth: number;
  /** Padding below the button in addition to safe area (default `space.sm`). */
  dockBottomGap?: number;
  /** Top padding of the white dock (default `space.sm + 2`). */
  dockPaddingTop?: number;
};

/**
 * Fixed dock + pill primary button shared by house rules (I Agree) and
 * personal onboarding steps (Continue / Save). Same position, gradients, and
 * sizing everywhere.
 */
export function OnboardingBottomCta({
  label,
  onPress,
  disabled = false,
  padH,
  safeBottomInset,
  buttonWidth,
  dockBottomGap = space.sm,
  dockPaddingTop = space.sm + 2,
}: OnboardingBottomCtaProps) {
  return (
    <View
      style={[
        styles.dock,
        {
          paddingHorizontal: padH,
          paddingTop: dockPaddingTop,
          paddingBottom: safeBottomInset + dockBottomGap,
        },
      ]}
    >
      <Pressable
        accessibilityRole='button'
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.btnOuter,
          { width: buttonWidth },
          disabled && styles.btnOuterDisabled,
          !disabled && pressed && { transform: [{ scale: 0.98 }] },
        ]}
      >
        <LinearGradient
          colors={disabled ? GRADIENT_DISABLED : GRADIENT_ENABLED}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.btnGradient}
        >
          <Text style={[styles.btnLabel, disabled && styles.btnLabelDisabled]}>
            {label}
          </Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  btnOuter: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  btnOuterDisabled: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: { elevation: 0 },
    }),
  },
  btnGradient: {
    borderRadius: radius.pill,
    minHeight: 48,
    paddingVertical: 13,
    paddingHorizontal: space.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLabel: {
    color: '#ffffff',
    fontSize: type.bodyLarge,
    fontWeight: '700',
    letterSpacing: -0.25,
  },
  btnLabelDisabled: {
    color: 'rgba(255,255,255,0.92)',
  },
});
