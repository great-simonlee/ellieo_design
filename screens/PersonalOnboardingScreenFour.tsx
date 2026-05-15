import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { OnboardingProgressBlock } from '../components/OnboardingProgressBlock';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  type LayoutChangeEvent,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OnboardingBottomCta } from '../components/OnboardingBottomCta';
import { useOnboardingCtaLayout } from '../design/onboardingCtaLayout';
import { colors, radius, space, type } from '../design/theme';

const ink = '#1C1C1E';
const labelSecondary = '#636366';
const captionMuted = '#8E8E93';
const danger = '#FF3B30';
/** Matches text fields on other onboarding steps */
const fieldFill = '#F2F2F7';
const fieldBorder = 'rgba(60, 60, 67, 0.12)';
const selectedChoiceBg = 'rgba(47, 109, 246, 0.07)';
const selectedChoiceBorder = 'rgba(47, 109, 246, 0.45)';
/** Photo grid: 2 rows × 3 columns (left → right, top → bottom). */
const GRID_COLS = 3;
const GRID_ROWS = 2;
const SLOT_COUNT = GRID_COLS * GRID_ROWS;
const MIN_PHOTOS = 2;
const SLOT_GAP = space.md;
const ASPECT_H_PER_W = 4 / 3;

type SlotRect = { x: number; y: number; width: number; height: number };

type DragSession = {
  index: number;
  uri: string;
  frame: SlotRect;
};

function hitSlotIndex(px: number, py: number, rects: (SlotRect | null)[]) {
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i];
    if (!r) continue;
    if (
      px >= r.x &&
      px <= r.x + r.width &&
      py >= r.y &&
      py <= r.y + r.height
    ) {
      return i;
    }
  }
  return null;
}

/** Empty slots starting at `start`, then wrapping (matches tap-to-fill UX). */
function orderedEmptySlotIndices(
  slotValues: (string | null)[],
  start: number,
): number[] {
  const out: number[] = [];
  for (let i = start; i < SLOT_COUNT; i++) {
    if (slotValues[i] == null) out.push(i);
  }
  for (let i = 0; i < start; i++) {
    if (slotValues[i] == null) out.push(i);
  }
  return out;
}

function applyReorder(
  slots: (string | null)[],
  from: number,
  to: number,
): (string | null)[] {
  if (from === to) return slots;
  const next = [...slots];
  const v = next[from];
  if (v == null) return slots;
  if (next[to] == null) {
    next[from] = null;
    next[to] = v;
  } else {
    const t = next[to];
    next[to] = v;
    next[from] = t;
  }
  return next;
}

/** Pack photos to indices 0..n-1 with no gaps (profile stays first). */
function compactSlots(values: (string | null)[]): (string | null)[] {
  const ordered: string[] = [];
  for (let i = 0; i < SLOT_COUNT; i++) {
    if (values[i] != null) ordered.push(values[i]!);
  }
  const next: (string | null)[] = Array(SLOT_COUNT).fill(null);
  for (let k = 0; k < ordered.length; k++) next[k] = ordered[k];
  return next;
}

type PersonalOnboardingScreenFourProps = {
  onBack: () => void;
  onSkip?: () => void;
  onContinue?: () => void;
};

