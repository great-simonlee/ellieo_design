import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  type LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MATCH_PREFERRED_AREAS,
  neighborhoodsForArea,
  type MatchPreferredArea,
} from '../../data/matchPreferredLocationOptions';
import {
  GenderSegmentGrid,
  IconChoiceCards,
} from '../../components/OnboardingChoiceControls';
import { OnboardingBottomCta } from '../../components/OnboardingBottomCta';
import { useOnboardingCtaLayout } from '../../design/onboardingCtaLayout';
import { colors, radius, space, type } from '../../design/theme';
import {
  StepSixPickerSheet,
  type StepSixPickerTarget,
} from '../createListing/StepSixPickerSheet';
import { MatchLocationPickerSheet } from './MatchLocationPickerSheet';

/** Clearance for fixed bottom CTA (dock padding + button + gap). */
const CTA_DOCK_HEIGHT = space.sm + 2 + 48 + space.sm;

const ink = '#1C1C1E';
const labelSecondary = '#636366';
const captionMuted = '#8E8E93';
const fieldFill = '#F2F2F7';
const fieldBorder = 'rgba(60, 60, 67, 0.12)';

const PREF_GENDER_OPTIONS = [
  { id: 'she', title: 'She / her' },
  { id: 'he', title: 'He / him' },
  { id: 'they', title: 'They / them' },
  { id: 'any', title: 'Open to all' },
] as const;

const PREF_STATUS_CHOICES = [
  {
    id: 'student',
    label: 'Student',
    accessibilityLabel: 'Student preferred',
    icon: 'school-outline' as const,
    iconSelected: 'school' as const,
  },
  {
    id: 'working',
    label: 'Working',
    accessibilityLabel: 'Working preferred',
    icon: 'briefcase-outline' as const,
    iconSelected: 'briefcase' as const,
  },
  {
    id: 'both',
    label: 'Open to both',
    accessibilityLabel: 'Open to both',
    icon: 'people-outline' as const,
    iconSelected: 'people' as const,
  },
];

const PREF_ROOM_CHOICES = [
  {
    id: 'master',
    label: 'Master',
    accessibilityLabel: 'Master bedroom preferred',
    icon: 'bed-outline' as const,
    iconSelected: 'bed' as const,
  },
  {
    id: 'regular',
    label: 'Regular',
    accessibilityLabel: 'Regular bedroom preferred',
    icon: 'home-outline' as const,
    iconSelected: 'home' as const,
  },
  {
    id: 'flex',
    label: 'Flex',
    accessibilityLabel: 'Flexroom preferred',
    icon: 'grid-outline' as const,
    iconSelected: 'grid' as const,
  },
  {
    id: 'any',
    label: 'Any room',
    accessibilityLabel: 'Open to any room options',
    icon: 'sparkles-outline' as const,
    iconSelected: 'sparkles' as const,
  },
];

function sanitizeBudgetInput(input: string): string {
  return input.replace(/\D/g, '').slice(0, 6);
}

function formatBudgetDisplay(digits: string): string {
  if (!digits) return '';
  const n = Number.parseInt(digits, 10);
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString('en-US');
}

type MatchPreferredRoommateScreenProps = {
  onBack: () => void;
  onContinue: () => void;
};

