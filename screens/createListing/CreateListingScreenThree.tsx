import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboardingCtaLayout } from '../../design/onboardingCtaLayout';
import { colors, gradientPrimaryHorizontal, radius, space, type } from '../../design/theme';
import { CreateListingPrimaryCta } from './CreateListingPrimaryCta';
import type { ListingRoomRow, ListingStep3Snapshot } from './createListingTypes';
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
  STEP_PROPERTY,
  white,
} from './createListingTokens';

const PROPERTY_TYPES = [
  { id: 'apartment', label: 'Apartment', icon: 'business-outline' as const },
  { id: 'walkup', label: 'Walk-ups', icon: 'layers-outline' as const },
  { id: 'house', label: 'House', icon: 'home-outline' as const },
  { id: 'dorm', label: 'Dormitory', icon: 'school-outline' as const },
];

const COUNT_LABELS = (n: number, unit: 'bed' | 'bath') => {
  const u = unit === 'bed' ? 'Bedroom' : 'Bathroom';
  if (n === 0) return `0 ${u}s`;
  if (n === 1) return `1 ${u}`;
  return `${n} ${u}s`;
};

const ROOM_KINDS = [
  'Master w/ Bath',
  'Master w/o Bath',
  'Regular',
  'Flex',
  'Entire Unit',
  'Studio',
  'Etc',
] as const;

/** Max distinct room-type + price rows on this step */
const MAX_ROOM_TYPE_ROWS = 4;

export type CreateListingScreenThreeProps = {
  restoredSnapshot?: ListingStep3Snapshot | null;
  onClose: () => void;
  onBack: () => void;
  onContinue: (snapshot: ListingStep3Snapshot) => void;
};

