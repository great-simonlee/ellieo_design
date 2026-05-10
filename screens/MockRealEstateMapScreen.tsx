import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboardingCtaLayout } from '../design/onboardingCtaLayout';
import { colors, radius, space, type } from '../design/theme';

const ink = '#1C1C1E';
const labelSecondary = '#636366';
const mapBlock = '#D8DEE6';
const mapRoad = 'rgba(255,255,255,0.92)';

type MockRealEstateMapScreenProps = {
  /** Return to welcome (design preview only). */
  onExit?: () => void;
};

const PIN_POSITIONS = [
  { top: '26%' as const, left: '38%' as const },
  { top: '44%' as const, left: '62%' as const },
  { top: '58%' as const, left: '28%' as const },
  { top: '36%' as const, left: '72%' as const },
];

type FooterTab = 'rooms' | 'match' | 'messages';

const FOOTER_TABS: {
  id: FooterTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'rooms', label: 'Rooms', icon: 'home-outline', iconActive: 'home' },
  {
    id: 'match',
    label: 'Match',
    icon: 'people-outline',
    iconActive: 'people',
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: 'chatbubbles-outline',
    iconActive: 'chatbubbles',
  },
];

/** Mock counts — wire to real data later. */
const ROOMS_COUNT = 0;
const ROOMMATES_WAITING = 0;

