import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppTopBar, appTopBarStyles } from '../components/AppTopBar';
import { ProfileRoommateLookingCard } from '../components/ProfileRoommateLookingCard';
import { RoommateLookingReviewModal } from '../components/RoommateLookingReviewModal';
import { colors, radius, space, type } from '../design/theme';

const ink = '#1C1C1E';
const labelSecondary = '#636366';
const rowIconColor = ink;

type ProfileMenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};
type ProfileAffiliation = {
  role: string;
  organization: string;
};

type ProfileMenuScreenProps = {
  insets: {
    top: number;
    bottom: number;
  };
  padH: number;
  onClose: () => void;
  activelyLooking: boolean;
  onActivelyLookingChange: (next: boolean) => void;
  roommateReviewVisible: boolean;
  onRoommateReviewKeep: () => void;
  onRoommateReviewUpdate: () => void;
  onOpenListings?: () => void;
  onOpenSavedListings?: () => void;
  onOpenLifestylePreferences?: () => void;
  onOpenAccountSettings?: () => void;
};

const PROFILE_MENU_ITEMS: ProfileMenuItem[] = [
  { label: 'Your listings', icon: 'home-outline' },
  { label: 'Saved Listings', icon: 'heart-outline' },
  {
    label: 'Lifestyle & preferences',
    icon: 'people-outline',
  },
  {
    label: 'Account settings',
    icon: 'settings-outline',
  },
  { label: 'Get help', icon: 'help-circle-outline' },
  { label: 'Legal', icon: 'file-tray-outline' },
  { label: 'Log out', icon: 'log-out-outline' },
];

const PROFILE_AFFILIATIONS: ProfileAffiliation[] = [
  { role: 'Student', organization: '@ Fashion Institute of Technology' },
  { role: 'Financial Analyst', organization: '@ Goldman Sachs' },
  {
    role: 'Verify school email or LinkedIn',
    organization: 'to improve roommate matches',
  },
];