export function CreateListingScreenThree({
  restoredSnapshot = null,
  onClose,
  onBack,
  onContinue,
}: CreateListingScreenThreeProps) {
  const insets = useSafeAreaInsets();
  const { padH, contentMaxW, primaryButtonWidth } = useOnboardingCtaLayout();
  const innerW = contentMaxW;

  const [propertyTypeId, setPropertyTypeId] = useState<string | null>(
    () => restoredSnapshot?.propertyTypeId ?? null,
  );
  const [bedroom, setBedroom] = useState<number | null>(
    () => restoredSnapshot?.bedroom ?? null,
  );
  const [bathroom, setBathroom] = useState<number | null>(
    () => restoredSnapshot?.bathroom ?? null,
  );
  const [rooms, setRooms] = useState<ListingRoomRow[]>(
    () => restoredSnapshot?.rooms ?? [],
  );

  const [picker, setPicker] = useState<
    | { kind: 'bed' }
    | { kind: 'bath' }
    | { kind: 'roomKind'; index: number }
    | null
  >(null);

  const stepValid = useMemo(() => {
    if (!propertyTypeId || bedroom == null || bathroom == null) return false;
    if (rooms.length === 0 || rooms.length > MAX_ROOM_TYPE_ROWS) return false;
    return rooms.every((r) => {
      if (!r.kind.trim()) return false;
      const digits = r.price.replace(/\D/g, '');
      const n = digits ? Number.parseInt(digits, 10) : 0;
      return n > 0;
    });
  }, [propertyTypeId, bedroom, bathroom, rooms]);

  const openBedPicker = () => setPicker({ kind: 'bed' });
  const openBathPicker = () => setPicker({ kind: 'bath' });
  const openRoomKindPicker = (index: number) =>
    setPicker({ kind: 'roomKind', index });

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(
    new Animated.Value(Math.min(520, Dimensions.get('window').height * 0.62)),
  ).current;

  const sheetClosedY = useCallback(
    () => Math.min(520, Dimensions.get('window').height * 0.62),
    [],
  );

  const dismissSheet = useCallback(() => {
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
      if (finished) setPicker(null);
    });
  }, [backdropOpacity, sheetClosedY, sheetTranslateY]);

  useEffect(() => {
    if (picker == null) return;
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
  }, [picker, backdropOpacity, sheetClosedY, sheetTranslateY]);

  const addRoom = () => {
    setRooms((prev) =>
      prev.length >= MAX_ROOM_TYPE_ROWS
        ? prev
        : [...prev, { id: `r-${Date.now()}`, kind: '', price: '' }],
    );
  };

  const removeRoomAt = (index: number) => {
    setRooms((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRoom = (index: number, patch: Partial<ListingRoomRow>) => {
    setRooms((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  };

  const progressFraction = STEP_PROPERTY / LISTING_TOTAL_STEPS;

  const pickerOptions =
    picker?.kind === 'bed' || picker?.kind === 'bath'
      ? [0, 1, 2, 3].map((n) => ({
          key: String(n),
          label:
            picker.kind === 'bed'
              ? COUNT_LABELS(n, 'bed')
              : COUNT_LABELS(n, 'bath'),
          value: n,
        }))
      : picker?.kind === 'roomKind'
        ? ROOM_KINDS.map((k) => ({ key: k, label: k, value: k }))
        : [];

  const applyPicker = (value: string | number) => {
    if (!picker) return;
    if (picker.kind === 'bed') {
      setBedroom(value as number);
    } else if (picker.kind === 'bath') {
      setBathroom(value as number);
    } else {
      updateRoom(picker.index, { kind: String(value) });
    }
    dismissSheet();
  };

  const sheetCopy =
    picker?.kind === 'bed'
      ? {
          title: 'Bedrooms',
          subtitle: 'Guests see this on your listing so they know what to expect.',
        }
      : picker?.kind === 'bath'
        ? {
            title: 'Bathrooms',
            subtitle: 'Include full and half baths the way you advertise the home.',
          }
        : picker?.kind === 'roomKind'
          ? {
              title: 'Room type',
              subtitle: 'Each row can use a different type and price.',
            }
          : { title: '', subtitle: '' };

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
              {`Step ${STEP_PROPERTY} of ${LISTING_TOTAL_STEPS} · Property details`}
            </Text>
          </View>

          <Text style={[styles.sectionLabel, { width: innerW, alignSelf: 'center' }]}>
            Property type <Text style={styles.asterisk}>*</Text>
          </Text>
          <View style={[styles.typeRow, { width: innerW, alignSelf: 'center' }]}>
            {PROPERTY_TYPES.map((pt) => {
              const selected = propertyTypeId === pt.id;
              return (
                <Pressable
                  key={pt.id}
                  accessibilityRole='button'
                  accessibilityState={{ selected }}
                  onPress={() => setPropertyTypeId(pt.id)}
                  style={({ pressed }) => [
                    styles.typeCard,
                    selected && styles.typeCardSelected,
                    pressed && styles.typeCardPressed,
                  ]}
                >
                  <Ionicons
                    name={pt.icon}
                    size={26}
                    color={selected ? colors.primary : ink}
                  />
                  <Text
                    style={[styles.typeCardLabel, selected && styles.typeCardLabelSelected]}
                    numberOfLines={2}
                  >
                    {pt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.sectionLabel, { width: innerW, alignSelf: 'center' }]}>
            Bedroom & Bathroom <Text style={styles.asterisk}>*</Text>
          </Text>
          <View style={[styles.splitRow, { width: innerW, alignSelf: 'center' }]}>
            <Pressable
              accessibilityRole='button'
              onPress={openBedPicker}
              style={({ pressed }) => [
                styles.splitCell,
                pressed && styles.inputShellPressed,
              ]}
            >
              <Text
                style={[styles.inputLikeText, bedroom == null && styles.placeholderText]}
                numberOfLines={1}
              >
                {bedroom == null ? 'Bedroom' : COUNT_LABELS(bedroom, 'bed')}
              </Text>
              <Ionicons name='chevron-down' size={18} color={labelSecondary} />
            </Pressable>
            <Pressable
              accessibilityRole='button'
              onPress={openBathPicker}
              style={({ pressed }) => [
                styles.splitCell,
                pressed && styles.inputShellPressed,
              ]}
            >
              <Text
                style={[styles.inputLikeText, bathroom == null && styles.placeholderText]}
                numberOfLines={1}
              >
                {bathroom == null ? 'Bathroom' : COUNT_LABELS(bathroom, 'bath')}
              </Text>
              <Ionicons name='chevron-down' size={18} color={labelSecondary} />
            </Pressable>
          </View>

          <Text style={[styles.sectionLabel, { width: innerW, alignSelf: 'center' }]}>
            Room type <Text style={styles.asterisk}>*</Text>
          </Text>
          {rooms.map((row, index) => (
            <View
              key={row.id}
              style={[styles.roomRow, { width: innerW, alignSelf: 'center' }]}
            >
              <Pressable
                accessibilityRole='button'
                onPress={() => openRoomKindPicker(index)}
                style={({ pressed }) => [
                  styles.roomKindCell,
                  pressed && styles.inputShellPressed,
                ]}
              >
                <Text
                  style={[styles.inputLikeText, !row.kind && styles.placeholderText]}
                  numberOfLines={1}
                >
                  {row.kind || 'Room type'}
                </Text>
                <Ionicons name='chevron-down' size={18} color={labelSecondary} />
              </Pressable>
              <View style={styles.roomPriceCell}>
                <Text style={styles.pricePrefix}>$</Text>
                <TextInput
                  value={row.price}
                  onChangeText={(t) => updateRoom(index, { price: t.replace(/[^\d]/g, '') })}
                  placeholder='0'
                  placeholderTextColor={captionMuted}
                  keyboardType='number-pad'
                  selectionColor={colors.primary}
                  style={styles.roomPriceInput}
                />
              </View>
              <Pressable
                accessibilityRole='button'
                accessibilityLabel='Remove room'
                onPress={() => removeRoomAt(index)}
                style={({ pressed }) => [
                  styles.removeRoomBtn,
                  pressed && styles.removeRoomBtnPressed,
                ]}
              >
                <Ionicons name='remove' size={20} color={ink} />
              </Pressable>
            </View>
          ))}

          {rooms.length < MAX_ROOM_TYPE_ROWS ? (
            <Pressable
              accessibilityRole='button'
              accessibilityLabel='Add a room'
              onPress={addRoom}
              style={({ pressed }) => [styles.addRoom, pressed && { opacity: 0.7 }]}
            >
              <View style={styles.addRoomIcon}>
                <Ionicons name='add' size={18} color={colors.primary} />
              </View>
              <Text style={styles.addRoomText}>Add a room</Text>
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
          onPress={() =>
            onContinue({
              propertyTypeId,
              bedroom,
              bathroom,
              rooms,
            })
          }
          width={primaryButtonWidth}
        />
      </View>

      <Modal
        visible={picker != null}
        transparent
        animationType='none'
        onRequestClose={dismissSheet}
      >
        <View style={styles.modalRoot}>
          <Animated.View
            pointerEvents='box-none'
            style={[StyleSheet.absoluteFillObject, { opacity: backdropOpacity }]}
          >
            <Pressable
              accessibilityRole='button'
              accessibilityLabel='Dismiss'
              style={StyleSheet.absoluteFill}
              onPress={dismissSheet}
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
                <Text style={styles.sheetTitle}>{sheetCopy.title}</Text>
                {sheetCopy.subtitle ? (
                  <Text style={styles.sheetSubtitle}>{sheetCopy.subtitle}</Text>
                ) : null}
              </View>
              <Pressable
                accessibilityRole='button'
                accessibilityLabel='Cancel'
                hitSlop={12}
                onPress={dismissSheet}
                style={({ pressed }) => [
                  styles.sheetCancelHit,
                  pressed && styles.headerButtonPressed,
                ]}
              >
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </Pressable>
            </View>

            <View style={styles.sheetOptionsCard}>
              <ScrollView
                keyboardShouldPersistTaps='handled'
                nestedScrollEnabled
                scrollEnabled={picker?.kind === 'roomKind'}
                style={picker?.kind === 'roomKind' ? styles.sheetRoomKindOptionsScroll : undefined}
                showsVerticalScrollIndicator={picker?.kind === 'roomKind'}
              >
                {pickerOptions.map((opt, index) => {
                  const isLast = index === pickerOptions.length - 1;
                  const isSelected =
                    picker?.kind === 'bed'
                      ? bedroom === opt.value
                      : picker?.kind === 'bath'
                        ? bathroom === opt.value
                        : picker?.kind === 'roomKind'
                          ? rooms[picker.index]?.kind === opt.value
                          : false;
                  return (
                    <Pressable
                      key={opt.key}
                      accessibilityRole='menuitem'
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => applyPicker(opt.value)}
                      style={({ pressed }) => [
                        styles.sheetOptionRow,
                        !isLast && styles.sheetOptionRowBorder,
                        isSelected && styles.sheetOptionRowSelected,
                        pressed &&
                          (isSelected
                            ? styles.sheetOptionRowPressedSelected
                            : styles.sheetOptionRowPressed),
                      ]}
                    >
                      <Text
                        style={[styles.sheetRowText, isSelected && styles.sheetRowTextSelected]}
                        numberOfLines={2}
                      >
                        {opt.label}
                      </Text>
                      <Ionicons
                        name='checkmark-circle'
                        size={24}
                        color={colors.primary}
                        style={[styles.sheetCheck, !isSelected && styles.sheetCheckHidden]}
                      />
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </Animated.View>
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
  asterisk: {
    color: required,
    fontWeight: '600',
  },
  typeRow: {
    flexDirection: 'row',
    gap: space.sm,
    marginBottom: space.xl,
  },
  typeCard: {
    flex: 1,
    minWidth: 0,
    aspectRatio: 1,
    borderRadius: radius.sm + 2,
    borderWidth: 1,
    borderColor: fieldBorder,
    backgroundColor: white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xs,
    paddingVertical: space.sm,
  },
  typeCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(47,109,246,0.06)',
  },
  typeCardPressed: {
    opacity: 0.9,
  },
  typeCardLabel: {
    marginTop: space.xs,
    fontSize: type.micro,
    lineHeight: 14,
    fontWeight: '600',
    color: ink,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  typeCardLabelSelected: {
    color: colors.primary,
  },
  splitRow: {
    flexDirection: 'row',
    gap: space.sm,
    marginBottom: space.xl,
  },
  splitCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: Platform.select({ ios: 52, default: 50 }),
    borderRadius: radius.sm + 2,
    paddingHorizontal: space.lg,
    paddingVertical: Platform.select({ ios: 15, default: 14 }),
    backgroundColor: fieldFill,
    borderWidth: 1,
    borderColor: fieldBorder,
  },
  inputShellPressed: {
    opacity: 0.88,
  },
  inputLikeText: {
    flex: 1,
    fontSize: type.bodyLarge,
    lineHeight: 22,
    fontWeight: '500',
    color: ink,
    letterSpacing: -0.25,
    minWidth: 0,
  },
  placeholderText: {
    color: captionMuted,
    fontWeight: '400',
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginBottom: space.sm,
  },
  roomKindCell: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: Platform.select({ ios: 52, default: 50 }),
    borderRadius: radius.sm + 2,
    paddingHorizontal: space.md,
    paddingVertical: Platform.select({ ios: 15, default: 14 }),
    backgroundColor: fieldFill,
    borderWidth: 1,
    borderColor: fieldBorder,
  },
  roomPriceCell: {
    flex: 0.85,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: Platform.select({ ios: 52, default: 50 }),
    borderRadius: radius.sm + 2,
    paddingHorizontal: space.md,
    backgroundColor: fieldFill,
    borderWidth: 1,
    borderColor: fieldBorder,
  },
  pricePrefix: {
    fontSize: type.bodyLarge,
    fontWeight: '600',
    color: ink,
    marginRight: space.xs,
  },
  roomPriceInput: {
    flex: 1,
    padding: 0,
    margin: 0,
    fontSize: type.bodyLarge,
    fontWeight: '500',
    color: ink,
    letterSpacing: -0.25,
    minWidth: 0,
  },
  removeRoomBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: fieldBorder,
    backgroundColor: white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeRoomBtnPressed: {
    opacity: 0.75,
  },
  addRoom: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: space.sm,
    marginBottom: space.lg,
    gap: space.sm,
  },
  addRoomIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: fieldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: white,
  },
  addRoomText: {
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
  sheetOptionsCard: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: fieldBorder,
    overflow: 'hidden',
    backgroundColor: white,
  },
  sheetRoomKindOptionsScroll: {
    maxHeight: 56 * 5 + 20,
  },
  sheetOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    minHeight: 56,
    paddingVertical: space.sm,
    paddingLeft: space.lg,
    paddingRight: space.md,
  },
  sheetOptionRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: fieldBorder,
  },
  sheetOptionRowSelected: {
    backgroundColor: 'rgba(47, 109, 246, 0.07)',
  },
  sheetOptionRowPressed: {
    backgroundColor: 'rgba(60, 60, 67, 0.06)',
  },
  sheetOptionRowPressedSelected: {
    backgroundColor: 'rgba(47, 109, 246, 0.12)',
  },
  sheetRowText: {
    flex: 1,
    fontSize: type.bodyLarge,
    fontWeight: '500',
    color: ink,
    letterSpacing: -0.25,
    minWidth: 0,
  },
  sheetRowTextSelected: {
    fontWeight: '700',
    color: colors.primary,
  },
  sheetCheck: {
    flexShrink: 0,
  },
  sheetCheckHidden: {
    opacity: 0,
  },
});
