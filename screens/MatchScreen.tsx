import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  LayoutChangeEvent,
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
  AppTopBar,
  appTopBarBlockHeight,
  appTopBarStyles,
} from '../components/AppTopBar';
import { MatchCelebrationModal } from '../components/MatchCelebrationModal';
import {
  ProfileDetailSheet,
  type RoommateProfile,
} from '../components/RoommateProfileDetail';
import { colors, gradientPrimaryHorizontal, radius, space, type } from '../design/theme';

const ink = '#1C1C1E';
const muted = '#687084';
const white = '#FFFFFF';
/** Portrait profile photos — width : height = 3 : 4 */
const PHOTO_ASPECT = 3 / 4;
const ACTION_DOCK_BUTTON_H = 52;
/** Shared height with `photoCountPill` on profile cards. */
const PHOTO_META_PILL_MIN_H = 28;
const CARD_FOOT_COMPACT_H = 40;
/** Vertical rhythm — header → card → actions → tab bar */
const MATCH_GAP_HEADER_DECK = space.md;
const MATCH_GAP_DECK_ACTIONS = space.lg;
const MATCH_GAP_ACTIONS_TAB = space.md;

export type { RoommateProfile } from '../components/RoommateProfileDetail';

const MOCK_SCHOOL_LOGOS = {
  nyu: require('../assets/img/mock/nyu_logo.png'),
} as const;

function schoolLogoFor(profile: RoommateProfile): ImageSourcePropType | null {
  if (profile.schoolLogo) return profile.schoolLogo;
  const key = profile.school.trim().toLowerCase();
  if (key === 'nyu' || key.includes('new york university')) {
    return MOCK_SCHOOL_LOGOS.nyu;
  }
  return null;
}

