import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ListingProgressBlock } from '../../components/ListingProgressBlock';
import { OnboardingNavHeader } from '../../components/OnboardingNavHeader';
import { useOnboardingCtaLayout } from '../../design/onboardingCtaLayout';
import { colors, radius, space, type } from '../../design/theme';
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
  /** Omit nav, progress bar, footer; parent ScrollView supplies scroll. */
  embedInUnifiedList?: boolean;
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
  embedInUnifiedList = false,
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

  const canContinue = Boolean(entireUnitFilled);

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

  const listingLayoutsForm = (
        <View style={[styles.contentNarrow, { maxWidth: contentMaxW }]}>
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
                Room layouts <Text style={styles.optionalHint}>(Optional)</Text>
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
                            pressed && styles.navPressed,
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
  );

  if (embedInUnifiedList) {
    return (
      <ScrollView
        scrollEnabled={false}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: pageBg }}
        contentContainerStyle={{
          paddingTop: space.lg,
          paddingBottom: space.xxl,
          paddingHorizontal: padH,
        }}
      >
        {listingLayoutsForm}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style='dark' />
      <OnboardingNavHeader padH={padH} onBack={onBack} onClose={onClose} />

      <ListingProgressBlock
        padH={padH}
        step={STEP_LAYOUTS}
        title='Layouts'
        progressRatio={progressFraction}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={{
          paddingTop: space.sm,
          paddingBottom: insets.bottom + BOTTOM_CTA_SCROLL_CLEARANCE,
          paddingHorizontal: padH,
        }}
        showsVerticalScrollIndicator={false}
      >
        {listingLayoutsForm}
      </ScrollView>

      <View
        pointerEvents='box-none'
        style={[styles.bottomDock, { paddingBottom: insets.bottom + space.md }]}
      >
        <LinearGradient
          pointerEvents='none'
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.98)']}
          style={StyleSheet.absoluteFill}
        />
        <CreateListingPrimaryCta
          key={canContinue ? 'continue-on' : 'continue-off'}
          label='Continue'
          disabled={!canContinue}
          onPress={() => {
            if (canContinue) onContinue();
          }}
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
  flex: {
    flex: 1,
  },
  navPressed: {
    opacity: 0.55,
  },
  contentNarrow: {
    width: '100%',
    alignSelf: 'center',
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
  optionalHint: {
    textTransform: 'none',
    fontWeight: '500',
    color: captionMuted,
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
