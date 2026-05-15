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
  LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
import { colors, radius, space, type } from '../design/theme';

const ink = '#1C1C1E';
const muted = '#687084';
const pageBg = '#F5F7FF';
const cardBorder = 'rgba(31,41,55,0.08)';
const white = '#FFFFFF';

/** Until `onLayout` runs, thumb height uses this (px). Width stays fixed for stable text measure. */
const SAVED_THUMB_FALLBACK = 72;
const SAVED_THUMB_W = 88;

export type SavedListing = {
  id: string;
  title: string;
  unit: string;
  layout: string;
  entireUnitPrice: string;
  roomPrices: { label: string; price: string }[];
  image: ImageSourcePropType;
};

/** Dummy saved inventory — mirrors YourListings visuals, design shell only. */
const INITIAL_SAVED: SavedListing[] = [
  {
    id: 'west48',
    title: 'W 48th St & 8th Ave',
    unit: '#12J',
    layout: '2 Beds 2 Baths',
    entireUnitPrice: '$7,400',
    roomPrices: [
      { label: 'Master w/ Bath', price: '$2,600' },
      { label: 'Regular', price: '$2,450' },
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
    image: require('../assets/img/banner1.png'),
  },
  {
    id: 'midtown-studio',
    title: 'W 34th St & 7th Ave',
    unit: '#9D',
    layout: 'Studio · 0 Bed 1 Bath',
    entireUnitPrice: '$4,600',
    roomPrices: [{ label: 'Studio', price: '$4,600' }],
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
    image: require('../assets/img/user_banner.png'),
  },
];

export type SavedListingsScreenProps = {
  onBack?: () => void;
  onUnsaveListing?: (listingId: string) => void;
};

export function SavedListingsScreen({
  onBack,
  onUnsaveListing,
}: SavedListingsScreenProps) {
  const insets = useSafeAreaInsets();
  const { padH } = useOnboardingCtaLayout();
  const [saved, setSaved] = useState<SavedListing[]>(INITIAL_SAVED);
  const [unsaveTarget, setUnsaveTarget] = useState<SavedListing | null>(null);

  const confirmUnsaveFinal = useCallback(() => {
    if (!unsaveTarget) return;
    const id = unsaveTarget.id;
    setSaved((prev) => prev.filter((l) => l.id !== id));
    onUnsaveListing?.(id);
    setUnsaveTarget(null);
  }, [unsaveTarget, onUnsaveListing]);

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
            paddingBottom: insets.bottom + space.xxxl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionKicker}>Favorites</Text>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Saved listings</Text>
            <Text style={styles.sectionMeta}>
              {saved.length === 1
                ? '1 Listing Saved'
                : `${saved.length} Listings Saved`}
            </Text>
          </View>
        </View>

        {saved.length === 0 ? (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={[colors.coral, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.emptyOrb}
            >
              <Ionicons name='heart' size={28} color='#FFFFFF' />
            </LinearGradient>
            <Text style={styles.emptyTitle}>Nothing saved yet</Text>
            <Text style={styles.emptyCopy}>
              Tap the heart on a listing to keep it here for quick access.
            </Text>
          </View>
        ) : (
          <View style={styles.listStack}>
            {saved.map((listing) => (
              <SavedListingCard
                key={listing.id}
                listing={listing}
                onUnlikePress={() => setUnsaveTarget(listing)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <RemoveSavedListingModal
        listing={unsaveTarget}
        onClose={() => setUnsaveTarget(null)}
        onConfirmFinal={confirmUnsaveFinal}
      />
    </View>
  );
}

function SavedListingCard({
  listing,
  onUnlikePress,
}: {
  listing: SavedListing;
  onUnlikePress: () => void;
}) {
  const [infoBlockHeight, setInfoBlockHeight] = useState<number | null>(null);
  const roomsNormalized = listing.roomPrices.slice(0, 3);
  const showRoomBreakdown =
    roomsNormalized.length > 1 ||
    (roomsNormalized.length === 1 &&
      roomsNormalized[0].price.trim() !== listing.entireUnitPrice.trim());

  const thumbH = Math.max(48, infoBlockHeight ?? SAVED_THUMB_FALLBACK);
  const thumbRadius = Math.min(
    radius.lg + 2,
    Math.max(radius.sm, Math.floor(Math.min(SAVED_THUMB_W, thumbH) / 5)),
  );

  const onInfoBlockLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h <= 0) return;
    setInfoBlockHeight((prev) =>
      prev != null && Math.abs(prev - h) < 0.5 ? prev : Math.round(h),
    );
  }, []);

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole='button'
        accessibilityLabel={`Remove saved listing, ${listing.title}`}
        onPress={onUnlikePress}
        hitSlop={12}
        style={({ pressed }) => [
          styles.cardUnlikeHeart,
          pressed && styles.cardUnlikeHeartPressed,
        ]}
      >
        <Ionicons name='heart' size={24} color={colors.coral} />
      </Pressable>
      <View style={styles.rowTop}>
        <View
          style={[
            styles.thumbnailWrap,
            {
              width: SAVED_THUMB_W,
              height: thumbH,
              borderRadius: thumbRadius,
            },
          ]}
        >
          <Image
            source={listing.image}
            resizeMode='cover'
            style={[
              styles.thumbnail,
              { borderRadius: thumbRadius },
            ]}
          />
        </View>
        <View style={styles.mainCol}>
          <View style={styles.titleBlock} onLayout={onInfoBlockLayout}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {listing.title}
            </Text>
            <Text style={styles.unitLine} numberOfLines={1}>
              {listing.unit}
            </Text>
            <Text style={styles.layoutLine} numberOfLines={2}>
              {listing.layout}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.priceSection}>
        <View style={styles.priceEntireRow}>
          <Text style={styles.priceEntireLabel}>Entire unit</Text>
          <Text style={styles.priceEntireValue}>{listing.entireUnitPrice}</Text>
        </View>
        {showRoomBreakdown ? (
          <View style={styles.priceRoomBlock}>
            {roomsNormalized.map((room, index) => (
              <View
                key={room.label}
                style={[
                  styles.priceRoomRow,
                  index > 0 && styles.priceRoomRowSep,
                ]}
              >
                <Text style={styles.priceRoomName} numberOfLines={1}>
                  {room.label}
                </Text>
                <Text style={styles.priceRoomValue}>{room.price}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <Pressable
        accessibilityRole='button'
        accessibilityLabel='View Listing details'
        style={({ pressed }) => [
          styles.viewButton,
          pressed && styles.viewButtonPressed,
        ]}
      >
        <Text style={styles.viewLabel}>View Listing</Text>
        <Ionicons name='chevron-forward' size={18} color={colors.primary} />
      </Pressable>
    </View>
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
  sectionHeader: {
    gap: space.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
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
  listStack: {
    gap: space.md,
  },
  emptyState: {
    marginTop: space.xl,
    borderRadius: radius.xl,
    padding: space.xxl,
    alignItems: 'center',
    backgroundColor: white,
    borderWidth: 1,
    borderColor: cardBorder,
    gap: space.sm,
  },
  emptyOrb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,92,122,0.22)',
    ...Platform.select({
      ios: {
        shadowColor: colors.coral,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 2 },
    }),
  },
  emptyTitle: {
    fontSize: type.bodyLarge,
    fontWeight: '900',
    color: ink,
    letterSpacing: -0.28,
  },
  emptyCopy: {
    fontSize: type.caption,
    fontWeight: '600',
    color: muted,
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: -0.08,
  },
  card: {
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
  rowTop: {
    flexDirection: 'row',
    gap: space.md,
    alignItems: 'flex-start',
  },
  thumbnailWrap: {
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  cardUnlikeHeart: {
    position: 'absolute',
    top: space.sm,
    right: space.sm,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  cardUnlikeHeartPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.92 }],
  },
  mainCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'flex-start',
    paddingTop: 2,
    paddingRight: 40,
  },
  titleBlock: {
    minWidth: 0,
    gap: 2,
  },
  cardTitle: {
    fontSize: type.bodyLarge,
    lineHeight: 22,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.28,
  },
  unitLine: {
    marginTop: space.xs,
    fontSize: type.caption,
    lineHeight: 17,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.08,
  },
  layoutLine: {
    marginTop: 2,
    fontSize: type.caption,
    lineHeight: 17,
    fontWeight: '600',
    color: muted,
    letterSpacing: -0.08,
  },
  priceSection: {
    marginTop: 2,
    paddingTop: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(31,41,55,0.1)',
  },
  priceEntireRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  priceEntireLabel: {
    fontSize: type.micro,
    lineHeight: 14,
    fontWeight: '700',
    color: muted,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    flexShrink: 0,
  },
  priceEntireValue: {
    fontSize: type.bodyLarge,
    lineHeight: 22,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.3,
    textAlign: 'right',
    flexShrink: 0,
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  priceRoomBlock: {
    marginTop: 4,
  },
  priceRoomRowSep: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(31,41,55,0.06)',
  },
  priceRoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
    paddingVertical: 3,
  },
  priceRoomName: {
    flex: 1,
    fontSize: type.micro,
    lineHeight: 14,
    fontWeight: '600',
    color: muted,
    letterSpacing: -0.04,
  },
  priceRoomValue: {
    fontSize: type.caption,
    lineHeight: 16,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.08,
    textAlign: 'right',
    ...Platform.select({
      android: { includeFontPadding: false },
      default: {},
    }),
  },
  viewButton: {
    minHeight: 48,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: space.md,
    backgroundColor: '#F0F5FF',
    borderWidth: 1.5,
    borderColor: 'rgba(47,109,246,0.22)',
  },
  viewButtonPressed: {
    opacity: 0.82,
  },
  viewLabel: {
    fontSize: type.caption,
    lineHeight: 17,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.08,
  },
  rmSavedModalRoot: {
    flex: 1,
  },
  rmSavedBackdropDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.32)',
  },
  rmSavedSheetShell: {
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
  rmSavedSheetTitle: {
    fontSize: type.title + 3,
    lineHeight: 28,
    fontWeight: '900',
    color: ink,
    letterSpacing: -0.52,
    marginBottom: space.md + space.xs,
  },
  rmSavedSheetSubtitle: {
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
  rmSavedSubtitleLead: {
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.24,
    fontSize: type.bodyLarge,
    lineHeight: 24,
  },
  rmSavedSheetHint: {
    fontSize: type.body,
    fontWeight: '600',
    color: captionMuted,
    lineHeight: 21,
    letterSpacing: -0.12,
    marginBottom: space.xl + space.sm,
  },
  rmSavedFooterRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: space.md,
  },
  rmSavedCancelCta: {
    flex: 1,
    minHeight: 58,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: fieldFill,
    borderWidth: 1,
    borderColor: fieldBorder,
  },
  rmSavedCancelCtaLabel: {
    fontSize: type.bodyLarge,
    lineHeight: 22,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.22,
  },
  rmSavedDangerCtaShell: {
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
  rmSavedDangerCtaGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.lg,
    paddingHorizontal: space.lg,
    minHeight: 58,
  },
  rmSavedDangerCtaText: {
    fontSize: type.bodyLarge,
    fontWeight: '900',
    color: white,
    letterSpacing: -0.2,
  },
  rmSavedCtaPressed: {
    opacity: 0.82,
  },
});

function RemoveSavedListingModal({
  listing,
  onClose,
  onConfirmFinal,
}: {
  listing: SavedListing | null;
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
      <View style={styles.rmSavedModalRoot}>
        <Animated.View
          pointerEvents='box-none'
          style={[StyleSheet.absoluteFillObject, { opacity: backdropOpacity }]}
        >
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Dismiss remove from saved'
            style={StyleSheet.absoluteFill}
            onPress={onBackdropPress}
          >
            <BlurView intensity={42} tint='dark' style={StyleSheet.absoluteFill} />
            <View style={styles.rmSavedBackdropDim} />
          </Pressable>
        </Animated.View>

        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.rmSavedSheetShell,
            {
              paddingBottom: Math.max(insets.bottom, space.xl) + space.md,
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          {listing ? (
            <>
              <Text style={styles.rmSavedSheetTitle}>Remove from saved?</Text>
              <Text style={styles.rmSavedSheetSubtitle}>
                <Text style={styles.rmSavedSubtitleLead}>{listing.title}</Text>
                {' · '}
                <Text style={styles.rmSavedSubtitleLead}>{listing.unit}</Text>
                {' '}
                will be removed from your saved listings.
              </Text>
              <Text style={styles.rmSavedSheetHint}>
                You can save it again from the listing page.
              </Text>

              <View style={styles.rmSavedFooterRow}>
                <Pressable
                  accessibilityRole='button'
                  accessibilityLabel='Cancel remove from saved'
                  onPress={runClose}
                  style={({ pressed }) => [
                    styles.rmSavedCancelCta,
                    pressed && styles.rmSavedCtaPressed,
                  ]}
                >
                  <Text style={styles.rmSavedCancelCtaLabel}>Cancel</Text>
                </Pressable>
                <Pressable
                  accessibilityRole='button'
                  accessibilityLabel='Confirm remove from saved'
                  onPress={onConfirmAnimated}
                  style={({ pressed }) => [
                    styles.rmSavedDangerCtaShell,
                    pressed && styles.rmSavedCtaPressed,
                  ]}
                >
                  <LinearGradient
                    colors={[colors.coral, colors.coralDeep]}
                    end={{ x: 1, y: 0.5 }}
                    start={{ x: 0, y: 0.5 }}
                    style={styles.rmSavedDangerCtaGradient}
                  >
                    <Text style={styles.rmSavedDangerCtaText}>Remove</Text>
                    <Ionicons
                      name='arrow-forward'
                      size={20}
                      color={white}
                      style={{ marginLeft: space.sm }}
                    />
                  </LinearGradient>
                </Pressable>
              </View>
            </>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}
