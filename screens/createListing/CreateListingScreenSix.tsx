import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
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
  STEP_LEASE,
  white,
} from './createListingTokens';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const TIMINGS = ['Early', 'Mid', 'Late'] as const;

const LEASE_TERMS = ['0-6 months', '7-12 months', '1 years or more'] as const;

const LEASE_TYPES = [
  { id: 'new', label: 'New Lease' },
  { id: 'roommate', label: 'Roommate Only' },
  { id: 'takeover', label: 'Lease Takeover' },
  { id: 'sublease', label: 'Sublease' },
] as const;

const PROMOTIONS = [
  { id: 'noBroker', label: 'No broker fee', icon: 'people-outline' as const },
  { id: 'reducedAmenity', label: 'Reduced amenity fee', icon: 'bulb-outline' as const },
] as const;

const FREE_MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);
const LEASE_LENGTH_OPTIONS = Array.from({ length: 31 }, (_, i) => i + 6);

const MAX_FREE_MONTH_ROWS = 2;

type FreeRow = { id: string; freeMonths: number | null; leaseMonths: number | null };

type PickerState =
  | { kind: 'month' }
  | { kind: 'timing' }
  | { kind: 'leaseTerm' }
  | { kind: 'freeMonths'; rowId: string }
  | { kind: 'leaseLength'; rowId: string }
  | null;

export type CreateListingScreenSixProps = {
  onClose: () => void;
  onBack: () => void;
  onContinue: () => void;
};