/** Design-only deck — all images under `assets/img/mock`. */
export const MOCK_ROOMMATE_PROFILES: RoommateProfile[] = [
  {
    id: 'maya',
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
    roomPreference: 'Master bedroom preferred',
    preferredLocation: 'East Village',
    matchPct: 94,
    tags: ['Early bird', 'Very tidy', 'Rarely hosts'],
    photos: [
      require('../assets/img/mock/IMG_6076.jpg'),
      require('../assets/img/mock/IMG_2585.png'),
    ],
  },
  {
    id: 'jordan',
    name: 'Jordan',
    age: 26,
    school: 'NYU',
    role: 'Financial analyst',
    gender: 'He / him',
    major: 'Finance',
    schoolYear: '2024',
    bio: 'Gym before work, meal prep Sundays. Prefer respectful noise levels after 10pm.',
    budget: '$2,200 / mo',
    moveIn: 'Mid Sep 2026',
    roommatePreference: 'Male roommate only',
    statusPreference: 'Working preferred',
    roomPreference: 'Regular bedroom preferred',
    preferredLocation: 'Midtown',
    matchPct: 89,
    tags: ['Night owl', 'Active', 'Moderate clean'],
    photos: [
      require('../assets/img/mock/IMG_2426.jpg'),
      require('../assets/img/mock/IMG_5033_2.png'),
    ],
  },
  {
    id: 'alex',
    name: 'Alex',
    age: 23,
    school: 'Columbia',
    role: 'CS grad student',
    gender: 'They / them',
    major: 'Computer Science',
    schoolYear: '2027',
    bio: 'Headphones on most days. Happy to split groceries and keep common areas clear.',
    budget: '$1,650 / mo',
    moveIn: 'Late Jul 2026',
    roommatePreference: 'Open to all genders',
    statusPreference: 'Open to both',
    roomPreference: 'Flexroom preferred',
    preferredLocation: 'Upper West Side',
    matchPct: 86,
    tags: ['Flexible sleep', 'Introvert', 'Quiet'],
    photos: [
      require('../assets/img/mock/IMG_3508.png'),
      require('../assets/img/mock/IMG_5033_2.png'),
    ],
  },
  {
    id: 'sam',
    name: 'Sam',
    age: 25,
    school: 'Parsons',
    role: 'Photographer',
    gender: 'She / her',
    major: 'Photography',
    schoolYear: '2025',
    bio: 'Shoots around the city — out a lot. Want a roommate who’s cool with shared creative space.',
    budget: '$1,950 / mo',
    moveIn: 'Mid Aug 2026',
    roommatePreference: 'Open to all genders',
    statusPreference: 'Open to both',
    roomPreference: 'Open to any room options.',
    preferredLocation: 'Brooklyn Heights',
    matchPct: 82,
    tags: ['Social', 'Occasional guests', 'Pet friendly'],
    photos: [
      require('../assets/img/mock/IMG_5035_2.png'),
      require('../assets/img/mock/IMG_2586.png'),
    ],
  },
  {
    id: 'riley',
    name: 'Riley',
    age: 27,
    school: 'Goldman Sachs',
    role: 'Analyst',
    gender: 'He / him',
    major: 'Economics',
    schoolYear: '2023',
    bio: 'Long hours downtown. Looking for someone low-drama who respects WFH days.',
    budget: '$2,450 / mo',
    moveIn: 'Early Oct 2026',
    roommatePreference: 'Male roommate only',
    statusPreference: 'Working preferred',
    roomPreference: 'Open to any room options.',
    preferredLocation: 'Financial District',
    matchPct: 78,
    tags: ['Early bird', 'Very tidy', 'No pets'],
    photos: [
      require('../assets/img/mock/IMG_4775.png'),
      require('../assets/img/mock/IMG_6076.jpg'),
    ],
  },
  {
    id: 'casey',
    name: 'Casey',
    age: 22,
    school: 'Pratt',
    role: 'Illustrator',
    gender: 'They / them',
    major: 'Illustration',
    schoolYear: '2026',
    bio: 'Plants everywhere, candles never. Down to explore Brooklyn or LIC listings together.',
    budget: '$1,700 / mo',
    moveIn: 'Late Sep 2026',
    roommatePreference: 'Female roommate only',
    statusPreference: 'Student preferred',
    roomPreference: 'Flexroom preferred',
    preferredLocation: 'Williamsburg',
    matchPct: 91,
    tags: ['Creative', 'Relaxed clean', 'Sometimes cooks'],
    photos: [
      require('../assets/img/mock/IMG_3508.png'),
      require('../assets/img/mock/IMG_2426.jpg'),
    ],
  },
];

const shallowShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  android: { elevation: 6 },
});

export type MatchScreenProps = {
  padH: number;
  /** Tab bar (and any chrome below this screen) — used only until deck layout is measured. */
  bottomChromeH?: number;
  onOpenProfile?: () => void;
};

