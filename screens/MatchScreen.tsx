import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AppTopBar,
  appTopBarBlockHeight,
  appTopBarStyles,
} from '../components/AppTopBar';
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
    roomPreference: 'Master preferred',
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
    roomPreference: 'Regular preferred',
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
    roomPreference: 'Flex preferred',
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
    roomPreference: 'Open to any options',
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
    roomPreference: 'Open to any options',
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
    roomPreference: 'Flex preferred',
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

function matchHintFor(pct: number): string {
  if (pct >= 92) return 'Exceptional lifestyle & timing fit';
  if (pct >= 85) return 'Lifestyle & move-in preferences align';
  if (pct >= 78) return 'Strong overlap on budget & habits';
  return 'Worth a conversation — explore the fit';
}

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
  const current = deck[index];
  const exhausted = index >= deck.length;

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

  const onLike = useCallback(() => {
    if (!current || exhausted) return;
    if (current.matchPct >= 85) {
      setMatchModal(current);
    }
    // Stay on the same profile — only "Keep browsing" advances the deck.
  }, [current, exhausted]);

  const openDetail = useCallback((profile: RoommateProfile) => {
    setDetailProfile(profile);
  }, []);

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
          onLayout={(e) => {
            const h = Math.round(e.nativeEvent.layout.height);
            if (h > 0) setDeckAreaH(h);
          }}
        >
          {exhausted ? (
            <EmptyDeck cardW={cardW} cardH={cardH} onReset={() => setIndex(0)} />
          ) : (
            <View style={[styles.deckFrame, { height: deckFrameH }]}>
              {current ? (
                <View
                  style={[
                    styles.cardShell,
                    styles.cardFront,
                    { width: cardW, height: cardH },
                  ]}
                >
                  <ProfileCard
                    profile={current}
                    width={cardW}
                    photoH={photoH}
                    onOpenDetail={() => openDetail(current)}
                  />
                </View>
              ) : null}
            </View>
          )}
        </View>

        {!exhausted ? (
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
        ) : null}
      </View>

      <ProfileDetailSheet
        profile={detailProfile}
        padH={padH}
        onClose={() => setDetailProfile(null)}
      />

      <MatchCelebrationModal
        profile={matchModal}
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
  onReset,
}: {
  cardW: number;
  cardH: number;
  onReset: () => void;
}) {
  return (
    <View style={[styles.emptyCard, { width: cardW, height: cardH }]}>
      <View style={styles.emptyIconOrb}>
        <Ionicons name='people' size={36} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>You&apos;re all caught up</Text>
      <Text style={styles.emptyCopy}>
        Check back later for new roommate profiles in your area.
      </Text>
      <Pressable
        accessibilityRole='button'
        accessibilityLabel='Review profiles again'
        onPress={onReset}
        style={({ pressed }) => [
          styles.emptyBtn,
          pressed && styles.emptyBtnPressed,
        ]}
      >
        <Text style={styles.emptyBtnText}>Start over</Text>
      </Pressable>
    </View>
  );
}

