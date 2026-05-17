import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  colors,
  gradientPrimaryHorizontal,
  radius,
  space,
  type,
} from '../design/theme';
import { LifestyleProfileReadout } from './LifestyleProfileReadout';
import { MatchCelebrationModal } from './MatchCelebrationModal';
import type { RoommateProfile } from './RoommateProfileDetail';

const ink = '#0F172A';
const inkSoft = '#475569';
const canvas = '#F4F7FC';
const white = '#FFFFFF';
const cardBorder = '#E2E8F0';
const cardSurface = '#FFFFFF';
const cardSurfaceTint = '#F7FAFF';
const CLOSE_BTN_SIZE = 34;
/** Vertical rhythm — Full profile modal body only. */
const SECTION_GAP = space.xxl;
const KICKER_TO_CONTENT = space.md;
const LIST_ROW_GAP = space.md;

function matchHintFor(pct: number): string {
  if (pct >= 92) return 'Exceptional lifestyle & timing fit';
  if (pct >= 85) return 'Lifestyle & move-in preferences align';
  if (pct >= 78) return 'Strong overlap on budget & habits';
  return 'Worth a conversation — explore the fit';
}

const MOCK_SCHOOL_LOGOS = {
  nyu: require('../assets/img/mock/nyu_logo.png'),
} as const;

/** Full profile only — expand acronyms for display (logos still keyed on raw `school`). */
const SCHOOL_DISPLAY_NAMES: Record<string, string> = {
  nyu: 'New York University',
  mit: 'Massachusetts Institute of Technology',
  fit: 'Fashion Institute of Technology',
  columbia: 'Columbia University',
  parsons: 'Parsons School of Design',
  pratt: 'Pratt Institute',
};

function schoolDisplayName(school: string): string {
  const trimmed = school.trim();
  const key = trimmed.toLowerCase();
  if (SCHOOL_DISPLAY_NAMES[key]) return SCHOOL_DISPLAY_NAMES[key];
  if (key.includes('new york university')) return 'New York University';
  if (key.includes('massachusetts institute of technology')) {
    return 'Massachusetts Institute of Technology';
  }
  return trimmed;
}

function schoolLogoFor(profile: RoommateProfile) {
  if (profile.schoolLogo) return profile.schoolLogo;
  const key = profile.school.trim().toLowerCase();
  if (key === 'nyu' || key.includes('new york university')) {
    return MOCK_SCHOOL_LOGOS.nyu;
  }
  return null;
}

type MatchFullProfileSheetProps = {
  profile: RoommateProfile | null;
  padH: number;
  onClose: () => void;
  onSayHi?: () => void;
  celebrationProfile?: RoommateProfile | null;
  onCelebrationClose?: () => void;
};

