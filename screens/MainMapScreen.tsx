import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboardingCtaLayout } from '../design/onboardingCtaLayout';
import { colors, radius, space, type } from '../design/theme';
import { useAuthLayout } from './auth/useAuthLayout';
import { MatchScreen } from './MatchScreen';
import { CreateListingScreen } from './CreateListingScreen';
import { CreateListingUnifiedScreen } from './CreateListingUnifiedScreen';
import { PersonalOnboardingScreenSeven } from './PersonalOnboardingScreenSeven';
import { ProfileMenuScreen } from './ProfileMenuScreen';
import { SavedListingsScreen } from './SavedListingsScreen';
import { YourListingsScreen } from './YourListingsScreen';

const ink = '#1C1C1E';
const labelSecondary = '#636366';
const mapBlock = '#D8DEE6';
const mapRoad = 'rgba(255,255,255,0.92)';

const PIN_POSITIONS = [
  { top: '26%' as const, left: '38%' as const },
  { top: '44%' as const, left: '62%' as const },
  { top: '58%' as const, left: '28%' as const },
  { top: '36%' as const, left: '72%' as const },
];

type FooterTab = 'rooms' | 'match' | 'messages';
type ProfileRoute =
  | 'menu'
  | 'listings'
  | 'savedListings'
  | 'lifestylePreferences'
  | 'createListing'
  | 'editListing';

export type MainMapScreenProps = {
  /** Return to welcome / auth (design preview). */
  onExit?: () => void;
};

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
const ROOMS_COUNT: number = 0;
const ROOMMATES_WAITING: number = 0;

/** Peek height: handle + stats (collapsed). */
const COLLAPSED_SHEET_H = 104;

const ORB_COLORS = ['#93C5FD', colors.primary, '#1D4ED8'] as const;

/**
 * Empty listings — soft orb pulse, drifting “lost pins,” playful copy.
 * Not a generic illustration; motion + typography only (no new assets).
 */
function NoListingsSurprise() {
  const breathe = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;
  const fadeStagger = useRef(
    [0, 1, 2, 3, 4].map(() => new Animated.Value(0.25)),
  ).current;

  useEffect(() => {
    const b = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    b.start();
    return () => b.stop();
  }, [breathe]);

  useEffect(() => {
    const d = Animated.loop(
      Animated.timing(drift, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    d.start();
    return () => d.stop();
  }, [drift]);

  useEffect(() => {
    const anims = fadeStagger.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 400),
          Animated.timing(v, {
            toValue: 1,
            duration: 900,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0.2,
            duration: 1100,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [fadeStagger]);

  const orbScale = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.08],
  });
  const orbOpacity = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [0.05, 0.1],
  });
  const driftRotate = drift.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={emptyStyles.wrap}>
      <View style={emptyStyles.stage}>
        <Animated.View
          style={[
            emptyStyles.orbRing,
            {
              opacity: orbOpacity,
              transform: [{ rotate: driftRotate }, { scale: orbScale }],
            },
          ]}
        >
          <LinearGradient
            colors={[...ORB_COLORS]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        {[0, 1, 2, 3, 4].map((i) => (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              top: 22 + (i % 3) * 28,
              left: 24 + i * 36,
              opacity: fadeStagger[i % fadeStagger.length],
            }}
          >
            <Ionicons
              name='location-outline'
              size={20}
              color={colors.primary}
              style={{ opacity: 0.35 + (i % 3) * 0.1 }}
            />
          </Animated.View>
        ))}
        <View style={emptyStyles.iconBadge}>
          <Ionicons name='planet-outline' size={28} color={colors.primary} />
        </View>
      </View>

      <Text style={emptyStyles.kicker}>All clear for now</Text>
      <Text style={emptyStyles.title}>
        No listings in this view — the map is taking a breath.
      </Text>
      <Text style={emptyStyles.body}>
        Pan the map or tweak filters; when rooms appear, they&apos;ll land here
        like pins finding home.
      </Text>
    </View>
  );
}