export function ProfileMenuScreen({
  insets,
  padH,
  onClose,
  activelyLooking,
  onActivelyLookingChange,
  roommateReviewVisible,
  onRoommateReviewKeep,
  onRoommateReviewUpdate,
  onOpenListings,
  onOpenSavedListings,
  onOpenLifestylePreferences,
  onOpenAccountSettings,
}: ProfileMenuScreenProps) {
  const [affiliationIndex, setAffiliationIndex] = useState(0);
  const affiliation = PROFILE_AFFILIATIONS[affiliationIndex];

  return (
    <View style={profileStyles.root}>
      <StatusBar style='dark' />
      <AppTopBar
        insetTop={insets.top}
        padH={padH}
        paddingBottom={space.lg}
        actions={
          <>
            <Pressable
              accessibilityRole='button'
              accessibilityLabel='Notifications'
              hitSlop={10}
              style={({ pressed }) => [
                appTopBarStyles.iconButton,
                pressed && profileStyles.headerIconButtonPressed,
              ]}
            >
              <Ionicons name='notifications-outline' size={22} color={ink} />
              <View style={profileStyles.notificationDot} />
            </Pressable>
            <Pressable
              accessibilityRole='button'
              accessibilityLabel='Close profile menu'
              onPress={onClose}
              hitSlop={10}
              style={({ pressed }) => [
                appTopBarStyles.iconButton,
                pressed && profileStyles.headerIconButtonPressed,
              ]}
            >
              <Ionicons name='close' size={22} color={ink} />
            </Pressable>
          </>
        }
      />

      <ScrollView
        style={profileStyles.scroll}
        contentContainerStyle={[
          profileStyles.scrollContent,
          {
            paddingHorizontal: padH,
            paddingBottom: insets.bottom + space.xxxl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={profileStyles.profileHero}>
          <View style={profileStyles.heroIdentityRow}>
            <View style={profileStyles.profilePhotoFrame}>
              <LinearGradient
                colors={['#EEF4FF', '#FFFFFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={profileStyles.profilePhoto}
              >
                <Text style={profileStyles.profilePhotoInitials}>SL</Text>
              </LinearGradient>
            </View>

            <View style={profileStyles.profileMeta}>
              <Text style={profileStyles.profileName} numberOfLines={1}>
                Seunghoon Lee
              </Text>
              <Pressable
                accessibilityRole='button'
                accessibilityLabel='Change profile affiliation preview'
                hitSlop={6}
                onPress={() =>
                  setAffiliationIndex(
                    (affiliationIndex + 1) % PROFILE_AFFILIATIONS.length,
                  )
                }
                style={({ pressed }) => [
                  profileStyles.profileAffiliation,
                  pressed && profileStyles.profileAffiliationPressed,
                ]}
              >
                <Text style={profileStyles.profileRole} numberOfLines={1}>
                  {affiliation.role}
                </Text>
                <Text
                  style={profileStyles.profileOrganization}
                  numberOfLines={1}
                >
                  {affiliation.organization}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={profileStyles.profileDivider} />

          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Copy match code'
            style={({ pressed }) => [
              profileStyles.matchCodeRow,
              pressed && profileStyles.actionRowPressed,
            ]}
          >
            <View style={profileStyles.matchCodeIconWrap}>
              <Ionicons name='key-outline' size={22} color={rowIconColor} />
            </View>
            <View style={profileStyles.matchCodeMain}>
              <Text style={profileStyles.matchCodeLabel}>
                Roommate Match Code
              </Text>
              <Text style={profileStyles.matchCodeValue}>226855315</Text>
            </View>
            <View style={profileStyles.copyIconWrap}>
              <Ionicons name='copy-outline' size={17} color={rowIconColor} />
            </View>
          </Pressable>
        </View>

        <ProfileRoommateLookingCard
          activelyLooking={activelyLooking}
          onActivelyLookingChange={onActivelyLookingChange}
        />

        <View style={profileStyles.menuCard}>
          <Text style={profileStyles.sectionKicker}>Manage</Text>
          {PROFILE_MENU_ITEMS.slice(0, 4).map((item, index) => (
            <Pressable
              key={item.label}
              accessibilityRole='button'
              accessibilityLabel={item.label}
              onPress={
                index === 0
                  ? onOpenListings
                  : index === 1
                    ? onOpenSavedListings
                    : index === 2
                      ? onOpenLifestylePreferences
                      : index === 3
                        ? onOpenAccountSettings
                        : undefined
              }
              style={({ pressed }) => [
                profileStyles.menuRow,
                index === 3 && profileStyles.menuRowLast,
                pressed && profileStyles.actionRowPressed,
              ]}
            >
              <View style={profileStyles.menuIconWrap}>
                <Ionicons name={item.icon} size={22} color={rowIconColor} />
              </View>
              <Text style={profileStyles.menuLabel}>{item.label}</Text>
              <Ionicons
                name='chevron-forward'
                size={20}
                color='rgba(60,60,67,0.45)'
              />
            </Pressable>
          ))}
        </View>

        <View style={profileStyles.menuCard}>
          <Text style={profileStyles.sectionKicker}>Support</Text>
          {PROFILE_MENU_ITEMS.slice(4).map((item, index) => (
            <Pressable
              key={item.label}
              accessibilityRole='button'
              accessibilityLabel={item.label}
              style={({ pressed }) => [
                profileStyles.menuRow,
                index === 2 && profileStyles.menuRowLast,
                pressed && profileStyles.actionRowPressed,
              ]}
            >
              <View style={profileStyles.menuIconWrap}>
                <Ionicons name={item.icon} size={22} color={rowIconColor} />
              </View>
              <Text style={profileStyles.menuLabel}>{item.label}</Text>
              <Ionicons
                name='chevron-forward'
                size={20}
                color='rgba(60,60,67,0.45)'
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <RoommateLookingReviewModal
        visible={roommateReviewVisible}
        padH={padH}
        bottomInset={insets.bottom}
        onKeep={onRoommateReviewKeep}
        onUpdate={onRoommateReviewUpdate}
      />
    </View>
  );
}

const profileStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerIconButtonPressed: {
    backgroundColor: '#F2F2F7',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.coral,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingTop: space.sm,
  },
  profileHero: {
    borderRadius: radius.xl,
    backgroundColor: '#FFFFFF',
    padding: space.md,
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.08)',
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
  heroIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.xs,
  },
  profilePhotoFrame: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(47,109,246,0.12)',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
      },
      android: { elevation: 3 },
    }),
  },
  profilePhoto: {
    flex: 1,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePhotoInitials: {
    fontSize: type.title,
    lineHeight: 26,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  profileMeta: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    flexShrink: 1,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.45,
  },
  profileAffiliation: {
    alignSelf: 'flex-start',
    marginTop: 5,
    borderRadius: radius.xs,
  },
  profileAffiliationPressed: {
    opacity: 0.68,
  },
  profileRole: {
    fontSize: type.caption,
    lineHeight: 17,
    fontWeight: '600',
    color: labelSecondary,
    letterSpacing: -0.08,
  },
  profileOrganization: {
    marginTop: 1,
    fontSize: type.caption,
    lineHeight: 17,
    fontWeight: '500',
    color: labelSecondary,
    letterSpacing: -0.08,
  },
  profileDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(60,60,67,0.1)',
    marginTop: space.lg,
    marginBottom: space.sm,
  },
  matchCodeRow: {
    minHeight: 64,
    borderRadius: radius.lg,
    paddingHorizontal: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  matchCodeMain: {
    flex: 1,
    gap: 3,
  },
  matchCodeLabel: {
    fontSize: type.caption,
    lineHeight: 17,
    color: labelSecondary,
    fontWeight: '600',
    letterSpacing: -0.08,
  },
  matchCodeValue: {
    fontSize: type.bodyLarge,
    lineHeight: 22,
    color: ink,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  matchCodeIconWrap: {
    width: 32,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyIconWrap: {
    width: 32,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCard: {
    marginTop: space.lg,
    borderRadius: radius.xl,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.08)',
    padding: space.sm,
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
  sectionKicker: {
    marginLeft: space.sm,
    marginTop: space.xs,
    marginBottom: space.xs,
    fontSize: type.micro,
    lineHeight: 14,
    fontWeight: '900',
    color: 'rgba(60,60,67,0.48)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  menuRow: {
    minHeight: 64,
    borderRadius: radius.lg,
    paddingHorizontal: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginBottom: space.sm,
  },
  menuRowLast: {
    marginBottom: 0,
  },
  actionRowPressed: {
    backgroundColor: '#F8F8FA',
  },
  menuIconWrap: {
    width: 32,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: type.bodyLarge,
    lineHeight: 23,
    fontWeight: '600',
    color: ink,
    letterSpacing: -0.25,
  },
});
