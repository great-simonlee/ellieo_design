import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OnboardingNavHeader } from '../components/OnboardingNavHeader';
import { useOnboardingCtaLayout } from '../design/onboardingCtaLayout';
import { colors, space, type } from '../design/theme';
import type { ListingStep3Snapshot } from './createListing/createListingTypes';
import { CreateListingPrimaryCta } from './createListing/CreateListingPrimaryCta';
import { CreateListingScreenFive } from './createListing/CreateListingScreenFive';
import { CreateListingScreenFour } from './createListing/CreateListingScreenFour';
import { CreateListingScreenOneAndTwo } from './createListing/CreateListingScreenOneAndTwo';
import { CreateListingScreenSix } from './createListing/CreateListingScreenSix';
import { CreateListingScreenThree } from './createListing/CreateListingScreenThree';
import { pageBg, BOTTOM_CTA_SCROLL_CLEARANCE } from './createListing/createListingTokens';

const ink = '#1C1C1E';

const EMPTY_STEP_3_SNAPSHOT: ListingStep3Snapshot = {
  propertyTypeId: null,
  bedroom: null,
  bathroom: null,
  rooms: [],
};

export type CreateListingUnifiedScreenProps = {
  onClose: () => void;
};

/**
 * Edit flow: entire create-listing funnel on one scrollable page (design shell).
 */
export function CreateListingUnifiedScreen({ onClose }: CreateListingUnifiedScreenProps) {
  const insets = useSafeAreaInsets();
  const { padH, contentMaxW, primaryButtonWidth } = useOnboardingCtaLayout();

  const [layoutsSnapshot, setLayoutsSnapshot] =
    useState<ListingStep3Snapshot>(EMPTY_STEP_3_SNAPSHOT);

  const onUnifiedSnapshot = useCallback((s: ListingStep3Snapshot) => {
    setLayoutsSnapshot(s);
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style='dark' />

      <OnboardingNavHeader
        padH={padH}
        onBack={onClose}
        onClose={onClose}
        backAccessibilityLabel='Back to listings'
        center={<Text style={styles.navTitle}>Edit listing</Text>}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: padH,
              paddingBottom: insets.bottom + BOTTOM_CTA_SCROLL_CLEARANCE + space.xxl,
              maxWidth: contentMaxW + padH * 2,
              alignSelf: 'center',
              width: '100%',
            },
          ]}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator
        >
          <Text style={styles.sectionEyebrow}>Photos & address</Text>
          <CreateListingScreenOneAndTwo embedInUnifiedList onClose={onClose} />

          <View style={styles.sectionRule} />

          <Text style={styles.sectionEyebrow}>Property details</Text>
          <CreateListingScreenThree
            embedInUnifiedList
            onUnifiedSnapshot={onUnifiedSnapshot}
            restoredSnapshot={layoutsSnapshot}
            onClose={onClose}
            onBack={onClose}
            onContinue={() => {}}
          />

          <View style={styles.sectionRule} />

          <Text style={styles.sectionEyebrow}>Layouts</Text>
          <CreateListingScreenFour
            embedInUnifiedList
            step3={layoutsSnapshot}
            onClose={onClose}
            onBack={onClose}
            onContinue={() => {}}
          />

          <View style={styles.sectionRule} />

          <Text style={styles.sectionEyebrow}>Amenities & utilities</Text>
          <CreateListingScreenFive embedInUnifiedList onClose={onClose} onBack={onClose} onContinue={() => {}} />

          <View style={styles.sectionRule} />

          <Text style={styles.sectionEyebrow}>Move-in & lease</Text>
          <CreateListingScreenSix embedInUnifiedList onClose={onClose} onBack={onClose} onContinue={onClose} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        pointerEvents='box-none'
        style={[styles.bottomDock, { paddingBottom: insets.bottom + space.md }]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.98)']}
          style={StyleSheet.absoluteFill}
        />
        <CreateListingPrimaryCta
          label='Save listing'
          disabled={false}
          onPress={onClose}
          width={primaryButtonWidth}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: pageBg,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    gap: space.xs,
    paddingTop: space.sm,
  },
  navTitle: {
    fontSize: type.bodyLarge,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.35,
  },
  sectionEyebrow: {
    fontSize: type.micro,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: space.sm,
    marginBottom: space.xs,
    paddingHorizontal: space.xs,
  },
  sectionRule: {
    height: StyleSheet.hairlineWidth,
    marginVertical: space.lg,
    backgroundColor: 'rgba(60, 60, 67, 0.08)',
  },
  bottomDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingTop: space.xl,
  },
});