export function MatchFullProfileSheet({
  profile,
  padH,
  onClose,
  onSayHi,
  celebrationProfile = null,
  onCelebrationClose,
}: MatchFullProfileSheetProps) {
  const visible = profile !== null;
  const insets = useSafeAreaInsets();
  const { width: windowW, height: windowH } = useWindowDimensions();
  const [photoPage, setPhotoPage] = useState(0);

  const heroH = useMemo(() => Math.round(windowH * 0.5), [windowH]);
  const footerPad = Math.max(insets.bottom, space.md) + space.sm;
  const footerH = 72 + footerPad;

  useEffect(() => {
    setPhotoPage(0);
  }, [profile?.id]);

  const onGalleryScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!profile) return;
    const x = e.nativeEvent.contentOffset.x;
    const page = Math.round(x / windowW);
    if (page >= 0 && page < profile.photos.length) {
      setPhotoPage(page);
    }
  };

  const schoolLogo = profile ? schoolLogoFor(profile) : null;

  return (
    <Modal
      animationType='slide'
      presentationStyle='fullScreen'
      visible={visible}
      onRequestClose={onClose}
    >
      {profile ? (
        <View style={styles.root}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: footerH + space.xl },
            ]}
            showsVerticalScrollIndicator={false}
            bounces={false}
            alwaysBounceVertical={false}
            overScrollMode='never'
          >
            <View style={[styles.hero, { height: heroH }]}>
              <ScrollView
                horizontal
                pagingEnabled
                nestedScrollEnabled
                bounces={profile.photos.length > 1}
                scrollEnabled={profile.photos.length > 1}
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={onGalleryScroll}
                onMomentumScrollEnd={onGalleryScroll}
                style={styles.heroGallery}
              >
                {profile.photos.map((src, i) => (
                  <View
                    key={`${profile.id}-hero-${i}`}
                    style={{ width: windowW, height: heroH }}
                  >
                    <Image source={src} resizeMode='cover' style={styles.heroImage} />
                  </View>
                ))}
              </ScrollView>

              <LinearGradient
                colors={['rgba(6,8,20,0.55)', 'rgba(6,8,20,0)', 'rgba(6,8,20,0)']}
                locations={[0, 0.35, 1]}
                style={styles.heroGradTop}
                pointerEvents='none'
              />
              <LinearGradient
                colors={['rgba(6,8,20,0)', 'rgba(6,8,20,0.35)', 'rgba(6,8,20,0.88)']}
                locations={[0.35, 0.72, 1]}
                style={styles.heroGradBottom}
                pointerEvents='none'
              />

              {profile.photos.length > 1 ? (
                <View
                  style={[styles.heroDots, { top: insets.top + space.sm }]}
                  pointerEvents='none'
                >
                  {profile.photos.map((_, i) => (
                    <View
                      key={`${profile.id}-dot-${i}`}
                      style={[styles.heroDot, i === photoPage && styles.heroDotOn]}
                    />
                  ))}
                </View>
              ) : null}

              <View style={[styles.heroIdentity, { paddingHorizontal: padH }]}>
                <View style={styles.heroNameRow}>
                  <Text style={styles.heroName}>{profile.name}</Text>
                  <View style={styles.heroVerified}>
                    <Ionicons name='checkmark' size={11} color={white} />
                  </View>
                </View>
                <Text style={styles.heroMajorYear}>
                  {profile.major} · Class of {profile.schoolYear}
                </Text>
                <View style={styles.heroSchoolRow}>
                  {schoolLogo ? (
                    <Image source={schoolLogo} style={styles.heroSchoolLogo} />
                  ) : (
                    <View style={styles.heroSchoolFallback}>
                      <Ionicons name='school-outline' size={12} color={white} />
                    </View>
                  )}
                  <Text style={styles.heroSchool} numberOfLines={2}>
                    {schoolDisplayName(profile.school)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.body, { paddingHorizontal: padH }]}>
              <View style={styles.insightCard}>
                <View style={styles.insightHeader}>
                  <View style={styles.insightCopy}>
                    <View style={styles.matchPointLabelRow}>
                      <Ionicons name='sparkles' size={15} color={colors.primary} />
                      <Text style={styles.insightEyebrow}>Match point</Text>
                    </View>
                    <Text style={styles.matchPointHint}>
                      {matchHintFor(profile.matchPct)}
                    </Text>
                  </View>
                  <Text
                    style={styles.matchPointScore}
                    accessibilityLabel={`${profile.matchPct} percent match`}
                  >
                    {profile.matchPct}%
                  </Text>
                </View>
              </View>

              <View style={styles.profileSection}>
                <Text style={styles.sectionKicker}>About me</Text>
                <View style={styles.profileList}>
                  <View
                    style={styles.profileListRow}
                    accessibilityLabel={`Gender, ${profile.gender}`}
                  >
                    <Ionicons name='person-outline' size={17} color={colors.primary} />
                    <Text style={styles.profileListLine}>
                      <Text style={styles.profileListLabel}>Gender · </Text>
                      <Text style={styles.profileListValue}>{profile.gender}</Text>
                    </Text>
                  </View>
                  <View
                    style={styles.profileListRow}
                    accessibilityLabel={`Budget, ${profile.budget}`}
                  >
                    <Ionicons name='wallet-outline' size={17} color={colors.primary} />
                    <Text style={styles.profileListLine}>
                      <Text style={styles.profileListLabel}>Budget · </Text>
                      <Text style={styles.profileListValue}>{profile.budget}</Text>
                    </Text>
                  </View>
                  <View
                    style={styles.profileListRow}
                    accessibilityLabel={`Move-in, ${profile.moveIn}`}
                  >
                    <Ionicons name='calendar-outline' size={17} color={colors.primary} />
                    <Text style={styles.profileListLine}>
                      <Text style={styles.profileListLabel}>Move-in · </Text>
                      <Text style={styles.profileListValue}>{profile.moveIn}</Text>
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.profileSection}>
                <Text style={styles.sectionKicker}>Looking for</Text>
                <View style={styles.profileList}>
                  <View
                    style={styles.profileListRow}
                    accessibilityLabel={`Roommate preference, ${profile.roommatePreference}`}
                  >
                    <Ionicons name='people-outline' size={17} color={colors.primary} />
                    <Text style={styles.profileListLine}>
                      <Text style={styles.profileListLabel}>Roommate · </Text>
                      <Text style={styles.profileListValue}>
                        {profile.roommatePreference}
                      </Text>
                    </Text>
                  </View>
                  <View
                    style={styles.profileListRow}
                    accessibilityLabel={`Status preference, ${profile.statusPreference}`}
                  >
                    <Ionicons name='briefcase-outline' size={17} color={colors.primary} />
                    <Text style={styles.profileListLine}>
                      <Text style={styles.profileListLabel}>Status · </Text>
                      <Text style={styles.profileListValue}>{profile.statusPreference}</Text>
                    </Text>
                  </View>
                  <View
                    style={styles.profileListRow}
                    accessibilityLabel={`Room preference, ${profile.roomPreference}`}
                  >
                    <Ionicons name='bed-outline' size={17} color={colors.primary} />
                    <Text style={styles.profileListLine}>
                      <Text style={styles.profileListLabel}>Room · </Text>
                      <Text style={styles.profileListValue}>{profile.roomPreference}</Text>
                    </Text>
                  </View>
                  <View
                    style={styles.profileListRow}
                    accessibilityLabel={`Preferred location, ${profile.preferredLocation}`}
                  >
                    <Ionicons name='location-outline' size={17} color={colors.primary} />
                    <Text style={styles.profileListLine}>
                      <Text style={styles.profileListLabel}>Location · </Text>
                      <Text style={styles.profileListValue}>{profile.preferredLocation}</Text>
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.profileSection}>
                <Text style={styles.sectionKicker}>In their words</Text>
                <View style={styles.quoteBlock}>
                  <Text style={styles.quoteMark}>"</Text>
                  <Text style={styles.aboutBio}>{profile.bio}</Text>
                </View>
              </View>

              <View style={styles.profileSection}>
                <Text style={styles.sectionKicker}>Lifestyle</Text>
                <LifestyleProfileReadout tags={profile.tags} profileId={profile.id} />
              </View>
            </View>
          </ScrollView>

          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Close profile'
            onPress={onClose}
            hitSlop={10}
            style={({ pressed }) => [
              styles.closeBtnFixed,
              {
                top: insets.top + space.xs,
                right: padH,
                width: CLOSE_BTN_SIZE,
                height: CLOSE_BTN_SIZE,
                borderRadius: CLOSE_BTN_SIZE / 2,
              },
              pressed && styles.closeBtnPressed,
            ]}
          >
            <Ionicons name='close' size={18} color='rgba(15,23,42,0.72)' />
          </Pressable>

          <View style={[styles.footer, { paddingBottom: footerPad, paddingHorizontal: padH }]}>
            <LinearGradient
              colors={['rgba(244,247,252,0)', canvas]}
              style={styles.footerFade}
              pointerEvents='none'
            />
            <Pressable
              accessibilityRole='button'
              accessibilityLabel={`Say hi to ${profile.name}`}
              onPress={onSayHi ?? onClose}
              style={({ pressed }) => [styles.ctaShell, pressed && styles.ctaPressed]}
            >
              <LinearGradient
                colors={gradientPrimaryHorizontal}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.cta}
              >
                <View style={styles.ctaInner}>
                  <View style={styles.ctaIconRing}>
                    <Ionicons name='chatbubble-ellipses' size={20} color={white} />
                  </View>
                  <View style={styles.ctaTextCol}>
                    <Text style={styles.ctaTitle}>Say hi to {profile.name}</Text>
                    <Text style={styles.ctaSub}>Start the roommate conversation</Text>
                  </View>
                  <Ionicons name='arrow-forward' size={20} color='rgba(255,255,255,0.9)' />
                </View>
              </LinearGradient>
            </Pressable>
          </View>

          <MatchCelebrationModal
            presentation='embedded'
            profile={celebrationProfile}
            onClose={onCelebrationClose ?? (() => {})}
          />
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: canvas,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    width: '100%',
    backgroundColor: '#0B1020',
  },
  heroGallery: {
    ...StyleSheet.absoluteFillObject,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 120,
  },
  heroGradBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '58%',
  },
  heroDots: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    zIndex: 4,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  heroDotOn: {
    width: 22,
    backgroundColor: white,
  },
  closeBtnFixed: {
    position: 'absolute',
    zIndex: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.52)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.45)',
    overflow: 'hidden',
  },
  closeBtnPressed: {
    opacity: 0.65,
  },
  heroIdentity: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: space.xl + 8,
    gap: 4,
    zIndex: 3,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  heroName: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    color: white,
    letterSpacing: -0.8,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroVerified: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  heroMajorYear: {
    fontSize: type.body,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: -0.15,
  },
  heroSchoolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: 2,
  },
  heroSchoolLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: white,
  },
  heroSchoolFallback: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  heroSchool: {
    flex: 1,
    fontSize: type.caption,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.78)',
    letterSpacing: -0.05,
  },
  body: {
    paddingTop: space.xl,
    gap: SECTION_GAP,
  },
  insightCard: {
    borderRadius: radius.lg,
    backgroundColor: cardSurfaceTint,
    padding: space.lg,
    borderWidth: 1,
    borderColor: cardBorder,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  insightCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
    paddingRight: space.sm,
  },
  matchPointLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  insightEyebrow: {
    fontSize: type.micro,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  matchPointHint: {
    fontSize: type.caption,
    lineHeight: 18,
    fontWeight: '500',
    color: inkSoft,
    letterSpacing: -0.05,
  },
  matchPointScore: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -1,
    flexShrink: 0,
  },
  profileSection: {
    gap: KICKER_TO_CONTENT,
  },
  profileList: {
    gap: LIST_ROW_GAP,
  },
  profileListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 24,
  },
  profileListLine: {
    flex: 1,
    fontSize: type.body,
    lineHeight: 22,
    fontWeight: '400',
    color: ink,
    letterSpacing: -0.15,
  },
  profileListLabel: {
    color: inkSoft,
    fontWeight: '400',
  },
  profileListValue: {
    fontWeight: '600',
    color: ink,
  },
  sectionKicker: {
    fontSize: type.micro,
    lineHeight: 14,
    fontWeight: '700',
    color: inkSoft,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  quoteBlock: {
    position: 'relative',
  },
  quoteMark: {
    position: 'absolute',
    left: 0,
    top: 0,
    fontSize: 44,
    lineHeight: 44,
    fontWeight: '800',
    color: 'rgba(47,109,246,0.18)',
    letterSpacing: -2,
  },
  aboutBio: {
    fontSize: type.bodyLarge,
    lineHeight: 26,
    fontWeight: '400',
    color: ink,
    letterSpacing: -0.25,
    paddingTop: space.lg,
    paddingLeft: space.lg,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    paddingTop: space.md,
    backgroundColor: canvas,
  },
  footerFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -24,
    height: 24,
  },
  ctaShell: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.32,
        shadowRadius: 20,
      },
      android: { elevation: 10 },
    }),
  },
  ctaPressed: {
    opacity: 0.92,
  },
  cta: {
    minHeight: 58,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    justifyContent: 'center',
  },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  ctaIconRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  ctaTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  ctaTitle: {
    fontSize: type.bodyLarge,
    fontWeight: '800',
    color: white,
    letterSpacing: -0.25,
  },
  ctaSub: {
    fontSize: type.micro,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.82)',
    letterSpacing: -0.02,
  },
});
