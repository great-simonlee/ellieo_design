import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, space, type } from '../../design/theme';
import { captionMuted, fieldBorder, fieldFill, ink, white } from './createListingTokens';

export const FREE_MONTH_PICKER_VALUES = [1, 2, 3] as const;
export const FREE_LEASE_LENGTH_VALUES = Array.from({ length: 16 }, (_, i) => i + 12);

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

const MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const TIMINGS = ['Early', 'Mid', 'Late'] as const;

const LEASE_TERMS = ['0-6 months', '7-12 months', '1 years or more'] as const;

export type StepSixPickerKind =
  | 'month'
  | 'timing'
  | 'leaseTerm'
  | 'freeMonths'
  | 'leaseLength';

export type StepSixPickerTarget =
  | { kind: 'month' }
  | { kind: 'timing' }
  | { kind: 'leaseTerm' }
  | { kind: 'freeMonths'; rowId: string }
  | { kind: 'leaseLength'; rowId: string };

type StepSixPickerSheetProps = {
  picker: StepSixPickerTarget | null;
  selectedValue: string | number | null;
  onSelect: (value: string | number) => void;
  onDismiss: () => void;
};

const SHEET_COPY: Record<StepSixPickerKind, { title: string; subtitle?: string }> = {
  month: {
    title: 'Move-in month',
    subtitle: 'When can renters move in?',
  },
  timing: {
    title: 'Move-in timing',
    subtitle: 'Early, mid, or late in the month',
  },
  leaseTerm: {
    title: 'Lease term',
    subtitle: 'Expected lease duration',
  },
  freeMonths: {
    title: 'Months free',
    subtitle: 'Up to 3 months rent credit',
  },
  leaseLength: {
    title: 'Lease length',
    subtitle: '12–27 month lease term',
  },
};

