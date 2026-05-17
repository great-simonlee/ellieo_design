import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { colors, gradientPrimaryHorizontal, radius, space, type } from '../design/theme';
import { LifestyleProfileReadout } from './LifestyleProfileReadout';

const ink = '#1C1C1E';
const labelSecondary = '#636366';
const white = '#FFFFFF';

type ReviewRow = {
  id: string;
  label: string;
  value?: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  multiline?: boolean;
  lifestyleTags?: string[];
};

/** Design-only — mirrors Match full-profile lifestyle tags. */
const REVIEW_LIFESTYLE_TAGS = [
  'Early bird',
  'Very tidy',
  'Rarely hosts',
  'Introvert',
];
const REVIEW_PROFILE_ID = 'current-user';

const REVIEW_ROWS: ReviewRow[] = [
  { id: 'gender', label: 'My gender', value: 'She / her', icon: 'person-outline' },
  { id: 'budget', label: 'Budget', value: '$1,850 / mo', icon: 'wallet-outline' },
  {
    id: 'moveIn',
    label: 'Move-in date',
    value: 'Early Aug 2026',
    icon: 'calendar-outline',
  },
  {
    id: 'prefGender',
    label: 'Preferred roommate gender',
    value: 'Female roommate only',
    icon: 'people-outline',
  },
  {
    id: 'prefStatus',
    label: 'Preferred status',
    value: 'Student preferred',
    icon: 'school-outline',
  },
  {
    id: 'prefRoom',
    label: 'Preferred room',
    value: 'Master bedroom preferred',
    icon: 'bed-outline',
  },
  {
    id: 'prefLoc',
    label: 'Preferred locations',
    value: 'East Village, Gramercy',
    icon: 'location-outline',
  },
  {
    id: 'intro',
    label: 'Brief introduction',
    value:
      'Quiet weekdays, gallery walks on weekends, and early-morning coffee runs.',
    icon: 'document-text-outline',
    multiline: true,
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    icon: 'heart-outline',
    lifestyleTags: REVIEW_LIFESTYLE_TAGS,
  },
];

type RoommateLookingReviewModalProps = {
  visible: boolean;
  padH: number;
  bottomInset: number;
  onKeep: () => void;
  onUpdate: () => void;
};

