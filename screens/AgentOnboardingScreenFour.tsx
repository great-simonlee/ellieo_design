import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
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

/** Landscape 4:3 frame for license / selfie upload (`width`:`height`). */
const PHOTO_ASPECT_RATIO = 4 / 3;

type FieldScrollKey = 'licenseName';

async function pickSingleImageFromLibrary(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert(
      'Photos',
      'Photo access is needed to upload pictures. You can enable it in Settings.',
    );
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: false,
    quality: 0.85,
  });
  if (result.canceled || result.assets.length === 0) return null;
  return result.assets[0].uri;
}

export type AgentOnboardingScreenFourProps = {
  /** Back from verification step 1 (name on license) to the bio screen. */
  onBackToBio?: () => void;
  /** Alias for `onBackToBio` (older call sites). */
  onBack?: () => void;
  onComplete: () => void;
};

export function AgentOnboardingScreenFour({
  onBackToBio,
  onBack,
  onComplete,
}: AgentOnboardingScreenFourProps) {
  const exitToBio = onBackToBio ?? onBack;
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { padH, contentMaxW, primaryButtonWidth } = useOnboardingCtaLayout();

  const [licenseName, setLicenseName] = useState('');
  const [licensePhotoUri, setLicensePhotoUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [keyboardBottomInset, setKeyboardBottomInset] = useState(0);
  const keyboardInsetRef = useRef(0);
  const scrollRef = useRef<ScrollView>(null);
  const fieldLayout = useRef<
    Partial<Record<FieldScrollKey, { y: number; h: number }>>
  >({});

  const progressStepNumber = 3;
  const progressRatio = progressStepNumber / TOTAL_STEPS;

  const canContinue = useMemo(() => {
    const nameOk = licenseName.trim().length > 0;
    return (
      nameOk &&
      licensePhotoUri != null &&
      selfieUri != null
    );
  }, [licenseName, licensePhotoUri, selfieUri]);

  const pickLicensePhoto = useCallback(async () => {
    const uri = await pickSingleImageFromLibrary();
    if (uri) setLicensePhotoUri(uri);
  }, []);

  const pickSelfiePhoto = useCallback(async () => {
    const uri = await pickSingleImageFromLibrary();
    if (uri) setSelfieUri(uri);
  }, []);

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

  const scrollPadBottom =
    space.xl + (keyboardBottomInset > 0 ? space.xxl + space.md : 0);

  const goBack = () => {
    exitToBio?.();
  };

  const goNext = () => {
    if (!canContinue) return;
    onComplete();
  };

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

      <View
        style={[styles.progressBlock, { paddingHorizontal: padH }]}
        accessibilityRole='progressbar'
        accessibilityValue={{
          min: 1,
          max: TOTAL_STEPS,
          now: progressStepNumber,
        }}
        accessibilityLabel={`Onboarding step ${progressStepNumber} of ${TOTAL_STEPS}`}
      >
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={['#7BA6FF', colors.primary]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[
              styles.progressFill,
              { width: `${Math.min(1, progressRatio) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressCaption}>
          Step {progressStepNumber} of {TOTAL_STEPS}
        </Text>
      </View>

      <Text
        style={[styles.pageEyebrow, { paddingHorizontal: padH }]}
        accessibilityRole='header'
      >
        VERIFICATION
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
              <Text style={styles.screenTitle}>Verify your information</Text>
              <Text style={styles.screenSubtitle}>
                Enter your name as on your license, then add a photo of the
                license and a selfie holding it.
              </Text>
            </View>
            <View
              collapsable={false}
              onLayout={captureFieldLayout('licenseName')}
            >
              <FieldBlock label='Name on license' required>
                <TextInput
                  value={licenseName}
                  onChangeText={setLicenseName}
                  onFocus={() => scrollToField('licenseName')}
                  placeholder='Enter your name on license'
                  placeholderTextColor={captionMuted}
                  style={styles.input}
                  selectionColor={colors.primary}
                />
              </FieldBlock>
            </View>

            <FieldBlock label='License photo' required>
              <GalleryPhotoSlot
                variant='license'
                uri={licensePhotoUri}
                onPick={() => void pickLicensePhoto()}
                onRemove={() => setLicensePhotoUri(null)}
              />
            </FieldBlock>

            <FieldBlock label='Selfie with license' required>
              <GalleryPhotoSlot
                variant='selfie'
                uri={selfieUri}
                onPick={() => void pickSelfiePhoto()}
                onRemove={() => setSelfieUri(null)}
              />
            </FieldBlock>
          </>
        </ScrollView>

        <OnboardingBottomCta
          label='Complete'
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

/** Empty state = earlier dashed upload UI; tap opens library. Filled = 4:3 preview + trash. */
function GalleryPhotoSlot({
  variant,
  uri,
  onPick,
  onRemove,
}: {
  variant: 'license' | 'selfie';
  uri: string | null;
  onPick: () => void;
  onRemove: () => void;
}) {
  const frameSize = {
    width: '100%' as const,
    aspectRatio: PHOTO_ASPECT_RATIO,
  };

  if (uri == null && variant === 'license') {
    return (
      <Pressable
        accessibilityRole='button'
        accessibilityLabel='Choose license photo from library'
        onPress={() => void onPick()}
        style={({ pressed }) => [
          styles.dropZone,
          frameSize,
          pressed && styles.dropZonePressed,
        ]}
      >
        <LinearGradient
          colors={['rgba(47,109,246,0.06)', 'rgba(47,109,246,0.02)']}
          style={StyleSheet.absoluteFill}
        />
        <Ionicons
          name='cloud-upload-outline'
          size={36}
          color={colors.primary}
          style={{ opacity: 0.65 }}
        />
        <Text style={styles.dropZoneTitle}>Add license photo</Text>
        <Text style={styles.dropZoneMeta}>
          Tap to choose from your photo library
        </Text>
      </Pressable>
    );
  }

  if (uri == null && variant === 'selfie') {
    return (
      <Pressable
        accessibilityRole='button'
        accessibilityLabel='Choose selfie with license from library'
        onPress={() => void onPick()}
        style={({ pressed }) => [
          styles.selfiePlaceholder,
          frameSize,
          pressed && styles.selfiePlaceholderPressed,
        ]}
      >
        <LinearGradient
          colors={['rgba(47,109,246,0.08)', 'rgba(47,109,246,0.03)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.selfiePlaceholderInner}>
          <Ionicons
            name='camera-outline'
            size={36}
            color={colors.primary}
            style={{ opacity: 0.7 }}
          />
          <Text style={styles.selfiePlaceholderTitle}>
            Add selfie with license
          </Text>
          <Text style={styles.selfiePlaceholderMeta}>
            Hold your license next to your face — tap to choose from your
            library
          </Text>
        </View>
      </Pressable>
    );
  }

  if (uri == null) return null;

  return (
    <View style={[styles.photoPreviewShell, frameSize]}>
      <Image
        source={{ uri }}
        style={styles.photoPreviewImage}
        resizeMode='cover'
      />
      <Pressable
        accessibilityRole='button'
        accessibilityLabel='Remove photo'
        onPress={onRemove}
        hitSlop={10}
        style={({ pressed }) => [
          styles.trashBtn,
          pressed && { opacity: 0.85 },
        ]}
      >
        <Ionicons name='trash' size={14} color='#FFFFFF' />
      </Pressable>
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
  progressBlock: {
    paddingBottom: space.md,
    width: '100%',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E5EA',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressCaption: {
    marginTop: space.sm,
    fontSize: type.caption,
    fontWeight: '600',
    color: captionMuted,
    letterSpacing: -0.1,
  },
  pageEyebrow: {
    fontSize: type.micro,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: space.sm,
  },
  scrollContent: {
    paddingTop: space.xs,
  },
  heroBlock: {
    width: '100%',
    alignSelf: 'center',
    marginBottom: 0,
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
  dropZone: {
    borderRadius: radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(47, 109, 246, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
    overflow: 'hidden',
  },
  dropZonePressed: {
    opacity: 0.92,
    borderColor: colors.primary,
  },
  dropZoneTitle: {
    marginTop: space.md,
    fontSize: type.bodyLarge,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.3,
  },
  dropZoneMeta: {
    marginTop: space.xs,
    fontSize: type.caption,
    color: captionMuted,
    textAlign: 'center',
    maxWidth: 260,
  },
  selfiePlaceholder: {
    borderRadius: radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(47, 109, 246, 0.35)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfiePlaceholderPressed: {
    opacity: 0.92,
    borderColor: colors.primary,
  },
  selfiePlaceholderInner: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
  },
  selfiePlaceholderTitle: {
    marginTop: space.md,
    fontSize: type.bodyLarge,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  selfiePlaceholderMeta: {
    marginTop: space.xs,
    fontSize: type.caption,
    color: captionMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
  photoPreviewShell: {
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: 'hidden',
    backgroundColor: '#F8FAFF',
    position: 'relative',
  },
  photoPreviewImage: {
    ...StyleSheet.absoluteFillObject,
  },
  trashBtn: {
    position: 'absolute',
    bottom: space.sm,
    right: space.sm,
    zIndex: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: required,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: { elevation: 3 },
    }),
  },
});