export function MatchScreen({
  padH,
  bottomChromeH = 0,
  onOpenProfile,
}: MatchScreenProps) {
  const insets = useSafeAreaInsets();
  const { width: windowW, height: windowH } = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [matchModal, setMatchModal] = useState<RoommateProfile | null>(null);
  const [detailProfile, setDetailProfile] = useState<RoommateProfile | null>(null);
  const [deckAreaH, setDeckAreaH] = useState(0);

  const deck = MOCK_ROOMMATE_PROFILES;
  const exhausted = index >= deck.length;
  /** Keep first card mounted under empty state so "Browse again" does not remount. */
  const deckCardIndex = exhausted ? 0 : index;
  const current = deck[deckCardIndex];

  const onDeckAreaLayout = useCallback((e: LayoutChangeEvent) => {
    const h = Math.round(e.nativeEvent.layout.height);
    if (h <= 0) return;
    setDeckAreaH((prev) => (prev === h ? prev : h));
  }, []);

  const headerBlockH = appTopBarBlockHeight(insets.top, MATCH_GAP_HEADER_DECK);
  const actionDockH =
    MATCH_GAP_DECK_ACTIONS +
    ACTION_DOCK_BUTTON_H +
    MATCH_GAP_ACTIONS_TAB;
  const { cardW, cardH, photoH, deckFrameH } = useMemo(() => {
    const width = windowW - padH * 2;
    const estimatedPhotoH = Math.max(
      280,
      windowH - headerBlockH - actionDockH - bottomChromeH,
    );
    const photoHeight = deckAreaH > 0 ? deckAreaH : estimatedPhotoH;

    return {
      cardW: width,
      cardH: photoHeight,
      photoH: photoHeight,
      deckFrameH: photoHeight,
    };
  }, [
    windowW,
    padH,
    windowH,
    headerBlockH,
    actionDockH,
    bottomChromeH,
    deckAreaH,
  ]);

  const onPass = useCallback(() => {
    if (!current || exhausted) return;
    setIndex((i) => i + 1);
  }, [current, exhausted]);

  const showSayHiCelebration = useCallback((profile: RoommateProfile) => {
    if (profile.matchPct >= 85) {
      setMatchModal(profile);
    }
  }, []);

  const onLike = useCallback(() => {
    if (!current || exhausted) return;
    showSayHiCelebration(current);
    // Stay on the same profile — only "Keep browsing" advances the deck.
  }, [current, exhausted, showSayHiCelebration]);

  const openDetail = useCallback((profile: RoommateProfile) => {
    setDetailProfile(profile);
  }, []);

  const onSayHiFromDetail = useCallback(() => {
    if (!detailProfile) return;
    showSayHiCelebration(detailProfile);
  }, [detailProfile, showSayHiCelebration]);

  const closeDetail = useCallback(() => {
    setMatchModal(null);
    setDetailProfile(null);
  }, []);

  const celebrationOnDetail =
    detailProfile && matchModal?.id === detailProfile.id ? matchModal : null;
  const celebrationOnDeck = !detailProfile ? matchModal : null;

  return (
    <View style={styles.root}>
      <StatusBar style='dark' />

      <AppTopBar
        insetTop={insets.top}
        padH={padH}
        paddingBottom={MATCH_GAP_HEADER_DECK}
        actions={
          <>
            <Pressable
              accessibilityRole='button'
              accessibilityLabel='Search and filters'
              style={({ pressed }) => [
                appTopBarStyles.iconButton,
                styles.headerFilterBtn,
                pressed && styles.headerBtnPressed,
              ]}
            >
              <Ionicons name='search-outline' size={22} color={ink} />
            </Pressable>
            <Pressable
              accessibilityRole='button'
              accessibilityLabel='Profile'
              onPress={onOpenProfile}
              style={({ pressed }) => [
                appTopBarStyles.iconButton,
                styles.headerProfileBtn,
                pressed && styles.headerBtnPressed,
              ]}
            >
              <Ionicons name='person' size={22} color={white} />
            </Pressable>
          </>
        }
      />

      <View style={styles.body}>
        <View
          style={[styles.deckArea, { paddingHorizontal: padH }]}
          onLayout={onDeckAreaLayout}
        >
          <View style={[styles.deckFrame, { height: deckFrameH }]}>
            {current ? (
              <View
                style={[
                  styles.cardShell,
                  styles.cardFront,
                  exhausted && styles.deckCardHidden,
                  { width: cardW, height: cardH },
                ]}
                pointerEvents={exhausted ? 'none' : 'auto'}
              >
                <ProfileCard
                  profile={current}
                  width={cardW}
                  photoH={photoH}
                  onOpenDetail={() => openDetail(current)}
                />
              </View>
            ) : null}
            {exhausted ? (
              <View style={styles.emptyOverlay} pointerEvents='box-none'>
                <EmptyDeck
                  cardW={cardW}
                  cardH={cardH}
                  profilesReviewed={deck.length}
                  onReset={() => setIndex(0)}
                />
              </View>
            ) : null}
          </View>
        </View>

        {exhausted ? (
          <View style={[styles.actionDockSpacer, { height: actionDockH }]} />
        ) : (
          <View style={[styles.actionDock, { paddingHorizontal: padH }]}>
            <Pressable
              accessibilityRole='button'
              accessibilityLabel='Skip this roommate'
              onPress={onPass}
              style={({ pressed }) => [
                styles.deckActionGhost,
                pressed && styles.deckActionPressed,
              ]}
            >
              <Ionicons name='arrow-forward' size={20} color={muted} />
              <Text style={styles.deckActionGhostText}>Keep browsing</Text>
            </Pressable>
            <Pressable
              accessibilityRole='button'
              accessibilityLabel='Connect with roommate'
              onPress={onLike}
              style={({ pressed }) => [
                styles.deckActionPrimaryShell,
                pressed && styles.deckActionPressed,
              ]}
            >
              <LinearGradient
                colors={gradientPrimaryHorizontal}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.deckActionPrimary}
              >
                <Ionicons name='chatbubbles' size={20} color={white} />
                <Text style={styles.deckActionPrimaryText}>Say hi</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </View>

      <ProfileDetailSheet
        profile={detailProfile}
        padH={padH}
        onClose={closeDetail}
        onSayHi={detailProfile ? onSayHiFromDetail : undefined}
        celebrationProfile={celebrationOnDetail}
        onCelebrationClose={() => setMatchModal(null)}
      />

      <MatchCelebrationModal
        profile={celebrationOnDeck}
        onClose={() => setMatchModal(null)}
      />
    </View>
  );
}

function ProfileCard({
  profile,
  width,
  photoH,
  compact,
  onOpenDetail,
}: {
  profile: RoommateProfile;
  width: number;
  photoH: number;
  compact?: boolean;
  onOpenDetail?: () => void;
}) {
  const [photoPage, setPhotoPage] = useState(0);
  const galleryRef = useRef<ScrollView>(null);
  const schoolLogo = schoolLogoFor(profile);
  const profilePhoto = profile.photos[0];

  const cardH = photoH + (compact ? CARD_FOOT_COMPACT_H : 0);

  const onPhotoScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const page = Math.round(x / width);
    if (page >= 0 && page < profile.photos.length) {
      setPhotoPage(page);
    }
  };

  useEffect(() => {
    setPhotoPage(0);
    galleryRef.current?.scrollTo({ x: 0, animated: false });
  }, [profile.id]);

  const photoIndexPill =
    !compact && profile.photos.length > 1 ? (
      onOpenDetail ? (
        <Pressable
          accessibilityRole='button'
          accessibilityLabel={`Photo ${photoPage + 1} of ${profile.photos.length}`}
          onPress={onOpenDetail}
          style={({ pressed }) => [
            styles.photoCountPill,
            pressed && styles.photoCountPillPressed,
          ]}
        >
          <Ionicons name='images-outline' size={14} color={white} />
          <Text style={styles.photoCountText}>
            {photoPage + 1}/{profile.photos.length}
          </Text>
        </Pressable>
      ) : (
        <View style={styles.photoCountPill} pointerEvents='none'>
          <Ionicons name='images-outline' size={14} color={white} />
          <Text style={styles.photoCountText}>
            {photoPage + 1}/{profile.photos.length}
          </Text>
        </View>
      )
    ) : null;

  return (
    <View
      style={[
        styles.card,
        compact ? styles.cardCompact : styles.cardPhotoOnly,
        { width, height: cardH },
      ]}
    >
      <View style={[styles.photoFrame, { width, height: photoH }]}>
        <View style={styles.photoClip}>
          <ScrollView
            ref={galleryRef}
            horizontal
            pagingEnabled
            bounces={profile.photos.length > 1}
            scrollEnabled={profile.photos.length > 1}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={onPhotoScroll}
            onMomentumScrollEnd={onPhotoScroll}
            style={styles.photoGallery}
          >
            {profile.photos.map((src, i) => (
              <View
                key={`${profile.id}-card-photo-${i}`}
                style={[styles.photoSlide, { width, height: photoH }]}
              >
                <Image source={src} resizeMode='cover' style={styles.photoImage} />
              </View>
            ))}
          </ScrollView>
        </View>
        <View style={styles.photoOverlays} pointerEvents='box-none'>
          <LinearGradient
            colors={['rgba(15,23,42,0)', 'rgba(15,23,42,0.35)', 'rgba(15,23,42,0.92)']}
            locations={[0.32, 0.58, 1]}
            style={styles.photoGradient}
            pointerEvents='none'
          />
          {!compact && profile.photos.length > 1 ? (
            <View style={styles.photoIndexChrome} pointerEvents='box-none'>
              {photoIndexPill}
            </View>
          ) : null}
          {!compact ? (
            <View style={styles.photoOverlayBottom} pointerEvents='box-none'>
              <View style={styles.photoOverlayIdentity} pointerEvents='none'>
                <View style={styles.photoIdentityAvatarWrap}>
                  <View style={styles.photoIdentityAvatar}>
                    <Image
                      source={profilePhoto}
                      resizeMode='cover'
                      style={styles.photoIdentityAvatarImage}
                    />
                  </View>
                  {schoolLogo ? (
                    <View style={styles.photoSchoolBadge}>
                      <Image
                        source={schoolLogo}
                        resizeMode='cover'
                        style={styles.photoSchoolBadgeImage}
                      />
                    </View>
                  ) : null}
                </View>
                <View style={styles.photoOverlayTextCol}>
                  <View style={styles.photoNameRow}>
                    <Text style={styles.photoName} numberOfLines={1}>
                      {profile.name}
                    </Text>
                    <View style={styles.photoVerifiedMark}>
                      <Ionicons name='checkmark' size={12} color={white} />
                    </View>
                  </View>
                  <View style={styles.photoMatchCallout}>
                    <Ionicons name='sparkles' size={13} color={white} />
                    <Text style={styles.photoMatchCalloutText} numberOfLines={1}>
                      You&apos;re a {profile.matchPct}% Match!
                    </Text>
                  </View>
                </View>
              </View>
              <Text
                style={styles.photoBioOnImage}
                numberOfLines={2}
                ellipsizeMode='tail'
              >
                {profile.bio}
              </Text>
              <View style={styles.photoOverlayMetaRow} pointerEvents='box-none'>
                <Text style={styles.photoOverlayMetaText} numberOfLines={1}>
                  {profile.budget} · {profile.moveIn}
                </Text>
                {onOpenDetail ? (
                  <Pressable
                    accessibilityRole='button'
                    accessibilityLabel={`Read full profile for ${profile.name}`}
                    onPress={onOpenDetail}
                    style={({ pressed }) => [
                      styles.photoOverlayProfileLink,
                      pressed && styles.photoOverlayProfileLinkPressed,
                    ]}
                  >
                    <Text style={styles.photoOverlayProfileLinkText}>Full profile</Text>
                    <Ionicons name='chevron-forward' size={14} color={white} />
                  </Pressable>
                ) : null}
              </View>
            </View>
          ) : null}
        </View>
      </View>

      {compact ? (
        <View style={[styles.cardFoot, styles.cardFootCompact]}>
          <Text style={styles.cardNameCompact} numberOfLines={1}>
            {profile.name}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function EmptyDeck({
  cardW,
  cardH,
  profilesReviewed,
  onReset,
}: {
  cardW: number;
  cardH: number;
  profilesReviewed: number;
  onReset: () => void;
}) {
  return (
    <View style={[styles.emptyCard, { width: cardW, height: cardH }]}>
      <LinearGradient
        colors={['#E8EFFF', '#F3F7FF', '#FFFFFF']}
        locations={[0, 0.42, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.emptyInner}>
        <View style={styles.emptyIconMark}>
          <Ionicons name='sparkles' size={32} color={colors.primary} />
        </View>

        <Text style={styles.emptyKicker}>All caught up</Text>
        <Text style={styles.emptyTitle}>You&apos;ve seen{'\n'}everyone nearby</Text>
        <Text style={styles.emptyCopy}>
          New roommate profiles land here as people join Ellieo in your area.
        </Text>

        <View style={styles.emptyStats}>
          <View style={styles.emptyStatChip}>
            <Text style={styles.emptyStatValue}>{profilesReviewed}</Text>
            <Text style={styles.emptyStatLabel}>Reviewed</Text>
          </View>
          <View style={styles.emptyStatDivider} />
          <View style={styles.emptyStatChip}>
            <Text style={styles.emptyStatValue}>0</Text>
            <Text style={styles.emptyStatLabel}>Remaining</Text>
          </View>
          <View style={styles.emptyStatDivider} />
          <View style={styles.emptyStatChip}>
            <Ionicons name='location' size={14} color={colors.primary} />
            <Text style={styles.emptyStatLabel}>Your area</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Review profiles again'
          onPress={onReset}
          style={({ pressed }) => [
            styles.emptyBtnShell,
            pressed && styles.emptyBtnPressed,
          ]}
        >
          <LinearGradient
            colors={gradientPrimaryHorizontal}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.emptyBtn}
          >
            <View style={styles.emptyBtnIcon}>
              <Ionicons name='refresh' size={18} color={white} />
            </View>
            <Text style={styles.emptyBtnText}>Browse again</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: white,
  },
  headerFilterBtn: {
    backgroundColor: '#FFFFFF',
    ...shallowShadow,
  },
  headerProfileBtn: {
    backgroundColor: colors.primary,
    ...shallowShadow,
  },
  headerBtnPressed: {
    opacity: 0.88,
  },
  body: {
    flex: 1,
    minHeight: 0,
    backgroundColor: white,
  },
  deckArea: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: white,
  },
  deckFrame: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  deckCardHidden: {
    opacity: 0,
  },
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  actionDockSpacer: {
    backgroundColor: white,
  },
  cardShell: {
    position: 'relative',
    borderRadius: radius.xl,
    ...shallowShadow,
  },
  cardFront: {
    zIndex: 2,
  },
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(31,41,55,0.1)',
  },
  cardPhotoOnly: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  cardCompact: {
    backgroundColor: white,
  },
  photoFrame: {
    width: '100%',
    backgroundColor: '#F4F6FA',
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  photoClip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  photoOverlays: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  photoGallery: {
    flex: 1,
  },
  photoSlide: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F6FA',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  photoIndexChrome: {
    position: 'absolute',
    top: space.md,
    left: space.md,
    zIndex: 11,
  },
  photoCountPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: PHOTO_META_PILL_MIN_H,
    paddingVertical: 5,
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(15,23,42,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.28,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  photoCountText: {
    fontSize: type.micro,
    fontWeight: '800',
    color: white,
    letterSpacing: 0.1,
  },
  photoCountPillPressed: {
    opacity: 0.88,
  },
  photoOverlayBottom: {
    position: 'absolute',
    left: space.md,
    right: space.md,
    bottom: space.md,
    gap: space.sm,
    zIndex: 2,
  },
  photoOverlayIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.sm,
  },
  photoOverlayTextCol: {
    flex: 1,
    minWidth: 0,
    gap: space.xs,
  },
  photoMatchCallout: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    maxWidth: '100%',
  },
  photoMatchCalloutText: {
    flexShrink: 1,
    fontSize: type.micro,
    lineHeight: 14,
    fontWeight: '700',
    color: white,
    letterSpacing: -0.05,
  },
  photoBioOnImage: {
    fontSize: type.caption,
    lineHeight: 18,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: -0.1,
    paddingHorizontal: space.sm,
    marginBottom: -space.sm,
  },
  photoNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    maxWidth: '100%',
  },
  photoVerifiedMark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    flexShrink: 0,
  },
  photoOverlayMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
    paddingHorizontal: space.sm,
    marginTop: -space.xs,
  },
  photoOverlayMetaText: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    fontSize: type.caption,
    lineHeight: 18,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: -0.08,
    textAlign: 'left',
  },
  photoOverlayProfileLink: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 2,
    minHeight: 44,
    paddingLeft: space.sm,
  },
  photoOverlayProfileLinkPressed: {
    opacity: 0.75,
  },
  photoOverlayProfileLinkText: {
    fontSize: type.caption,
    fontWeight: '800',
    color: white,
    letterSpacing: -0.08,
  },
  photoIdentityAvatarWrap: {
    width: 44,
    height: 44,
    position: 'relative',
  },
  photoIdentityAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  photoIdentityAvatarImage: {
    width: '100%',
    height: '100%',
  },
  photoSchoolBadge: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: white,
  },
  photoSchoolBadgeImage: {
    width: '100%',
    height: '100%',
  },
  photoName: {
    flexShrink: 1,
    fontSize: type.title + 2,
    lineHeight: 26,
    fontWeight: '800',
    color: white,
    letterSpacing: -0.4,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardFoot: {
    paddingHorizontal: space.md,
  },
  cardFootCompact: {
    height: CARD_FOOT_COMPACT_H,
    paddingTop: space.sm,
    paddingBottom: space.sm,
    justifyContent: 'center',
  },
  cardNameCompact: {
    fontSize: type.body,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.2,
  },
  actionDock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingTop: MATCH_GAP_DECK_ACTIONS,
    paddingBottom: MATCH_GAP_ACTIONS_TAB,
    backgroundColor: white,
  },
  deckActionGhost: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    backgroundColor: white,
    borderWidth: 1,
    borderColor: 'rgba(31,41,55,0.1)',
    ...shallowShadow,
  },
  deckActionGhostText: {
    fontSize: type.body,
    fontWeight: '700',
    color: muted,
    letterSpacing: -0.15,
  },
  deckActionPrimaryShell: {
    flex: 1.15,
    borderRadius: radius.pill,
    ...shallowShadow,
  },
  deckActionPrimary: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  deckActionPrimaryText: {
    fontSize: type.bodyLarge,
    fontWeight: '800',
    color: white,
    letterSpacing: -0.2,
  },
  deckActionPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  emptyCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: white,
    borderWidth: 1,
    borderColor: 'rgba(47,109,246,0.12)',
    ...Platform.select({
      ios: {
        shadowColor: '#2F6DF6',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.12,
        shadowRadius: 32,
      },
      android: { elevation: 10 },
    }),
  },
  emptyInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
    paddingVertical: space.xxl,
    gap: space.sm,
  },
  emptyIconMark: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(47,109,246,0.14)',
    marginBottom: space.sm,
  },
  emptyKicker: {
    fontSize: type.micro,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: type.display + 4,
    lineHeight: 34,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.7,
    textAlign: 'center',
  },
  emptyCopy: {
    fontSize: type.body,
    lineHeight: 22,
    fontWeight: '500',
    color: muted,
    textAlign: 'center',
    letterSpacing: -0.12,
    maxWidth: 280,
    marginBottom: space.xs,
  },
  emptyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(47,109,246,0.1)',
    marginTop: space.xs,
    marginBottom: space.sm,
  },
  emptyStatChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  emptyStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(47,109,246,0.12)',
  },
  emptyStatValue: {
    fontSize: type.title,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.35,
  },
  emptyStatLabel: {
    fontSize: type.micro,
    fontWeight: '600',
    color: muted,
    letterSpacing: -0.02,
  },
  emptyBtnShell: {
    width: '100%',
    maxWidth: 280,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: space.xs,
    ...shallowShadow,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingVertical: space.md + 2,
    paddingHorizontal: space.xl,
    minHeight: 52,
  },
  emptyBtnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  emptyBtnIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  emptyBtnText: {
    fontSize: type.bodyLarge,
    fontWeight: '800',
    color: white,
    letterSpacing: -0.2,
  },
});
