import Ionicons from '@expo/vector-icons/Ionicons';
import { OnboardingProgressBlock } from '../components/OnboardingProgressBlock';
import {
  ONBOARDING_PREVIEW_PROFILE,
  RoommateProfileDetailBody,
} from '../components/RoommateProfileDetail';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboardingCtaLayout } from '../design/onboardingCtaLayout';
import { gradientPrimaryHorizontal, radius, space, type } from '../design/theme';

const ink = '#1C1C1E';
const white = '#FFFFFF';

type PersonalOnboardingScreenProfilePreviewProps = {
  onBack: () => void;
  onContinue: () => void;
};

/** Final onboarding step — full roommate profile preview aligned with Match tab detail sheet. */
export function PersonalOnboardingScreenProfilePreview({
  onBack,
  onContinue,
}: PersonalOnboardingScreenProfilePreviewProps) {
  const insets = useSafeAreaInsets();
  const { padH, contentMaxW } = useOnboardingCtaLayout();
  const footerPad = Math.max(insets.bottom, space.md) + space.sm;

  return (
    <View style={styles.root}>
      <StatusBar style='dark' />

      <View style={[styles.header, { paddingTop: insets.top + space.sm, paddingHorizontal: padH }]}>
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Go back'
          onPress={onBack}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
        >
          <Ionicons name='chevron-back' size={26} color={ink} />
        </Pressable>
      </View>

      <OnboardingProgressBlock
        padH={padH}
        step={6}
        totalSteps={6}
        title='Profile preview'
        progressRatio={1}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: padH,
            paddingBottom: 88 + footerPad + space.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.intro, { maxWidth: contentMaxW }]}>
          <Text style={styles.screenTitle}>Looking good!</Text>
          <Text style={styles.screenSubtitle}>
            Here&apos;s how your profile appears to potential roommates on the
            Match tab.
          </Text>
        </View>

        <RoommateProfileDetailBody
          profile={ONBOARDING_PREVIEW_PROFILE}
          padH={padH}
          variant='onboarding-preview'
        />
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: footerPad, paddingHorizontal: padH },
        ]}
      >
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Continue'
          onPress={onContinue}
          style={({ pressed }) => [
            styles.ctaShell,
            { maxWidth: contentMaxW },
            pressed && styles.ctaPressed,
          ]}
        >
          <LinearGradient
            colors={gradientPrimaryHorizontal}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.cta}
          >
            <View style={styles.ctaRow}>
              <View style={styles.ctaIconSlot}>
                <Ionicons name='checkmark-circle' size={21} color={white} />
              </View>
              <Text style={styles.ctaText}>Continue</Text>
            </View>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginLeft: -space.xs,
    padding: space.xs,
    borderRadius: radius.sm,
  },
  backBtnPressed: {
    opacity: 0.55,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 520,
  },
  intro: {
    width: '100%',
    alignSelf: 'center',
    marginBottom: space.lg,
    gap: space.sm,
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  screenSubtitle: {
    fontSize: type.body,
    lineHeight: 22,
    fontWeight: '500',
    color: '#687084',
    letterSpacing: -0.15,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'stretch',
    paddingTop: space.lg,
    backgroundColor: '#F5F7FA',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(31,41,55,0.08)',
  },
  ctaShell: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  cta: {
    width: '100%',
    minHeight: 52,
    paddingVertical: 15,
    paddingHorizontal: space.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaIconSlot: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: type.bodyLarge,
    lineHeight: 20,
    fontWeight: '800',
    color: white,
    letterSpacing: -0.2,
    ...Platform.select({
      android: { includeFontPadding: false },
    }),
  },
  ctaPressed: {
    opacity: 0.92,
  },
});