export function CreateListingScreenSix({ onClose, onBack, onContinue }: CreateListingScreenSixProps) {
  const insets = useSafeAreaInsets();
  const { padH, contentMaxW, primaryButtonWidth } = useOnboardingCtaLayout();
  const innerW = contentMaxW;

  const [moveInMonth, setMoveInMonth] = useState<string | null>(null);
  const [moveInTiming, setMoveInTiming] = useState<string | null>(null);
  const [leaseTerm, setLeaseTerm] = useState<string | null>(null);
  const [leaseTypeId, setLeaseTypeId] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<Set<string>>(() => new Set());
  const [freeRows, setFreeRows] = useState<FreeRow[]>([]);
  const [picker, setPicker] = useState<PickerState>(null);

  const togglePromotion = (id: string) => {
    setPromotions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addFreeRow = () => {
    setFreeRows((prev) =>
      prev.length >= MAX_FREE_MONTH_ROWS
        ? prev
        : [...prev, { id: `f-${Date.now()}`, freeMonths: null, leaseMonths: null }],
    );
  };

  const removeFreeRow = (id: string) => {
    setFreeRows((prev) => prev.filter((r) => r.id !== id));
  };

  const patchFreeRow = (id: string, patch: Partial<FreeRow>) => {
    setFreeRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const closePicker = () => setPicker(null);

  const applyPicker = (value: string | number) => {
    if (!picker) return;
    if (picker.kind === 'month') setMoveInMonth(String(value));
    else if (picker.kind === 'timing') setMoveInTiming(String(value));
    else if (picker.kind === 'leaseTerm') setLeaseTerm(String(value));
    else if (picker.kind === 'freeMonths') {
      patchFreeRow(picker.rowId, { freeMonths: value as number });
    } else if (picker.kind === 'leaseLength') {
      patchFreeRow(picker.rowId, { leaseMonths: value as number });
    }
    closePicker();
  };

  const pickerMeta = useMemo(() => {
    if (!picker) return { title: '', options: [] as { key: string; label: string; value: string | number }[] };
    if (picker.kind === 'month') {
      return {
        title: 'Month',
        options: MONTHS.map((m) => ({ key: m, label: m, value: m })),
      };
    }
    if (picker.kind === 'timing') {
      return {
        title: 'Timing',
        options: TIMINGS.map((t) => ({ key: t, label: t, value: t })),
      };
    }
    if (picker.kind === 'leaseTerm') {
      return {
        title: 'Lease term',
        options: LEASE_TERMS.map((t) => ({ key: t, label: t, value: t })),
      };
    }
    if (picker.kind === 'freeMonths') {
      return {
        title: 'Months free',
        options: FREE_MONTH_OPTIONS.map((n) => ({
          key: String(n),
          label: `${n} month${n === 1 ? '' : 's'}`,
          value: n,
        })),
      };
    }
    return {
      title: 'Lease length (months)',
      options: LEASE_LENGTH_OPTIONS.map((n) => ({
        key: String(n),
        label: `${n} months`,
        value: n,
      })),
    };
  }, [picker]);

  const selectedValue = useMemo(() => {
    if (!picker) return null;
    if (picker.kind === 'month') return moveInMonth;
    if (picker.kind === 'timing') return moveInTiming;
    if (picker.kind === 'leaseTerm') return leaseTerm;
    const row = freeRows.find((r) => r.id === picker.rowId);
    if (picker.kind === 'freeMonths') return row?.freeMonths ?? null;
    return row?.leaseMonths ?? null;
  }, [picker, moveInMonth, moveInTiming, leaseTerm, freeRows]);

  const stepValid = useMemo(() => {
    if (!moveInMonth || !moveInTiming || !leaseTerm || !leaseTypeId) return false;
    return freeRows.every((r) => r.freeMonths != null && r.leaseMonths != null);
  }, [moveInMonth, moveInTiming, leaseTerm, leaseTypeId, freeRows]);

  const progressFraction = STEP_LEASE / LISTING_TOTAL_STEPS;

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
              {`Step ${STEP_LEASE} of ${LISTING_TOTAL_STEPS} · Move-in & lease`}
            </Text>
          </View>

          <Text style={[styles.sectionLabel, { width: innerW, alignSelf: 'center' }]}>
            Available Move-in Schedule <Text style={styles.asterisk}>*</Text>
          </Text>
          <View style={[styles.splitRow, { width: innerW, alignSelf: 'center' }]}>
            <Pressable
              accessibilityRole='button'
              onPress={() => setPicker({ kind: 'month' })}
              style={({ pressed }) => [styles.splitCell, pressed && styles.cellPressed]}
            >
              <Text
                style={[styles.inputLikeText, !moveInMonth && styles.placeholderText]}
                numberOfLines={1}
              >
                {moveInMonth ?? 'Month'}
              </Text>
              <Ionicons name='chevron-down' size={18} color={captionMuted} />
            </Pressable>
            <Pressable
              accessibilityRole='button'
              onPress={() => setPicker({ kind: 'timing' })}
              style={({ pressed }) => [styles.splitCell, pressed && styles.cellPressed]}
            >
              <Text
                style={[styles.inputLikeText, !moveInTiming && styles.placeholderText]}
                numberOfLines={1}
              >
                {moveInTiming ?? 'Early/Mid/Late'}
              </Text>
              <Ionicons name='chevron-down' size={18} color={captionMuted} />
            </Pressable>
          </View>

          <Text
            style={[styles.sectionLabel, { width: innerW, alignSelf: 'center', marginTop: space.xl }]}
          >
            Lease Term <Text style={styles.asterisk}>*</Text>
          </Text>
          <Pressable
            accessibilityRole='button'
            onPress={() => setPicker({ kind: 'leaseTerm' })}
            style={({ pressed }) => [
              styles.fullCell,
              { width: innerW, alignSelf: 'center' },
              pressed && styles.cellPressed,
            ]}
          >
            <Text style={[styles.inputLikeText, !leaseTerm && styles.placeholderText]} numberOfLines={1}>
              {leaseTerm ?? 'Choose your lease term'}
            </Text>
            <Ionicons name='chevron-down' size={18} color={captionMuted} />
          </Pressable>

          <Text
            style={[styles.sectionLabel, { width: innerW, alignSelf: 'center', marginTop: space.xl }]}
          >
            Promotion
          </Text>
          <View style={[styles.promoRow, { width: innerW, alignSelf: 'center' }]}>
            {PROMOTIONS.map((p) => {
              const on = promotions.has(p.id);
              return (
                <Pressable
                  key={p.id}
                  accessibilityRole='checkbox'
                  accessibilityState={{ checked: on }}
                  onPress={() => togglePromotion(p.id)}
                  style={({ pressed }) => [
                    styles.promoChip,
                    on && styles.promoChipSelected,
                    pressed && styles.cellPressed,
                  ]}
                >
                  <Ionicons name={p.icon} size={18} color={on ? colors.primary : captionMuted} />
                  <Text style={[styles.promoChipText, on && styles.promoChipTextSelected]} numberOfLines={2}>
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text
            style={[styles.sectionLabel, { width: innerW, alignSelf: 'center', marginTop: space.xl }]}
          >
            Lease type <Text style={styles.asterisk}>*</Text>
          </Text>
          <View style={[styles.leaseTypeWrap, { width: innerW, alignSelf: 'center' }]}>
            {LEASE_TYPES.map((lt) => {
              const selected = leaseTypeId === lt.id;
              return (
                <Pressable
                  key={lt.id}
                  accessibilityRole='button'
                  accessibilityState={{ selected }}
                  onPress={() => setLeaseTypeId(lt.id)}
                  style={({ pressed }) => [
                    styles.leaseTypeChip,
                    selected && styles.leaseTypeChipSelected,
                    pressed && styles.cellPressed,
                  ]}
                >
                  <Text style={[styles.leaseTypeChipText, selected && styles.leaseTypeChipTextSelected]}>
                    {lt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text
            style={[styles.sectionLabel, { width: innerW, alignSelf: 'center', marginTop: space.xl }]}
          >
            Free Month <Text style={styles.sectionHint}>(Max {MAX_FREE_MONTH_ROWS} options)</Text>
          </Text>
          {freeRows.map((row) => (
            <View key={row.id} style={[styles.freeRow, { width: innerW, alignSelf: 'center' }]}>
              <Pressable
                style={({ pressed }) => [styles.freeMini, pressed && styles.cellPressed]}
                onPress={() => setPicker({ kind: 'freeMonths', rowId: row.id })}
              >
                <Text
                  style={[styles.freeMiniText, row.freeMonths == null && styles.placeholderText]}
                  numberOfLines={1}
                >
                  {row.freeMonths != null ? String(row.freeMonths) : 'Free'}
                </Text>
                <Ionicons name='chevron-down' size={14} color={captionMuted} />
              </Pressable>
              <Text style={styles.freeRowCopy}>months free on</Text>
              <Pressable
                style={({ pressed }) => [styles.freeMini, pressed && styles.cellPressed]}
                onPress={() => setPicker({ kind: 'leaseLength', rowId: row.id })}
              >
                <Text
                  style={[styles.freeMiniText, row.leaseMonths == null && styles.placeholderText]}
                  numberOfLines={1}
                >
                  {row.leaseMonths != null ? String(row.leaseMonths) : 'Length'}
                </Text>
                <Ionicons name='chevron-down' size={14} color={captionMuted} />
              </Pressable>
              <Text style={styles.freeRowCopy}>months lease</Text>
              <Pressable
                accessibilityRole='button'
                accessibilityLabel='Remove free month row'
                onPress={() => removeFreeRow(row.id)}
                style={({ pressed }) => [styles.removeMini, pressed && styles.headerButtonPressed]}
              >
                <Ionicons name='remove' size={18} color={ink} />
              </Pressable>
            </View>
          ))}
          {freeRows.length < MAX_FREE_MONTH_ROWS ? (
            <Pressable
              accessibilityRole='button'
              onPress={addFreeRow}
              style={({ pressed }) => [styles.addFree, pressed && { opacity: 0.7 }]}
            >
              <View style={styles.addFreeIcon}>
                <Ionicons name='add' size={18} color={colors.primary} />
              </View>
              <Text style={styles.addFreeText}>Add free month option</Text>
            </Pressable>
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

      <Modal visible={picker != null} transparent animationType='fade' onRequestClose={closePicker}>
        <Pressable style={styles.modalScrim} onPress={closePicker} accessibilityLabel='Dismiss' />
        <View style={styles.pickerCard} pointerEvents='box-none'>
          <Text style={styles.pickerTitle}>{pickerMeta.title}</Text>
          <ScrollView style={styles.pickerScroll} keyboardShouldPersistTaps='handled'>
            {pickerMeta.options.map((opt, index) => {
              const isLast = index === pickerMeta.options.length - 1;
              const sel =
                typeof opt.value === 'number'
                  ? selectedValue === opt.value
                  : selectedValue === opt.value;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => applyPicker(opt.value)}
                  style={({ pressed }) => [
                    styles.pickerRow,
                    !isLast && styles.pickerRowBorder,
                    sel && styles.pickerRowSelected,
                    pressed && styles.cellPressed,
                  ]}
                >
                  <Text style={[styles.pickerRowText, sel && styles.pickerRowTextSelected]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
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
  sectionHint: {
    textTransform: 'none',
    fontWeight: '500',
    color: captionMuted,
  },
  asterisk: {
    color: required,
    fontWeight: '600',
  },
  splitRow: {
    flexDirection: 'row',
    gap: space.sm,
    marginBottom: space.md,
  },
  splitCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: Platform.select({ ios: 52, default: 50 }),
    borderRadius: radius.sm + 2,
    paddingHorizontal: space.md,
    backgroundColor: fieldFill,
    borderWidth: 1,
    borderColor: fieldBorder,
  },
  fullCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: Platform.select({ ios: 52, default: 50 }),
    borderRadius: radius.sm + 2,
    paddingHorizontal: space.lg,
    backgroundColor: fieldFill,
    borderWidth: 1,
    borderColor: fieldBorder,
  },
  cellPressed: {
    opacity: 0.88,
  },
  inputLikeText: {
    flex: 1,
    fontSize: type.bodyLarge,
    fontWeight: '500',
    color: ink,
    letterSpacing: -0.25,
    minWidth: 0,
  },
  placeholderText: {
    color: captionMuted,
    fontWeight: '400',
  },
  promoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  promoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: fieldBorder,
    backgroundColor: white,
    flexGrow: 1,
    minWidth: '45%',
  },
  promoChipSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(47, 109, 246, 0.06)',
  },
  promoChipText: {
    flex: 1,
    fontSize: type.body,
    fontWeight: '600',
    color: ink,
    minWidth: 0,
  },
  promoChipTextSelected: {
    color: colors.primary,
  },
  leaseTypeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  leaseTypeChip: {
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: fieldBorder,
    backgroundColor: white,
    minWidth: '47%',
    flexGrow: 1,
  },
  leaseTypeChipSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(47, 109, 246, 0.06)',
  },
  leaseTypeChipText: {
    fontSize: type.body,
    fontWeight: '600',
    color: ink,
    textAlign: 'center',
  },
  leaseTypeChipTextSelected: {
    color: colors.primary,
  },
  freeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: space.xs,
    marginBottom: space.sm,
  },
  freeMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 40,
    paddingHorizontal: space.sm,
    borderRadius: radius.sm,
    backgroundColor: fieldFill,
    borderWidth: 1,
    borderColor: fieldBorder,
  },
  freeMiniText: {
    fontSize: type.body,
    fontWeight: '600',
    color: ink,
    maxWidth: 56,
  },
  freeRowCopy: {
    fontSize: type.caption,
    fontWeight: '500',
    color: ink,
  },
  removeMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: fieldBorder,
    backgroundColor: white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: space.xs,
  },
  addFree: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: space.sm,
    gap: space.sm,
  },
  addFreeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: fieldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: white,
  },
  addFreeText: {
    fontSize: type.body,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.15,
  },
  bottomDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingTop: space.xl,
  },
  modalScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    zIndex: 1,
  },
  pickerCard: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    top: '22%',
    maxHeight: '52%',
    zIndex: 2,
    backgroundColor: white,
    borderRadius: radius.lg,
    padding: space.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 28,
      },
      android: { elevation: 12 },
    }),
  },
  pickerTitle: {
    fontSize: type.title,
    fontWeight: '800',
    color: ink,
    marginBottom: space.md,
    letterSpacing: -0.4,
  },
  pickerScroll: {
    maxHeight: 360,
  },
  pickerRow: {
    paddingVertical: space.md,
  },
  pickerRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: fieldBorder,
  },
  pickerRowSelected: {
    backgroundColor: 'rgba(47, 109, 246, 0.06)',
    marginHorizontal: -space.lg,
    paddingHorizontal: space.lg,
    borderRadius: radius.sm,
  },
  pickerRowText: {
    fontSize: type.bodyLarge,
    fontWeight: '500',
    color: ink,
  },
  pickerRowTextSelected: {
    fontWeight: '700',
    color: colors.primary,
  },
});
