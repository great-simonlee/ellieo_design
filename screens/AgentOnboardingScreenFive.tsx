import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OnboardingBottomCta } from '../components/OnboardingBottomCta';
import { useOnboardingCtaLayout } from '../design/onboardingCtaLayout';
import { colors, radius, space, type } from '../design/theme';

const ink = '#1C1C1E';
const labelSecondary = '#636366';
const captionMuted = '#8E8E93';

/** Decorative bits — pure shapes, no image assets. */
const CONFETTI = [
  { left: '4%', top: 18, w: 9, h: 14, bg: '#FFB020', rot: '14deg' },
  { left: '12%', top: 56, w: 7, h: 7, bg: colors.primary, rot: '-22deg' },
  { left: '82%', top: 28, w: 11, h: 8, bg: '#34C759', rot: '8deg' },
  { left: '88%', top: 72, w: 8, h: 12, bg: '#FF9F0A', rot: '-18deg' },
  { left: '8%', top: 124, w: 6, h: 6, bg: '#AF52DE', rot: '35deg' },
  { left: '78%', top: 140, w: 10, h: 10, bg: '#5AC8FA', rot: '-12deg' },
  { left: '18%', top: 96, w: 8, h: 8, bg: '#FFD60A', rot: '22deg' },
  { left: '90%', top: 168, w: 7, h: 11, bg: colors.primary, rot: '19deg' },
  { left: '6%', top: 200, w: 10, h: 7, bg: '#FF453A', rot: '-8deg' },
  { left: '72%', top: 96, w: 6, h: 9, bg: '#64D2FF', rot: '28deg' },
  { left: '42%', top: 12, w: 5, h: 5, bg: captionMuted, rot: '0deg' },
  { left: '52%', top: 220, w: 8, h: 8, bg: '#FFD60A', rot: '-35deg' },
] as const;

export type AgentOnboardingScreenFiveProps = {
  onStartExploring: () => void;
};