export function PersonalOnboardingScreenFour({
  onBack,
  onSkip,
  onContinue,
}: PersonalOnboardingScreenFourProps) {
  const insets = useSafeAreaInsets();
  const { height: windowH } = useWindowDimensions();
  const { padH, contentMaxW, primaryButtonWidth } = useOnboardingCtaLayout();

  const ONBOARDING_TOTAL_STEPS = 6;
  const onboardingStepNumber = 3;
  const progressRatio = 3 / 6;

  const [slots, setSlots] = useState<(string | null)[]>(() =>
    Array(SLOT_COUNT).fill(null),
  );
  const [drag, setDrag] = useState<DragSession | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const panMove = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const dragScale = useRef(new Animated.Value(1)).current;

  const slotWindows = useRef<(SlotRect | null)[]>(
    Array(SLOT_COUNT).fill(null),
  );
  const slotRefs = useRef<Array<View | null>>(Array(SLOT_COUNT).fill(null));

  const refreshSlotWindow = useCallback((index: number) => {
    const node = slotRefs.current[index];
    if (!node) return;
    requestAnimationFrame(() => {
      node.measureInWindow((x, y, width, height) => {
        slotWindows.current[index] = { x, y, width, height };
      });
    });
  }, []);

  const onSlotLayout = useCallback(
    (index: number) => (_e: LayoutChangeEvent) => {
      refreshSlotWindow(index);
    },
    [refreshSlotWindow],
  );

  const filledCount = useMemo(
    () => slots.filter((u) => u != null).length,
    [slots],
  );
  const canContinue = filledCount >= MIN_PHOTOS;
  const uniqueUris = useMemo(
    () => new Set(slots.filter((u): u is string => u != null)),
    [slots],
  );
  const hasDuplicatePhotos =
    filledCount >= 2 && uniqueUris.size < filledCount;

  const showValidationError =
    !canContinue || hasDuplicatePhotos;

  /** Fit 2×3 grid + shell padding on one screen (no scroll). */
  const { cellW, cellH } = useMemo(() => {
    const headerNavBlock = 44;
    const progressBlockReserve = 52;
    /** Title + bullet intro (matches Three title/subtitle scale; bullets can wrap). */
    const titleSubtitleBlock = 140;
    const hintBlock = 44;
    const errorBlock = showValidationError ? 52 : 0;
    const dockBlock = 56 + space.sm * 2 + insets.bottom + 6;
    const verticalMargin = space.sm + space.xs;
    const shellVPadding = space.md * 2;

    const availableForShell =
      windowH -
      insets.top -
      headerNavBlock -
      progressBlockReserve -
      titleSubtitleBlock -
      hintBlock -
      errorBlock -
      dockBlock -
      verticalMargin;

    const innerGridW = contentMaxW - shellVPadding;
    const maxCellW =
      (innerGridW - SLOT_GAP * (GRID_COLS - 1)) / GRID_COLS;
    const maxCellH =
      (Math.max(120, availableForShell) -
        SLOT_GAP * (GRID_ROWS - 1) -
        shellVPadding) /
      GRID_ROWS;
    const maxCellWFromH = maxCellH / ASPECT_H_PER_W;
    const w = Math.min(maxCellW, maxCellWFromH);
    const cellWidth = Math.max(64, Math.floor(w * 100) / 100);
    const cellHeight = cellWidth * ASPECT_H_PER_W;
    return { cellW: cellWidth, cellH: cellHeight };
  }, [
    windowH,
    insets.top,
    insets.bottom,
    contentMaxW,
    showValidationError,
  ]);

  useEffect(() => {
    if (!drag) {
      panMove.setValue({ x: 0, y: 0 });
      dragScale.setValue(1);
      return;
    }
    Animated.spring(dragScale, {
      toValue: 1.05,
      friction: 7,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [drag, dragScale, panMove]);

  const endDrag = useCallback(
    (dx: number, dy: number) => {
      if (!drag) return;
      const cx = drag.frame.x + drag.frame.width / 2 + dx;
      const cy = drag.frame.y + drag.frame.height / 2 + dy;
      const target = hitSlotIndex(cx, cy, slotWindows.current);
      if (target != null && target !== drag.index) {
        setSlots((prev) => compactSlots(applyReorder(prev, drag.index, target)));
      }
      setDropTargetIndex(null);
      setDrag(null);
      panMove.setValue({ x: 0, y: 0 });
    },
    [drag, panMove],
  );

  const panResponder = useMemo(() => {
    if (!drag) return null;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, g) => {
        panMove.setValue({ x: g.dx, y: g.dy });
        const cx = drag.frame.x + drag.frame.width / 2 + g.dx;
        const cy = drag.frame.y + drag.frame.height / 2 + g.dy;
        const t = hitSlotIndex(cx, cy, slotWindows.current);
        const next = t != null && t !== drag.index ? t : null;
        setDropTargetIndex((prev) => (prev === next ? prev : next));
      },
      onPanResponderRelease: (_, g) => {
        endDrag(g.dx, g.dy);
      },
      onPanResponderTerminate: (_, g) => {
        endDrag(g.dx, g.dy);
      },
    });
  }, [drag, endDrag, panMove]);

  const pickForSlot = async (startSlotIndex: number) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Photos',
        'Photo access is needed to upload pictures. You can enable it in Settings.',
      );
      return;
    }
    const limit = orderedEmptySlotIndices(slots, startSlotIndex).length;
    if (limit === 0) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: limit,
      orderedSelection: true,
      quality: 0.85,
    });
    if (result.canceled || result.assets.length === 0) return;

    setSlots((prev) => {
      const orderedEmpty = orderedEmptySlotIndices(prev, startSlotIndex);
      if (orderedEmpty.length === 0) return prev;

      const existing = new Set(
        prev.filter((u): u is string => u != null),
      );
      const next = [...prev];

      const seenInBatch = new Set<string>();
      const uniqueIncoming: string[] = [];
      for (const a of result.assets) {
        const uri = a.uri;
        if (seenInBatch.has(uri)) continue;
        seenInBatch.add(uri);
        uniqueIncoming.push(uri);
      }

      let incomingIdx = 0;
      for (const slotIdx of orderedEmpty) {
        while (incomingIdx < uniqueIncoming.length) {
          const uri = uniqueIncoming[incomingIdx++];
          if (!existing.has(uri)) {
            next[slotIdx] = uri;
            existing.add(uri);
            break;
          }
        }
      }

      return compactSlots(next);
    });

    requestAnimationFrame(() => {
      for (let i = 0; i < SLOT_COUNT; i++) refreshSlotWindow(i);
    });
  };

  const removeAt = (slotIndex: number) => {
    setSlots((prev) => {
      const cleared = [...prev];
      cleared[slotIndex] = null;
      return compactSlots(cleared);
    });
  };

  const beginDrag = (index: number) => {
    const uri = slots[index];
    if (!uri) return;
    refreshSlotWindow(index);
    requestAnimationFrame(() => {
      const r = slotWindows.current[index];
      if (!r) return;
      panMove.setValue({ x: 0, y: 0 });
      setDrag({
        index,
        uri,
        frame: { ...r },
      });
    });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style='dark' />

      <View style={[styles.headerRow, { paddingHorizontal: padH }]}>
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Go back'
          onPress={onBack}
          hitSlop={12}
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.backBtnPressed,
          ]}
        >
          <Ionicons name='chevron-back' size={26} color={ink} />
        </Pressable>
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Skip photo upload'
          onPress={() => onSkip?.()}
          hitSlop={12}
          style={({ pressed }) => [
            styles.skipBtn,
            pressed && styles.skipPressed,
          ]}
        >
          <Text style={styles.skipLabel}>Skip</Text>
        </Pressable>
      </View>

      <OnboardingProgressBlock
        padH={padH}
        step={onboardingStepNumber}
        totalSteps={ONBOARDING_TOTAL_STEPS}
        title='Photos & video'
        progressRatio={progressRatio}
      />

      <View
        style={[styles.mainColumn, { paddingHorizontal: padH }]}
        pointerEvents={drag ? 'none' : 'auto'}
      >
        <Text style={[styles.screenTitle, { maxWidth: contentMaxW }]}>
          Update Your Photos
        </Text>
        <View
          style={[styles.introBullets, { width: contentMaxW }]}
        >
          <View style={styles.bulletRow}>
            <Text style={styles.bulletGlyph} accessibilityElementsHidden>
              •
            </Text>
            <Text style={styles.introBulletText}>
              Upload or rearrange your photos to help future roommates get to
              know you better.
            </Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bulletGlyph} accessibilityElementsHidden>
              •
            </Text>
            <Text style={styles.introBulletText}>
              You can skip this for now, but you&apos;ll need to upload at least
              2 photos and write a short bio later to use the Roommate Matching
              service.
            </Text>
          </View>
        </View>

        <View
          style={[styles.gridShell, { width: contentMaxW }]}
          onLayout={() => {
            for (let i = 0; i < SLOT_COUNT; i++) refreshSlotWindow(i);
          }}
        >
          <View style={[styles.grid, { gap: SLOT_GAP }]}>
            {Array.from({ length: GRID_ROWS }, (_, row) => (
              <View
                key={row}
                style={[styles.gridRow, { gap: SLOT_GAP }]}
              >
                {Array.from({ length: GRID_COLS }, (_, col) => {
                  const index = row * GRID_COLS + col;
                  const uri = slots[index];
                  const isProfileSlot = index === 0;
                  const hasPhoto = uri != null;
                  const isDraggingSource = drag?.index === index;
                  const isDropTarget =
                    drag != null &&
                    dropTargetIndex === index &&
                    index !== drag.index;
                  return (
                    <View
                      key={index}
                      ref={(r) => {
                        slotRefs.current[index] = r;
                      }}
                      onLayout={onSlotLayout(index)}
                      collapsable={false}
                      style={[
                        styles.slot,
                        {
                          width: cellW,
                          height: cellH,
                        },
                        hasPhoto ? styles.slotFilled : styles.slotEmpty,
                        hasPhoto &&
                          isProfileSlot &&
                          !isDraggingSource &&
                          styles.slotProfileOutline,
                        isDraggingSource && styles.slotDraggingSource,
                        isDropTarget && styles.slotDropTarget,
                      ]}
                    >
                      <Pressable
                        accessibilityRole='button'
                        accessibilityLabel={
                          hasPhoto
                            ? `Photo ${index + 1}${isProfileSlot ? ', profile photo' : ''}. Hold and drag to reorder.`
                            : `Add photos starting at slot ${index + 1}. You can select multiple photos at once.`
                        }
                        onPress={() => {
                          if (!hasPhoto) void pickForSlot(index);
                        }}
                        onLongPress={() => {
                          if (hasPhoto) beginDrag(index);
                        }}
                        delayLongPress={320}
                        style={({ pressed }) => [
                          styles.slotPressable,
                          pressed && hasPhoto && styles.slotPressed,
                        ]}
                      >
                        {hasPhoto ? (
                          <>
                            <Image
                              source={{ uri }}
                              style={styles.slotImage}
                              resizeMode='cover'
                            />
                            {isProfileSlot ? (
                              <LinearGradient
                                colors={['#7BA6FF', colors.primary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.profileBadge}
                              >
                                <Text style={styles.profileBadgeText}>
                                  Profile
                                </Text>
                              </LinearGradient>
                            ) : null}
                          </>
                        ) : (
                          <View style={styles.slotEmptyInner}>
                            <View style={styles.addOrb}>
                              <Ionicons
                                name='add'
                                size={28}
                                color={colors.primary}
                              />
                            </View>
                          </View>
                        )}
                      </Pressable>
                      {hasPhoto ? (
                        <Pressable
                          accessibilityRole='button'
                          accessibilityLabel={`Remove photo ${index + 1}`}
                          onPress={() => removeAt(index)}
                          hitSlop={10}
                          style={({ pressed }) => [
                            styles.trashBtn,
                            pressed && { opacity: 0.85 },
                          ]}
                        >
                          <Ionicons
                            name='trash'
                            size={14}
                            color='#FFFFFF'
                          />
                        </Pressable>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.hintPill, { maxWidth: contentMaxW }]}>
          <Ionicons
            name='hand-left-outline'
            size={17}
            color={colors.primary}
          />
          <Text style={styles.hintText}>
            Hold & drag to switch photo order
          </Text>
        </View>

        {showValidationError ? (
          <View style={[styles.errorSurface, { maxWidth: contentMaxW }]}>
            <Ionicons
              name='alert-circle'
              size={18}
              color={danger}
            />
            <Text style={styles.errorText}>
              {hasDuplicatePhotos
                ? 'Please use different photos in each slot.'
                : 'Please upload at least 2 different photos to continue.'}
            </Text>
          </View>
        ) : null}
      </View>

      <OnboardingBottomCta
        label='Continue'
        onPress={() => {
          if (canContinue && !hasDuplicatePhotos) onContinue?.();
        }}
        disabled={!canContinue || hasDuplicatePhotos}
        padH={padH}
        safeBottomInset={insets.bottom}
        buttonWidth={primaryButtonWidth}
      />

      {drag && panResponder ? (
        <View style={styles.dragLayer} pointerEvents='box-none'>
          <Animated.View
            pointerEvents='auto'
            {...panResponder.panHandlers}
            style={[
              styles.dragFloating,
              {
                left: drag.frame.x,
                top: drag.frame.y,
                width: drag.frame.width,
                height: drag.frame.height,
                transform: [...panMove.getTranslateTransform()],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.dragImageWrap,
                { transform: [{ scale: dragScale }] },
              ]}
            >
              <Image
                source={{ uri: drag.uri }}
                style={styles.dragImage}
                resizeMode='cover'
              />
            </Animated.View>
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: { flex: 1 },
  mainColumn: {
    flex: 1,
    minHeight: 0,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
    paddingTop: space.sm,
    paddingBottom: space.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: space.xs,
  },
  backBtn: {
    marginLeft: -space.xs,
    padding: space.xs,
    borderRadius: radius.sm,
  },
  backBtnPressed: { opacity: 0.55 },
  skipBtn: {
    paddingVertical: space.xs,
    paddingHorizontal: space.sm,
  },
  skipPressed: { opacity: 0.55 },
  skipLabel: {
    fontSize: type.body,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: -0.2,
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.8,
    lineHeight: 36,
    marginBottom: space.sm,
    alignSelf: 'center',
    width: '100%',
  },
  /** Same body scale as Three `screenSubtitle`; width matches photo grid. */
  introBullets: {
    alignSelf: 'center',
    marginBottom: space.lg,
    gap: space.sm + 2,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletGlyph: {
    width: 18,
    fontSize: type.body,
    lineHeight: 22,
    color: labelSecondary,
    fontWeight: '400',
    textAlign: 'center',
    paddingTop: 1,
  },
  introBulletText: {
    flex: 1,
    fontSize: type.body,
    lineHeight: 22,
    color: labelSecondary,
    fontWeight: '400',
    letterSpacing: -0.2,
  },
  gridShell: {
    alignSelf: 'center',
    backgroundColor: '#F4F5F9',
    borderRadius: radius.lg,
    padding: space.sm + 4,
    marginBottom: space.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(60, 60, 67, 0.08)',
  },
  grid: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slot: {
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  slotFilled: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: fieldBorder,
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
    }),
  },
  slotEmpty: {
    backgroundColor: '#E8EAEF',
    borderWidth: 1,
    borderColor: 'rgba(60, 60, 67, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
      android: { elevation: 0 },
    }),
  },
  /** Fills the slot’s content box edge-to-edge (avoids flex inset + white gap under border). */
  slotPressable: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  slotProfileOutline: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  slotDraggingSource: {
    opacity: 0.38,
  },
  slotDropTarget: {
    borderWidth: 2,
    borderColor: selectedChoiceBorder,
    backgroundColor: selectedChoiceBg,
  },
  slotPressed: {
    opacity: 0.92,
  },
  slotImage: {
    ...StyleSheet.absoluteFillObject,
  },
  slotEmptyInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  addOrb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(47, 109, 246, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(47, 109, 246, 0.22)',
  },
  profileBadge: {
    position: 'absolute',
    top: space.sm,
    left: space.sm,
    zIndex: 1,
    paddingHorizontal: space.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.xs,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  profileBadgeText: {
    color: '#FFFFFF',
    fontSize: type.micro,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  trashBtn: {
    position: 'absolute',
    bottom: space.sm,
    right: space.sm,
    zIndex: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: danger,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: { elevation: 3 },
    }),
  },
  hintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    alignSelf: 'center',
    width: '100%',
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: selectedChoiceBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(47, 109, 246, 0.18)',
    marginBottom: space.sm,
  },
  hintText: {
    flex: 1,
    fontSize: type.caption,
    color: labelSecondary,
    fontWeight: '600',
    letterSpacing: -0.15,
  },
  errorSurface: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    alignSelf: 'center',
    width: '100%',
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 59, 48, 0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  errorText: {
    flex: 1,
    fontSize: type.caption,
    color: danger,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  dragLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  dragFloating: {
    position: 'absolute',
    borderRadius: radius.md,
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 18,
      },
      android: { elevation: 14 },
    }),
  },
  dragImageWrap: {
    width: '100%',
    height: '100%',
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
  },
  dragImage: {
    width: '100%',
    height: '100%',
  },
});
