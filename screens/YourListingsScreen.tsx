import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OnboardingNavHeader } from '../components/OnboardingNavHeader';
import {
  captionMuted,
  fieldBorder,
  fieldFill,
} from './createListing/createListingTokens';
import { useOnboardingCtaLayout } from '../design/onboardingCtaLayout';
import { colors, gradientPrimaryHorizontal, radius, space, type } from '../design/theme';

const ink = '#1C1C1E';
const muted = '#687084';
const pageBg = '#F5F7FF';
const softInk = '#354052';
const cardBorder = 'rgba(31,41,55,0.08)';
const white = '#FFFFFF';
const expiryAccent = colors.coralDeep;

/** Max linked roommates shown in portfolio / roommate sheet (design shell). */
const MAX_ROOMMATES_PER_LISTING = 5;

type ListingStatus = 'Live' | 'Draft' | 'Attention';
type RoommateProfile = {
  id: string;
  name: string;
  image: ImageSourcePropType;
};

type Listing = {
  id: string;
  title: string;
  unit: string;
  layout: string;
  entireUnitPrice: string;
  roomPrices: {
    label: string;
    price: string;
  }[];
  status: ListingStatus;
  views: string;
  leads: number;
  saved: number;
  roommates: RoommateProfile[];
  image: ImageSourcePropType;
};

const SUGGESTED_ROOMMATE = {
  name: 'Simon',
  matchCode: '#234240924',
  headline: 'Founder at Ellieo',
  detail: 'Student @ New York University',
  image: require('../assets/img/agent_onboarding.png'),
};

const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'west48',
    title: 'W 48th St & 8th Ave',
    unit: '#12J',
    layout: '2 Beds 2 Baths',
    entireUnitPrice: '$7,400',
    roomPrices: [
      { label: 'Master w/ Bath', price: '$2,600' },
      { label: 'Regular', price: '$2,450' },
      { label: 'Flex', price: '$2,350' },
    ],
    status: 'Live',
    views: '1.8K',
    leads: 22,
    saved: 103,
    roommates: [
      {
        id: 'maya',
        name: 'Maya',
        image: require('../assets/img/user_banner.png'),
      },
      {
        id: 'jules',
        name: 'Jules',
        image: require('../assets/img/personal_onboarding.png'),
      },
    ],
    image: require('../assets/img/agent_banner.png'),
  },
  {
    id: 'bowery',
    title: 'E 1st St & Bowery',
    unit: '#3012',
    layout: '2 Beds 2 Baths',
    entireUnitPrice: '$5,000',
    roomPrices: [
      { label: 'Regular', price: '$2,600' },
      { label: 'Flex', price: '$2,400' },
    ],
    status: 'Live',
    views: '1.2K',
    leads: 18,
    saved: 84,
    roommates: [
      {
        id: 'nora',
        name: 'Nora',
        image: require('../assets/img/agent_onboarding.png'),
      },
    ],
    image: require('../assets/img/banner1.png'),
  },
  {
    id: 'chelsea',
    title: 'Chelsea Studio Share',
    unit: '#8C',
    layout: '2 Beds 2 Baths',
    entireUnitPrice: '$5,200',
    roomPrices: [
      { label: 'Master w/ Bath', price: '$2,750' },
      { label: 'Regular', price: '$2,450' },
    ],
    status: 'Attention',
    views: '394',
    leads: 4,
    saved: 19,
    roommates: [],
    image: require('../assets/img/user_banner.png'),
  },
  {
    id: 'lic',
    title: 'LIC Skyline Room',
    unit: '#PH4',
    layout: '2 Beds 2 Baths',
    entireUnitPrice: '$4,300',
    roomPrices: [
      { label: 'Regular', price: '$2,150' },
      { label: 'Flex', price: '$1,950' },
    ],
    status: 'Draft',
    views: '-',
    leads: 0,
    saved: 0,
    roommates: [],
    image: require('../assets/img/personal_onboarding.png'),
  },
  {
    id: 'midtown-studio',
    title: 'W 34th St & 7th Ave',
    unit: '#9D',
    layout: 'Studio · 0 Bed 1 Bath',
    entireUnitPrice: '$4,600',
    roomPrices: [{ label: 'Studio', price: '$4,600' }],
    status: 'Live',
    views: '612',
    leads: 9,
    saved: 31,
    roommates: [],
    image: require('../assets/img/banner1.png'),
  },
];

export type YourListingsScreenProps = {
  onBack?: () => void;
  onCreateListing?: () => void;
  onEditListing?: (listingId: string) => void;
  onDeleteListing?: (listingId: string) => void;
  onBoostListing?: (listingId: string) => void;
};