function MatchCelebrationModal({
  profile,
  onClose,
}: {
  profile: RoommateProfile | null;
  onClose: () => void;
}) {
  const visible = profile !== null;
  const insets = useSafeAreaInsets();
  const { height: windowH } = useWindowDimensions();

  const sheetTravel = useMemo(
    () => Math.min(380, Math.round(windowH * 0.42)),
    [windowH],
  );
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(sheetTravel)).current;

  const dismissAnimated = useCallback(
    (after?: () => void) => {
      backdropOpacity.stopAnimation();
      sheetTranslateY.stopAnimation();
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: sheetTravel,
          duration: 260,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished && after) after();
      });
    },
    [backdropOpacity, sheetTranslateY, sheetTravel],
  );

  const runClose = useCallback(() => {
    if (!profile) return;
    dismissAnimated(onClose);
  }, [dismissAnimated, onClose, profile]);

  useEffect(() => {
    if (!profile) return;
    backdropOpacity.stopAnimation();
    sheetTranslateY.stopAnimation();
    sheetTranslateY.setValue(sheetTravel);
    backdropOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        stiffness: 300,
        damping: 34,
        mass: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [profile?.id, backdropOpacity, sheetTranslateY, sheetTravel]);

  return (
    <Modal
      animationType='none'
      transparent
      visible={visible}
      onRequestClose={runClose}
    >
      <View style={styles.matchModalRoot}>
        <Animated.View
          pointerEvents='box-none'
          style={[StyleSheet.absoluteFillObject, { opacity: backdropOpacity }]}
        >
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Dismiss match'
            style={StyleSheet.absoluteFill}
            onPress={runClose}
          >
            <BlurView intensity={48} tint='dark' style={StyleSheet.absoluteFill} />
            <View style={styles.matchModalDim} />
          </Pressable>
        </Animated.View>

        <View style={styles.matchSheetStage} pointerEvents='box-none'>
          {profile ? (
            <Animated.View
              accessibilityViewIsModal
              style={[
                styles.matchSheet,
                {
                  paddingBottom: Math.max(insets.bottom, space.md) + space.sm,
                  transform: [{ translateY: sheetTranslateY }],
                },
              ]}
            >
              <LinearGradient
                colors={['#E3EBFF', '#F5F8FF', '#FFFFFF']}
                locations={[0, 0.45, 1]}
                style={styles.matchSheetGlow}
                pointerEvents='none'
              />

              <View style={styles.matchSheetBody}>
                <View
                  style={styles.matchCompatPill}
                  accessibilityLabel={`${profile.matchPct} percent compatible`}
                >
                  <Text style={styles.matchCompatPct}>{profile.matchPct}%</Text>
                  <Text style={styles.matchCompatLabel}> compatible</Text>
                </View>

                <Text style={styles.matchSheetTitle}>
                  You & {profile.name}
                </Text>
                <Text style={styles.matchSheetHint} numberOfLines={2}>
                  {matchHintFor(profile.matchPct)}
                </Text>

                <View style={styles.matchSheetMetaRow}>
                  <View style={styles.matchSheetMetaChip}>
                    <Ionicons name='briefcase-outline' size={14} color={colors.primary} />
                    <Text style={styles.matchSheetMetaText} numberOfLines={1}>
                      {profile.role}
                    </Text>
                  </View>
                  <View style={styles.matchSheetMetaChip}>
                    <Ionicons name='calendar-outline' size={14} color={colors.primary} />
                    <Text style={styles.matchSheetMetaText} numberOfLines={1}>
                      {profile.moveIn}
                    </Text>
                  </View>
                </View>

                <Pressable
                  accessibilityRole='button'
                  accessibilityLabel={`Say hi to ${profile.name}`}
                  onPress={runClose}
                  style={({ pressed }) => [
                    styles.matchModalPrimary,
                    pressed && styles.matchModalPrimaryPressed,
                  ]}
                >
                  <LinearGradient
                    colors={gradientPrimaryHorizontal}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.matchModalPrimaryGradient}
                  >
                    <View style={styles.matchModalPrimaryIcon}>
                      <Ionicons name='chatbubble' size={20} color={white} />
                    </View>
                    <Text style={styles.matchModalPrimaryText}>
                      Say hi to {profile.name}
                    </Text>
                  </LinearGradient>
                </Pressable>

                <Pressable
                  accessibilityRole='button'
                  accessibilityLabel='Keep browsing'
                  onPress={runClose}
                  style={({ pressed }) => [
                    styles.matchModalGhost,
                    pressed && styles.matchModalGhostPressed,
                  ]}
                >
                  <Text style={styles.matchModalGhostText}>Keep browsing</Text>
                </Pressable>
              </View>
            </Animated.View>
          ) : null}
        </View>
      </View>
    </Modal>
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
    backgroundColor: white,
    borderWidth: 1,
    borderColor: 'rgba(31,41,55,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xxl,
    gap: space.md,
    ...shallowShadow,
  },
  emptyIconOrb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(47,109,246,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: type.title,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.35,
    textAlign: 'center',
  },
  emptyCopy: {
    fontSize: type.body,
    lineHeight: 22,
    fontWeight: '500',
    color: muted,
    textAlign: 'center',
    letterSpacing: -0.12,
  },
  emptyBtn: {
    marginTop: space.sm,
    paddingVertical: space.md,
    paddingHorizontal: space.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  emptyBtnPressed: {
    opacity: 0.9,
  },
  emptyBtnText: {
    fontSize: type.body,
    fontWeight: '800',
    color: white,
    letterSpacing: -0.15,
  },
  matchModalRoot: {
    flex: 1,
  },
  matchModalDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
  },
  matchSheetStage: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  matchSheet: {
    width: '100%',
    maxHeight: '82%',
    overflow: 'hidden',
    backgroundColor: white,
    borderTopLeftRadius: radius.xl + 4,
    borderTopRightRadius: radius.xl + 4,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.8)',
    ...Platform.select({
      ios: {
        shadowColor: '#1E3A5F',
        shadowOffset: { width: 0, height: -12 },
        shadowOpacity: 0.2,
        shadowRadius: 36,
      },
      android: { elevation: 32 },
    }),
  },
  matchSheetGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 160,
  },
  matchCompatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: white,
    borderWidth: 1,
    borderColor: 'rgba(47,109,246,0.16)',
    ...shallowShadow,
  },
  matchCompatPct: {
    fontSize: type.body,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.2,
  },
  matchCompatLabel: {
    fontSize: type.caption,
    fontWeight: '600',
    color: muted,
    letterSpacing: -0.05,
  },
  matchSheetBody: {
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
    alignItems: 'center',
    gap: space.sm,
    paddingBottom: space.xs,
    zIndex: 1,
  },
  matchSheetTitle: {
    fontSize: type.display + 2,
    lineHeight: 34,
    fontWeight: '800',
    color: ink,
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  matchSheetHint: {
    fontSize: type.body,
    lineHeight: 22,
    fontWeight: '500',
    color: muted,
    textAlign: 'center',
    letterSpacing: -0.12,
    maxWidth: 300,
    marginBottom: space.xs,
  },
  matchSheetMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.sm,
    marginBottom: space.md,
    width: '100%',
  },
  matchSheetMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '48%',
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: '#F4F7FD',
    borderWidth: 1,
    borderColor: 'rgba(47,109,246,0.1)',
  },
  matchSheetMetaText: {
    flexShrink: 1,
    fontSize: type.caption,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.08,
  },
  matchModalPrimary: {
    width: '100%',
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: space.xs,
    ...shallowShadow,
  },
  matchModalPrimaryPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  matchModalPrimaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingVertical: space.md + 2,
    paddingHorizontal: space.lg,
    minHeight: 56,
  },
  matchModalPrimaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  matchModalPrimaryText: {
    fontSize: type.bodyLarge,
    fontWeight: '800',
    color: white,
    letterSpacing: -0.25,
  },
  matchModalGhost: {
    width: '100%',
    minHeight: 48,
    marginTop: space.xs,
    paddingVertical: space.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: '#F4F7FD',
    borderWidth: 1,
    borderColor: 'rgba(47,109,246,0.12)',
  },
  matchModalGhostPressed: {
    opacity: 0.85,
    backgroundColor: '#EAF0FC',
  },
  matchModalGhostText: {
    fontSize: type.body,
    fontWeight: '700',
    color: muted,
    letterSpacing: -0.15,
  },
});