function ListingPlaceholderRow() {
  return (
    <View style={listRowStyles.row}>
      <LinearGradient
        colors={['#E8EEF8', '#F0F4FC']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={listRowStyles.thumb}
      />
      <View style={listRowStyles.meta}>
        <View style={listRowStyles.lineLg} />
        <View style={listRowStyles.lineSm} />
      </View>
    </View>
  );
}

export function MainMapScreen({ onExit }: MainMapScreenProps) {
  const insets = useSafeAreaInsets();
  const { height: windowH } = useWindowDimensions();
  const { padH, primaryButtonWidth } = useOnboardingCtaLayout();
  const { sheetCornerRadius } = useAuthLayout();
  const [activeTab, setActiveTab] = useState<FooterTab>('rooms');
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [profileRoute, setProfileRoute] = useState<ProfileRoute>('menu');
  const [tabBarH, setTabBarH] = useState(
    52 + space.sm + Math.max(insets.bottom, space.sm),
  );

  /** 0 = peek above tab bar, 1 = full-screen sheet (covers tab bar). */
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const currentSheetProgress = useRef(0);
  const gestureStartProgress = useRef(0);

  /** Drag distance ≈ full travel from peek strip to full-screen sheet. */
  const dragScale = useMemo(
    () => Math.max(1, windowH - COLLAPSED_SHEET_H),
    [windowH],
  );

  /** Bottom-anchored: height grows upward from the tab bar (no translateY slide). */
  const sheetHeight = useMemo(
    () =>
      sheetAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [COLLAPSED_SHEET_H, windowH],
      }),
    [sheetAnim, windowH],
  );
  const sheetBottom = useMemo(
    () =>
      sheetAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [tabBarH, 0],
      }),
    [sheetAnim, tabBarH],
  );

  useEffect(() => {
    const id = sheetAnim.addListener(({ value }) => {
      currentSheetProgress.current = value;
    });
    return () => sheetAnim.removeListener(id);
  }, [sheetAnim]);

  useEffect(() => {
    sheetAnim.setValue(0);
    currentSheetProgress.current = 0;
    setIsSheetExpanded(false);
  }, [windowH, tabBarH, sheetAnim]);

  const snapSheetAnimTo = useCallback(
    (to: 0 | 1) => {
      setIsSheetExpanded(to === 1);
      Animated.spring(sheetAnim, {
        toValue: to,
        useNativeDriver: false,
        friction: 9,
        tension: 68,
      }).start();
    },
    [sheetAnim],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dy) > 6 && Math.abs(g.dy) > Math.abs(g.dx) * 1.2,
        onPanResponderGrant: () => {
          gestureStartProgress.current = currentSheetProgress.current;
        },
        onPanResponderMove: (_, g) => {
          const next = Math.min(
            1,
            Math.max(0, gestureStartProgress.current - g.dy / dragScale),
          );
          sheetAnim.setValue(next);
        },
        onPanResponderRelease: (_, g) => {
          const t = Math.min(
            1,
            Math.max(0, gestureStartProgress.current - g.dy / dragScale),
          );
          const v = g.vy;
          let target: 0 | 1 = t > 0.45 ? 1 : 0;
          if (v < -0.6) target = 1;
          if (v > 0.6) target = 0;
          snapSheetAnimTo(target);
        },
      }),
    [dragScale, sheetAnim, snapSheetAnimTo],
  );

  const expandSheetFullScreen = () => {
    sheetAnim.stopAnimation((v) => {
      const t = typeof v === 'number' ? v : currentSheetProgress.current;
      snapSheetAnimTo(t < 0.92 ? 1 : 0);
    });
  };

  const hasListings = ROOMS_COUNT > 0;
  const mapCollapseButtonWidth = primaryButtonWidth * 0.6;

  if (profileMenuVisible) {
    if (profileRoute === 'createListing') {
      return (
        <CreateListingScreen onClose={() => setProfileRoute('listings')} />
      );
    }

    if (profileRoute === 'editListing') {
      return (
        <CreateListingUnifiedScreen onClose={() => setProfileRoute('listings')} />
      );
    }

    if (profileRoute === 'listings') {
      return (
        <YourListingsScreen
          onBack={() => setProfileRoute('menu')}
          onCreateListing={() => setProfileRoute('createListing')}
          onEditListing={() => setProfileRoute('editListing')}
        />
      );
    }

    if (profileRoute === 'savedListings') {
      return (
        <SavedListingsScreen onBack={() => setProfileRoute('menu')} />
      );
    }

    if (profileRoute === 'lifestylePreferences') {
      return (
        <PersonalOnboardingScreenSeven
          mode='profile'
          onBack={() => setProfileRoute('menu')}
          onComplete={() => setProfileRoute('menu')}
        />
      );
    }

    return (
      <ProfileMenuScreen
        insets={insets}
        padH={padH}
        onClose={() => {
          setProfileRoute('menu');
          setProfileMenuVisible(false);
        }}
        onOpenListings={() => setProfileRoute('listings')}
        onOpenSavedListings={() => setProfileRoute('savedListings')}
        onOpenLifestylePreferences={() =>
          setProfileRoute('lifestylePreferences')
        }
      />
    );
  }

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
              <View
                style={[
                  styles.block,
                  { top: '10%', left: '6%', width: '24%', height: '15%' },
                ]}
              />
              <View
                style={[
                  styles.block,
                  { top: '8%', left: '56%', width: '30%', height: '19%' },
                ]}
              />
              <View
                style={[
                  styles.block,
                  { top: '36%', left: '4%', width: '32%', height: '13%' },
                ]}
              />
              <View
                style={[
                  styles.block,
                  { top: '50%', left: '46%', width: '26%', height: '17%' },
                ]}
              />
              <View
                style={[
                  styles.block,
                  { top: '66%', left: '14%', width: '22%', height: '12%' },
                ]}
              />
              <View
                style={[
                  styles.block,
                  { top: '28%', left: '40%', width: '20%', height: '24%' },
                ]}
              />
              <View style={[styles.roadH, { top: '46%', left: '-8%' }]} />
              <View style={[styles.roadV, { top: '2%', left: '50%' }]} />
              <View style={styles.roadDiag} />
              {PIN_POSITIONS.map((p, i) => (
                <View
                  key={i}
                  style={[styles.pinOuter, { top: p.top, left: p.left }]}
                >
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
                onPress={() => {
                  setProfileRoute('menu');
                  setProfileMenuVisible(true);
                }}
                style={({ pressed }) => [
                  styles.floatPrimary,
                  pressed && styles.floatPressed,
                ]}
              >
                <Ionicons name='person' size={22} color='#FFFFFF' />
              </Pressable>
            </View>
          </View>

          <Animated.View
            pointerEvents='auto'
            style={[
              styles.roomsSheetShell,
              {
                height: sheetHeight,
                bottom: sheetBottom,
                borderTopLeftRadius: sheetCornerRadius,
                borderTopRightRadius: sheetCornerRadius,
              },
            ]}
          >
            <View style={styles.roomsSheetInner}>
              <ScrollView
                style={styles.listingsScrollFill}
                contentContainerStyle={[
                  styles.listingsScrollContent,
                  {
                    paddingHorizontal: padH,
                    paddingTop: insets.top + space.lg,
                    paddingBottom: space.xl,
                    ...(!hasListings
                      ? { flexGrow: 1, justifyContent: 'center' as const }
                      : {}),
                  },
                ]}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'
                bounces
              >
                {hasListings ? (
                  <>
                    {Array.from(
                      { length: Math.min(ROOMS_COUNT, 8) },
                      (_, i) => (
                        <ListingPlaceholderRow key={i} />
                      ),
                    )}
                  </>
                ) : (
                  <NoListingsSurprise />
                )}
              </ScrollView>

              <View
                {...panResponder.panHandlers}
                style={[
                  styles.sheetGrabBlock,
                  { paddingHorizontal: padH, minHeight: COLLAPSED_SHEET_H },
                ]}
              >
                <Pressable
                  accessibilityRole='button'
                  accessibilityLabel='Tap to expand or collapse listings'
                  onPress={expandSheetFullScreen}
                  style={({ pressed }) => [
                    styles.sheetGrabBlockPressable,
                    pressed && styles.sheetGrabBlockPressablePressed,
                  ]}
                >
                  <View style={styles.sheetHandleHit}>
                    <View
                      style={styles.sheetHandle}
                      accessibilityLabel='Sheet handle'
                    />
                  </View>
                  <Text style={styles.roomsSheetLineTitle}>
                    Over {ROOMS_COUNT} Rooms
                  </Text>
                  <Text style={styles.roomsSheetLineSub}>
                    {ROOMMATES_WAITING}{' '}
                    {ROOMMATES_WAITING === 1 ? 'Roommate' : 'Roommates'} Waiting
                  </Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>

          {isSheetExpanded ? (
            <Pressable
              accessibilityRole='button'
              accessibilityLabel='Collapse listings and return to map'
              onPress={() => snapSheetAnimTo(0)}
              style={({ pressed }) => [
                styles.mapCollapseButton,
                {
                  bottom: tabBarH + space.md,
                  width: mapCollapseButtonWidth,
                  marginLeft: -mapCollapseButtonWidth / 2,
                },
                pressed && styles.mapCollapseButtonPressed,
              ]}
            >
              <LinearGradient
                colors={['#7BA6FF', colors.primary]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.mapCollapseButtonGradient}
              >
                <Ionicons name='map-outline' size={20} color='#FFFFFF' />
                <Text style={styles.mapCollapseButtonText}>Map</Text>
              </LinearGradient>
            </Pressable>
          ) : null}
        </>
      ) : activeTab === 'match' ? (
        <View style={styles.matchTab}>
          <MatchScreen
            padH={padH}
            bottomChromeH={tabBarH}
            onOpenProfile={() => {
              setProfileRoute('menu');
              setProfileMenuVisible(true);
            }}
          />
        </View>
      ) : (
        <View
          style={[
            styles.tabPlaceholder,
            { paddingTop: insets.top + space.xxl, paddingHorizontal: padH },
          ]}
        >
          <Text style={styles.tabPlaceholderTitle}>Messages</Text>
          <Text style={styles.tabPlaceholderMeta}>
            Layout placeholder — design only.
          </Text>
        </View>
      )}

      <View
        onLayout={(e) => setTabBarH(e.nativeEvent.layout.height)}
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

const emptyStyles = StyleSheet.create({
  wrap: {
    paddingTop: space.md,
    paddingBottom: space.xxl,
    alignItems: 'center',
  },
  stage: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  orbRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    opacity: 0.8,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(47,109,246,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(47,109,246,0.2)',
  },
  kicker: {
    fontSize: type.caption,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: space.sm,
  },
  title: {
    fontSize: type.title,
    fontWeight: '700',
    color: ink,
    textAlign: 'center',
    letterSpacing: -0.45,
    lineHeight: 26,
    marginBottom: space.md,
    maxWidth: 320,
  },
  body: {
    fontSize: type.body,
    fontWeight: '400',
    color: labelSecondary,
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: -0.2,
    maxWidth: 300,
  },
});

const listRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space.md,
    marginBottom: space.lg,
    alignItems: 'center',
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
  },
  meta: {
    flex: 1,
    gap: space.sm,
  },
  lineLg: {
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    width: '88%',
  },
  lineSm: {
    height: 12,
    borderRadius: 4,
    backgroundColor: '#EEF2F6',
    width: '55%',
  },
});

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
  matchTab: {
    flex: 1,
    minHeight: 0,
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
  roomsSheetShell: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 5,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  roomsSheetInner: {
    flex: 1,
    overflow: 'hidden',
  },
  /** Fills space above the fixed-height peek strip (grab + stats). */
  listingsScrollFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: COLLAPSED_SHEET_H,
  },
  listingsScrollContent: {
    flexGrow: 1,
  },
  sheetGrabBlock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: space.sm + 2,
    paddingBottom: space.sm,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(60,60,67,0.06)',
    zIndex: 2,
  },
  /** Full-width tap target: handle + stats (peek strip). */
  sheetGrabBlockPressable: {
    width: '100%',
    alignItems: 'center',
  },
  sheetGrabBlockPressablePressed: {
    opacity: 0.92,
  },
  sheetHandleHit: {
    paddingVertical: space.sm,
    paddingHorizontal: space.xxl,
    marginBottom: space.xs,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  roomsSheetLineTitle: {
    width: '100%',
    textAlign: 'center',
    fontSize: type.body,
    lineHeight: Math.round(type.body * 1.2),
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.28,
    marginBottom: 2,
  },
  roomsSheetLineSub: {
    width: '100%',
    textAlign: 'center',
    fontSize: type.body,
    lineHeight: Math.round(type.body * 1.15),
    fontWeight: '400',
    color: labelSecondary,
    letterSpacing: -0.2,
  },
  mapCollapseButton: {
    position: 'absolute',
    zIndex: 30,
    left: '50%',
    borderRadius: radius.pill,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  mapCollapseButtonGradient: {
    minHeight: 48,
    paddingVertical: 13,
    paddingHorizontal: space.xxl,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
  },
  mapCollapseButtonPressed: {
    opacity: 0.88,
  },
  mapCollapseButtonText: {
    fontSize: type.bodyLarge,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.25,
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
    zIndex: 20,
    ...Platform.select({
      ios: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      android: { elevation: 16 },
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
