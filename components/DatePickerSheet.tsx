import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
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

const ITEM_H = 44;
const WHEEL_VISIBLE_ROWS = 5;
const WHEEL_HEIGHT = ITEM_H * WHEEL_VISIBLE_ROWS;
const WHEEL_PAD = ITEM_H * 2;

const ink = '#1C1C1E';
const muted = '#8E8E93';
const trackLine = 'rgba(60, 60, 67, 0.12)';

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

const MONTH_ITEMS = Array.from({ length: 12 }, (_, i) => {
  const m = i + 1;
  const name = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(
    new Date(2024, i, 1),
  );
  return { value: m, label: `${m} / ${name}` };
});

function buildYearOptions(): number[] {
  const y = new Date().getFullYear();
  /** Newest year = calendar year in which user turns 18 (born that year → 18 on birthday). */
  const max = y - 18;
  const min = 1920;
  const out: number[] = [];
  for (let yr = max; yr >= min; yr -= 1) out.push(yr);
  return out;
}

type Item<T> = { value: T; label: string };

function WheelColumn<T extends string | number>({
  items,
  value,
  onChange,
  compactLabel,
  testID,
}: {
  items: Item<T>[];
  value: T;
  onChange: (v: T) => void;
  compactLabel?: boolean;
  testID?: string;
}) {
  const scrollRef = useRef<ScrollView>(null);
  /** After user scroll settles, skip one prop→scroll sync (avoids fighting + year flicker). */
  const skipNextPropSyncRef = useRef(false);

  const found = items.findIndex((it) => it.value === value);
  const safeIndex = found >= 0 ? found : 0;

  const scrollToIndex = useCallback(
    (i: number, animated: boolean) => {
      if (items.length === 0) return;
      const clamped = Math.min(Math.max(0, i), items.length - 1);
      scrollRef.current?.scrollTo({ y: clamped * ITEM_H, animated });
    },
    [items.length],
  );

  useEffect(() => {
    if (skipNextPropSyncRef.current) {
      skipNextPropSyncRef.current = false;
      return;
    }
    scrollToIndex(safeIndex, false);
  }, [safeIndex, scrollToIndex]);

  const settle = (e: { nativeEvent: { contentOffset: { y: number } } }) => {
    if (items.length === 0) return;
    const y = e.nativeEvent.contentOffset.y;
    const i = Math.round(y / ITEM_H);
    const clamped = Math.max(0, Math.min(i, items.length - 1));
    const targetY = clamped * ITEM_H;
    /** Snap without animation — animated snap re-fires momentum end and can oscillate on long lists. */
    if (Math.abs(y - targetY) > 1) {
      scrollRef.current?.scrollTo({ y: targetY, animated: false });
    }
    const next = items[clamped]?.value;
    if (next !== undefined && next !== value) {
      skipNextPropSyncRef.current = true;
      onChange(next);
    }
  };

  return (
    <View style={wheelStyles.column} testID={testID}>
      <View style={wheelStyles.highlight} pointerEvents='none' />
      <ScrollView
        ref={scrollRef}
        style={wheelStyles.scroll}
        contentContainerStyle={wheelStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        snapToAlignment='start'
        decelerationRate='fast'
        nestedScrollEnabled
        disableIntervalMomentum
        onMomentumScrollEnd={settle}
      >
        {items.map((it) => {
          const selected = it.value === value;
          return (
            <View key={String(it.value)} style={wheelStyles.item}>
              <Text
                style={[
                  wheelStyles.itemText,
                  compactLabel && wheelStyles.itemTextCompact,
                  selected && wheelStyles.itemTextSelected,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {it.label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const wheelStyles = StyleSheet.create({
  /** No flex:1 here — parent row must get height from explicit minHeight; flex + ScrollView collapses to 0 on iOS. */
  column: {
    height: WHEEL_HEIGHT,
    width: '100%',
    position: 'relative',
  },
  scroll: {
    height: WHEEL_HEIGHT,
    width: '100%',
    zIndex: 1,
  },
  /** Center band aligns with row index 2 in the 5-row viewport (not WHEEL_PAD — that’s inside scroll content). */
  highlight: {
    position: 'absolute',
    left: space.xs,
    right: space.xs,
    top: ITEM_H * 2,
    height: ITEM_H,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(47, 109, 246, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(47, 109, 246, 0.22)',
    zIndex: 0,
  },
  item: {
    height: ITEM_H,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: space.xs,
  },
  itemText: {
    fontSize: type.body,
    fontWeight: '500',
    color: muted,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  itemTextCompact: {
    fontSize: type.caption,
    letterSpacing: -0.15,
  },
  itemTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  scrollContent: {
    paddingVertical: WHEEL_PAD,
  },
});

export type DatePickerSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Month 1–12, day 1–31, four-digit year. */
  onConfirm: (month: number, day: number, year: number) => void;
  initialMonth: number | null;
  initialDay: number | null;
  initialYear: number | null;
  /** e.g. "Birthday", "Start date" */
  title?: string;
  hint?: string;
  confirmLabel?: string;
  dismissAccessibilityLabel?: string;
  confirmAccessibilityLabel?: string;
};

export function DatePickerSheet({
  visible,
  onClose,
  onConfirm,
  initialMonth,
  initialDay,
  initialYear,
  title = 'Date',
  hint = 'Scroll to set month, day, and year.',
  confirmLabel = 'Done',
  dismissAccessibilityLabel = 'Dismiss date picker',
  confirmAccessibilityLabel = 'Confirm date',
}: DatePickerSheetProps) {
  const insets = useSafeAreaInsets();
  const { padH, primaryButtonWidth } = useOnboardingCtaLayout();
  const years = useMemo(() => buildYearOptions(), []);

  const defaultYear = years[0] ?? 2000;
  const [month, setMonth] = useState(initialMonth ?? 1);
  const [day, setDay] = useState(initialDay ?? 1);
  const [year, setYear] = useState(initialYear ?? defaultYear);

  useEffect(() => {
    if (!visible) return;
    const m = initialMonth ?? 1;
    let y = initialYear ?? defaultYear;
    if (!years.includes(y)) y = defaultYear;
    const dim = daysInMonth(m, y);
    let d = initialDay ?? 1;
    if (d > dim) d = dim;
    setMonth(m);
    setDay(d);
    setYear(y);
  }, [visible, initialMonth, initialDay, initialYear, defaultYear, years]);

  const maxDay = daysInMonth(month, year);
  const dayItems: Item<number>[] = useMemo(() => {
    const n = maxDay;
    return Array.from({ length: n }, (_, i) => ({
      value: i + 1,
      label: String(i + 1),
    }));
  }, [maxDay]);

  useEffect(() => {
    if (day > maxDay) setDay(maxDay);
  }, [day, maxDay]);

  const yearItems: Item<number>[] = useMemo(
    () => years.map((y) => ({ value: y, label: String(y) })),
    [years],
  );

  const handleMonth = (m: number) => {
    setMonth(m);
    const dim = daysInMonth(m, year);
    if (day > dim) setDay(dim);
  };

  const handleYear = (y: number) => {
    setYear(y);
    const dim = daysInMonth(month, y);
    if (day > dim) setDay(dim);
  };

  const handleDone = () => {
    onConfirm(month, day, year);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
    >
      <View style={styles.root} accessibilityViewIsModal>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityLabel={dismissAccessibilityLabel}
        />
        <View
          style={[
            styles.sheet,
            {
              paddingHorizontal: padH,
              paddingBottom: Math.max(insets.bottom, space.md) + space.sm,
            },
          ]}
        >
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>{title}</Text>
          <Text style={styles.sheetHint}>{hint}</Text>

          <View style={styles.wheelsRow}>
            <View style={styles.headingColWide}>
              <Text style={styles.colHeading}>Month</Text>
            </View>
            <View style={styles.wheelHeadingSpacer} />
            <View style={styles.headingColNarrow}>
              <Text style={styles.colHeading}>Day</Text>
            </View>
            <View style={styles.wheelHeadingSpacer} />
            <View style={styles.headingColYear}>
              <Text style={styles.colHeading}>Year</Text>
            </View>
          </View>

          <View style={styles.wheels}>
            <View style={styles.wheelColWide}>
              <WheelColumn
                items={MONTH_ITEMS}
                value={month}
                onChange={handleMonth}
                compactLabel
              />
            </View>
            <View style={styles.wheelDivider} />
            <View style={styles.wheelColNarrow}>
              <WheelColumn items={dayItems} value={day} onChange={setDay} />
            </View>
            <View style={styles.wheelDivider} />
            <View style={styles.wheelColYear}>
              <WheelColumn items={yearItems} value={year} onChange={handleYear} />
            </View>
          </View>

          <View style={styles.doneDock}>
            <Pressable
              accessibilityRole='button'
              accessibilityLabel={confirmAccessibilityLabel}
              onPress={handleDone}
              style={({ pressed }) => [
                styles.doneOuter,
                { width: primaryButtonWidth },
                pressed && { transform: [{ scale: 0.98 }] },
              ]}
            >
              <LinearGradient
                colors={['#7BA6FF', colors.primary]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.doneGradient}
              >
                <Text style={styles.doneLabel}>{confirmLabel}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radius.lg + 4,
    borderTopRightRadius: radius.lg + 4,
    paddingTop: space.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: { elevation: 16 },
    }),
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(60, 60, 67, 0.25)',
    marginBottom: space.md,
  },
  sheetTitle: {
    fontSize: type.title,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: space.xs,
  },
  sheetHint: {
    fontSize: type.caption,
    color: muted,
    textAlign: 'center',
    marginBottom: space.sm,
    letterSpacing: -0.1,
  },
  wheelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: trackLine,
    paddingBottom: space.xs,
    marginBottom: 0,
  },
  /** Match wheel column flex ratios — do not set height (avoids a 220px-tall header gap). */
  headingColWide: { flex: 1.45, minWidth: 0 },
  headingColNarrow: { flex: 0.72, minWidth: 0 },
  headingColYear: { flex: 1, minWidth: 0 },
  wheelHeadingSpacer: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
  colHeading: {
    fontSize: type.micro,
    fontWeight: '700',
    color: muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  wheels: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 0,
    marginBottom: space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: trackLine,
    minHeight: WHEEL_HEIGHT,
    height: WHEEL_HEIGHT,
  },
  wheelColWide: {
    flex: 1.45,
    minWidth: 0,
    height: WHEEL_HEIGHT,
    justifyContent: 'center',
  },
  wheelColNarrow: {
    flex: 0.72,
    minWidth: 0,
    height: WHEEL_HEIGHT,
    justifyContent: 'center',
  },
  wheelColYear: {
    flex: 1,
    minWidth: 0,
    height: WHEEL_HEIGHT,
    justifyContent: 'center',
  },
  wheelDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: trackLine,
    marginTop: 0,
    marginBottom: 0,
  },
  /** Matches `OnboardingBottomCta` dock + primary pill footprint. */
  doneDock: {
    alignItems: 'center',
    width: '100%',
    paddingTop: space.sm + 2,
  },
  doneOuter: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
      },
      android: { elevation: 6 },
    }),
  },
  doneGradient: {
    borderRadius: radius.pill,
    minHeight: 48,
    paddingVertical: 13,
    paddingHorizontal: space.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneLabel: {
    color: '#FFFFFF',
    fontSize: type.bodyLarge,
    fontWeight: '700',
    letterSpacing: -0.25,
  },
});
