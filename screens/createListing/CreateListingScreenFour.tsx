import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboardingCtaLayout } from '../../design/onboardingCtaLayout';
import { colors, gradientPrimaryHorizontal, radius, space, type } from '../../design/theme';
import { CreateListingPrimaryCta } from './CreateListingPrimaryCta';
import {
  BOTTOM_CTA_SCROLL_CLEARANCE,
  captionMuted,
  fieldBorder,
  fieldFill,
  ink,
  labelSecondary,
  LISTING_TOTAL_STEPS,
  pageBg,
  progressTrackBg,
  required,
  STEP_LAYOUTS,
  white,
} from './createListingTokens';
import type { ListingStep3Snapshot } from './createListingTypes';

export type CreateListingScreenFourProps = {
  step3: ListingStep3Snapshot;
  onClose: () => void;
  onBack: () => void;
  onContinue: () => void;
};

/** Room-type rows from step 3 that need their own layout tile (Entire Unit uses the default hero slot). */
function roomRowsForLayoutTiles(rooms: ListingStep3Snapshot['rooms']) {
  return rooms.filter((r) => {
    const k = r.kind.trim();
    return k.length > 0 && k !== 'Entire Unit';
  });
}

export function CreateListingScreenFour({
  step3,
  onClose,
  onBack,
  onContinue,
}: CreateListingScreenFourProps) {
  const insets = useSafeAreaInsets();
  const { padH, contentMaxW, primaryButtonWidth } = useOnboardingCtaLayout();
  const innerW = contentMaxW;

  const fromStep3 = useMemo(() => roomRowsForLayoutTiles(step3.rooms), [step3.rooms]);

  const [dismissedRowIds, setDismissedRowIds] = useState<string[]>([]);
  const [entireUnitFilled, setEntireUnitFilled] = useState(false);
  const [layoutFilledByRowId, setLayoutFilledByRowId] = useState<Record<string, boolean>>({});

  const visibleRoomLayouts = useMemo(
    () => fromStep3.filter((r) => !dismissedRowIds.includes(r.id)),
    [fromStep3, dismissedRowIds],
  );

  const stepValid = useMemo(() => {
    if (!entireUnitFilled) return false;
    return visibleRoomLayouts.every((r) => layoutFilledByRowId[r.id] === true);
  }, [entireUnitFilled, visibleRoomLayouts, layoutFilledByRowId]);

  const progressFraction = STEP_LAYOUTS / LISTING_TOTAL_STEPS;

  const roomTileGap = space.md;
  const roomTileWidth = Math.max(120, Math.floor((innerW - roomTileGap) / 2));

  const toggleEntireUnit = () => setEntireUnitFilled((v) => !v);
  const toggleRoomLayout = (rowId: string) =>
    setLayoutFilledByRowId((prev) => ({ ...prev, [rowId]: !prev[rowId] }));

  const dismissRoomLayout = (rowId: string) => {
    setDismissedRowIds((prev) => (prev.includes(rowId) ? prev : [...prev, rowId]));
    setLayoutFilledByRowId((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar style='dark' />
      <View
        style={[
          styles.headerBar,
          {
            paddingTop: insets.top + space.md,
            paddingHorizontal: padH,
          },
        ]}
      >
        <View style={styles.headerRow}>
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
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Close'
            hitSlop={10}
            onPress={onClose}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.headerButtonPressed,
            ]}
          >
            <Ionicons name='close' size={22} color={ink} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: space.sm,
          paddingBottom: insets.bottom + BOTTOM_CTA_SCROLL_CLEARANCE,
          paddingHorizontal: padH,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentNarrow, { maxWidth: contentMaxW }]}>
          <View style={[styles.progressBlock, { width: innerW, alignSelf: 'center' }]}>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={gradientPrimaryHorizontal}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[
                  styles.progressFill,
                  { width: `${Math.min(100, progressFraction * 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressCaption}>
              {`Step ${STEP_LAYOUTS} of ${LISTING_TOTAL_STEPS} · Layouts`}
            </Text>
          </View>

          <Text style={[styles.sectionLabel, { width: innerW, alignSelf: 'center' }]}>
            Entire Unit <Text style={styles.asterisk}>*</Text>
          </Text>
          <Pressable
            accessibilityRole='button'
            accessibilityState={{ selected: entireUnitFilled }}
            accessibilityLabel='Add entire unit layout'
            onPress={toggleEntireUnit}
            style={({ pressed }) => [
              styles.entireUnitSlot,
              { width: innerW, alignSelf: 'center' },
              entireUnitFilled && styles.layoutSlotFilled,
              pressed && styles.layoutSlotPressed,
            ]}
          >
            {entireUnitFilled ? (
              <View style={styles.filledBadge}>
                <Ionicons name='checkmark-circle' size={28} color={colors.primary} />
              </View>
            ) : (
              <>
                <Ionicons name='image-outline' size={40} color={captionMuted} />
                <View style={styles.addGlyph}>
                  <Ionicons name='add' size={14} color={white} />
                </View>
              </>
            )}
          </Pressable>

          {visibleRoomLayouts.length > 0 ? (
            <>
              <Text
                style={[
                  styles.sectionLabel,
                  { width: innerW, alignSelf: 'center', marginTop: space.xl },
                ]}
              >
                Room layouts
              </Text>
              <View
                style={[
                  styles.roomGrid,
                  { width: innerW, alignSelf: 'center', gap: roomTileGap },
                ]}
              >
                {visibleRoomLayouts.map((row) => {
                  const filled = layoutFilledByRowId[row.id] === true;
                  return (
                    <View key={row.id} style={[styles.roomGridCell, { width: roomTileWidth }]}>
                      <View style={styles.roomGridHeader}>
                        <Text style={styles.roomGridLabel} numberOfLines={1}>
                          {row.kind.trim()}
                        </Text>
                        <Pressable
                          accessibilityRole='button'
                          accessibilityLabel={`Remove ${row.kind} layout`}
                          hitSlop={8}
                          onPress={() => dismissRoomLayout(row.id)}
                          style={({ pressed }) => [
                            styles.miniDismiss,
                            pressed && styles.headerButtonPressed,
                          ]}
                        >
                          <Ionicons name='remove' size={18} color={ink} />
                        </Pressable>
                      </View>
                      <Pressable
                        accessibilityRole='button'
                        accessibilityState={{ selected: filled }}
                        accessibilityLabel={`Add layout for ${row.kind}`}
                        onPress={() => toggleRoomLayout(row.id)}
                        style={({ pressed }) => [
                          styles.roomThumbSlot,
                          filled && styles.layoutSlotFilled,
                          pressed && styles.layoutSlotPressed,
                        ]}
                      >
                        {filled ? (
                          <Ionicons name='checkmark-circle' size={26} color={colors.primary} />
                        ) : (
                          <>
                            <Ionicons name='image-outline' size={32} color={captionMuted} />
                            <View style={styles.addGlyphSmall}>
                              <Ionicons name='add' size={12} color={white} />
                            </View>
                          </>
                        )}
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>

      <View
        pointerEvents='box-none'
        style={[styles.bottomDock, { paddingBottom: insets.bottom + space.md }]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.98)']}
          style={StyleSheet.absoluteFill}
        />
        <CreateListingPrimaryCta
          label='Continue'
          disabled={!stepValid}
          onPress={onContinue}
          width={primaryButtonWidth}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: pageBg,
  },
  headerBar: {
    backgroundColor: pageBg,
    zIndex: 2,
  },
  headerRow: {
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
  contentNarrow: {
    width: '100%',
    alignSelf: 'center',
  },
  progressBlock: {
    marginBottom: space.lg,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: progressTrackBg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressCaption: {
    marginTop: space.sm,
    fontSize: type.caption,
    fontWeight: '600',
    color: captionMuted,
    letterSpacing: -0.1,
  },
  sectionLabel: {
    fontSize: type.caption,
    fontWeight: '600',
    color: labelSecondary,
    letterSpacing: -0.1,
    marginBottom: space.sm,
    textTransform: 'uppercase',
  },
  asterisk: {
    color: required,
    fontWeight: '600',
  },
  entireUnitSlot: {
    aspectRatio: 4 / 3,
    borderRadius: radius.md,
    backgroundColor: fieldFill,
    borderWidth: 1,
    borderColor: fieldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  layoutSlotFilled: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(47, 109, 246, 0.06)',
  },
  layoutSlotPressed: {
    opacity: 0.92,
  },
  addGlyph: {
    position: 'absolute',
    bottom: space.md,
    right: space.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addGlyphSmall: {
    position: 'absolute',
    bottom: space.sm,
    right: space.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roomGridCell: {
    minWidth: 0,
  },
  roomGridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.sm,
    gap: space.xs,
  },
  roomGridLabel: {
    flex: 1,
    fontSize: type.body,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.2,
    minWidth: 0,
  },
  miniDismiss: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: fieldBorder,
    backgroundColor: white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomThumbSlot: {
    aspectRatio: 1,
    borderRadius: radius.sm + 2,
    backgroundColor: fieldFill,
    borderWidth: 1,
    borderColor: fieldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bottomDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingTop: space.xl,
  },
});