export function YourListingsScreen({
  onBack,
  onCreateListing,
  onEditListing,
  onDeleteListing,
  onBoostListing,
}: YourListingsScreenProps) {
  const insets = useSafeAreaInsets();
  const { padH, primaryButtonWidth } = useOnboardingCtaLayout();
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [roommateListing, setRoommateListing] = useState<Listing | null>(null);
  const [roommateQuery, setRoommateQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);
  const [boostTarget, setBoostTarget] = useState<Listing | null>(null);
  const [boostedListingIds, setBoostedListingIds] = useState<Record<string, true>>({});

  const closeRoommateSheet = () => {
    setRoommateListing(null);
    setRoommateQuery('');
  };

  const openDeleteModal = (listing: Listing) => {
    setDeleteTarget(listing);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
  };

  const openBoostModal = (listing: Listing) => {
    if (boostedListingIds[listing.id]) return;
    setBoostTarget(listing);
  };

  const closeBoostModal = () => {
    setBoostTarget(null);
  };

  const confirmDeleteFinal = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setListings((prev) => prev.filter((l) => l.id !== id));
    setBoostedListingIds((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    onDeleteListing?.(id);
    closeDeleteModal();
  };

  const confirmBoostFinal = () => {
    if (!boostTarget) return;
    const id = boostTarget.id;
    setBoostedListingIds((prev) => ({ ...prev, [id]: true }));
    onBoostListing?.(id);
    closeBoostModal();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style='dark' />

      <OnboardingNavHeader padH={padH} onBack={onBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: space.md,
            paddingHorizontal: padH,
            paddingBottom: insets.bottom + 140,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionKicker}>Portfolio</Text>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Your listings</Text>
            <Text style={styles.sectionMeta}>{listings.length} listings</Text>
          </View>
        </View>

        <View style={styles.listStack}>
          {listings.map((listing, index) => (
            <ListingRow
              key={listing.id}
              isBoosted={Boolean(boostedListingIds[listing.id])}
              isLast={index === listings.length - 1}
              listing={listing}
              onOpenRoommates={() => setRoommateListing(listing)}
              onPressBoost={() => openBoostModal(listing)}
              onPressDelete={() => openDeleteModal(listing)}
              onPressEdit={
                onEditListing ? () => onEditListing(listing.id) : undefined
              }
            />
          ))}
        </View>
      </ScrollView>

      <View
        pointerEvents='box-none'
        style={[
          styles.bottomCtaWrap,
          { paddingBottom: insets.bottom + space.md },
        ]}
      >
        <LinearGradient
          colors={['rgba(245,247,255,0)', 'rgba(245,247,255,0.98)']}
          style={styles.bottomCtaFade}
        />
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Create a new listing'
          onPress={onCreateListing}
          style={({ pressed }) => [
            styles.createButtonShell,
            { width: primaryButtonWidth },
            pressed && styles.createButtonPressed,
          ]}
        >
          <LinearGradient
            colors={gradientPrimaryHorizontal}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.createButton}
          >
            <Ionicons name='add' size={22} color='#FFFFFF' />
            <Text style={styles.createButtonText}>Create a new listing</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <RoommateSheet
        listing={roommateListing}
        onChangeQuery={setRoommateQuery}
        onClose={closeRoommateSheet}
        query={roommateQuery}
      />

      <BoostListingModal
        listing={boostTarget}
        onClose={closeBoostModal}
        onConfirmFinal={confirmBoostFinal}
      />

      <DeleteListingModal
        listing={deleteTarget}
        onClose={closeDeleteModal}
        onConfirmFinal={confirmDeleteFinal}
      />
    </View>
  );
}

