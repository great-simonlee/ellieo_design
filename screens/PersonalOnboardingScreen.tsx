import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OnboardingBottomCta } from '../components/OnboardingBottomCta';
import { useOnboardingCtaLayout } from '../design/onboardingCtaLayout';
import { colors, radius, space, type } from '../design/theme';

const RULES: { title: string; body: string }[] = [
  {
    title: 'Be yourself',
    body: 'Just be real — genuine photos and stories help everyone trust each other.',
  },
  {
    title: 'Be safe',
    body: 'Look out for yourself and others. If something feels off, let us know.',
  },
  {
    title: 'Be respectful',
    body: "Kindness goes a long way. Treat your roommates the way you'd like to be treated.",
  },
  {
    title: 'Create a welcoming home.',
    body: 'Together, we can make Ellieo a safe and friendly space for everyone.',
  },
];

const ink = '#14151A';
const inkSoft = '#3D4152';
const bodyMuted = '#6B6F7C';
const rulesSurface = '#F3F5F8';
const rulesBorder = 'rgba(15, 23, 42, 0.06)';

type PersonalOnboardingScreenProps = {
  onClose: () => void;
  onAgree?: () => void;
};

export function PersonalOnboardingScreen({
  onClose,
  onAgree,
}: PersonalOnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const { screenW, padH, contentMaxW, primaryButtonWidth } =
    useOnboardingCtaLayout();
  const [rulesViewportH, setRulesViewportH] = useState(0);
  const [rulesContentH, setRulesContentH] = useState(0);

  /** Taller hero pulls content up visually; ~56% width reads as a modest bump vs 50%. */
  const heroHeight = Math.round(screenW * 0.56);
  const heroRadius = Math.min(radius.xl + 4, Math.round(screenW * 0.055));

  /** When rules fit, vertically center the card in the area between subtitle and button. */
  const rulesFitBand =
    rulesViewportH > 0 &&
    rulesContentH > 0 &&
    rulesContentH <= rulesViewportH + 2;

  return (
    <View style={styles.root}>
      <StatusBar style='light' />

      <View
        style={[
          styles.heroShell,
          {
            height: heroHeight,
            borderBottomLeftRadius: heroRadius,
            borderBottomRightRadius: heroRadius,
          },
        ]}
      >
        <Image
          accessibilityLabel='Ellieo onboarding'
          source={require('../assets/img/personal_onboarding.png')}
          style={{ width: screenW, height: heroHeight }}
          resizeMode='cover'
        />
        <LinearGradient
          pointerEvents='none'
          colors={[
            'rgba(0,0,0,0.12)',
            'transparent',
            'rgba(255,255,255,0.08)',
            '#ffffff',
          ]}
          locations={[0, 0.35, 0.72, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Close'
          onPress={onClose}
          style={({ pressed }) => [
            styles.closeOuter,
            {
              top: insets.top + space.sm,
              right: padH,
              opacity: pressed ? 0.88 : 1,
            },
          ]}
        >
          <BlurView
            intensity={Platform.OS === 'ios' ? 38 : 24}
            tint='light'
            style={styles.closeBlur}
          >
            <Ionicons name='close' size={21} color={ink} />
          </BlurView>
        </Pressable>
      </View>

      <View style={styles.mainColumn}>
        <View style={[styles.headerBlock, { paddingHorizontal: padH }]}>
          <Text style={styles.eyebrow}>House rules</Text>
          <Text style={styles.titleLine}>
            <Text style={styles.titlePlain}>Welcome to </Text>
            <Text style={styles.titleBrand}>Ellieo</Text>
          </Text>
          <Text style={styles.subtitle}>Please follow our house rules.</Text>
        </View>

        <ScrollView
          accessibilityLabel='House rules list'
          style={styles.rulesScroll}
          contentContainerStyle={[
            { paddingHorizontal: padH },
            rulesFitBand
              ? {
                  flexGrow: 1,
                  justifyContent: 'center',
                  paddingVertical: space.xs,
                }
              : {
                  flexGrow: 0,
                  justifyContent: 'flex-start',
                  paddingTop: space.sm,
                  paddingBottom: space.xs,
                },
          ]}
          onLayout={(e) =>
            setRulesViewportH(e.nativeEvent.layout.height)
          }
          onContentSizeChange={(_, h) => setRulesContentH(h)}
          showsVerticalScrollIndicator
          bounces
          keyboardShouldPersistTaps='handled'
        >
          <View
            style={[
              styles.rulesCardOuter,
              { width: '100%', maxWidth: contentMaxW },
            ]}
          >
            <View style={styles.rulesCard}>
              {RULES.map((rule, i) => (
                <View
                  key={rule.title}
                  style={[
                    styles.ruleRow,
                    i < RULES.length - 1 && styles.ruleRowDivider,
                  ]}
                >
                  <View style={styles.ruleAccent} />
                  <View style={styles.ruleCopy}>
                    <Text style={styles.ruleTitle}>{rule.title}</Text>
                    <Text style={styles.ruleBody}>{rule.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <OnboardingBottomCta
          label='I Agree'
          onPress={() => (onAgree ?? onClose)()}
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
    backgroundColor: '#ffffff',
  },
  heroShell: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#0f172a',
  },
  closeOuter: {
    position: 'absolute',
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  closeBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  mainColumn: {
    flex: 1,
    minHeight: 0,
  },
  headerBlock: {
    paddingTop: space.xl + space.md,
    paddingBottom: 0,
  },
  rulesScroll: {
    flex: 1,
    minHeight: 0,
  },
  rulesCardOuter: {
    alignSelf: 'center',
  },
  eyebrow: {
    fontSize: type.micro,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: space.sm,
  },
  titleLine: {
    marginBottom: space.sm,
  },
  titlePlain: {
    fontSize: type.display - 2,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.7,
  },
  titleBrand: {
    fontSize: type.display - 2,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: type.body,
    lineHeight: 22,
    color: bodyMuted,
    fontWeight: '500',
    letterSpacing: -0.2,
    marginBottom: 0,
    maxWidth: 340,
  },
  rulesCard: {
    backgroundColor: rulesSurface,
    borderRadius: radius.md + 2,
    paddingVertical: 2,
    paddingHorizontal: space.md - 2,
    borderWidth: 1,
    borderColor: rulesBorder,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 20,
      },
      android: { elevation: 2 },
    }),
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: space.md + 2,
    paddingHorizontal: space.sm,
  },
  ruleRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(15, 23, 42, 0.07)',
  },
  ruleAccent: {
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
    opacity: 0.88,
    marginRight: space.md,
  },
  ruleCopy: {
    flex: 1,
    minWidth: 0,
  },
  ruleTitle: {
    fontSize: type.bodyLarge,
    fontWeight: '700',
    color: inkSoft,
    marginBottom: space.xs,
    letterSpacing: -0.35,
  },
  ruleBody: {
    fontSize: type.body,
    lineHeight: 22,
    color: bodyMuted,
    fontWeight: '400',
    letterSpacing: -0.15,
  },
});