export function StepSixPickerSheet({
  picker,
  selectedValue,
  onSelect,
  onDismiss,
}: StepSixPickerSheetProps) {
  const insets = useSafeAreaInsets();
  const open = picker != null;

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(
    new Animated.Value(Math.min(480, Dimensions.get('window').height * 0.55)),
  ).current;

  const sheetClosedY = useCallback(
    () => Math.min(480, Dimensions.get('window').height * 0.55),
    [],
  );

  const runDismiss = useCallback(() => {
    const y = sheetClosedY();
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
        toValue: y,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onDismiss();
    });
  }, [backdropOpacity, onDismiss, sheetClosedY, sheetTranslateY]);

  useEffect(() => {
    if (!open) return;
    const y = sheetClosedY();
    backdropOpacity.stopAnimation();
    sheetTranslateY.stopAnimation();
    sheetTranslateY.setValue(y);
    backdropOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        stiffness: 320,
        damping: 36,
        mass: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [open, backdropOpacity, sheetClosedY, sheetTranslateY]);

  const handleSelect = (value: string | number) => {
    onSelect(value);
    runDismiss();
  };

  const kind = picker?.kind ?? 'month';
  const copy = SHEET_COPY[kind];

  const renderContent = () => {
    if (kind === 'freeMonths') {
      return (
        <View style={styles.monthsFreeRow}>
          {FREE_MONTH_PICKER_VALUES.map((n) => {
            const selected = selectedValue === n;
            return (
              <Pressable
                key={n}
                accessibilityRole='button'
                accessibilityState={{ selected }}
                onPress={() => handleSelect(n)}
                style={({ pressed }) => [
                  styles.monthsFreeCard,
                  selected && styles.monthsFreeCardSelected,
                  pressed && styles.monthsFreeCardPressed,
                ]}
              >
                {selected ? (
                  <View style={styles.monthsFreeCheck}>
                    <Ionicons name='checkmark' size={14} color={white} />
                  </View>
                ) : null}
                <Text style={[styles.monthsFreeNumber, selected && styles.monthsFreeNumberSelected]}>
                  {n}
                </Text>
                <Text style={[styles.monthsFreeUnit, selected && styles.monthsFreeUnitSelected]}>
                  {n === 1 ? 'month' : 'months'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      );
    }

    if (kind === 'leaseLength') {
      return (
        <ScrollView
          style={styles.leaseLengthScroll}
          contentContainerStyle={styles.leaseLengthGrid}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          {FREE_LEASE_LENGTH_VALUES.map((n) => {
            const selected = selectedValue === n;
            return (
              <Pressable
                key={n}
                accessibilityRole='button'
                accessibilityState={{ selected }}
                onPress={() => handleSelect(n)}
                style={({ pressed }) => [
                  styles.leaseChip,
                  selected && styles.leaseChipSelected,
                  pressed && !selected && styles.leaseChipPressed,
                ]}
              >
                <Text style={[styles.leaseChipValue, selected && styles.leaseChipValueSelected]}>
                  {n}
                </Text>
                <Text style={[styles.leaseChipUnit, selected && styles.leaseChipUnitSelected]}>
                  mo
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      );
    }

    if (kind === 'timing') {
      return (
        <View style={styles.timingRow}>
          {TIMINGS.map((label) => {
            const selected = selectedValue === label;
            return (
              <Pressable
                key={label}
                accessibilityRole='button'
                accessibilityState={{ selected }}
                onPress={() => handleSelect(label)}
                style={({ pressed }) => [
                  styles.timingCard,
                  selected && styles.timingCardSelected,
                  pressed && styles.timingCardPressed,
                ]}
              >
                {selected ? (
                  <View style={styles.monthCellCheck}>
                    <Ionicons name='checkmark' size={12} color={white} />
                  </View>
                ) : null}
                <Text style={[styles.timingLabel, selected && styles.timingLabelSelected]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      );
    }

    if (kind === 'month') {
      return (
        <View style={styles.monthGrid}>
          {MONTHS.map((monthName, index) => {
            const selected = selectedValue === monthName;
            return (
              <Pressable
                key={monthName}
                accessibilityRole='button'
                accessibilityLabel={monthName}
                accessibilityState={{ selected }}
                onPress={() => handleSelect(monthName)}
                style={({ pressed }) => [
                  styles.monthCell,
                  selected && styles.monthCellSelected,
                  pressed && !selected && styles.monthCellPressed,
                ]}
              >
                {selected ? (
                  <View style={styles.monthCellCheck}>
                    <Ionicons name='checkmark' size={12} color={white} />
                  </View>
                ) : null}
                <Text
                  style={[styles.monthCellText, selected && styles.monthCellTextSelected]}
                  numberOfLines={1}
                >
                  {MONTH_ABBR[index]} / {index + 1}
                </Text>
              </Pressable>
            );
          })}
        </View>
      );
    }

    return (
      <View style={styles.leaseTermCol}>
        {LEASE_TERMS.map((term) => {
          const selected = selectedValue === term;
          return (
            <Pressable
              key={term}
              accessibilityRole='button'
              accessibilityLabel={term}
              accessibilityState={{ selected }}
              onPress={() => handleSelect(term)}
              style={({ pressed }) => [
                styles.leaseTermCard,
                selected && styles.leaseTermCardSelected,
                pressed && !selected && styles.leaseTermCardPressed,
              ]}
            >
              {selected ? (
                <View style={styles.monthCellCheck}>
                  <Ionicons name='checkmark' size={12} color={white} />
                </View>
              ) : null}
              <Text
                style={[styles.leaseTermLabel, selected && styles.leaseTermLabelSelected]}
                numberOfLines={2}
              >
                {term}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  return (
    <Modal visible={open} transparent animationType='none' onRequestClose={runDismiss}>
      <View style={styles.modalRoot}>
        <Animated.View
          pointerEvents='box-none'
          style={[StyleSheet.absoluteFillObject, { opacity: backdropOpacity }]}
        >
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Dismiss'
            style={StyleSheet.absoluteFill}
            onPress={runDismiss}
          >
            <BlurView intensity={42} tint='dark' style={StyleSheet.absoluteFill} />
            <View style={styles.sheetBackdropDim} />
          </Pressable>
        </Animated.View>

        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.sheetShell,
            {
              paddingBottom: Math.max(insets.bottom, space.lg),
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          <View style={styles.sheetGrabberArea}>
            <View style={styles.sheetHandle} />
          </View>

          <View style={styles.sheetHeaderRow}>
            <View style={styles.sheetTitleBlock}>
              <Text style={styles.sheetTitle}>{copy.title}</Text>
              {copy.subtitle ? (
                <Text style={styles.sheetSubtitle}>{copy.subtitle}</Text>
              ) : null}
            </View>
            <Pressable
              accessibilityRole='button'
              accessibilityLabel='Cancel'
              hitSlop={12}
              onPress={runDismiss}
              style={({ pressed }) => [styles.sheetCancelHit, pressed && styles.pressedFade]}
            >
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </Pressable>
          </View>

          {renderContent()}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  sheetBackdropDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.32)',
  },
  sheetShell: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '78%',
    width: '100%',
    backgroundColor: white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space.lg,
    paddingTop: space.xs,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.14,
        shadowRadius: 32,
      },
      android: { elevation: 28 },
    }),
  },
  sheetGrabberArea: {
    alignItems: 'center',
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(60, 60, 67, 0.22)',
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space.md,
    marginBottom: space.lg,
  },
  sheetTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  sheetTitle: {
    fontSize: type.display,
    lineHeight: 31,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.55,
  },
  sheetSubtitle: {
    marginTop: space.xs,
    fontSize: type.caption,
    fontWeight: '500',
    color: captionMuted,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  sheetCancelHit: {
    paddingVertical: space.xs,
    paddingHorizontal: space.sm,
    marginTop: 2,
  },
  sheetCancelText: {
    fontSize: type.body,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: -0.2,
  },
  pressedFade: {
    opacity: 0.55,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    paddingBottom: space.sm,
  },
  monthCell: {
    width: '23%',
    minWidth: 72,
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingVertical: space.md,
    paddingHorizontal: space.xs,
    borderRadius: radius.sm,
    backgroundColor: fieldFill,
    borderWidth: 1.5,
    borderColor: fieldBorder,
  },
  monthCellSelected: {
    backgroundColor: 'rgba(47, 109, 246, 0.08)',
    borderColor: colors.primary,
  },
  monthCellPressed: {
    backgroundColor: 'rgba(60, 60, 67, 0.08)',
  },
  monthCellCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  monthCellText: {
    fontSize: type.caption,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.15,
  },
  monthCellTextSelected: {
    color: colors.primary,
  },
  leaseTermCol: {
    gap: space.sm,
    paddingBottom: space.sm,
  },
  leaseTermCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.sm,
    backgroundColor: fieldFill,
    borderWidth: 1.5,
    borderColor: fieldBorder,
  },
  leaseTermCardSelected: {
    backgroundColor: 'rgba(47, 109, 246, 0.08)',
    borderColor: colors.primary,
  },
  leaseTermCardPressed: {
    backgroundColor: 'rgba(60, 60, 67, 0.08)',
  },
  leaseTermLabel: {
    fontSize: type.body,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  leaseTermLabelSelected: {
    color: colors.primary,
  },
  timingRow: {
    flexDirection: 'row',
    gap: space.sm,
    paddingBottom: space.sm,
  },
  timingCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 88,
    paddingVertical: space.lg,
    paddingHorizontal: space.sm,
    borderRadius: radius.sm,
    backgroundColor: fieldFill,
    borderWidth: 1.5,
    borderColor: fieldBorder,
  },
  timingCardSelected: {
    backgroundColor: 'rgba(47, 109, 246, 0.08)',
    borderColor: colors.primary,
  },
  timingCardPressed: {
    backgroundColor: 'rgba(60, 60, 67, 0.08)',
  },
  timingLabel: {
    fontSize: type.bodyLarge,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.3,
  },
  timingLabelSelected: {
    color: colors.primary,
  },
  monthsFreeRow: {
    flexDirection: 'row',
    gap: space.sm,
    paddingBottom: space.sm,
  },
  monthsFreeCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 112,
    paddingVertical: space.lg,
    paddingHorizontal: space.sm,
    borderRadius: radius.md,
    backgroundColor: fieldFill,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  monthsFreeCardSelected: {
    backgroundColor: 'rgba(47, 109, 246, 0.08)',
    borderColor: colors.primary,
  },
  monthsFreeCardPressed: {
    backgroundColor: 'rgba(60, 60, 67, 0.08)',
  },
  monthsFreeCheck: {
    position: 'absolute',
    top: space.sm,
    right: space.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  monthsFreeNumber: {
    fontSize: type.display,
    lineHeight: 32,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.6,
  },
  monthsFreeNumberSelected: {
    color: colors.primary,
  },
  monthsFreeUnit: {
    marginTop: 2,
    fontSize: type.caption,
    fontWeight: '600',
    color: captionMuted,
    letterSpacing: -0.1,
  },
  monthsFreeUnitSelected: {
    color: colors.primary,
  },
  leaseLengthScroll: {
    maxHeight: 280,
  },
  leaseLengthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    paddingBottom: space.sm,
  },
  leaseChip: {
    width: '22.5%',
    minWidth: 72,
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.md,
    borderRadius: radius.sm,
    backgroundColor: fieldFill,
    borderWidth: 1.5,
    borderColor: fieldBorder,
  },
  leaseChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  leaseChipPressed: {
    backgroundColor: 'rgba(60, 60, 67, 0.08)',
  },
  leaseChipValue: {
    fontSize: type.bodyLarge,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.3,
  },
  leaseChipValueSelected: {
    color: white,
  },
  leaseChipUnit: {
    marginTop: 1,
    fontSize: type.micro,
    fontWeight: '700',
    color: captionMuted,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  leaseChipUnitSelected: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
});
