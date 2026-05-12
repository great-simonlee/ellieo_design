import Ionicons from '@expo/vector-icons/Ionicons';
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

const ink = '#1C1C1E';
const muted = '#636366';
const pageBg = '#FFFFFF';
const cardBorder = 'rgba(60,60,67,0.08)';

type ListingStatus = 'Live' | 'Draft' | 'Attention';
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
  roommates: string;
  nextMove: string;
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
    roommates: '2 roommates linked',
    nextMove: 'Strong demand. Keep Boost on tonight.',
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
    roommates: '1 roommate linked',
    nextMove: 'Add a roommate intro to increase trust.',
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
    roommates: 'No roommate yet',
    nextMove: 'Verify address before the next publish window.',
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
    roommates: 'Draft setup',
    nextMove: 'Finish pricing and house rules.',
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
            paddingTop: insets.top + space.sm,
            paddingHorizontal: padH,
            paddingBottom: insets.bottom + 118,
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
            <Ionicons name='arrow-back' size={24} color={ink} />
          </Pressable>

        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>Your listings</Text>
          <Text style={styles.title}>Manage your rooms</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All listings</Text>
          <Text style={styles.sectionMeta}>{LISTINGS.length} total</Text>
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
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Create a new listing'
          style={({ pressed }) => [
            styles.createButton,
            { width: primaryButtonWidth },
            pressed && styles.createButtonPressed,
          ]}
        >
          <Ionicons name='add' size={22} color='#FFFFFF' />
          <Text style={styles.createButtonText}>Create a new listing</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ListingRow({ listing }: { listing: Listing }) {
  return (
    <View style={styles.listingCard}>
      <View style={styles.listingTop}>
        <Image source={listing.image} resizeMode='cover' style={styles.thumbnail} />

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

      <View style={styles.roommateStrip}>
        <View style={styles.roommateIcon}>
          <Ionicons name='people-outline' size={17} color={ink} />
        </View>
        <Text style={styles.roommateText} numberOfLines={1}>
          {listing.roommates}
        </Text>
        <Ionicons name='chevron-forward' size={18} color='rgba(60,60,67,0.42)' />
      </View>

      <View style={styles.actionsRow}>
        <ActionButton label='Delete' icon='trash-outline' />
        <ActionButton label='Edit' icon='create-outline' />
        <ActionButton label='Boost' icon='rocket-outline' primary />
      </View>
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

function ActionButton({
  label,
  icon,
  primary,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  primary?: boolean;
}) {
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
      <Ionicons name={icon} size={17} color={primary ? colors.primary : ink} />
      <Text style={[styles.actionText, primary && styles.actionTextPrimary]}>
        {label}
      </Text>
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
    gap: space.lg,
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
  },
  headerButtonPressed: {
    backgroundColor: '#ECEFF5',
  },
  titleBlock: {
    gap: space.xs,
  },
  eyebrow: {
    fontSize: type.micro,
    lineHeight: 14,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 29,
    lineHeight: 34,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.85,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: space.md,
  },
  sectionTitle: {
    fontSize: type.title,
    lineHeight: 25,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.45,
  },
  sectionMeta: {
    fontSize: type.caption,
    lineHeight: 17,
    fontWeight: '700',
    color: muted,
  },
  listStack: {
    gap: space.md,
  },
  listingCard: {
    borderRadius: radius.xl,
    padding: space.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: cardBorder,
    gap: space.md,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.045,
        shadowRadius: 18,
      },
      android: { elevation: 2 },
    }),
  },
  listingTop: {
    flexDirection: 'row',
    gap: space.md,
    alignItems: 'stretch',
  },
  thumbnail: {
    width: 94,
    height: 94,
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
    gap: 6,
  },
  signal: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: '#FAFAFC',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#FAFAFC',
    flexDirection: 'row',
    alignItems: 'center',
  },
  entirePriceColumn: {
    flex: 1,
    minWidth: 0,
  },
  priceDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginHorizontal: space.md,
    backgroundColor: 'rgba(60,60,67,0.12)',
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
    paddingHorizontal: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: '#FAFAFC',
  },
  roommateIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  roommateText: {
    flex: 1,
    fontSize: type.caption,
    lineHeight: 17,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.08,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  actionButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: radius.pill,
    backgroundColor: '#F8F8FA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
  },
  actionButtonPrimary: {
    backgroundColor: 'rgba(47,109,246,0.1)',
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
    color: colors.primary,
  },
  bottomCtaWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingTop: space.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  createButton: {
    minHeight: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius: 16,
      },
      android: { elevation: 5 },
    }),
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