export function AgentOnboardingScreenFive({
  onStartExploring,
}: AgentOnboardingScreenFiveProps) {
  const insets = useSafeAreaInsets();
  const { padH, contentMaxW, primaryButtonWidth } = useOnboardingCtaLayout();

  const pulse = useRef(new Animated.Value(1)).current;
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.04,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    const halo = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 3200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    breathe.start();
    halo.start();
    return () => {
      breathe.stop();
      halo.stop();
    };
  }, [pulse, drift]);

  const haloOpacity = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.65],
  });

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#EEF4FF', '#F8FAFF', '#FFFFFF']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <StatusBar style='dark' />

      <View style={[styles.safeTop, { paddingTop: insets.top }]}>
        <View
          style={[
            styles.onePage,
            { paddingHorizontal: padH, paddingBottom: space.xl },
          ]}
        >
          <View style={styles.heroStage}>
            {CONFETTI.map((c, i) => (
              <View
                key={i}
                pointerEvents='none'
                style={[
                  styles.confetti,
                  {
                    left: c.left as `${number}%`,
                    top: c.top,
                    width: c.w,
                    height: c.h,
                    backgroundColor: c.bg,
                    transform: [{ rotate: c.rot }],
                  },
                ]}
              />
            ))}

            <Text style={styles.eyebrow}>You&apos;re in</Text>

            <Text style={styles.displayTitle} accessibilityRole='header'>
              Welcome Aboard.
            </Text>

            <Text style={styles.lede}>
              Your agent profile is on its way to verification.
            </Text>

            <View style={styles.medallionStack}>
              <Animated.View
                pointerEvents='none'
                style={[styles.haloRing, { opacity: haloOpacity }]}
              />
              <Ionicons
                name='sparkles'
                size={16}
                color={colors.primary}
                style={[styles.sparkleNW, { opacity: 0.5 }]}
              />
              <Ionicons
                name='sparkles'
                size={14}
                color={colors.primary}
                style={[styles.sparkleNE, { opacity: 0.4 }]}
              />
              <Ionicons
                name='star'
                size={11}
                color='#FFB020'
                style={[styles.sparkleSW, { opacity: 0.65 }]}
              />
              <Animated.View
                style={[
                  styles.medallionShadow,
                  { transform: [{ scale: pulse }] },
                ]}
              >
                <LinearGradient
                  colors={['#8EB7FF', '#5B8FF7', colors.primary]}
                  locations={[0, 0.45, 1]}
                  start={{ x: 0.15, y: 0 }}
                  end={{ x: 0.85, y: 1 }}
                  style={styles.medallionGradient}
                >
                  <View style={styles.medallionInnerCut}>
                    <Ionicons
                      name='shield-checkmark'
                      size={46}
                      color='#FFFFFF'
                      style={styles.medallionIcon}
                    />
                  </View>
                </LinearGradient>
              </Animated.View>
            </View>
          </View>

          <View
            style={[styles.card, { maxWidth: contentMaxW }]}
          >
            <View style={styles.cardAccent} />
            <Text style={styles.cardBody}>
              Thank you for joining Ellieo.
            </Text>
            <Text style={styles.cardBody}>
              Please allow us{' '}
              <Text style={styles.emphasis}>24–48 hours</Text> to review and
              verify your information.
            </Text>
            <Text style={styles.cardBody}>
              We&apos;re excited to partner with you and help you grow your real
              estate business with confidence.
            </Text>

            <Text style={[styles.cardBody, styles.cardBodyLast]}>
              If you have any questions, please contact us at info@ellieo.com.
            </Text>
          </View>
        </View>

        <OnboardingBottomCta
          label='Start Exploring'
          onPress={onStartExploring}
          padH={padH}
          safeBottomInset={insets.bottom}
          buttonWidth={primaryButtonWidth}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeTop: {
    flex: 1,
  },
  onePage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: space.sm,
  },
  heroStage: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: space.xl,
  },
  confetti: {
    position: 'absolute',
    borderRadius: 2,
    opacity: 0.85,
  },
  eyebrow: {
    fontSize: type.micro,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: space.md,
  },
  displayTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: ink,
    letterSpacing: -1.6,
    lineHeight: 44,
    textAlign: 'center',
    marginBottom: space.lg,
  },
  lede: {
    fontSize: type.bodyLarge,
    fontWeight: '600',
    color: labelSecondary,
    letterSpacing: -0.35,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 24,
    marginBottom: space.xl,
  },
  medallionStack: {
    width: 176,
    height: 176,
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloRing: {
    position: 'absolute',
    width: 172,
    height: 172,
    borderRadius: 86,
    borderWidth: 2,
    borderColor: 'rgba(47, 109, 246, 0.35)',
  },
  medallionShadow: {
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.38,
        shadowRadius: 28,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  medallionGradient: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  medallionInnerCut: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  medallionIcon: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      default: {},
    }),
  },
  sparkleNW: {
    position: 'absolute',
    top: 8,
    left: 12,
  },
  sparkleNE: {
    position: 'absolute',
    top: 24,
    right: 8,
  },
  sparkleSW: {
    position: 'absolute',
    bottom: 36,
    left: 4,
  },
  card: {
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    paddingHorizontal: space.lg,
    paddingVertical: space.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(47, 109, 246, 0.12)',
    ...Platform.select({
      ios: {
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.07,
        shadowRadius: 28,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: space.lg,
    right: space.lg,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: colors.primary,
    opacity: 0.55,
  },
  cardBody: {
    fontSize: type.body,
    lineHeight: 24,
    color: labelSecondary,
    fontWeight: '400',
    letterSpacing: -0.2,
    marginBottom: space.lg,
    textAlign: 'left',
  },
  cardBodyLast: {
    marginBottom: 0,
  },
  emphasis: {
    fontWeight: '700',
    color: ink,
  },
});
