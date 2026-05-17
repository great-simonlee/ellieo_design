import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  colors,
  gradientPrimaryHorizontal,
  radius,
  space,
  type,
} from '../design/theme';
import { MatchFullProfileSheet } from './MatchFullProfileSheet';

const ink = '#1C1C1E';
const muted = '#687084';
const white = '#FFFFFF';
/** Portrait gallery — width : height = 3 : 4 */
const PHOTO_ASPECT = 3 / 4;

function portraitPhotoSize(
  width: number,
  maxHeight?: number,
): { width: number; height: number } {
  let w = width;
  let h = Math.round(w / PHOTO_ASPECT);
  if (maxHeight != null && h > maxHeight) {
    h = maxHeight;
    w = Math.round(h * PHOTO_ASPECT);
  }
  return { width: w, height: h };
}

const shallowShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  android: { elevation: 6 },
});

export type RoommateProfile = {
  id: string;
  name: string;
  age: number;
  school: string;
  role: string;
  /** Display label, e.g. `She / her`. */
  gender: string;
  major: string;
  /** Graduation year, e.g. `2026`. */
  schoolYear: string;
  bio: string;
  budget: string;
  /** e.g. `Early Aug 2026` — timing + month + year. */
  moveIn: string;
  /** e.g. `Female roommate only`, `Open to all genders`. */
  roommatePreference: string;
  /** e.g. `Student preferred`, `Open to both`. */
  statusPreference: string;
  /** e.g. `Master preferred`, `Open to any options`. */
  roomPreference: string;
  /** e.g. `East Village`. */
  preferredLocation: string;
  matchPct: number;
  tags: string[];
  photos: ImageSourcePropType[];
  schoolLogo?: ImageSourcePropType;
};

const MOCK_SCHOOL_LOGOS = {
  nyu: require('../assets/img/mock/nyu_logo.png'),
} as const;

function matchHintFor(pct: number): string {
  if (pct >= 92) return 'Exceptional lifestyle & timing fit';
  if (pct >= 85) return 'Lifestyle & move-in preferences align';
  if (pct >= 78) return 'Strong overlap on budget & habits';
  return 'Worth a conversation — explore the fit';
}

function schoolLogoFor(profile: RoommateProfile): ImageSourcePropType | null {
  if (profile.schoolLogo) return profile.schoolLogo;
  const key = profile.school.trim().toLowerCase();
  if (key === 'nyu' || key.includes('new york university')) {
    return MOCK_SCHOOL_LOGOS.nyu;
  }
  return null;
}

/** Design-only — represents a completed personal onboarding profile. */
export const ONBOARDING_PREVIEW_PROFILE: RoommateProfile = {
  id: 'preview-you',
  name: 'Maya',
  age: 24,
  school: 'Fashion Institute of Technology',
  role: 'Design student',
  gender: 'She / her',
  major: 'Fashion Design',
  schoolYear: '2026',
  bio: 'Quiet weekdays, gallery walks on weekends, and early-morning coffee runs. Looking for a tidy 2BR near Midtown with a roommate who values calm evenings and keeps common spaces spotless.',
  budget: '$1,850 / mo',
  moveIn: 'Early Aug 2026',
  roommatePreference: 'Female roommate only',
  statusPreference: 'Student preferred',
  roomPreference: 'Master preferred',
  preferredLocation: 'East Village',
  matchPct: 94,
  tags: ['Early bird', 'Very tidy', 'Rarely hosts', 'Introvert'],
  photos: [
    require('../assets/img/mock/IMG_6076.jpg'),
    require('../assets/img/mock/IMG_2585.png'),
  ],
};

export type RoommateProfileDetailVariant = 'match' | 'onboarding-preview';

