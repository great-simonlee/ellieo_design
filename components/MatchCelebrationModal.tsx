import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, gradientPrimaryHorizontal, radius, space, type } from '../design/theme';
import type { RoommateProfile } from './RoommateProfileDetail';

const ink = '#1C1C1E';
const muted = '#687084';
const white = '#FFFFFF';

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

type MatchCelebrationModalProps = {
  profile: RoommateProfile | null;
  onClose: () => void;
  /**
   * `embedded` — overlay inside an existing Modal (Full profile).
   * `modal` — standalone RN Modal (Match deck Say hi).
   */
  presentation?: 'modal' | 'embedded';
};

/** Bottom sheet — “You & {name}” match confirmation (Match screen). */
export function MatchCelebrationModal({
  profile,
  onClose,
  presentation = 'modal',
}: MatchCelebrationModalProps) {
  const visible = profile !== null;
  const insets = useSafeAreaInsets();
  const { height: windowH } = useWindowDimensions();
  const embedded = presentation === 'embedded';

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

  if (!visible) return null;

  const sheet = (
    <View
      style={[styles.matchModalRoot, embedded && styles.matchModalRootEmbedded]}
      accessibilityViewIsModal={embedded}
    >
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

                <Text style={styles.matchSheetTitle}>You & {profile.name}</Text>
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
  );

  if (embedded) {
    return sheet;
  }

  return (
    <Modal
      animationType='none'
      transparent
      visible
      onRequestClose={runClose}
    >
      {sheet}
    </Modal>
  );
}

const styles = StyleSheet.create({
  matchModalRoot: {
    flex: 1,
  },
  matchModalRootEmbedded: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    elevation: 200,
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