export function MockRealEstateMapScreen({ onExit }: MockRealEstateMapScreenProps) {
  const insets = useSafeAreaInsets();
  const { padH } = useOnboardingCtaLayout();
  const [activeTab, setActiveTab] = useState<FooterTab>('rooms');

  return (
    <View style={styles.root}>
      <StatusBar style='dark' />

      {activeTab === 'rooms' ? (
        <>
          <View style={styles.mapLayer}>
            <View style={styles.mapFill}>
              <LinearGradient
                colors={['#DDE8F0', '#E4EDE5', '#E2E6EE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <LinearGradient
                colors={['rgba(47,109,246,0.1)', 'rgba(47,109,246,0)']}
                start={{ x: 0.15, y: 0.05 }}
                end={{ x: 0.85, y: 0.65 }}
                style={styles.waterBlob}
                pointerEvents='none'
              />
              <View style={[styles.block, { top: '10%', left: '6%', width: '24%', height: '15%' }]} />
              <View style={[styles.block, { top: '8%', left: '56%', width: '30%', height: '19%' }]} />
              <View style={[styles.block, { top: '36%', left: '4%', width: '32%', height: '13%' }]} />
              <View style={[styles.block, { top: '50%', left: '46%', width: '26%', height: '17%' }]} />
              <View style={[styles.block, { top: '66%', left: '14%', width: '22%', height: '12%' }]} />
              <View style={[styles.block, { top: '28%', left: '40%', width: '20%', height: '24%' }]} />
              <View style={[styles.roadH, { top: '46%', left: '-8%' }]} />
              <View style={[styles.roadV, { top: '2%', left: '50%' }]} />
              <View style={styles.roadDiag} />
              {PIN_POSITIONS.map((p, i) => (
                <View key={i} style={[styles.pinOuter, { top: p.top, left: p.left }]}>
                  <View style={styles.pinInner}>
                    <Ionicons name='location' size={18} color='#FFFFFF' />
                  </View>
                </View>
              ))}
            </View>

            {onExit ? (
              <Pressable
                accessibilityRole='button'
                accessibilityLabel='Exit preview'
                onPress={onExit}
                hitSlop={12}
                style={({ pressed }) => [
                  styles.exitFab,
                  { top: insets.top + space.sm, left: padH },
                  pressed && styles.exitFabPressed,
                ]}
              >
                <Ionicons name='close' size={20} color={ink} />
              </Pressable>
            ) : null}

            <View
              style={[
                styles.mapFloatStack,
                { top: insets.top + space.md, right: padH },
              ]}
            >
              <Pressable
                accessibilityRole='button'
                accessibilityLabel='Search and filters'
                style={({ pressed }) => [
                  styles.floatWhite,
                  pressed && styles.floatPressed,
                ]}
              >
                <Ionicons name='search-outline' size={22} color={ink} />
              </Pressable>
              <Pressable
                accessibilityRole='button'
                accessibilityLabel='Profile'
                style={({ pressed }) => [
                  styles.floatPrimary,
                  pressed && styles.floatPressed,
                ]}
              >
                <Ionicons name='person' size={22} color='#FFFFFF' />
              </Pressable>
            </View>
          </View>

          <View
            style={[
              styles.roomsSheet,
              {
                paddingHorizontal: padH,
                marginBottom: 0,
              },
            ]}
          >
            <View style={styles.sheetHandle} accessibilityLabel='Sheet handle' />
            <Text style={styles.roomsSheetTitle}>
              Over {ROOMS_COUNT} Rooms
            </Text>
            <Text style={styles.roomsSheetSub}>
              {ROOMMATES_WAITING} Roommates Waiting
            </Text>
          </View>
        </>
      ) : (
        <View
          style={[
            styles.tabPlaceholder,
            { paddingTop: insets.top + space.xxl, paddingHorizontal: padH },
          ]}
        >
          <Text style={styles.tabPlaceholderTitle}>
            {activeTab === 'match' ? 'Match' : 'Messages'}
          </Text>
          <Text style={styles.tabPlaceholderMeta}>
            Layout placeholder — design only.
          </Text>
        </View>
      )}

      <View
        style={[
          styles.tabBar,
          {
            paddingBottom: Math.max(insets.bottom, space.sm),
            paddingHorizontal: padH,
          },
        ]}
      >
        {FOOTER_TABS.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole='button'
              accessibilityLabel={tab.label}
              accessibilityState={{ selected }}
              onPress={() => setActiveTab(tab.id)}
              style={({ pressed }) => [
                styles.tabItem,
                pressed && styles.tabItemPressed,
              ]}
            >
              <Ionicons
                name={selected ? tab.iconActive : tab.icon}
                size={26}
                color={selected ? colors.primary : labelSecondary}
              />
              <Text
                style={[styles.tabLabel, selected && styles.tabLabelSelected]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const floatShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  android: { elevation: 6 },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapLayer: {
    flex: 1,
    width: '100%',
    minHeight: 200,
  },
  mapFill: {
    ...StyleSheet.absoluteFillObject,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  exitFab: {
    position: 'absolute',
    zIndex: 4,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...floatShadow,
  },
  exitFabPressed: { opacity: 0.85 },
  mapFloatStack: {
    position: 'absolute',
    zIndex: 3,
    gap: space.md,
    alignItems: 'center',
  },
  floatWhite: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...floatShadow,
  },
  floatPrimary: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...floatShadow,
  },
  floatPressed: { opacity: 0.88 },
  waterBlob: {
    position: 'absolute',
    width: '72%',
    height: '52%',
    top: '6%',
    right: '0%',
    borderTopLeftRadius: 120,
    borderBottomLeftRadius: 88,
  },
  block: {
    position: 'absolute',
    backgroundColor: mapBlock,
    borderRadius: radius.xs,
    opacity: 0.88,
  },
  roadH: {
    position: 'absolute',
    width: '130%',
    height: 5,
    backgroundColor: mapRoad,
    transform: [{ rotate: '-7deg' }],
  },
  roadV: {
    position: 'absolute',
    width: 5,
    height: '125%',
    top: '-8%',
    backgroundColor: mapRoad,
  },
  roadDiag: {
    position: 'absolute',
    width: '145%',
    height: 4,
    backgroundColor: mapRoad,
    top: '60%',
    left: '-24%',
    transform: [{ rotate: '50deg' }],
    opacity: 0.95,
  },
  pinOuter: {
    position: 'absolute',
    marginLeft: -18,
    marginTop: -28,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 6,
      },
      android: { elevation: 6 },
    }),
  },
  pinInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  roomsSheet: {
    marginTop: -20,
    paddingTop: space.sm + 2,
    paddingBottom: space.lg + 4,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radius.lg + 6,
    borderTopRightRadius: radius.lg + 6,
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 16 },
    }),
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    marginBottom: space.lg,
  },
  roomsSheetTitle: {
    fontSize: type.title,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.5,
    marginBottom: space.xs + 2,
  },
  roomsSheetSub: {
    fontSize: type.body,
    fontWeight: '400',
    color: ink,
    letterSpacing: -0.25,
    opacity: 0.85,
  },
  tabPlaceholder: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabPlaceholderTitle: {
    fontSize: type.title,
    fontWeight: '700',
    color: ink,
    marginBottom: space.sm,
  },
  tabPlaceholderMeta: {
    fontSize: type.body,
    color: labelSecondary,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    paddingTop: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(60,60,67,0.12)',
    backgroundColor: '#FFFFFF',
    zIndex: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 12 },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    gap: 4,
  },
  tabItemPressed: { opacity: 0.72 },
  tabLabel: {
    fontSize: type.micro,
    fontWeight: '600',
    color: labelSecondary,
    letterSpacing: -0.05,
  },
  tabLabelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
});