/** Match tab setup — roommate search preferences (design-only). */
export function MatchPreferredRoommateScreen({
  onBack,
  onContinue,
}: MatchPreferredRoommateScreenProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { padH, contentMaxW, primaryButtonWidth } = useOnboardingCtaLayout();
  const scrollRef = useRef<ScrollView>(null);
  const budgetFieldLayout = useRef<{ y: number; h: number } | null>(null);
  const [keyboardBottomInset, setKeyboardBottomInset] = useState(0);
  const keyboardInsetRef = useRef(0);

  useEffect(() => {
    keyboardInsetRef.current = keyboardBottomInset;
  }, [keyboardBottomInset]);

  useEffect(() => {
    const showEvt =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvt, (e) => {
      setKeyboardBottomInset(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvt, () => {
      setKeyboardBottomInset(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const [prefGenderId, setPrefGenderId] = useState<string | null>(null);
  const [prefStatusId, setPrefStatusId] = useState<string | null>(null);
  const [prefRoomId, setPrefRoomId] = useState<string | null>(null);
  const [budgetDigits, setBudgetDigits] = useState('');
  const [moveInMonth, setMoveInMonth] = useState<string | null>(null);
  const [moveInTiming, setMoveInTiming] = useState<string | null>(null);
  const [preferredArea, setPreferredArea] = useState<MatchPreferredArea | null>(
    null,
  );
  const [preferredNeighborhood, setPreferredNeighborhood] = useState<
    string | null
  >(null);

  const [moveInPicker, setMoveInPicker] = useState<StepSixPickerTarget | null>(
    null,
  );
  const [locationPicker, setLocationPicker] = useState<
    'area' | 'neighborhood' | null
  >(null);

  const neighborhoodOptions = useMemo(
    () => neighborhoodsForArea(preferredArea),
    [preferredArea],
  );

  const scrollPaddingBottom =
    insets.bottom +
    CTA_DOCK_HEIGHT +
    space.lg +
    (keyboardBottomInset > 0 ? space.xxl + space.md : 0);

  const scrollBudgetIntoView = () => {
    const delayMs = Platform.OS === 'ios' ? 72 : 96;
    const topGap = space.lg;
    const bottomMargin = space.md;

    const applyScroll = () => {
      const kb = keyboardInsetRef.current;
      const reservedTop = insets.top + 52;
      const reservedBottom =
        kb > 0 ? kb + CTA_DOCK_HEIGHT + space.md : insets.bottom + CTA_DOCK_HEIGHT + space.lg;
      const viewportH = Math.max(
        220,
        windowHeight - reservedTop - reservedBottom,
      );

      const meta = budgetFieldLayout.current;
      const sv = scrollRef.current;
      if (!meta || !sv) return;
      const { y, h } = meta;
      let scrollY = y - topGap;
      const fieldBottom = y + h;
      const visibleBottom = scrollY + viewportH - bottomMargin;
      if (fieldBottom > visibleBottom) {
        scrollY = fieldBottom - viewportH + bottomMargin;
      }
      scrollY = Math.max(0, scrollY);
      sv.scrollTo({ y: scrollY, animated: true });
    };

    const tryLayout = (attempt: number) => {
      if (budgetFieldLayout.current && scrollRef.current) {
        applyScroll();
      } else if (attempt < 10) {
        setTimeout(() => tryLayout(attempt + 1), 45);
      }
    };

    requestAnimationFrame(() => {
      setTimeout(() => tryLayout(0), delayMs);
    });
  };

  const canContinue =
    prefGenderId != null &&
    prefStatusId != null &&
    prefRoomId != null &&
    budgetDigits.length > 0 &&
    moveInMonth != null &&
    moveInTiming != null &&
    preferredArea != null &&
    preferredNeighborhood != null;

  const moveInPickerValue =
    moveInPicker?.kind === 'month'
      ? moveInMonth
      : moveInPicker?.kind === 'timing'
        ? moveInTiming
        : null;

  const handleAreaSelect = (area: string) => {
    setPreferredArea(area as MatchPreferredArea);
    setPreferredNeighborhood(null);
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
          style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
        >
          <Ionicons name='chevron-back' size={26} color={ink} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: padH,
              paddingBottom: scrollPaddingBottom,
              flexGrow: 0,
            },
          ]}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode={
            Platform.OS === 'ios' ? 'interactive' : 'on-drag'
          }
          showsVerticalScrollIndicator={keyboardBottomInset > 0}
        >
        <View style={[styles.intro, { maxWidth: contentMaxW }]}>
          <Text style={styles.screenTitle}>What you&apos;re looking for</Text>
          <Text style={styles.screenSubtitle}>
            Set your roommate preferences and where you want to live.
          </Text>
        </View>

        <View style={[styles.form, { maxWidth: contentMaxW }]}>
          <FieldBlock label='Preferred roommate gender'>
            <GenderSegmentGrid
              options={PREF_GENDER_OPTIONS}
              valueId={prefGenderId}
              onChange={setPrefGenderId}
            />
          </FieldBlock>

          <FieldBlock label='Preferred status'>
            <IconChoiceCards
              options={PREF_STATUS_CHOICES}
              valueId={prefStatusId}
              onChange={setPrefStatusId}
              layout='row'
            />
          </FieldBlock>

          <FieldBlock label='Preferred room'>
            <IconChoiceCards
              options={PREF_ROOM_CHOICES}
              valueId={prefRoomId}
              onChange={setPrefRoomId}
              layout='grid'
            />
          </FieldBlock>

          <FieldBlock
            label='Monthly budget'
            onLayout={(e) => {
              const { y, height } = e.nativeEvent.layout;
              budgetFieldLayout.current = { y, h: height };
            }}
          >
            <View style={styles.budgetInputWrap}>
              <Text style={styles.budgetPrefix}>$</Text>
              <TextInput
                value={formatBudgetDisplay(budgetDigits)}
                onChangeText={(t) => setBudgetDigits(sanitizeBudgetInput(t))}
                placeholder='0'
                placeholderTextColor={captionMuted}
                style={styles.budgetInput}
                keyboardType='number-pad'
                selectionColor={colors.primary}
                accessibilityLabel='Monthly budget'
                onFocus={scrollBudgetIntoView}
              />
            </View>
          </FieldBlock>

          <FieldBlock label='Preferred move-in'>
            <View style={styles.splitRow}>
              <SelectTrigger
                value={moveInMonth}
                placeholder='Month'
                onPress={() => setMoveInPicker({ kind: 'month' })}
                accessibilityLabel='Move-in month'
              />
              <SelectTrigger
                value={moveInTiming}
                placeholder='Early / Mid / Late'
                onPress={() => setMoveInPicker({ kind: 'timing' })}
                accessibilityLabel='Move-in timing'
              />
            </View>
          </FieldBlock>

          <FieldBlock label='Preferred location' isLast>
            <View style={styles.splitRow}>
              <SelectTrigger
                value={preferredArea}
                placeholder='Area'
                onPress={() => setLocationPicker('area')}
                accessibilityLabel='Preferred area'
              />
              <SelectTrigger
                value={preferredNeighborhood}
                placeholder='Neighborhood'
                onPress={() => preferredArea && setLocationPicker('neighborhood')}
                disabled={!preferredArea}
                accessibilityLabel='Preferred neighborhood'
              />
            </View>
          </FieldBlock>
        </View>
        </ScrollView>

        <OnboardingBottomCta
          label='Start matching'
          onPress={() => canContinue && onContinue()}
          disabled={!canContinue}
          padH={padH}
          safeBottomInset={keyboardBottomInset > 0 ? 0 : insets.bottom}
          buttonWidth={primaryButtonWidth}
        />
      </KeyboardAvoidingView>

      <StepSixPickerSheet
        picker={moveInPicker}
        selectedValue={moveInPickerValue}
        onSelect={(value) => {
          if (!moveInPicker) return;
          if (moveInPicker.kind === 'month') setMoveInMonth(String(value));
          else if (moveInPicker.kind === 'timing') setMoveInTiming(String(value));
        }}
        onDismiss={() => setMoveInPicker(null)}
      />

      <MatchLocationPickerSheet
        visible={locationPicker === 'area'}
        title='Preferred area'
        subtitle='Where do you want to live?'
        options={MATCH_PREFERRED_AREAS}
        selectedValue={preferredArea}
        onSelect={handleAreaSelect}
        onDismiss={() => setLocationPicker(null)}
      />

      <MatchLocationPickerSheet
        visible={locationPicker === 'neighborhood'}
        title='Neighborhood'
        subtitle={
          preferredArea
            ? `Neighborhoods in ${preferredArea}`
            : 'Choose an area first'
        }
        options={neighborhoodOptions}
        selectedValue={preferredNeighborhood}
        onSelect={setPreferredNeighborhood}
        onDismiss={() => setLocationPicker(null)}
      />
    </View>
  );
}

function FieldBlock({
  label,
  children,
  isLast,
  onLayout,
}: {
  label: string;
  children: ReactNode;
  isLast?: boolean;
  onLayout?: (e: LayoutChangeEvent) => void;
}) {
  return (
    <View
      style={[styles.fieldBlock, isLast && styles.fieldBlockLast]}
      collapsable={false}
      onLayout={onLayout}
    >
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function SelectTrigger({
  value,
  placeholder,
  onPress,
  disabled,
  accessibilityLabel,
}: {
  value: string | null;
  placeholder: string;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.selectTrigger,
        disabled && styles.selectTriggerDisabled,
        pressed && !disabled && styles.selectTriggerPressed,
      ]}
    >
      <Text
        style={[styles.selectTriggerText, !value && styles.selectTriggerPlaceholder]}
        numberOfLines={1}
      >
        {value ?? placeholder}
      </Text>
      <Ionicons
        name='chevron-down'
        size={18}
        color={disabled ? 'rgba(142,142,147,0.5)' : captionMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  headerRow: {
    paddingBottom: space.xs,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    marginLeft: -space.xs,
    padding: space.xs,
    borderRadius: radius.sm,
  },
  backBtnPressed: {
    opacity: 0.55,
  },
  scrollContent: {
    paddingTop: space.xs,
    width: '100%',
    alignSelf: 'center',
  },
  intro: {
    alignSelf: 'center',
    width: '100%',
    marginBottom: space.xl,
  },
  form: {
    alignSelf: 'center',
    width: '100%',
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.8,
    lineHeight: 36,
    marginBottom: space.sm,
  },
  screenSubtitle: {
    fontSize: type.body,
    lineHeight: 22,
    color: labelSecondary,
    letterSpacing: -0.2,
  },
  fieldBlock: {
    marginBottom: space.lg + space.sm,
  },
  fieldBlockLast: {
    marginBottom: 0,
  },
  fieldLabel: {
    fontSize: type.caption,
    fontWeight: '600',
    color: labelSecondary,
    letterSpacing: -0.1,
    marginBottom: space.sm,
    textTransform: 'uppercase',
  },
  budgetInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: Platform.select({ ios: 15, default: 14 }),
    borderRadius: radius.sm + 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: fieldBorder,
    backgroundColor: fieldFill,
  },
  budgetPrefix: {
    fontSize: type.bodyLarge,
    fontWeight: '600',
    color: labelSecondary,
    marginRight: space.xs,
  },
  budgetInput: {
    flex: 1,
    fontSize: type.bodyLarge,
    fontWeight: '500',
    color: ink,
    letterSpacing: -0.3,
    padding: 0,
  },
  splitRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  selectTrigger: {
    flex: 1,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: Platform.select({ ios: 15, default: 14 }),
    borderRadius: radius.sm + 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: fieldBorder,
    backgroundColor: fieldFill,
  },
  selectTriggerDisabled: {
    opacity: 0.45,
  },
  selectTriggerPressed: {
    opacity: 0.92,
  },
  selectTriggerText: {
    flex: 1,
    fontSize: type.bodyLarge,
    fontWeight: '400',
    color: ink,
    letterSpacing: -0.3,
  },
  selectTriggerPlaceholder: {
    color: captionMuted,
  },
});
