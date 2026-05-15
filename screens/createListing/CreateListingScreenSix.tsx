import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ListingProgressBlock } from '../../components/ListingProgressBlock';
import { OnboardingNavHeader } from '../../components/OnboardingNavHeader';
import { useOnboardingCtaLayout } from '../../design/onboardingCtaLayout';
import { colors, radius, space, type } from '../../design/theme';
import { CreateListingPrimaryCta } from './CreateListingPrimaryCta';
import { StepSixPickerSheet } from './StepSixPickerSheet';
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
  STEP_LEASE,
  white,
} from './createListingTokens';

const LEASE_TYPES = [
  { id: 'new', label: 'New Lease' },
  { id: 'roommate', label: 'Roommate Only' },
  { id: 'takeover', label: 'Lease Takeover' },
  { id: 'sublease', label: 'Sublease' },
] as const;

const PROMOTIONS = [
  { id: 'noBroker', label: 'No Broker Fee', icon: 'people-outline' as const },
  { id: 'reducedAmenity', label: 'Amenity Reduced', icon: 'bulb-outline' as const },
] as const;

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
  embedInUnifiedList?: boolean;
};

function SectionTitle({
  children,
  required: isRequired,
  optional,
  hint,
}: {
  children: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>
        {children}
        {isRequired ? <Text style={styles.asterisk}> *</Text> : null}
      </Text>
      {optional ? <Text style={styles.optionalTag}>Optional</Text> : null}
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
    </View>
  );
}

function SelectField({
  value,
  placeholder,
  onPress,
  fullWidth,
  elevated,
}: {
  value: string | null;
  placeholder: string;
  onPress: () => void;
  fullWidth?: boolean;
  elevated?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole='button'
      onPress={onPress}
      style={({ pressed }) => [
        styles.selectField,
        elevated && styles.selectFieldElevated,
        fullWidth && styles.selectFieldFull,
        pressed && styles.pressedFade,
      ]}
    >
      <Text
        style={[styles.selectFieldText, !value && styles.placeholderText]}
        numberOfLines={1}
      >
        {value ?? placeholder}
      </Text>
      <Ionicons name='chevron-down' size={18} color={captionMuted} />
    </Pressable>
  );
}

function SentencePicker({
  value,
  placeholder,
  onPress,
  accessibilityLabel,
}: {
  value: string | null;
  placeholder: string;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  const filled = value != null;
  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.sentencePickerHit, pressed && styles.pressedFade]}
    >
      <Text
        style={[styles.sentencePickerValue, !filled && styles.sentencePickerPlaceholder]}
        numberOfLines={1}
      >
        {value ?? placeholder}
      </Text>
    </Pressable>
  );
}

function FreeMonthOptionCard({
  row,
  onPickFreeMonths,
  onPickLeaseLength,
  onRemove,
}: {
  row: FreeRow;
  onPickFreeMonths: () => void;
  onPickLeaseLength: () => void;
  onRemove: () => void;
}) {
  const freeValue = row.freeMonths != null ? String(row.freeMonths) : null;
  const leaseValue = row.leaseMonths != null ? String(row.leaseMonths) : null;

  return (
    <View style={styles.freeOfferRow}>
      <View style={styles.freeOfferSentence}>
        <SentencePicker
          value={freeValue}
          placeholder='—'
          accessibilityLabel='Months free'
          onPress={onPickFreeMonths}
        />
        <Text style={styles.freeOfferStatic}> free on </Text>
        <SentencePicker
          value={leaseValue}
          placeholder='—'
          accessibilityLabel='Lease length in months'
          onPress={onPickLeaseLength}
        />
        <Text style={styles.freeOfferStatic}> months lease</Text>
      </View>
      <Pressable
        accessibilityRole='button'
        accessibilityLabel='Remove free month offer'
        onPress={onRemove}
        hitSlop={8}
        style={({ pressed }) => [styles.freeOfferRemove, pressed && styles.pressedFade]}
      >
        <Ionicons name='remove-circle-outline' size={22} color={captionMuted} />
      </Pressable>
    </View>
  );
}