/** Review sheet when re-enabling Match — backdrop + motion match `MatchCelebrationModal`. */
export function RoommateLookingReviewModal({
  visible,
  padH,
  bottomInset,
  onKeep,
  onUpdate,
}: RoommateLookingReviewModalProps) {
  const { height: windowH } = useWindowDimensions();
  const listMaxH = Math.min(320, Math.round(windowH * 0.38));

  const sheetTravel = useMemo(
    () => Math.min(560, Math.round(windowH * 0.52)),
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

  const runKeep = useCallback(() => {
    dismissAnimated(onKeep);
  }, [dismissAnimated, onKeep]);

  const runUpdate = useCallback(() => {
    dismissAnimated(onUpdate);
  }, [dismissAnimated, onUpdate]);

  useEffect(() => {
    if (!visible) return;
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
  }, [visible, backdropOpacity, sheetTranslateY, sheetTravel]);

  if (!visible) return null;

  return (
    <Modal
      animationType='none'
      transparent
      visible
      onRequestClose={() => {}}
    >
      <View style={styles.root}>
        <Animated.View
          pointerEvents='box-none'
          style={[StyleSheet.absoluteFillObject, { opacity: backdropOpacity }]}
        >
          <View style={StyleSheet.absoluteFill} pointerEvents='none'>
            <BlurView intensity={48} tint='dark' style={StyleSheet.absoluteFill} />
            <View style={styles.dim} />
          </View>
        </Animated.View>

        <View style={styles.sheetStage} pointerEvents='box-none'>
          <Animated.View
            accessibilityViewIsModal
            style={[
              styles.sheet,
              {
                paddingHorizontal: padH,
                paddingBottom: Math.max(bottomInset, space.md),
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons name='clipboard-outline' size={22} color={colors.primary} />
              </View>
              <View style={styles.headerCopy}>
                <Text style={styles.title} accessibilityRole='header'>
                  Review your roommate info
                </Text>
                <Text style={styles.subtitle}>
                  You&apos;re back on Match — confirm everything still looks right.
                </Text>
              </View>
            </View>

            <ScrollView
              style={[styles.list, { maxHeight: listMaxH }]}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.groupCard}>
                {REVIEW_ROWS.map((row, index) => {
                  const isLast = index === REVIEW_ROWS.length - 1;
                  const isLifestyle = row.id === 'lifestyle';

                  return (
                    <View key={row.id}>
                      {isLifestyle ? (
                        <View style={styles.lifestyleRow}>
                          <View style={styles.lifestyleRowHeader}>
                            <Ionicons
                              name={row.icon}
                              size={18}
                              color={colors.primary}
                              style={styles.rowIcon}
                            />
                            <Text style={styles.rowLabel}>{row.label}</Text>
                          </View>
                          <LifestyleProfileReadout
                            tags={row.lifestyleTags ?? REVIEW_LIFESTYLE_TAGS}
                            profileId={REVIEW_PROFILE_ID}
                          />
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.dataRow,
                            row.multiline && styles.dataRowStacked,
                          ]}
                        >
                          <View style={styles.dataRowLead}>
                            <Ionicons
                              name={row.icon}
                              size={18}
                              color={colors.primary}
                              style={styles.rowIcon}
                            />
                            <Text style={styles.rowLabel}>{row.label}</Text>
                          </View>
                          <Text
                            style={[
                              styles.rowValue,
                              row.multiline && styles.rowValueStacked,
                            ]}
                            numberOfLines={row.multiline ? 4 : 2}
                          >
                            {row.value}
                          </Text>
                        </View>
                      )}
                      {!isLast ? <View style={styles.rowDivider} /> : null}
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <Pressable
                accessibilityRole='button'
                accessibilityLabel='Keep current information'
                onPress={runKeep}
                style={({ pressed }) => [
                  styles.secondaryBtn,
                  pressed && styles.btnPressed,
                ]}
              >
                <Text style={styles.secondaryBtnText}>Looks good</Text>
              </Pressable>

              <Pressable
                accessibilityRole='button'
                accessibilityLabel='Update roommate information'
                onPress={runUpdate}
                style={({ pressed }) => [
                  styles.primaryShell,
                  pressed && styles.btnPressed,
                ]}
              >
                <LinearGradient
                  colors={gradientPrimaryHorizontal}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.primaryBtn}
                >
                  <Text style={styles.primaryBtnText}>Update information</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
  },
  sheetStage: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    maxHeight: '88%',
    backgroundColor: '#F8F8FA',
    borderTopLeftRadius: radius.xl + 4,
    borderTopRightRadius: radius.xl + 4,
    paddingTop: space.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#1E3A5F',
        shadowOffset: { width: 0, height: -12 },
        shadowOpacity: 0.18,
        shadowRadius: 28,
      },
      android: { elevation: 24 },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    marginBottom: space.lg,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: white,
    borderWidth: 1,
    borderColor: 'rgba(47,109,246,0.12)',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },
  title: {
    fontSize: type.title,
    lineHeight: 26,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 4,
    fontSize: type.body,
    lineHeight: 22,
    fontWeight: '400',
    color: labelSecondary,
    letterSpacing: -0.15,
  },
  list: {
    marginBottom: space.lg,
  },
  listContent: {
    paddingBottom: space.xs,
  },
  groupCard: {
    backgroundColor: white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.08)',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 14,
      },
      android: { elevation: 2 },
    }),
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    minHeight: 52,
  },
  dataRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: space.sm,
  },
  lifestyleRow: {
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    gap: space.md,
  },
  lifestyleRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataRowLead: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    maxWidth: '46%',
  },
  rowIcon: {
    marginRight: space.sm,
  },
  rowLabel: {
    flex: 1,
    fontSize: type.caption,
    lineHeight: 18,
    fontWeight: '600',
    color: labelSecondary,
    letterSpacing: -0.08,
  },
  rowValue: {
    flex: 1,
    fontSize: type.body,
    lineHeight: 21,
    fontWeight: '600',
    color: ink,
    letterSpacing: -0.12,
    textAlign: 'right',
  },
  rowValueStacked: {
    textAlign: 'left',
    paddingLeft: 26,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(60,60,67,0.1)',
    marginLeft: space.md,
  },
  footer: {
    gap: space.sm,
    paddingTop: space.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(60,60,67,0.1)',
  },
  secondaryBtn: {
    minHeight: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: white,
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.1)',
  },
  secondaryBtnText: {
    fontSize: type.body,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.12,
  },
  primaryShell: {
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  primaryBtn: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: type.bodyLarge,
    fontWeight: '800',
    color: white,
    letterSpacing: -0.2,
  },
  btnPressed: {
    opacity: 0.9,
  },
});