function ListingRow({
  listing,
  isBoosted,
  isLast,
  onOpenRoommates,
  onPressBoost,
  onPressDelete,
  onPressEdit,
}: {
  listing: Listing;
  isBoosted?: boolean;
  isLast?: boolean;
  onOpenRoommates: () => void;
  onPressBoost?: () => void;
  onPressDelete?: () => void;
  onPressEdit?: () => void;
}) {
  const accentColor = isLast ? expiryAccent : colors.primary;

  return (
    <View style={[styles.listingCard, isBoosted && styles.listingCardBoosted]}>
      <View style={[styles.listingAccent, { backgroundColor: accentColor }]} />
      <View style={styles.listingTop}>
        <View style={styles.thumbnailWrap}>
          <Image
            source={listing.image}
            resizeMode='cover'
            style={styles.thumbnail}
          />
        </View>

        <View style={styles.listingMain}>
          <View style={styles.listingTitleBlock}>
            <Text style={styles.listingTitle} numberOfLines={1}>
              {listing.title}
            </Text>
            <Text style={styles.listingLayout} numberOfLines={1}>
              {listing.unit} · {listing.layout}
            </Text>
          </View>

          <View style={styles.listingSignals}>
            <Signal value={listing.views} label='Views' />
            <Signal value={listing.leads} label='Leads' />
            <Signal value={listing.saved} label='Saved' />
          </View>
        </View>
      </View>

      {isLast ? (
        <View style={styles.expiryNotice}>
          <View style={styles.expiryNoticeTop}>
            <View style={styles.expiryTitleBlock}>
              <View style={styles.expiryIconWrap}>
                <Ionicons name='alarm-outline' size={18} color={softInk} />
              </View>
              <Text style={styles.expiryNoticeTitle}>
                Expires in{' '}
                <Text style={styles.expiryNoticeEmphasis}>3 days</Text>
              </Text>
            </View>
            <Pressable
              accessibilityRole='button'
              accessibilityLabel='Extend listing'
              style={({ pressed }) => [
                styles.expiryExtendButton,
                pressed && styles.expiryExtendButtonPressed,
              ]}
            >
              <Text style={styles.expiryExtendButtonText}>Extend</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={styles.priceBreakdown}>
        <View style={styles.entirePriceColumn}>
          <Text style={styles.priceLabel}>Entire Unit</Text>
          <Text style={styles.entirePriceValue}>{listing.entireUnitPrice}</Text>
        </View>
        <View style={styles.priceDivider} />
        <View style={styles.roomPriceColumn}>
          {listing.roomPrices.slice(0, 3).map((room) => (
            <View key={room.label} style={styles.roomPriceRow}>
              <Text style={styles.roomPriceLabel} numberOfLines={1}>
                {room.label}
              </Text>
              <Text style={styles.roomPriceValue}>{room.price}</Text>
            </View>
          ))}
        </View>
      </View>

      <RoommateStrip roommates={listing.roommates} onPress={onOpenRoommates} />

      <View style={styles.actionsRow}>
        <ActionButton label='Delete' icon='trash-outline' onPress={onPressDelete} />
        <ActionButton label='Edit' icon='create-outline' onPress={onPressEdit} />
        <ActionButton
          label={isBoosted ? 'Boosted' : 'Boost'}
          icon='rocket-outline'
          primary
          disabled={isBoosted}
          onPress={isBoosted ? undefined : onPressBoost}
        />
      </View>
    </View>
  );
}

function RoommateStrip({
  roommates,
  onPress,
}: {
  roommates: RoommateProfile[];
  onPress: () => void;
}) {
  const hasRoommates = roommates.length > 0;
  const roommateNames = roommates.map((roommate) => roommate.name).join(', ');

  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel='Open roommate listing'
      onPress={onPress}
      style={({ pressed }) => [
        styles.roommateStrip,
        pressed && styles.roommateStripPressed,
      ]}
    >
      {hasRoommates ? (
        <View style={styles.roommateAvatarStack}>
          {roommates.slice(0, MAX_ROOMMATES_PER_LISTING).map((roommate, index) => (
            <Image
              key={roommate.id}
              source={roommate.image}
              resizeMode='cover'
              style={[
                styles.roommateAvatar,
                index > 0 && styles.roommateAvatarOverlap,
              ]}
            />
          ))}
        </View>
      ) : (
        <View style={styles.roommateEmptyIcon}>
          <Ionicons
            name='person-add-outline'
            size={17}
            color={colors.primary}
          />
        </View>
      )}

      <Text
        style={[styles.roommateText, !hasRoommates && styles.roommateTextEmpty]}
        numberOfLines={1}
      >
        {hasRoommates ? roommateNames : 'No Roommate Added Yet'}
      </Text>
      <Ionicons name='chevron-forward' size={18} color='rgba(60,60,67,0.42)' />
    </Pressable>
  );
}

function RoommateSheet({
  listing,
  query,
  onChangeQuery,
  onClose,
}: {
  listing: Listing | null;
  query: string;
  onChangeQuery: (value: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const hasListing = listing !== null;
  const roommates = listing?.roommates ?? [];
  const hasRoommates = roommates.length > 0;
  const hasSearch = query.trim().length > 0;

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(
    new Animated.Value(Math.min(520, Dimensions.get('window').height * 0.62)),
  ).current;

  const sheetClosedY = useCallback(
    () => Math.min(520, Dimensions.get('window').height * 0.62),
    [],
  );

  const dismissAnimated = useCallback(
    (after?: () => void) => {
      const y = sheetClosedY();
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
          toValue: y,
          duration: 260,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished && after) after();
      });
    },
    [backdropOpacity, sheetClosedY, sheetTranslateY],
  );

  const runClose = useCallback(() => {
    dismissAnimated(onClose);
  }, [dismissAnimated, onClose]);

  useEffect(() => {
    if (!listing) return;
    const y = sheetClosedY();
    backdropOpacity.stopAnimation();
    sheetTranslateY.stopAnimation();
    sheetTranslateY.setValue(y);
    backdropOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        stiffness: 320,
        damping: 36,
        mass: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [listing, backdropOpacity, sheetClosedY, sheetTranslateY]);

  const handleRequestClose = () => {
    if (!listing) return;
    runClose();
  };

  return (
    <Modal
      animationType='none'
      transparent
      visible={hasListing}
      onRequestClose={handleRequestClose}
    >
      <View style={styles.deleteListingModalRoot}>
        <Animated.View
          pointerEvents='box-none'
          style={[StyleSheet.absoluteFillObject, { opacity: backdropOpacity }]}
        >
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Close roommate listing'
            style={StyleSheet.absoluteFill}
            onPress={runClose}
          >
            <BlurView intensity={42} tint='dark' style={StyleSheet.absoluteFill} />
            <View style={styles.deleteListingBackdropDim} />
          </Pressable>
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? -space.xxxl : 0}
          style={styles.roommateModalRoot}
          pointerEvents='box-none'
        >
          <Animated.View
            style={[
              styles.roommateSheet,
              {
                paddingBottom: Math.max(insets.bottom, space.xl) + space.md + space.sm,
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
          <View style={styles.roommateSheetHeader}>
            <View style={styles.roommateSheetTitleBlock}>
              <Text style={styles.roommateSheetEyebrow}>
                {listing ? `${listing.unit} roommate setup` : 'Roommate setup'}
              </Text>
              <Text style={styles.roommateSheetTitle}>Link a roommate</Text>
            </View>
            <Pressable
              accessibilityRole='button'
              accessibilityLabel='Close roommate listing'
              hitSlop={10}
              onPress={runClose}
              style={({ pressed }) => [
                styles.roommateCloseButton,
                pressed && styles.headerIconBtnPressed,
              ]}
            >
              <Ionicons name='close' size={22} color={ink} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps='handled'
            showsVerticalScrollIndicator={false}
            style={styles.roommateSheetScroll}
            contentContainerStyle={styles.roommateSheetScrollContent}
          >
          <Text style={styles.roommateSheetCopy}>
            Invite by MatchCode, then keep this listing&apos;s roommate roster tidy.
          </Text>

          <View style={styles.matchCodeInputShell}>
            <Ionicons name='search' size={18} color='rgba(104,112,132,0.62)' />
            <TextInput
              keyboardType='number-pad'
              placeholder='Search MatchCode #'
              placeholderTextColor='rgba(104,112,132,0.48)'
              value={query}
              onChangeText={onChangeQuery}
              style={styles.matchCodeInput}
            />
          </View>

          {hasSearch && (
            <LinearGradient
              colors={['#EEF4FF', '#F8FBFF']}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={styles.roommateCandidateCard}
            >
              <Image
                source={SUGGESTED_ROOMMATE.image}
                resizeMode='cover'
                style={styles.roommateCandidateAvatar}
              />
              <View style={styles.roommateCandidateMain}>
                <Text style={styles.roommateCandidateName}>
                  {SUGGESTED_ROOMMATE.name}
                </Text>
                <Text style={styles.roommateCandidateMeta} numberOfLines={1}>
                  MatchCode {SUGGESTED_ROOMMATE.matchCode}
                </Text>
                <Text style={styles.roommateCandidateMeta} numberOfLines={1}>
                  {SUGGESTED_ROOMMATE.headline}
                </Text>
              </View>
              <Pressable
                accessibilityRole='button'
                accessibilityLabel='Add suggested roommate'
                style={({ pressed }) => [
                  styles.roommateAddButton,
                  pressed && styles.createButtonPressed,
                ]}
              >
                <Ionicons name='add' size={15} color={white} />
                <Text style={styles.roommateAddButtonText}>Add</Text>
              </Pressable>
            </LinearGradient>
          )}

          <View style={styles.currentRoommatesHeader}>
            <Text style={styles.currentRoommatesTitle}>Current roommates</Text>
            <Text style={styles.currentRoommatesCount}>
              {roommates.length}/{MAX_ROOMMATES_PER_LISTING}
            </Text>
          </View>

          {hasRoommates ? (
            <View style={styles.currentRoommateStack}>
              {roommates.map((roommate) => (
                <View key={roommate.id} style={styles.currentRoommateCard}>
                  <Image
                    source={roommate.image}
                    resizeMode='cover'
                    style={styles.currentRoommateAvatar}
                  />
                  <View style={styles.currentRoommateMain}>
                    <Text style={styles.currentRoommateName}>{roommate.name}</Text>
                    <Text style={styles.currentRoommateMeta}>
                      Verified Ellieo profile
                    </Text>
                  </View>
                  <View style={styles.currentRoommatePill}>
                    <Ionicons
                      name='checkmark-circle'
                      size={14}
                      color={colors.primary}
                    />
                    <Text style={styles.currentRoommatePillText}>Linked</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.roommateEmptyState}>
              <LinearGradient
                colors={['rgba(147,197,253,0.35)', 'rgba(47,109,246,0.1)']}
                style={styles.roommateEmptyOrb}
              >
                <Ionicons name='people-outline' size={24} color={colors.primary} />
              </LinearGradient>
              <Text style={styles.roommateEmptyTitle}>No roommates yet</Text>
              <Text style={styles.roommateEmptyCopy}>
                Add a roommate to make this listing feel more complete and trustworthy.
              </Text>
            </View>
          )}
          </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

/** Red gradient capsule CTA aligned with onboarding primary CTAs. */
function DeleteListingDangerCta({
  label,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const a11y = accessibilityLabel ?? label;
  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={a11y}
      onPress={onPress}
      style={({ pressed }) => [
        styles.deleteListingDangerCtaShell,
        pressed && styles.actionButtonPressed,
      ]}
    >
      <LinearGradient
        colors={[colors.coral, colors.coralDeep]}
        end={{ x: 1, y: 0.5 }}
        start={{ x: 0, y: 0.5 }}
        style={styles.deleteListingDangerCtaGradient}
      >
        <Text style={styles.deleteListingDangerCtaText}>{label}</Text>
        <Ionicons
          name='arrow-forward'
          size={20}
          color={white}
          style={{ marginLeft: space.sm }}
        />
      </LinearGradient>
    </Pressable>
  );
}

/** Blue gradient capsule CTA for boost confirmation (matches onboarding primary). */
function BoostListingPrimaryCta({
  label,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const a11y = accessibilityLabel ?? label;
  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={a11y}
      onPress={onPress}
      style={({ pressed }) => [
        styles.boostListingPrimaryCtaShell,
        pressed && styles.actionButtonPressed,
      ]}
    >
      <LinearGradient
        colors={gradientPrimaryHorizontal}
        end={{ x: 1, y: 0.5 }}
        start={{ x: 0, y: 0.5 }}
        style={styles.boostListingPrimaryCtaGradient}
      >
        <Text style={styles.boostListingPrimaryCtaText}>{label}</Text>
        <Ionicons
          name='arrow-forward'
          size={20}
          color={white}
          style={{ marginLeft: space.sm }}
        />
      </LinearGradient>
    </Pressable>
  );
}

function DeleteListingModal({
  listing,
  onClose,
  onConfirmFinal,
}: {
  listing: Listing | null;
  onClose: () => void;
  onConfirmFinal: () => void;
}) {
  const insets = useSafeAreaInsets();
  const visible = listing !== null;

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(
    new Animated.Value(Math.min(520, Dimensions.get('window').height * 0.62)),
  ).current;

  const sheetClosedY = useCallback(
    () => Math.min(520, Dimensions.get('window').height * 0.62),
    [],
  );

  const dismissAnimated = useCallback(
    (after?: () => void) => {
      const y = sheetClosedY();
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
          toValue: y,
          duration: 260,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished && after) after();
      });
    },
    [backdropOpacity, sheetClosedY, sheetTranslateY],
  );

  const runClose = useCallback(() => {
    dismissAnimated(onClose);
  }, [dismissAnimated, onClose]);

  useEffect(() => {
    if (!listing) return;
    const y = sheetClosedY();
    backdropOpacity.stopAnimation();
    sheetTranslateY.stopAnimation();
    sheetTranslateY.setValue(y);
    backdropOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        stiffness: 320,
        damping: 36,
        mass: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [listing, backdropOpacity, sheetClosedY, sheetTranslateY]);

  const handleRequestClose = () => {
    if (!listing) return;
    runClose();
  };

  const onBackdropPress = () => {
    if (!listing) return;
    runClose();
  };

  const onConfirmAnimated = () => {
    dismissAnimated(onConfirmFinal);
  };

  return (
    <Modal
      animationType='none'
      transparent
      visible={visible}
      onRequestClose={handleRequestClose}
    >
      <View style={styles.deleteListingModalRoot}>
        <Animated.View
          pointerEvents='box-none'
          style={[StyleSheet.absoluteFillObject, { opacity: backdropOpacity }]}
        >
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Dismiss delete listing'
            style={StyleSheet.absoluteFill}
            onPress={onBackdropPress}
          >
            <BlurView intensity={42} tint='dark' style={StyleSheet.absoluteFill} />
            <View style={styles.deleteListingBackdropDim} />
          </Pressable>
        </Animated.View>

        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.deleteListingSheetShell,
            {
              paddingBottom: Math.max(insets.bottom, space.xl) + space.md,
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          {listing ? (
            <>
              <Text style={styles.deleteListingSheetTitle}>
                Delete this listing?
              </Text>
              <Text style={styles.deleteListingSheetSubtitle}>
                <Text style={styles.deleteListingSubtitleLead}>
                  {listing.title}
                </Text>
                {' · '}
                <Text style={styles.deleteListingSubtitleLead}>
                  {listing.unit}
                </Text>
                {' '}
                will leave your portfolio and renters will no longer see it.
              </Text>
              <Text style={styles.deleteListingSheetHint}>
                This can&apos;t be undone.
              </Text>

              <View style={styles.deleteListingFooterRow}>
                <Pressable
                  accessibilityRole='button'
                  accessibilityLabel='Cancel delete listing'
                  onPress={runClose}
                  style={({ pressed }) => [
                    styles.deleteListingCancelCta,
                    pressed && styles.actionButtonPressed,
                  ]}
                >
                  <Text style={styles.deleteListingCancelCtaLabel}>Cancel</Text>
                </Pressable>
                <DeleteListingDangerCta
                  label='Delete'
                  onPress={onConfirmAnimated}
                  accessibilityLabel='Delete listing permanently'
                />
              </View>
            </>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

function BoostListingModal({
  listing,
  onClose,
  onConfirmFinal,
}: {
  listing: Listing | null;
  onClose: () => void;
  onConfirmFinal: () => void;
}) {
  const insets = useSafeAreaInsets();
  const visible = listing !== null;

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(
    new Animated.Value(Math.min(520, Dimensions.get('window').height * 0.62)),
  ).current;

  const sheetClosedY = useCallback(
    () => Math.min(520, Dimensions.get('window').height * 0.62),
    [],
  );

  const dismissAnimated = useCallback(
    (after?: () => void) => {
      const y = sheetClosedY();
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
          toValue: y,
          duration: 260,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished && after) after();
      });
    },
    [backdropOpacity, sheetClosedY, sheetTranslateY],
  );

  const runClose = useCallback(() => {
    dismissAnimated(onClose);
  }, [dismissAnimated, onClose]);

  useEffect(() => {
    if (!listing) return;
    const y = sheetClosedY();
    backdropOpacity.stopAnimation();
    sheetTranslateY.stopAnimation();
    sheetTranslateY.setValue(y);
    backdropOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        stiffness: 320,
        damping: 36,
        mass: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [listing, backdropOpacity, sheetClosedY, sheetTranslateY]);

  const handleRequestClose = () => {
    if (!listing) return;
    runClose();
  };

  const onBackdropPress = () => {
    if (!listing) return;
    runClose();
  };

  const onConfirmAnimated = () => {
    dismissAnimated(onConfirmFinal);
  };

  return (
    <Modal
      animationType='none'
      transparent
      visible={visible}
      onRequestClose={handleRequestClose}
    >
      <View style={styles.deleteListingModalRoot}>
        <Animated.View
          pointerEvents='box-none'
          style={[StyleSheet.absoluteFillObject, { opacity: backdropOpacity }]}
        >
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Dismiss boost listing'
            style={StyleSheet.absoluteFill}
            onPress={onBackdropPress}
          >
            <BlurView intensity={42} tint='dark' style={StyleSheet.absoluteFill} />
            <View style={styles.deleteListingBackdropDim} />
          </Pressable>
        </Animated.View>

        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.deleteListingSheetShell,
            {
              paddingBottom: Math.max(insets.bottom, space.xl) + space.md,
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          {listing ? (
            <>
              <Text style={styles.deleteListingSheetTitle}>
                Boost this listing?
              </Text>
              <Text style={styles.deleteListingSheetSubtitle}>
                <Text style={styles.deleteListingSubtitleLead}>
                  {listing.title}
                </Text>
                {' · '}
                <Text style={styles.deleteListingSubtitleLead}>
                  {listing.unit}
                </Text>
                {' '}
                will get better placement in search so more renters see it first.
              </Text>
              <Text style={styles.deleteListingSheetHint}>
                Design preview — boost controls and billing would live here in production.
              </Text>

              <View style={styles.deleteListingFooterRow}>
                <Pressable
                  accessibilityRole='button'
                  accessibilityLabel='Cancel boost listing'
                  onPress={runClose}
                  style={({ pressed }) => [
                    styles.deleteListingCancelCta,
                    pressed && styles.actionButtonPressed,
                  ]}
                >
                  <Text style={styles.deleteListingCancelCtaLabel}>Cancel</Text>
                </Pressable>
                <BoostListingPrimaryCta
                  label='Boost'
                  onPress={onConfirmAnimated}
                  accessibilityLabel='Confirm boost listing'
                />
              </View>
            </>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

function Signal({ value, label }: { value: string | number; label: string }) {
  const displayValue = value === 0 || value === '0' ? '-' : `${value}`;

  return (
    <View style={styles.signal}>
      <Text style={styles.signalValue}>{displayValue}</Text>
      <Text style={styles.signalLabel}>{label}</Text>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  primary,
  disabled,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  primary?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}) {
  const iconName = primary && icon === 'rocket-outline' ? 'rocket' : icon;

  if (primary) {
    return (
      <Pressable
        accessibilityRole='button'
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.actionButton,
          styles.actionButtonPrimary,
          disabled && styles.actionButtonPrimaryDisabled,
          pressed && !disabled && styles.actionButtonPressed,
        ]}
      >
        <LinearGradient
          colors={gradientPrimaryHorizontal}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.boostButtonSurface}
        >
          <View style={styles.boostIconWrap}>
            <Ionicons name={iconName} size={17} color={white} />
          </View>
          <Text style={[styles.actionText, styles.actionTextPrimary]}>
            {label}
          </Text>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        primary && styles.actionButtonPrimary,
        disabled && styles.actionButtonDisabled,
        pressed && !disabled && styles.actionButtonPressed,
      ]}
    >
      <Ionicons name={iconName} size={17} color={ink} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: pageBg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: space.md,
  },
  headerIconBtnPressed: {
    opacity: 0.55,
  },
  sectionHeader: {
    gap: space.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  sectionMeta: {
    fontSize: type.body,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.2,
    lineHeight: 20,
    flexShrink: 0,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  sectionKicker: {
    fontSize: type.micro,
    lineHeight: 14,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: type.title,
    lineHeight: 25,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.45,
  },
  listStack: {
    gap: space.md,
  },
  listingCard: {
    borderRadius: radius.xl,
    padding: space.md,
    backgroundColor: white,
    borderWidth: 1,
    borderColor: cardBorder,
    gap: space.md,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.07,
        shadowRadius: 26,
      },
      android: { elevation: 3 },
    }),
  },
  listingCardBoosted: {
    borderWidth: 2,
    borderColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.16,
        shadowRadius: 22,
      },
      android: { elevation: 5 },
    }),
  },
  listingAccent: {
    position: 'absolute',
    left: 0,
    top: 28,
    width: 4,
    height: 76,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  listingTop: {
    flexDirection: 'row',
    gap: space.md,
    alignItems: 'stretch',
  },
  expiryNotice: {
    borderRadius: radius.md,
    backgroundColor: '#F3F4F6',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(17,24,39,0.08)',
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    overflow: 'hidden',
  },
  expiryNoticeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  expiryTitleBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minWidth: 0,
  },
  expiryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(17,24,39,0.06)',
  },
  expiryNoticeTitle: {
    flex: 1,
    fontSize: type.body,
    lineHeight: 21,
    fontWeight: '600',
    color: muted,
    letterSpacing: -0.12,
    minWidth: 0,
  },
  expiryNoticeEmphasis: {
    fontSize: type.body,
    lineHeight: 21,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.2,
  },
  expiryExtendButton: {
    minHeight: 36,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: white,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.12)',
  },
  expiryExtendButtonPressed: {
    opacity: 0.78,
  },
  expiryExtendButtonText: {
    fontSize: type.caption,
    lineHeight: 17,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.08,
  },
  thumbnailWrap: {
    width: 98,
    height: 104,
    borderRadius: radius.lg,
  },
  thumbnail: {
    width: 98,
    height: 104,
    borderRadius: radius.lg,
    backgroundColor: '#E5E7EB',
  },
  listingMain: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between',
  },
  listingTitleBlock: {
    minWidth: 0,
  },
  listingTitle: {
    fontSize: type.bodyLarge,
    lineHeight: 22,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.28,
  },
  listingLayout: {
    marginTop: 3,
    fontSize: type.caption,
    lineHeight: 17,
    fontWeight: '600',
    color: muted,
    letterSpacing: -0.08,
  },
  listingSignals: {
    flexDirection: 'row',
    gap: 7,
  },
  signal: {
    flex: 1,
    minHeight: 50,
    borderRadius: radius.md,
    backgroundColor: '#F6F8FD',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(31,41,55,0.04)',
  },
  signalValue: {
    fontSize: type.caption,
    lineHeight: 17,
    fontWeight: '800',
    color: ink,
  },
  signalLabel: {
    fontSize: type.micro,
    lineHeight: 14,
    fontWeight: '600',
    color: muted,
    marginTop: 1,
  },
  priceBreakdown: {
    minHeight: 96,
    borderRadius: radius.lg,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    backgroundColor: '#F8FAFF',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(31,41,55,0.04)',
  },
  entirePriceColumn: {
    flex: 1,
    minWidth: 0,
  },
  priceDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginHorizontal: space.md,
    backgroundColor: 'rgba(31,41,55,0.09)',
  },
  priceLabel: {
    fontSize: type.caption,
    lineHeight: 17,
    fontWeight: '600',
    color: muted,
    letterSpacing: -0.08,
  },
  entirePriceValue: {
    marginTop: 2,
    fontSize: type.title,
    lineHeight: 25,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.25,
  },
  roomPriceColumn: {
    flex: 1.55,
    gap: 5,
  },
  roomPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  roomPriceLabel: {
    flex: 1,
    fontSize: type.caption,
    lineHeight: 17,
    fontWeight: '600',
    color: ink,
    letterSpacing: -0.08,
  },
  roomPriceValue: {
    fontSize: type.caption,
    lineHeight: 17,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.08,
  },
  roommateStrip: {
    minHeight: 44,
    borderRadius: radius.lg,
    paddingHorizontal: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: 'rgba(31,41,55,0.04)',
  },
  roommateStripPressed: {
    opacity: 0.76,
  },
  roommateAvatarStack: {
    minWidth: 32,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
  },
  roommateAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: white,
    backgroundColor: '#E5E7EB',
  },
  roommateAvatarOverlap: {
    marginLeft: -12,
  },
  roommateEmptyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47,109,246,0.1)',
  },
  roommateText: {
    flex: 1,
    fontSize: type.caption,
    lineHeight: 17,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.08,
  },
  roommateTextEmpty: {
    color: muted,
  },
  roommateModalRoot: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  roommateSheet: {
    width: '100%',
    maxHeight: '88%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.xl,
    paddingTop: space.xl + space.sm,
    backgroundColor: white,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(31,41,55,0.06)',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.14,
        shadowRadius: 32,
      },
      android: { elevation: 28 },
    }),
  },
  roommateSheetScroll: {
    flexGrow: 0,
  },
  roommateSheetScrollContent: {
    gap: space.lg,
    paddingBottom: space.md,
  },
  roommateSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    marginBottom: space.md,
  },
  roommateSheetTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  roommateSheetEyebrow: {
    fontSize: type.micro,
    lineHeight: 14,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  roommateSheetTitle: {
    marginTop: 2,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
    color: ink,
    letterSpacing: -0.65,
  },
  roommateCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FC',
  },
  roommateSheetCopy: {
    marginTop: space.xs,
    fontSize: type.caption,
    lineHeight: 18,
    fontWeight: '600',
    color: muted,
    letterSpacing: -0.08,
  },
  matchCodeInputShell: {
    minHeight: 52,
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: '#F8FAFF',
    borderWidth: 1,
    borderColor: 'rgba(31,41,55,0.07)',
  },
  matchCodeInput: {
    flex: 1,
    minHeight: 50,
    paddingVertical: 0,
    fontSize: type.body,
    lineHeight: 20,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.12,
  },
  roommateCandidateCard: {
    minHeight: 82,
    borderRadius: radius.lg,
    padding: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderWidth: 1,
    borderColor: 'rgba(47,109,246,0.1)',
  },
  roommateCandidateAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  roommateCandidateMain: {
    flex: 1,
    minWidth: 0,
  },
  roommateCandidateName: {
    fontSize: type.bodyLarge,
    lineHeight: 22,
    fontWeight: '900',
    color: ink,
    letterSpacing: -0.25,
  },
  roommateCandidateMeta: {
    marginTop: 1,
    fontSize: type.caption,
    lineHeight: 16,
    fontWeight: '600',
    color: muted,
    letterSpacing: -0.08,
  },
  roommateAddButton: {
    minHeight: 38,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    backgroundColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius: 14,
      },
      android: { elevation: 4 },
    }),
  },
  roommateAddButtonText: {
    fontSize: type.caption,
    lineHeight: 17,
    fontWeight: '900',
    color: white,
    letterSpacing: -0.08,
  },
  currentRoommatesHeader: {
    marginTop: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentRoommatesTitle: {
    fontSize: type.caption,
    lineHeight: 17,
    fontWeight: '900',
    color: ink,
    letterSpacing: -0.08,
  },
  currentRoommatesCount: {
    fontSize: type.micro,
    lineHeight: 14,
    fontWeight: '900',
    color: muted,
    letterSpacing: 0.2,
  },
  currentRoommateStack: {
    gap: space.md,
  },
  currentRoommateCard: {
    minHeight: 66,
    borderRadius: radius.lg,
    padding: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: white,
    borderWidth: 1,
    borderColor: 'rgba(31,41,55,0.07)',
  },
  currentRoommateAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E5E7EB',
  },
  currentRoommateMain: {
    flex: 1,
    minWidth: 0,
  },
  currentRoommateName: {
    fontSize: type.body,
    lineHeight: 20,
    fontWeight: '900',
    color: ink,
    letterSpacing: -0.16,
  },
  currentRoommateMeta: {
    marginTop: 1,
    fontSize: type.caption,
    lineHeight: 17,
    fontWeight: '600',
    color: muted,
    letterSpacing: -0.08,
  },
  currentRoommatePill: {
    minHeight: 30,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(47,109,246,0.09)',
  },
  currentRoommatePillText: {
    fontSize: type.micro,
    lineHeight: 14,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -0.04,
  },
  roommateEmptyState: {
    minHeight: 150,
    borderRadius: radius.xl,
    padding: space.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBFCFF',
    borderWidth: 1,
    borderColor: 'rgba(31,41,55,0.05)',
  },
  roommateEmptyOrb: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roommateEmptyTitle: {
    marginTop: space.md,
    fontSize: type.bodyLarge,
    lineHeight: 22,
    fontWeight: '900',
    color: ink,
    letterSpacing: -0.24,
  },
  roommateEmptyCopy: {
    marginTop: space.xs,
    fontSize: type.caption,
    lineHeight: 18,
    fontWeight: '600',
    color: muted,
    textAlign: 'center',
    letterSpacing: -0.08,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.pill,
    backgroundColor: '#F7F9FE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    borderWidth: 1,
    borderColor: 'rgba(31,41,55,0.04)',
  },
  actionButtonPrimary: {
    flex: 1.16,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 22,
    padding: 0,
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 14,
      },
      android: { elevation: 4 },
    }),
  },
  actionButtonPressed: {
    opacity: 0.82,
  },
  actionButtonPrimaryDisabled: {
    opacity: 0.52,
  },
  actionButtonDisabled: {
    opacity: 0.45,
  },
  actionText: {
    fontSize: type.caption,
    lineHeight: 17,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.08,
  },
  actionTextPrimary: {
    color: white,
    fontWeight: '800',
  },
  boostButtonSurface: {
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    minHeight: 44,
    overflow: 'hidden',
    paddingHorizontal: space.sm,
  },
  boostIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  bottomCtaWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingTop: space.xl,
  },
  bottomCtaFade: {
    ...StyleSheet.absoluteFillObject,
  },
  createButtonShell: {
    minHeight: 58,
    borderRadius: radius.pill,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.26,
        shadowRadius: 20,
      },
      android: { elevation: 6 },
    }),
  },
  createButton: {
    minHeight: 58,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
  },
  createButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  createButtonText: {
    fontSize: type.bodyLarge,
    lineHeight: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.25,
  },
  deleteListingModalRoot: {
    flex: 1,
  },
  deleteListingBackdropDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.32)',
  },
  deleteListingSheetShell: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '78%',
    width: '100%',
    backgroundColor: white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.xl + space.sm,
    paddingTop: space.xxl + space.md,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.14,
        shadowRadius: 32,
      },
      android: { elevation: 28 },
    }),
  },
  deleteListingSheetTitle: {
    fontSize: type.title + 3,
    lineHeight: 28,
    fontWeight: '900',
    color: ink,
    letterSpacing: -0.52,
    marginBottom: space.md + space.xs,
  },
  deleteListingSheetSubtitle: {
    fontSize: type.bodyLarge,
    fontWeight: '500',
    color: muted,
    lineHeight: 24,
    letterSpacing: -0.18,
    marginBottom: space.sm + space.xs,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  deleteListingSubtitleLead: {
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.24,
    fontSize: type.bodyLarge,
    lineHeight: 24,
  },
  deleteListingSheetHint: {
    fontSize: type.body,
    fontWeight: '600',
    color: captionMuted,
    lineHeight: 21,
    letterSpacing: -0.12,
    marginBottom: space.xl + space.sm,
  },
  deleteListingFooterRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: space.md,
  },
  deleteListingCancelCta: {
    flex: 1,
    minHeight: 58,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: fieldFill,
    borderWidth: 1,
    borderColor: fieldBorder,
  },
  deleteListingCancelCtaLabel: {
    fontSize: type.bodyLarge,
    lineHeight: 22,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.22,
  },
  deleteListingDangerCtaShell: {
    flex: 1,
    minHeight: 58,
    borderRadius: radius.pill,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.coralDeep,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  deleteListingDangerCtaGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.lg,
    paddingHorizontal: space.lg,
    minHeight: 58,
  },
  deleteListingDangerCtaText: {
    fontSize: type.bodyLarge,
    fontWeight: '900',
    color: white,
    letterSpacing: -0.2,
  },
  boostListingPrimaryCtaShell: {
    flex: 1,
    minHeight: 58,
    borderRadius: radius.pill,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.26,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  boostListingPrimaryCtaGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.lg,
    paddingHorizontal: space.lg,
    minHeight: 58,
  },
  boostListingPrimaryCtaText: {
    fontSize: type.bodyLarge,
    fontWeight: '900',
    color: white,
    letterSpacing: -0.2,
  },
});
