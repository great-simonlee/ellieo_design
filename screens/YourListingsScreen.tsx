import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import {
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboardingCtaLayout } from '../design/onboardingCtaLayout';
import { colors, radius, space, type } from '../design/theme';

const ink = '#111827';
const muted = '#687084';
const pageBg = '#F5F7FF';
const softInk = '#354052';
const cardBorder = 'rgba(31,41,55,0.08)';
const white = '#FFFFFF';

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

const LISTINGS: Listing[] = [
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
];

export type YourListingsScreenProps = {
  onBack?: () => void;
};

export function YourListingsScreen({ onBack }: YourListingsScreenProps) {
  const insets = useSafeAreaInsets();
  const { padH, primaryButtonWidth } = useOnboardingCtaLayout();

  return (
    <View style={styles.root}>
      <StatusBar style='dark' />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + space.md,
            paddingHorizontal: padH,
            paddingBottom: insets.bottom + 140,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Go back'
            hitSlop={10}
            onPress={onBack}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.headerButtonPressed,
            ]}
          >
            <Ionicons name='arrow-back' size={22} color={ink} />
          </Pressable>

          <View style={styles.headerPill}>
            <Text style={styles.headerPillText}>{LISTINGS.length} listings</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionKicker}>Portfolio</Text>
            <Text style={styles.sectionTitle}>Your listings</Text>
          </View>
        </View>

        <View style={styles.listStack}>
          {LISTINGS.map((listing) => (
            <ListingRow key={listing.id} listing={listing} />
          ))}
        </View>
      </ScrollView>

      <View
        pointerEvents='box-none'
        style={[styles.bottomCtaWrap, { paddingBottom: insets.bottom + space.md }]}
      >
        <LinearGradient
          colors={['rgba(245,247,255,0)', 'rgba(245,247,255,0.98)']}
          style={styles.bottomCtaFade}
        />
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Create a new listing'
          style={({ pressed }) => [
            styles.createButtonShell,
            { width: primaryButtonWidth },
            pressed && styles.createButtonPressed,
          ]}
        >
          <LinearGradient
            colors={[colors.primary, '#7057FF']}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.createButton}
          >
            <Ionicons name='add' size={22} color='#FFFFFF' />
            <Text style={styles.createButtonText}>Create a new listing</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

function ListingRow({ listing }: { listing: Listing }) {
  const tone = getListingTone(listing.status);

  return (
    <View style={styles.listingCard}>
      <View style={[styles.listingAccent, { backgroundColor: tone.accent }]} />
      <View style={styles.listingTop}>
        <View style={styles.thumbnailWrap}>
          <Image source={listing.image} resizeMode='cover' style={styles.thumbnail} />
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
            <Signal value={listing.views} label='views' />
            <Signal value={`${listing.leads}`} label='leads' />
            <Signal value={`${listing.saved}`} label='saved' />
          </View>
        </View>
      </View>

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

      <RoommateStrip roommates={listing.roommates} />

      <View style={styles.actionsRow}>
        <ActionButton label='Delete' icon='trash-outline' />
        <ActionButton label='Edit' icon='create-outline' />
        <ActionButton label='Boost' icon='rocket-outline' primary />
      </View>
    </View>
  );
}

function RoommateStrip({ roommates }: { roommates: RoommateProfile[] }) {
  const hasRoommates = roommates.length > 0;
  const roommateNames = roommates.map((roommate) => roommate.name).join(', ');

  return (
    <View style={styles.roommateStrip}>
      {hasRoommates ? (
        <View style={styles.roommateAvatarStack}>
          {roommates.slice(0, 3).map((roommate, index) => (
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
          <Ionicons name='person-add-outline' size={17} color={colors.primary} />
        </View>
      )}

      <Text
        style={[styles.roommateText, !hasRoommates && styles.roommateTextEmpty]}
        numberOfLines={1}
      >
        {hasRoommates ? roommateNames : 'No Roommate Added Yet'}
      </Text>
      <Ionicons name='chevron-forward' size={18} color='rgba(60,60,67,0.42)' />
    </View>
  );
}

function Signal({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.signal}>
      <Text style={styles.signalValue}>{value}</Text>
      <Text style={styles.signalLabel}>{label}</Text>
    </View>
  );
}

function getListingTone(status: ListingStatus): { accent: string } {
  if (status === 'Attention') {
    return {
      accent: '#F59E0B',
    };
  }

  if (status === 'Draft') {
    return {
      accent: '#7C3AED',
    };
  }

  return {
    accent: colors.primary,
  };
}

function ActionButton({
  label,
  icon,
  primary,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  primary?: boolean;
}) {
  const iconName = primary && icon === 'rocket-outline' ? 'rocket' : icon;

  if (primary) {
    return (
      <Pressable
        accessibilityRole='button'
        accessibilityLabel={label}
        style={({ pressed }) => [
          styles.actionButton,
          styles.actionButtonPrimary,
          pressed && styles.actionButtonPressed,
        ]}
      >
        <LinearGradient
          colors={[colors.primary, '#6D5DF6']}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.boostButtonSurface}
        >
          <View style={styles.boostIconWrap}>
            <Ionicons name={iconName} size={17} color={white} />
          </View>
          <Text style={[styles.actionText, styles.actionTextPrimary]}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.actionButton,
        primary && styles.actionButtonPrimary,
        pressed && styles.actionButtonPressed,
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
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
      },
      android: { elevation: 2 },
    }),
  },
  headerButtonPressed: {
    opacity: 0.7,
  },
  headerPill: {
    minHeight: 38,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  headerPillText: {
    fontSize: type.caption,
    lineHeight: 17,
    fontWeight: '800',
    color: softInk,
    letterSpacing: -0.08,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
});