type RoommateProfileDetailBodyProps = {
  profile: RoommateProfile;
  padH: number;
  variant: RoommateProfileDetailVariant;
  /** When set, photo card uses this width; height follows 3:4 aspect. */
  photoCardW?: number;
  contentStyle?: StyleProp<ViewStyle>;
  /** Match sheet — chevron on photo (top-right stack under counter). */
  onDismiss?: () => void;
  /** Edge-to-edge photo (profile modal). */
  photoFullBleed?: boolean;
  /** Cap gallery height (profile modal). */
  photoMaxH?: number;
  /** Top-right `1 / n` pill; modal uses segment bars only. */
  photoShowCountPill?: boolean;
};

/** Scrollable profile body — photo gallery + identity, bio, lifestyle, and facts. */
export function RoommateProfileDetailBody({
  profile,
  padH,
  variant,
  photoCardW: photoCardWProp,
  contentStyle,
  onDismiss,
  photoFullBleed,
  photoMaxH,
  photoShowCountPill = true,
}: RoommateProfileDetailBodyProps) {
  const { width: windowW } = useWindowDimensions();
  const [photoPage, setPhotoPage] = useState(0);

  const basePhotoW = photoCardWProp ?? windowW - padH * 2;
  const { width: photoCardW, height: photoCardH } = portraitPhotoSize(
    basePhotoW,
    photoMaxH,
  );
  const schoolLogo = schoolLogoFor(profile);
  const isPreview = variant === 'onboarding-preview';

  const onGalleryScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const page = Math.round(x / photoCardW);
    if (page >= 0 && page < profile.photos.length) {
      setPhotoPage(page);
    }
  };

  useEffect(() => {
    setPhotoPage(0);
  }, [profile.id]);

  const photoFrame = (
    <View
      style={[
        styles.detailPhotoCard,
        photoFullBleed && styles.detailPhotoCardBleed,
        { width: photoCardW, height: photoCardH },
      ]}
    >
        <ScrollView
          horizontal
          pagingEnabled
          bounces={profile.photos.length > 1}
          scrollEnabled={profile.photos.length > 1}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={onGalleryScroll}
          onMomentumScrollEnd={onGalleryScroll}
          style={styles.detailPhotoGallery}
        >
          {profile.photos.map((src, i) => (
            <View
              key={`${profile.id}-detail-photo-${i}`}
              style={[
                styles.detailPhotoSlide,
                { width: photoCardW, height: photoCardH },
              ]}
            >
              <Image
                source={src}
                resizeMode='cover'
                style={styles.detailPhotoImage}
              />
            </View>
          ))}
        </ScrollView>

        <LinearGradient
          colors={['rgba(15,23,42,0)', 'rgba(15,23,42,0.55)']}
          style={styles.detailPhotoFade}
          pointerEvents='none'
        />

        <View style={styles.detailPhotoTopEnd} pointerEvents='box-none'>
          {profile.photos.length > 1 && photoShowCountPill ? (
            <View style={styles.detailPhotoCount} pointerEvents='none'>
              <Text style={styles.detailPhotoCountText}>
                {photoPage + 1} / {profile.photos.length}
              </Text>
            </View>
          ) : null}
          {onDismiss ? (
            <Pressable
              accessibilityRole='button'
              accessibilityLabel='Close profile'
              onPress={onDismiss}
              hitSlop={12}
              style={({ pressed }) => [
                styles.detailPhotoDismiss,
                pressed && styles.detailPhotoDismissPressed,
              ]}
            >
              <Ionicons name='chevron-down' size={24} color={ink} />
            </Pressable>
          ) : null}
        </View>

        {profile.photos.length > 1 ? (
          <View style={styles.detailPhotoSegments} pointerEvents='none'>
            {profile.photos.map((_, i) => (
              <View
                key={`${profile.id}-detail-seg-${i}`}
                style={[
                  styles.detailPhotoSegment,
                  i === photoPage && styles.detailPhotoSegmentOn,
                ]}
              />
            ))}
          </View>
        ) : null}
    </View>
  );

  return (
    <View style={contentStyle}>
      {photoFullBleed && photoCardW < windowW ? (
        <View style={[styles.detailPhotoBleedWrap, { width: windowW }]}>
          {photoFrame}
        </View>
      ) : (
        photoFrame
      )}

      <View style={styles.detailContent}>
        {isPreview ? (
          <Text style={styles.detailEyebrow}>How roommates see you</Text>
        ) : null}

        <View style={styles.detailTitleBlock}>
          <View style={styles.detailTitleRow}>
            <Text style={styles.detailTitle}>
              {profile.name}, {profile.age}
            </Text>
            <View style={styles.detailVerified}>
              <Ionicons name='checkmark' size={11} color={white} />
            </View>
          </View>
          <Text style={styles.detailRoleLine}>{profile.role}</Text>
          <View style={styles.detailSchoolRow}>
            {schoolLogo ? (
              <Image
                source={schoolLogo}
                resizeMode='cover'
                style={styles.detailSchoolLogo}
              />
            ) : null}
            <Text style={styles.detailSchoolLine} numberOfLines={2}>
              {profile.school}
            </Text>
          </View>
        </View>

        <View style={styles.detailGlanceRow}>
          <View style={styles.detailGlanceChip}>
            <Ionicons name='wallet-outline' size={14} color={colors.primary} />
            <Text style={styles.detailGlanceChipText}>{profile.budget}</Text>
          </View>
          <View style={styles.detailGlanceChip}>
            <Ionicons name='calendar-outline' size={14} color={colors.primary} />
            <Text style={styles.detailGlanceChipText}>{profile.moveIn}</Text>
          </View>
        </View>

        {!isPreview ? (
          <LinearGradient
            colors={['rgba(47,109,246,0.14)', 'rgba(47,109,246,0.04)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.detailMatchBanner}
          >
            <View style={styles.detailMatchCopy}>
              <View style={styles.detailMatchLabelRow}>
                <Ionicons name='sparkles' size={15} color={colors.primary} />
                <Text style={styles.detailMatchLabel}>Great match</Text>
              </View>
              <Text style={styles.detailMatchHint}>
                {matchHintFor(profile.matchPct)}
              </Text>
            </View>
            <Text style={styles.detailMatchScore}>{profile.matchPct}%</Text>
          </LinearGradient>
        ) : (
          <View style={styles.detailPreviewNote}>
            <Ionicons name='eye-outline' size={18} color={colors.primary} />
            <Text style={styles.detailPreviewNoteText}>
              This is your public roommate card — you can edit photos, bio, and
              lifestyle anytime from your profile.
            </Text>
          </View>
        )}

        <View style={styles.detailCard}>
          <Text style={styles.detailSectionLabel}>About</Text>
          <Text style={styles.detailBio}>{profile.bio}</Text>
        </View>

        <View style={styles.detailBlock}>
          <Text style={styles.detailBlockTitle}>Lifestyle</Text>
          <View style={styles.detailPillRow}>
            {profile.tags.map((tag) => (
              <View key={tag} style={styles.detailPill}>
                <Text style={styles.detailPillText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailSectionLabel}>Looking for</Text>
          <View style={styles.detailFacts}>
            <View style={styles.detailFact}>
              <Ionicons name='wallet-outline' size={20} color={colors.primary} />
              <View style={styles.detailFactText}>
                <Text style={styles.detailFactLabel}>Budget</Text>
                <Text style={styles.detailFactValue}>{profile.budget}</Text>
              </View>
            </View>
            <View style={styles.detailFactRule} />
            <View style={styles.detailFact}>
              <Ionicons
                name='calendar-outline'
                size={20}
                color={colors.primary}
              />
              <View style={styles.detailFactText}>
                <Text style={styles.detailFactLabel}>Move-in</Text>
                <Text style={styles.detailFactValue}>{profile.moveIn}</Text>
              </View>
            </View>
          </View>
        </View>

        {isPreview ? (
          <View style={styles.detailCard}>
            <View style={styles.detailVerifiedRow}>
              <View style={styles.detailVerifiedIcon}>
                <Ionicons name='shield-checkmark' size={20} color={colors.primary} />
              </View>
              <View style={styles.detailVerifiedCopy}>
                <Text style={styles.detailVerifiedTitle}>School verified</Text>
                <Text style={styles.detailVerifiedMeta}>
                  FIT student email confirmed during onboarding
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

type ProfileDetailSheetProps = {
  profile: RoommateProfile | null;
  padH: number;
  onClose: () => void;
  variant?: RoommateProfileDetailVariant;
};

export function ProfileDetailSheet({
  profile,
  padH,
  onClose,
  variant = 'match',
}: ProfileDetailSheetProps) {
  const visible = profile !== null;
  const insets = useSafeAreaInsets();
  const footerPad = Math.max(insets.bottom, space.md) + space.sm;
  const isPreview = variant === 'onboarding-preview';

  if (!isPreview) {
    return (
      <MatchFullProfileSheet profile={profile} padH={padH} onClose={onClose} />
    );
  }

  return (
      <Modal
        animationType='slide'
        presentationStyle='pageSheet'
        visible={visible}
        onRequestClose={onClose}
      >
        {profile ? (
          <View style={styles.detailRoot}>
            <ScrollView
              style={styles.detailScroll}
              contentInsetAdjustmentBehavior='never'
              automaticallyAdjustContentInsets={false}
              contentContainerStyle={[
                styles.detailScrollContent,
                {
                  paddingTop: space.md,
                  paddingHorizontal: padH,
                  paddingBottom: 88 + footerPad + space.xl,
                },
              ]}
              showsVerticalScrollIndicator={false}
            >
              <RoommateProfileDetailBody
                profile={profile}
                padH={padH}
                variant={variant}
              />
            </ScrollView>
            <View
              style={[
                styles.detailFooter,
                { paddingBottom: footerPad, paddingHorizontal: padH },
              ]}
            >
              <Pressable
                accessibilityRole='button'
                accessibilityLabel='Continue'
                onPress={onClose}
                style={({ pressed }) => [
                  styles.detailCtaShell,
                  pressed && styles.detailCtaPressed,
                ]}
              >
                <LinearGradient
                  colors={gradientPrimaryHorizontal}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.detailCta}
                >
                  <View style={styles.detailCtaRow}>
                    <View style={styles.detailCtaIconSlot}>
                      <Ionicons name='checkmark-circle' size={21} color={white} />
                    </View>
                    <Text style={styles.detailCtaText}>Continue</Text>
                  </View>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        ) : null}
      </Modal>
  );
}

const styles = StyleSheet.create({
  detailRoot: {
    flex: 1,
    backgroundColor: white,
  },
  detailScroll: {
    flex: 1,
  },
  detailScrollContent: {
    flexGrow: 1,
  },
  detailPhotoCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: '#E8ECF2',
    ...shallowShadow,
  },
  detailPhotoCardBleed: {
    borderRadius: 0,
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: { elevation: 0 },
    }),
  },
  detailPhotoBleedWrap: {
    alignSelf: 'center',
    alignItems: 'center',
  },
  detailPhotoGallery: {
    flex: 1,
  },
  detailPhotoSlide: {
    backgroundColor: '#0F172A',
  },
  detailPhotoImage: {
    width: '100%',
    height: '100%',
  },
  detailPhotoFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 88,
  },
  detailPhotoTopEnd: {
    position: 'absolute',
    top: space.md,
    right: space.md,
    alignItems: 'flex-end',
    gap: space.sm,
    zIndex: 12,
  },
  detailPhotoCount: {
    paddingVertical: 5,
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(15,23,42,0.5)',
  },
  detailPhotoDismiss: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: white,
    ...shallowShadow,
  },
  detailPhotoDismissPressed: {
    opacity: 0.88,
  },
  detailPhotoCountText: {
    fontSize: type.micro,
    fontWeight: '700',
    color: white,
    letterSpacing: 0.2,
  },
  detailPhotoSegments: {
    position: 'absolute',
    left: space.md,
    right: space.md,
    bottom: space.md,
    flexDirection: 'row',
    gap: 5,
  },
  detailPhotoSegment: {
    flex: 1,
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  detailPhotoSegmentOn: {
    backgroundColor: white,
  },
  detailContent: {
    marginTop: space.lg,
    gap: space.lg,
  },
  detailEyebrow: {
    fontSize: type.micro,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: -space.sm,
  },
  detailTitleBlock: {
    gap: space.xs,
  },
  detailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  detailTitle: {
    flexShrink: 1,
    fontSize: type.display,
    lineHeight: 32,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.6,
  },
  detailVerified: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    flexShrink: 0,
  },
  detailRoleLine: {
    fontSize: type.body,
    fontWeight: '600',
    color: ink,
    letterSpacing: -0.2,
  },
  detailSchoolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: 2,
  },
  detailSchoolLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: white,
  },
  detailSchoolLine: {
    flex: 1,
    fontSize: type.caption,
    fontWeight: '500',
    color: muted,
    letterSpacing: -0.05,
  },
  detailGlanceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    marginTop: -space.xs,
  },
  detailGlanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: white,
    borderWidth: 1,
    borderColor: 'rgba(31,41,55,0.08)',
  },
  detailGlanceChipText: {
    fontSize: type.caption,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.08,
  },
  detailMatchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(47,109,246,0.12)',
  },
  detailMatchCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
    paddingRight: space.md,
  },
  detailMatchLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailMatchLabel: {
    fontSize: type.body,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.2,
  },
  detailMatchHint: {
    fontSize: type.caption,
    fontWeight: '500',
    color: muted,
    letterSpacing: -0.05,
  },
  detailMatchScore: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.8,
  },
  detailPreviewNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(47,109,246,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(47,109,246,0.14)',
  },
  detailPreviewNoteText: {
    flex: 1,
    fontSize: type.caption,
    lineHeight: 19,
    fontWeight: '500',
    color: ink,
    letterSpacing: -0.08,
  },
  detailCard: {
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: white,
    gap: space.sm,
    ...shallowShadow,
  },
  detailSectionLabel: {
    fontSize: type.micro,
    fontWeight: '700',
    color: muted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  detailBio: {
    fontSize: type.body,
    lineHeight: 24,
    fontWeight: '500',
    color: ink,
    letterSpacing: -0.15,
  },
  detailBlock: {
    gap: space.sm,
  },
  detailBlockTitle: {
    fontSize: type.caption,
    fontWeight: '700',
    color: muted,
    letterSpacing: 0.02,
    marginLeft: space.xs,
  },
  detailPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  detailPill: {
    paddingVertical: 8,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: white,
    borderWidth: 1,
    borderColor: 'rgba(31,41,55,0.07)',
  },
  detailPillText: {
    fontSize: type.caption,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.05,
  },
  detailFacts: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  detailFact: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minWidth: 0,
  },
  detailFactRule: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginVertical: space.xs,
    backgroundColor: 'rgba(31,41,55,0.1)',
  },
  detailFactText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  detailFactLabel: {
    fontSize: type.micro,
    fontWeight: '600',
    color: muted,
    letterSpacing: 0.02,
  },
  detailFactValue: {
    fontSize: type.body,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.2,
  },
  detailVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  detailVerifiedIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47,109,246,0.1)',
  },
  detailVerifiedCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  detailVerifiedTitle: {
    fontSize: type.body,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.2,
  },
  detailVerifiedMeta: {
    fontSize: type.caption,
    fontWeight: '500',
    color: muted,
    letterSpacing: -0.05,
    lineHeight: 18,
  },
  detailFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'stretch',
    paddingTop: space.lg,
    backgroundColor: white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(31,41,55,0.08)',
  },
  detailCtaShell: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: radius.pill,
    overflow: 'hidden',
    ...shallowShadow,
  },
  detailCta: {
    width: '100%',
    minHeight: 52,
    paddingVertical: 15,
    paddingHorizontal: space.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  detailCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  detailCtaIconSlot: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCtaText: {
    fontSize: type.bodyLarge,
    lineHeight: 20,
    fontWeight: '800',
    color: white,
    letterSpacing: -0.2,
    ...Platform.select({
      android: { includeFontPadding: false },
    }),
  },
  detailCtaPressed: {
    opacity: 0.92,
  },
});