export function CreateListingScreenSix({
  onClose,
  onBack,
  onContinue,
  embedInUnifiedList = false,
}: CreateListingScreenSixProps) {
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

  const pickerSelectedValue = useMemo((): string | number | null => {
    if (!picker) return null;
    if (picker.kind === 'month') return moveInMonth;
    if (picker.kind === 'timing') return moveInTiming;
    if (picker.kind === 'leaseTerm') return leaseTerm;
    const row = freeRows.find((r) => r.id === picker.rowId);
    if (!row) return null;
    return picker.kind === 'freeMonths' ? row.freeMonths : row.leaseMonths;
  }, [picker, moveInMonth, moveInTiming, leaseTerm, freeRows]);

  const stepValid = useMemo(() => {
    if (!moveInMonth || !moveInTiming || !leaseTerm || !leaseTypeId) return false;
    return freeRows.every((r) => r.freeMonths != null && r.leaseMonths != null);
  }, [moveInMonth, moveInTiming, leaseTerm, leaseTypeId, freeRows]);

  const progressFraction = STEP_LEASE / LISTING_TOTAL_STEPS;

  const pickerSheet = (
    <StepSixPickerSheet
      picker={picker}
      selectedValue={pickerSelectedValue}
      onSelect={(value) => {
        if (!picker) return;
        if (picker.kind === 'month') setMoveInMonth(String(value));
        else if (picker.kind === 'timing') setMoveInTiming(String(value));
        else if (picker.kind === 'leaseTerm') setLeaseTerm(String(value));
        else if (picker.kind === 'freeMonths') {
          patchFreeRow(picker.rowId, { freeMonths: value as number });
        } else if (picker.kind === 'leaseLength') {
          patchFreeRow(picker.rowId, { leaseMonths: value as number });
        }
      }}
      onDismiss={closePicker}
    />
  );

  const leaseForm = (
        <View style={[styles.contentNarrow, { maxWidth: contentMaxW, width: innerW, gap: space.xxl }]}>
          <View style={styles.section}>
            <SectionTitle required>Available move-in schedule</SectionTitle>
            <View style={styles.splitRow}>
              <SelectField
                value={moveInMonth}
                placeholder='Month'
                onPress={() => setPicker({ kind: 'month' })}
              />
              <SelectField
                value={moveInTiming}
                placeholder='Early / Mid / Late'
                onPress={() => setPicker({ kind: 'timing' })}
              />
            </View>
          </View>

          <View style={styles.section}>
            <SectionTitle required>Lease term</SectionTitle>
            <SelectField
              value={leaseTerm}
              placeholder='Choose your lease term'
              onPress={() => setPicker({ kind: 'leaseTerm' })}
              fullWidth
            />
          </View>

          <View style={styles.section}>
            <SectionTitle optional>Promotion</SectionTitle>
            <View style={styles.promoRow}>
              {PROMOTIONS.map((p) => {
                const on = promotions.has(p.id);
                return (
                  <Pressable
                    key={p.id}
                    accessibilityRole='checkbox'
                    accessibilityState={{ checked: on }}
                    onPress={() => togglePromotion(p.id)}
                    style={({ pressed }) => [
                      styles.promoCard,
                      on && styles.promoCardSelected,
                      pressed && styles.pressedFade,
                    ]}
                  >
                    <View style={[styles.promoIconWrap, on && styles.promoIconWrapSelected]}>
                      <Ionicons
                        name={p.icon}
                        size={20}
                        color={on ? colors.primary : labelSecondary}
                      />
                    </View>
                    <Text
                      style={[styles.promoCardLabel, on && styles.promoCardLabelSelected]}
                      numberOfLines={2}
                    >
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <SectionTitle required>Lease type</SectionTitle>
            <View style={styles.leaseTypeGrid}>
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
                      selected && styles.chipSelected,
                      pressed && styles.pressedFade,
                    ]}
                  >
                    <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                      {lt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <SectionTitle>Free month</SectionTitle>
            {freeRows.length > 0 ? (
              <View style={styles.freeMonthList}>
                {freeRows.map((row) => (
                  <FreeMonthOptionCard
                    key={row.id}
                    row={row}
                    onPickFreeMonths={() => setPicker({ kind: 'freeMonths', rowId: row.id })}
                    onPickLeaseLength={() => setPicker({ kind: 'leaseLength', rowId: row.id })}
                    onRemove={() => removeFreeRow(row.id)}
                  />
                ))}
              </View>
            ) : null}
            {freeRows.length < MAX_FREE_MONTH_ROWS ? (
              <Pressable
                accessibilityRole='button'
                onPress={addFreeRow}
                style={({ pressed }) => [styles.addFreeBtn, pressed && styles.pressedFade]}
              >
                <Ionicons name='add-circle-outline' size={20} color={colors.primary} />
                <Text style={styles.addFreeBtnText}>Add free month option</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
  );

  if (embedInUnifiedList) {
    return (
      <>
        <ScrollView
          scrollEnabled={false}
          nestedScrollEnabled
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: pageBg }}
          contentContainerStyle={{
            paddingTop: space.md,
            paddingBottom: space.xxxl + space.xxl,
            paddingHorizontal: padH,
          }}
        >
          {leaseForm}
        </ScrollView>
        {pickerSheet}
      </>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style='dark' />
      <OnboardingNavHeader padH={padH} onBack={onBack} onClose={onClose} />

      <ListingProgressBlock
        padH={padH}
        step={STEP_LEASE}
        title='Move-in & lease'
        progressRatio={progressFraction}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={{
          paddingTop: space.md,
          paddingBottom: insets.bottom + BOTTOM_CTA_SCROLL_CLEARANCE,
          paddingHorizontal: padH,
        }}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        {leaseForm}
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

      {pickerSheet}
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
  section: {
    gap: space.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.xs,
  },
  sectionTitle: {
    fontSize: type.bodyLarge,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.35,
  },
  sectionHint: {
    fontSize: type.caption,
    fontWeight: '500',
    color: captionMuted,
    letterSpacing: -0.08,
  },
  optionalTag: {
    fontSize: type.micro,
    fontWeight: '600',
    color: labelSecondary,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    paddingVertical: 2,
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    backgroundColor: fieldFill,
    overflow: 'hidden',
  },
  asterisk: {
    color: required,
    fontWeight: '600',
  },
  splitRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  selectField: {
    flex: 1,
    flexBasis: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
    minHeight: 52,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: fieldFill,
    borderWidth: 1,
    borderColor: fieldBorder,
  },
  selectFieldElevated: {
    backgroundColor: white,
  },
  selectFieldFull: {
    flex: undefined,
    flexBasis: undefined,
    width: '100%',
    paddingHorizontal: space.lg,
  },
  selectFieldText: {
    flex: 1,
    fontSize: type.body,
    fontWeight: '600',
    color: ink,
    letterSpacing: -0.2,
    minWidth: 0,
  },
  placeholderText: {
    color: captionMuted,
    fontWeight: '500',
  },
  pressedFade: {
    opacity: 0.88,
  },
  promoRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  promoCard: {
    flex: 1,
    flexBasis: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    minHeight: 88,
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: fieldBorder,
    backgroundColor: white,
  },
  promoCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(47, 109, 246, 0.05)',
  },
  promoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: fieldFill,
  },
  promoIconWrapSelected: {
    backgroundColor: 'rgba(47, 109, 246, 0.12)',
  },
  promoCardLabel: {
    fontSize: type.caption,
    fontWeight: '700',
    color: ink,
    textAlign: 'center',
    letterSpacing: -0.15,
  },
  promoCardLabelSelected: {
    color: colors.primary,
  },
  leaseTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  leaseTypeChip: {
    flexGrow: 1,
    flexBasis: '47%',
    minHeight: 48,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: fieldBorder,
    backgroundColor: white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(47, 109, 246, 0.05)',
  },
  chipLabel: {
    fontSize: type.body,
    fontWeight: '600',
    color: ink,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  chipLabelSelected: {
    color: colors.primary,
  },
  freeMonthList: {
    gap: space.sm,
  },
  freeOfferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: fieldFill,
    borderWidth: 1,
    borderColor: fieldBorder,
  },
  freeOfferSentence: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    minWidth: 0,
  },
  freeOfferStatic: {
    fontSize: type.bodyLarge,
    fontWeight: '500',
    color: ink,
    letterSpacing: -0.25,
  },
  sentencePickerHit: {
    paddingVertical: 2,
    paddingHorizontal: space.sm,
    marginHorizontal: space.xs,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  sentencePickerValue: {
    fontSize: type.bodyLarge,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  sentencePickerPlaceholder: {
    fontWeight: '600',
    color: captionMuted,
    borderBottomColor: captionMuted,
  },
  freeOfferRemove: {
    padding: space.xs,
    flexShrink: 0,
  },
  addFreeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(47, 109, 246, 0.35)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(47, 109, 246, 0.04)',
  },
  addFreeBtnText: {
    fontSize: type.body,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.2,
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
