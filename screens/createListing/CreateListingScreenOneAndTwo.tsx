import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
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
import {
  ASPECT_H_PER_W,
  BOTTOM_CTA_SCROLL_CLEARANCE,
  GRID_COLS,
  captionMuted,
  dangerSlot,
  fieldBorder,
  fieldFill,
  ink,
  labelSecondary,
  LISTING_TOTAL_STEPS,
  MAX_PHOTOS,
  MIN_PHOTOS_CONTINUE,
  pageBg,
  progressTrackBg,
  required,
  SLOT_GAP,
  STEP_ADDRESS,
  STEP_PHOTOS,
  white,
} from './createListingTokens';

const fieldBorderSlot = fieldBorder;

const DUMMY_PHOTO_SOURCES: ImageSourcePropType[] = [
  require('../../assets/img/banner1.png'),
  require('../../assets/img/user_banner.png'),
  require('../../assets/img/agent_banner.png'),
  require('../../assets/img/personal_onboarding.png'),
  require('../../assets/img/agent_onboarding.png'),
];

const ADDRESS_SUGGESTIONS: { id: string; line: string; zip: string }[] = [
  {
    id: '1',
    line: '30 River Road, New York, New York 10044, United States',
    zip: '10044',
  },
  {
    id: '2',
    line: '30 River Road, Rockville Centre, New York 11570, United States',
    zip: '11570',
  },
  {
    id: '3',
    line: '30 River Road, Chatham, New Jersey 07928, United States',
    zip: '07928',
  },
  {
    id: '4',
    line: '30 River Road, North Arlington, New Jersey 07031, United States',
    zip: '07031',
  },
  {
    id: '5',
    line: '30 River Road, Clifton, New Jersey 07014, United States',
    zip: '07014',
  },
];

type Step = 'photos' | 'address' | 'search';

/** Listing flow steps 1 (photos) + 2 (address), mirroring `PersonalOnboardingScreen` / `Two` split. */
export type CreateListingScreenOneAndTwoProps = {
  onClose: () => void;
  /** Called when address step passes validation (design: advance to property step). */
  onContinuePastAddress?: () => void;
};

export function CreateListingScreenOneAndTwo({
  onClose,
  onContinuePastAddress,
}: CreateListingScreenOneAndTwoProps) {
  const insets = useSafeAreaInsets();
  const { padH, contentMaxW, primaryButtonWidth } = useOnboardingCtaLayout();

  const [step, setStep] = useState<Step>('photos');
  const [displayedAddress, setDisplayedAddress] = useState('');
  const [actualAddress, setActualAddress] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedField, setFocusedField] = useState<
    'displayed' | 'unit' | 'search' | 'youtube' | null
  >(null);

  const [photos, setPhotos] = useState<
    { id: string; source: ImageSourcePropType }[]
  >([]);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerBusy, setPickerBusy] = useState(false);

  const addressStepValid = useMemo(
    () =>
      displayedAddress.trim().length > 0 &&
      actualAddress.trim().length > 0 &&
      unitNumber.trim().length > 0,
    [displayedAddress, actualAddress, unitNumber],
  );

  const photosStepValid = photos.length >= MIN_PHOTOS_CONTINUE;

  const openSearch = useCallback(() => {
    setSearchQuery(actualAddress || '30 River Road, New York');
    setStep('search');
    setFocusedField('search');
  }, [actualAddress]);

  const selectSuggestion = useCallback((line: string) => {
    setActualAddress(line);
    setStep('address');
    setFocusedField(null);
  }, []);

  const filteredSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ADDRESS_SUGGESTIONS;
    return ADDRESS_SUGGESTIONS.filter((s) => s.line.toLowerCase().includes(q));
  }, [searchQuery]);

  const handleBack = () => {
    if (step === 'search') {
      setStep('address');
      setFocusedField(null);
      return;
    }
    if (step === 'address') {
      setStep('photos');
      return;
    }
    onClose();
  };

  const handleHeaderClose = () => {
    onClose();
  };

  const handleContinueFromPhotos = () => {
    if (!photosStepValid) return;
    setStep('address');
  };

  const handleContinueFromAddress = () => {
    if (!addressStepValid) return;
    if (onContinuePastAddress) {
      onContinuePastAddress();
    } else {
      onClose();
    }
  };

  const handleGalleryPick = () => {
    setPickerBusy(true);
    setTimeout(() => {
      setPhotos((prev) => {
        const room = MAX_PHOTOS - prev.length;
        if (room <= 0) return prev;
        const add = Math.min(3, room);
        const next = [...prev];
        for (let i = 0; i < add; i++) {
          next.push({
            id: `p-${Date.now()}-${i}`,
            source:
              DUMMY_PHOTO_SOURCES[(prev.length + i) % DUMMY_PHOTO_SOURCES.length],
          });
        }
        return next;
      });
      setPickerBusy(false);
      setPickerOpen(false);
    }, 650);
  };

  const removePhotoAt = (index: number) => {
    setPhotos((p) => p.filter((_, i) => i !== index));
  };

  const innerW = contentMaxW;

  const listingProgressFraction = useMemo(() => {
    if (step === 'photos') {
      return STEP_PHOTOS / LISTING_TOTAL_STEPS;
    }
    return STEP_ADDRESS / LISTING_TOTAL_STEPS;
  }, [step]);

  const renderProgress = () => (
    <View style={[styles.progressBlock, { width: innerW, alignSelf: 'center' }]}>
      <View style={styles.progressTrack}>
        <LinearGradient
          colors={gradientPrimaryHorizontal}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[
            styles.progressFill,
            { width: `${Math.min(100, listingProgressFraction * 100)}%` },
          ]}
        />
      </View>
      <Text style={styles.progressCaption}>
        {step === 'photos'
          ? `Step ${STEP_PHOTOS} of ${LISTING_TOTAL_STEPS} · Photos & video`
          : `Step ${STEP_ADDRESS} of ${LISTING_TOTAL_STEPS} · Verify address`}
      </Text>
    </View>
  );

  const renderAddressStep = () => (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={[
          styles.scrollPad,
          {
            paddingTop: space.sm,
            paddingBottom: insets.bottom + BOTTOM_CTA_SCROLL_CLEARANCE,
            paddingHorizontal: padH,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentNarrow, { maxWidth: contentMaxW }]}>
          {renderProgress()}

          <View style={{ width: innerW, alignSelf: 'center' }}>
            <View style={styles.fieldBlock}>
              <Text style={styles.label}>
                Displayed address <Text style={styles.asterisk}>*</Text>
              </Text>
              <TextInput
                value={displayedAddress}
                onChangeText={setDisplayedAddress}
                onFocus={() => setFocusedField('displayed')}
                onBlur={() => setFocusedField(null)}
                placeholder='e.g. E 14th St'
                placeholderTextColor={captionMuted}
                selectionColor={colors.primary}
                style={[
                  styles.inputShell,
                  styles.inputShellText,
                  focusedField === 'displayed' && styles.inputShellFocused,
                ]}
              />
              <Text style={styles.helper}>Shown on your public listing.</Text>
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>
                Actual address <Text style={styles.asterisk}>*</Text>
              </Text>
              <Pressable
                accessibilityRole='button'
                accessibilityLabel='Search address'
                onPress={openSearch}
                style={({ pressed }) => [
                  styles.inputShell,
                  styles.searchAddressRow,
                  pressed && styles.inputShellPressed,
                ]}
              >
                <Ionicons
                  name='search-outline'
                  size={20}
                  color={labelSecondary}
                  style={styles.searchAddressRowIcon}
                />
                <Text
                  style={[styles.inputLikeText, !actualAddress && styles.placeholderText]}
                  numberOfLines={1}
                >
                  {actualAddress || 'Search for your street address'}
                </Text>
              </Pressable>
              <Text style={styles.helper}>Verification only — never displayed publicly.</Text>
            </View>

            <View style={styles.fieldBlockLast}>
              <Text style={styles.label}>
                Unit number <Text style={styles.asterisk}>*</Text>
              </Text>
              <TextInput
                value={unitNumber}
                onChangeText={setUnitNumber}
                onFocus={() => setFocusedField('unit')}
                onBlur={() => setFocusedField(null)}
                placeholder='Apt, floor, or unit'
                placeholderTextColor={captionMuted}
                selectionColor={colors.primary}
                style={[
                  styles.inputShell,
                  styles.inputShellText,
                  focusedField === 'unit' && styles.inputShellFocused,
                ]}
              />
              <Text style={styles.helper}>Verification only — never displayed publicly.</Text>
            </View>
          </View>
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
          disabled={!addressStepValid}
          onPress={handleContinueFromAddress}
          width={primaryButtonWidth}
        />
      </View>
    </KeyboardAvoidingView>
  );

  const renderSearchStep = () => (
    <View style={styles.flex}>
      <View
        style={[
          styles.searchTopSafe,
          { paddingTop: insets.top + space.md, paddingHorizontal: padH },
        ]}
      >
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Go back'
          hitSlop={10}
          onPress={() => {
            setStep('address');
            setFocusedField(null);
          }}
          style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}
        >
          <Ionicons name='arrow-back' size={22} color={ink} />
        </Pressable>
        <Text style={styles.searchScreenTitle}>Search address</Text>
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Close search'
          hitSlop={10}
          onPress={() => {
            setStep('address');
            setFocusedField(null);
          }}
          style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}
        >
          <Ionicons name='close' size={22} color={ink} />
        </Pressable>
      </View>

      <View style={[styles.searchFieldSection, { paddingHorizontal: padH }]}>
        <View
          style={[
            styles.inputShell,
            focusedField === 'search' && styles.inputShellFocused,
          ]}
        >
          <Ionicons
            name='search-outline'
            size={20}
            color={labelSecondary}
            style={styles.searchFieldIcon}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder='Street, neighborhood, or ZIP'
            placeholderTextColor={captionMuted}
            autoFocus
            onFocus={() => setFocusedField('search')}
            onBlur={() => setFocusedField(null)}
            selectionColor={colors.primary}
            underlineColorAndroid='transparent'
            style={styles.searchInlineInput}
          />
        </View>
      </View>

      <FlatList
        data={filteredSuggestions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: padH,
          paddingBottom: insets.bottom + space.lg,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps='handled'
        ItemSeparatorComponent={() => <View style={styles.suggestionSeparator} />}
        ListEmptyComponent={
          <Text style={styles.emptySearch}>No matches for that search.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => selectSuggestion(item.line)}
            style={({ pressed }) => [
              styles.suggestionRow,
              pressed && styles.suggestionRowPressed,
            ]}
          >
            <View style={styles.suggestionRowText}>
              <Text style={styles.suggestionPrimary} numberOfLines={2}>
                {item.line}
              </Text>
              <Text style={styles.suggestionMeta}>{item.zip}</Text>
            </View>
            <Ionicons name='chevron-forward' size={18} color={captionMuted} />
          </Pressable>
        )}
      />
    </View>
  );

  const renderListingPhotoGrid = () => {
    const cardPad = space.md;
    const innerGridW = innerW - cardPad * 2;
    const cellW =
      Math.floor(
        ((innerGridW - SLOT_GAP * (GRID_COLS - 1)) / GRID_COLS) * 100,
      ) / 100;
    const cellH = cellW * ASPECT_H_PER_W;
    const showAdd = photos.length < MAX_PHOTOS;
    /** Add tile always first; then photos left-to-right (reference: 1 add + N photos). */
    const slotCount = showAdd ? photos.length + 1 : photos.length;
    const rows = Math.ceil(slotCount / GRID_COLS);
    const showPhotoError = photos.length < MIN_PHOTOS_CONTINUE;

    return (
      <>
        <View style={[styles.photoCardWrap, { width: innerW, alignSelf: 'center' }]}>
          <View style={[styles.photoGrid, { gap: SLOT_GAP }]}>
            {Array.from({ length: rows }, (_, row) => {
              const rowStart = row * GRID_COLS;
              const colsThisRow = Math.min(GRID_COLS, slotCount - rowStart);
              if (colsThisRow <= 0) return null;

              return (
                <View
                  key={row}
                  style={[styles.photoGridRow, { gap: SLOT_GAP }]}
                >
                  {Array.from({ length: colsThisRow }, (_, col) => {
                    const index = rowStart + col;
                    const isAddSlot = showAdd && index === 0;
                    const photoIdx = showAdd ? index - 1 : index;
                    const item =
                      !isAddSlot && photoIdx >= 0 && photoIdx < photos.length
                        ? photos[photoIdx]
                        : null;
                    const hasPhoto = item != null;
                    return (
                      <View
                        key={`${row}-${col}`}
                        style={[
                          styles.slot,
                          { width: cellW, height: cellH },
                          isAddSlot
                            ? styles.slotAdd
                            : hasPhoto
                              ? styles.slotFilled
                              : styles.slotEmpty,
                        ]}
                      >
                        <Pressable
                          accessibilityRole='button'
                          accessibilityLabel={
                            isAddSlot
                              ? 'Add photos from gallery'
                              : hasPhoto
                                ? `Photo ${photoIdx + 1}`
                                : 'Empty slot'
                          }
                          onPress={() => {
                            if (isAddSlot && photos.length < MAX_PHOTOS) {
                              setPickerOpen(true);
                            }
                          }}
                          style={({ pressed }) => [
                            styles.slotPressable,
                            pressed && hasPhoto && styles.slotPressed,
                          ]}
                        >
                          {hasPhoto ? (
                            <Image
                              source={item!.source}
                              style={styles.slotImage}
                              resizeMode='cover'
                            />
                          ) : isAddSlot ? (
                            <View style={styles.slotAddInner}>
                              <Ionicons
                                name='image-outline'
                                size={34}
                                color='rgba(100,116,139,0.72)'
                              />
                              <View style={styles.slotAddPlusBadge}>
                                <Ionicons name='add' size={14} color='rgba(71,85,105,0.95)' />
                              </View>
                            </View>
                          ) : null}
                        </Pressable>
                        {hasPhoto ? (
                          <Pressable
                            accessibilityRole='button'
                            accessibilityLabel={`Remove photo ${photoIdx + 1}`}
                            onPress={() => removePhotoAt(photoIdx)}
                            hitSlop={10}
                            style={({ pressed }) => [
                              styles.trashBtnSlot,
                              pressed && { opacity: 0.85 },
                            ]}
                          >
                            <Ionicons name='trash' size={14} color='#FFFFFF' />
                          </Pressable>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>

          <View style={styles.photoGridMetaRow}>
            <View style={styles.photoGridMetaLeft}>
              <Ionicons
                name='information-circle-outline'
                size={16}
                color={captionMuted}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.photoGridMetaHint}>Hold & drag to reorder</Text>
            </View>
            <Text style={styles.photoGridMetaCount}>
              {photos.length}/{MAX_PHOTOS} photos
            </Text>
          </View>
        </View>

        {showPhotoError ? (
          <View
            style={[styles.errorSurfaceSlot, { width: innerW, alignSelf: 'center' }]}
          >
            <Ionicons name='alert-circle' size={18} color={dangerSlot} />
            <Text style={styles.errorTextSlot}>
              {`Please upload at least ${MIN_PHOTOS_CONTINUE} photos to continue.`}
            </Text>
          </View>
        ) : null}
      </>
    );
  };

  const renderPhotosStep = () => (
    <View style={styles.flex}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: space.sm,
          paddingBottom: insets.bottom + BOTTOM_CTA_SCROLL_CLEARANCE,
          paddingHorizontal: padH,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentNarrow, { maxWidth: contentMaxW }]}>
          {renderProgress()}

          <View style={[styles.introBullets, { width: innerW, alignSelf: 'center' }]}>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletGlyph} accessibilityElementsHidden>
                •
              </Text>
              <Text
                style={styles.introBulletText}
                numberOfLines={1}
                ellipsizeMode='tail'
                accessibilityLabel='Please upload at least 4 real photos of your space.'
              >
                <Text style={styles.bulletBold}>4+ real photos</Text> of your actual space.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletGlyph} accessibilityElementsHidden>
                •
              </Text>
              <Text
                style={styles.introBulletText}
                numberOfLines={1}
                ellipsizeMode='tail'
                accessibilityLabel='Do not use photos from websites or other people.'
              >
                {`No web, stock, or other people's photos.`}
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletGlyph} accessibilityElementsHidden>
                •
              </Text>
              <Text
                style={styles.introBulletText}
                numberOfLines={1}
                ellipsizeMode='tail'
                accessibilityLabel='High-quality photos attract up to 3 times more attention.'
              >
                <Text style={styles.bulletBold}>Quality photos</Text> get up to{' '}
                <Text style={styles.bulletBold}>3x</Text> more attention.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletGlyph} accessibilityElementsHidden>
                •
              </Text>
              <Text
                style={styles.introBulletText}
                numberOfLines={1}
                ellipsizeMode='tail'
                accessibilityLabel='Include photos of your room, kitchen, and bathroom.'
              >
                Show <Text style={styles.bulletBold}>room, kitchen & bathroom</Text>.
              </Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletGlyph} accessibilityElementsHidden>
                •
              </Text>
              <Text
                style={styles.introBulletText}
                numberOfLines={1}
                ellipsizeMode='tail'
                accessibilityLabel='Recommend 4:3 horizontal photos for best display.'
              >
                <Text style={styles.bulletBold}>4:3 horizontal</Text> fits the listing best.
              </Text>
            </View>
          </View>

          {renderListingPhotoGrid()}

          <View style={[styles.youtubeBlock, { width: innerW, alignSelf: 'center' }]}>
            <Text style={styles.label}>YouTube URL (Optional)</Text>
            <TextInput
              value={youtubeUrl}
              onChangeText={setYoutubeUrl}
              onFocus={() => setFocusedField('youtube')}
              onBlur={() => setFocusedField(null)}
              placeholder='https://www.youtube.com/watch?v=…'
              placeholderTextColor={captionMuted}
              selectionColor={colors.primary}
              keyboardType='url'
              autoCapitalize='none'
              autoCorrect={false}
              style={[
                styles.inputShell,
                styles.inputShellText,
                focusedField === 'youtube' && styles.inputShellFocused,
              ]}
            />
          </View>
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
          disabled={!photosStepValid}
          onPress={handleContinueFromPhotos}
          width={primaryButtonWidth}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar style='dark' />

      {step !== 'search' ? (
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
              onPress={handleBack}
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
              onPress={handleHeaderClose}
              style={({ pressed }) => [
                styles.headerButton,
                pressed && styles.headerButtonPressed,
              ]}
            >
              <Ionicons name='close' size={22} color={ink} />
            </Pressable>
          </View>
        </View>
      ) : null}

      {step === 'address'
        ? renderAddressStep()
        : step === 'search'
          ? renderSearchStep()
          : renderPhotosStep()}

      <Modal
        visible={pickerOpen}
        transparent
        animationType='fade'
        onRequestClose={() => !pickerBusy && setPickerOpen(false)}
      >
        <View style={styles.pickerModalRoot} accessibilityViewIsModal>
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Dismiss'
            disabled={pickerBusy}
            onPress={() => !pickerBusy && setPickerOpen(false)}
            style={({ pressed }) => [
              styles.pickerScrim,
              pressed && !pickerBusy && styles.pickerScrimPressed,
            ]}
          />
          <View
            style={[
              styles.pickerSheet,
              { paddingBottom: insets.bottom + space.lg },
            ]}
          >
            {pickerBusy ? (
              <View style={styles.pickerBusyBlock}>
                <ActivityIndicator size='large' color={colors.primary} />
                <Text style={styles.pickerBusyLabel}>Adding photos…</Text>
              </View>
            ) : (
              <>
                <Text style={styles.pickerSheetTitle}>Add photos</Text>
                <Text style={styles.pickerSheetCaption}>
                  From your library — first image appears first (up to {MAX_PHOTOS}).
                </Text>
                <Pressable
                  accessibilityRole='button'
                  accessibilityLabel='Choose photos from library'
                  onPress={handleGalleryPick}
                  style={({ pressed }) => [
                    styles.pickerPrimaryOuter,
                    pressed && styles.pickerPrimaryPressed,
                  ]}
                >
                  <LinearGradient
                    colors={gradientPrimaryHorizontal}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.pickerPrimaryGradient}
                  >
                    <Ionicons name='images-outline' size={20} color={white} />
                    <Text style={[styles.pickerPrimaryText, { marginLeft: space.sm }]}>
                      Choose from library
                    </Text>
                  </LinearGradient>
                </Pressable>
                <Pressable
                  accessibilityRole='button'
                  accessibilityLabel='Cancel'
                  onPress={() => setPickerOpen(false)}
                  style={({ pressed }) => [
                    styles.pickerCancel,
                    pressed && styles.pickerCancelPressed,
                  ]}
                >
                  <Text style={styles.pickerCancelText}>Cancel</Text>
                </Pressable>
              </>
            )}
          </View>
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
  flex: {
    flex: 1,
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
  scrollPad: {
    flexGrow: 1,
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
  introBullets: {
    alignSelf: 'center',
    marginTop: space.md,
    marginBottom: space.lg,
    gap: space.sm + 2,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletGlyph: {
    width: 18,
    fontSize: type.caption,
    lineHeight: 18,
    color: labelSecondary,
    fontWeight: '400',
    textAlign: 'center',
  },
  introBulletText: {
    flex: 1,
    fontSize: type.caption,
    lineHeight: 18,
    color: labelSecondary,
    fontWeight: '400',
    letterSpacing: -0.15,
  },
  bulletBold: {
    fontWeight: '800',
    color: ink,
  },
  youtubeBlock: {
    marginTop: space.lg,
    marginBottom: space.sm,
  },
  photoCardWrap: {
    alignSelf: 'center',
    backgroundColor: fieldFill,
    borderRadius: radius.lg,
    padding: space.md,
    paddingBottom: space.sm + 2,
    marginBottom: space.sm,
    borderWidth: 1,
    borderColor: fieldBorder,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
      },
      android: { elevation: 2 },
    }),
  },
  photoGrid: {
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
  },
  photoGridRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  slot: {
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  slotFilled: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: fieldBorderSlot,
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
  slotAdd: {
    backgroundColor: white,
    borderWidth: 1,
    borderColor: fieldBorderSlot,
  },
  slotAddInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  slotAddPlusBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotPressable: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  slotPressed: {
    opacity: 0.92,
  },
  slotImage: {
    ...StyleSheet.absoluteFillObject,
  },
  trashBtnSlot: {
    position: 'absolute',
    bottom: space.sm,
    right: space.sm,
    zIndex: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: dangerSlot,
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
  photoGridMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.md,
    paddingTop: space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(60, 60, 67, 0.12)',
    paddingHorizontal: space.xs,
  },
  photoGridMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  photoGridMetaHint: {
    fontSize: type.caption,
    fontWeight: '500',
    color: captionMuted,
    letterSpacing: -0.12,
  },
  photoGridMetaCount: {
    fontSize: type.caption,
    fontWeight: '600',
    color: captionMuted,
    letterSpacing: -0.08,
  },
  errorSurfaceSlot: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.sm,
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 59, 48, 0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  errorTextSlot: {
    flex: 1,
    fontSize: type.caption,
    color: dangerSlot,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  fieldBlock: {
    marginBottom: space.lg,
  },
  fieldBlockLast: {
    marginBottom: 0,
  },
  label: {
    fontSize: type.caption,
    lineHeight: 17,
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
  inputShell: {
    minHeight: Platform.select({ ios: 52, default: 50 }),
    borderRadius: radius.sm + 2,
    paddingHorizontal: space.lg,
    paddingVertical: Platform.select({ ios: 15, default: 14 }),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: fieldFill,
    borderWidth: 1,
    borderColor: fieldBorder,
  },
  inputShellText: {
    fontSize: type.bodyLarge,
    color: ink,
    fontWeight: '400',
    letterSpacing: -0.3,
  },
  inputShellFocused: {
    borderColor: colors.primary,
    backgroundColor: fieldFill,
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
  },
  placeholderText: {
    color: captionMuted,
    fontWeight: '400',
  },
  helper: {
    marginTop: space.sm,
    fontSize: type.micro,
    lineHeight: 16,
    fontWeight: '400',
    color: captionMuted,
    letterSpacing: -0.05,
  },
  bottomDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingTop: space.xl,
  },
  searchTopSafe: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    backgroundColor: pageBg,
    paddingBottom: space.sm,
  },
  searchScreenTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: type.title,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.45,
  },
  searchFieldSection: {
    marginBottom: space.md,
  },
  searchFieldIcon: {
    marginRight: space.sm,
  },
  searchInlineInput: {
    flex: 1,
    padding: 0,
    margin: 0,
    minWidth: 0,
    minHeight: Platform.select({ ios: 22, default: 20 }),
    fontSize: type.bodyLarge,
    fontWeight: '400',
    color: ink,
    letterSpacing: -0.3,
    backgroundColor: 'transparent',
  },
  searchAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchAddressRowIcon: {
    marginRight: space.sm,
  },
  suggestionSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: fieldBorder,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.md,
    paddingRight: space.xs,
  },
  suggestionRowPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  suggestionRowText: {
    flex: 1,
    minWidth: 0,
    paddingRight: space.sm,
  },
  suggestionPrimary: {
    fontSize: type.bodyLarge,
    lineHeight: 22,
    fontWeight: '500',
    color: ink,
    letterSpacing: -0.28,
  },
  suggestionMeta: {
    marginTop: 2,
    fontSize: type.micro,
    lineHeight: 15,
    fontWeight: '600',
    color: captionMuted,
    letterSpacing: -0.05,
  },
  emptySearch: {
    textAlign: 'center',
    color: captionMuted,
    marginTop: space.xl,
    paddingHorizontal: space.lg,
    fontSize: type.body,
    fontWeight: '600',
  },
  pickerModalRoot: {
    flex: 1,
  },
  pickerScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.44)',
  },
  pickerScrimPressed: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  pickerSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(60, 60, 67, 0.12)',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: { elevation: 16 },
    }),
  },
  pickerSheetTitle: {
    fontSize: type.title,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.45,
    marginBottom: space.xs,
  },
  pickerSheetCaption: {
    fontSize: type.caption,
    lineHeight: 18,
    fontWeight: '600',
    color: captionMuted,
    letterSpacing: -0.08,
    marginBottom: space.lg,
  },
  pickerBusyBlock: {
    alignItems: 'center',
    paddingVertical: space.xl,
    gap: space.md,
  },
  pickerBusyLabel: {
    fontSize: type.body,
    fontWeight: '700',
    color: captionMuted,
    letterSpacing: -0.1,
  },
  pickerPrimaryOuter: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    minHeight: 54,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  pickerPrimaryPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  pickerPrimaryGradient: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  pickerPrimaryText: {
    color: white,
    fontWeight: '900',
    fontSize: type.bodyLarge,
    letterSpacing: -0.2,
  },
  pickerCancel: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.md,
    paddingVertical: space.md,
    minHeight: 48,
  },
  pickerCancelPressed: {
    opacity: 0.65,
  },
  pickerCancelText: {
    fontSize: type.body,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.12,
  },
});
