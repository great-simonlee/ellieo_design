import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
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
import { DatePickerSheet } from '../../components/DatePickerSheet';
import { OnboardingBottomCta } from '../../components/OnboardingBottomCta';
import { useOnboardingCtaLayout } from '../../design/onboardingCtaLayout';
import { colors, radius, space, type } from '../../design/theme';
import {
  captionMuted,
  FieldLabel,
  fieldFill,
  fieldBorder,
  GENDERS,
  ink,
  labelSecondary,
  parseBirthPart,
  sanitizeEnglishNameInput,
  sanitizeJobTitleInput,
  sanitizeSchoolYearInput,
  selectedChoiceBg,
  selectedChoiceBorder,
  type GenderId,
} from './personalInfoOnboarding';

const MAX_BIO_LENGTH = 1000;
const BIO_TEXT_INPUT_HEIGHT = 200;

type FieldScrollKey =
  | 'legalFirst'
  | 'legalLast'
  | 'preferred'
  | 'birthday'
  | 'company'
  | 'jobTitle'
  | 'major'
  | 'schoolYear'
  | 'bio';

export function AccountSettingsPersonalInfo({
  onBack,
}: {
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { padH, primaryButtonWidth, contentMaxW } = useOnboardingCtaLayout();

  const [legalFirst, setLegalFirst] = useState('Simon');
  const [legalLast, setLegalLast] = useState('Lee');
  const [preferred, setPreferred] = useState('');
  const [birthMonth, setBirthMonth] = useState('8');
  const [birthDay, setBirthDay] = useState('15');
  const [birthYear, setBirthYear] = useState('1998');
  const [birthdayPickerOpen, setBirthdayPickerOpen] = useState(false);
  const [bio, setBio] = useState(
    'Quiet weekdays, gallery walks on weekends, and early-morning coffee runs.',
  );
  const [bioFocused, setBioFocused] = useState(false);
  const [gender, setGender] = useState<GenderId>('he');
  const [status, setStatus] = useState<'student' | 'working'>('student');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [major, setMajor] = useState('Fashion Design');
  const [schoolYear, setSchoolYear] = useState('2026');

  const segmentLayouts = useRef<
    Partial<Record<GenderId, { x: number; width: number }>>
  >({});
  const genderSlideX = useRef(new Animated.Value(0)).current;
  const genderSlideW = useRef(new Animated.Value(0)).current;

  const scrollRef = useRef<ScrollView>(null);
  const fieldLayout = useRef<
    Partial<Record<FieldScrollKey, { y: number; h: number }>>
  >({});
  const [keyboardBottomInset, setKeyboardBottomInset] = useState(0);
  const keyboardInsetRef = useRef(0);
  const scrollViewportHRef = useRef(0);
  const inputShellYRef = useRef(0);
  const inputShellHRef = useRef(0);

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

  useEffect(() => {
    if (gender == null) return;
    const L = segmentLayouts.current[gender];
    if (L == null || L.width <= 0) return;
    Animated.parallel([
      Animated.spring(genderSlideX, {
        toValue: L.x,
        useNativeDriver: false,
        friction: 9,
        tension: 68,
      }),
      Animated.spring(genderSlideW, {
        toValue: L.width,
        useNativeDriver: false,
        friction: 9,
        tension: 68,
      }),
    ]).start();
  }, [gender, genderSlideX, genderSlideW]);

  const onGenderSegmentLayout = (id: GenderId) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    segmentLayouts.current[id] = { x, width };
    if (gender === id && width > 0) {
      Animated.parallel([
        Animated.spring(genderSlideX, {
          toValue: x,
          useNativeDriver: false,
          friction: 9,
          tension: 68,
        }),
        Animated.spring(genderSlideW, {
          toValue: width,
          useNativeDriver: false,
          friction: 9,
          tension: 68,
        }),
      ]).start();
    }
  };

  const birthdaySummary = useMemo(() => {
    const m = parseBirthPart(birthMonth);
    const d = parseBirthPart(birthDay);
    const y = parseBirthPart(birthYear);
    if (m == null || d == null || y == null || birthYear.trim().length !== 4) {
      return null;
    }
    return `${m} · ${d} · ${y}`;
  }, [birthMonth, birthDay, birthYear]);

  const scrollPaddingBottom =
    space.xl + (keyboardBottomInset > 0 ? space.xxl + space.md : 0);

  const captureFieldLayout =
    (key: FieldScrollKey) => (e: LayoutChangeEvent) => {
      const { y, height } = e.nativeEvent.layout;
      fieldLayout.current[key] = { y, h: height };
    };

  const scrollToField = (key: FieldScrollKey) => {
    const delayMs = Platform.OS === 'ios' ? 72 : 96;
    const topGap = space.lg + space.sm;
    const bottomMargin = space.md;

    const applyScroll = () => {
      const kb = keyboardInsetRef.current;
      const reservedTop = insets.top + 56;
      const reservedBottom = kb > 0 ? kb + 56 + space.md : insets.bottom + 72;
      const viewportH = Math.max(
        220,
        scrollViewportHRef.current ||
          windowHeight - reservedTop - reservedBottom,
      );

      const meta = fieldLayout.current[key];
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

    requestAnimationFrame(() => {
      setTimeout(applyScroll, delayMs);
    });
  };

  const scrollBioIntoView = () => {
    const vh = scrollViewportHRef.current;
    const inputY = inputShellYRef.current;
    const inputH = inputShellHRef.current;
    if (vh <= 0 || inputH <= 0) return;
    const needY = inputY + inputH - vh + space.md + space.sm;
    scrollRef.current?.scrollTo({ y: Math.max(0, needY), animated: false });
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
          accessibilityLabel='Save personal information'
          onPress={onBack}
          hitSlop={8}
          style={({ pressed }) => [
            styles.headerSaveBtn,
            pressed && styles.backBtnPressed,
          ]}
        >
          <Text style={styles.headerSave}>Save</Text>
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
          onLayout={(e) => {
            scrollViewportHRef.current = e.nativeEvent.layout.height;
            if (keyboardBottomInset > 0 && bioFocused) scrollBioIntoView();
          }}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: padH,
              paddingBottom: scrollPaddingBottom,
              maxWidth: contentMaxW + padH * 2,
            },
          ]}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode={
            Platform.OS === 'ios' ? 'interactive' : 'on-drag'
          }
          showsVerticalScrollIndicator={keyboardBottomInset > 0}
        >
          <Text style={[styles.screenTitle, { maxWidth: contentMaxW }]}>
            Personal Information
          </Text>
          <Text style={[styles.screenSubtitle, { maxWidth: contentMaxW }]}>
            We&apos;ll use your legal name for verification. Your preferred name
            is what others see on Ellieo.
          </Text>

          <View style={[styles.avatarBlock, { maxWidth: contentMaxW }]}>
            <View style={styles.profilePhotoFrame}>
              <LinearGradient
                colors={['#E8EFFF', '#F5F8FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.profilePhoto}
              >
                <Text style={styles.profilePhotoInitials}>SL</Text>
              </LinearGradient>
            </View>
            <Pressable
              accessibilityRole='button'
              accessibilityLabel='Edit profile photo'
              style={({ pressed }) => [
                styles.avatarEdit,
                pressed && styles.backBtnPressed,
              ]}
            >
              <Ionicons name='pencil' size={17} color='#FFFFFF' />
            </Pressable>
          </View>

          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Update your photos'
            style={({ pressed }) => [
              styles.photosPromo,
              { maxWidth: contentMaxW },
              pressed && styles.photosPromoPressed,
            ]}
          >
            <View style={styles.photosPromoIcon}>
              <Ionicons
                name='images-outline'
                size={22}
                color={colors.primary}
              />
            </View>
            <View style={styles.photosPromoCopy}>
              <Text style={styles.photosPromoTitle}>Update your photos</Text>
              <Text style={styles.photosPromoSub}>
                Share photos with future roommates.
              </Text>
            </View>
            <Ionicons name='chevron-forward' size={20} color={labelSecondary} />
          </Pressable>

          <View
            style={styles.section}
            collapsable={false}
            onLayout={captureFieldLayout('legalFirst')}
          >
            <FieldLabel text='Legal first name' required />
            <TextInput
              value={legalFirst}
              onChangeText={(t) => setLegalFirst(sanitizeEnglishNameInput(t))}
              onFocus={() => scrollToField('legalFirst')}
              placeholder='First name'
              placeholderTextColor={captionMuted}
              style={styles.input}
              autoCapitalize='words'
              autoCorrect={false}
              keyboardType={Platform.OS === 'ios' ? 'ascii-capable' : 'default'}
              selectionColor={colors.primary}
            />
          </View>

          <View
            style={styles.section}
            collapsable={false}
            onLayout={captureFieldLayout('legalLast')}
          >
            <FieldLabel text='Legal last name' required />
            <TextInput
              value={legalLast}
              onChangeText={(t) => setLegalLast(sanitizeEnglishNameInput(t))}
              onFocus={() => scrollToField('legalLast')}
              placeholder='Last name'
              placeholderTextColor={captionMuted}
              style={styles.input}
              autoCapitalize='words'
              autoCorrect={false}
              keyboardType={Platform.OS === 'ios' ? 'ascii-capable' : 'default'}
              selectionColor={colors.primary}
            />
            <Text style={styles.helper}>
              Send us an email to change your legal name.
            </Text>
          </View>

          <View
            style={styles.section}
            collapsable={false}
            onLayout={captureFieldLayout('preferred')}
          >
            <FieldLabel text='Preferred name' />
            <TextInput
              value={preferred}
              onChangeText={(t) => setPreferred(sanitizeEnglishNameInput(t))}
              onFocus={() => scrollToField('preferred')}
              placeholder='Enter preferred first name'
              placeholderTextColor={captionMuted}
              style={styles.input}
              autoCapitalize='words'
              autoCorrect={false}
              keyboardType={Platform.OS === 'ios' ? 'ascii-capable' : 'default'}
              selectionColor={colors.primary}
            />
            <Text style={styles.helper}>
              This is the name that will appear on your profile.
            </Text>
          </View>

          <View
            style={styles.section}
            collapsable={false}
            onLayout={captureFieldLayout('birthday')}
          >
            <FieldLabel text='Birthday' required />
            <Pressable
              accessibilityRole='button'
              accessibilityLabel={
                birthdaySummary
                  ? `Birthday ${birthdaySummary}`
                  : 'Select birthday'
              }
              onPress={() => {
                Keyboard.dismiss();
                setBirthdayPickerOpen(true);
                scrollToField('birthday');
              }}
              style={({ pressed }) => [
                styles.birthdayTrigger,
                pressed && styles.birthdayTriggerPressed,
              ]}
            >
              <Text
                style={[
                  styles.birthdayTriggerText,
                  !birthdaySummary && styles.birthdayTriggerPlaceholder,
                ]}
                numberOfLines={1}
              >
                {birthdaySummary ?? 'Select birthday'}
              </Text>
              <Ionicons name='chevron-down' size={20} color={labelSecondary} />
            </Pressable>
          </View>

          <View style={[styles.section, { maxWidth: contentMaxW }]}>
            <FieldLabel text='Gender' required />
            <View style={styles.genderSegmentTrack}>
              <Animated.View
                pointerEvents='none'
                style={[
                  styles.genderSlidingPill,
                  {
                    width: genderSlideW,
                    transform: [{ translateX: genderSlideX }],
                  },
                ]}
              />
              {GENDERS.map((g) => {
                const selected = gender === g.id;
                return (
                  <Pressable
                    key={g.id}
                    accessibilityRole='button'
                    accessibilityState={{ selected }}
                    accessibilityLabel={`${g.title}, ${g.hint}`}
                    onLayout={onGenderSegmentLayout(g.id)}
                    onPress={() => setGender(g.id)}
                    style={({ pressed }) => [
                      styles.genderSegment,
                      pressed && styles.genderSegmentPressed,
                    ]}
                  >
                    <View style={styles.genderSegmentContent}>
                      <Text
                        style={[
                          styles.genderSegmentLabel,
                          selected && styles.genderSegmentLabelSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {g.title}
                      </Text>
                      {selected ? (
                        <Ionicons
                          name='checkmark-circle'
                          size={17}
                          color={colors.primary}
                          style={styles.genderSegmentCheck}
                        />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.section, { maxWidth: contentMaxW }]}>
            <FieldLabel text='Current status' required />
            <View style={styles.statusRow}>
              <Pressable
                accessibilityRole='button'
                accessibilityState={{ selected: status === 'student' }}
                onPress={() => setStatus('student')}
                style={({ pressed }) => [
                  styles.statusMinimal,
                  status === 'student' && styles.statusMinimalSelected,
                  pressed && styles.statusMinimalPressed,
                ]}
              >
                <View
                  style={[
                    styles.statusIconCircle,
                    status === 'student' && styles.statusIconCircleSelected,
                  ]}
                >
                  <Ionicons
                    name={status === 'student' ? 'school' : 'school-outline'}
                    size={20}
                    color={
                      status === 'student' ? colors.primary : labelSecondary
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.statusMinimalLabel,
                    status === 'student' && styles.statusMinimalLabelSelected,
                  ]}
                >
                  Student
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole='button'
                accessibilityState={{ selected: status === 'working' }}
                onPress={() => setStatus('working')}
                style={({ pressed }) => [
                  styles.statusMinimal,
                  status === 'working' && styles.statusMinimalSelected,
                  pressed && styles.statusMinimalPressed,
                ]}
              >
                <View
                  style={[
                    styles.statusIconCircle,
                    status === 'working' && styles.statusIconCircleSelected,
                  ]}
                >
                  <Ionicons
                    name={
                      status === 'working' ? 'briefcase' : 'briefcase-outline'
                    }
                    size={19}
                    color={
                      status === 'working' ? colors.primary : labelSecondary
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.statusMinimalLabel,
                    status === 'working' && styles.statusMinimalLabelSelected,
                  ]}
                >
                  Working
                </Text>
              </Pressable>
            </View>
          </View>

          {status === 'working' ? (
            <>
              <View
                style={styles.section}
                collapsable={false}
                onLayout={captureFieldLayout('company')}
              >
                <FieldLabel text='Company' required />
                <TextInput
                  value={company}
                  onChangeText={setCompany}
                  onFocus={() => scrollToField('company')}
                  placeholder='e.g. Ellieo'
                  placeholderTextColor={captionMuted}
                  style={styles.input}
                  autoCapitalize='words'
                  selectionColor={colors.primary}
                />
              </View>
              <View
                style={styles.section}
                collapsable={false}
                onLayout={captureFieldLayout('jobTitle')}
              >
                <FieldLabel text='Job title' required />
                <TextInput
                  value={jobTitle}
                  onChangeText={(t) => setJobTitle(sanitizeJobTitleInput(t))}
                  onFocus={() => scrollToField('jobTitle')}
                  placeholder='e.g. Marketing intern'
                  placeholderTextColor={captionMuted}
                  style={styles.input}
                  autoCapitalize='words'
                  selectionColor={colors.primary}
                />
              </View>
            </>
          ) : (
            <>
              <View
                style={styles.section}
                collapsable={false}
                onLayout={captureFieldLayout('major')}
              >
                <FieldLabel text='Major' required />
                <TextInput
                  value={major}
                  onChangeText={setMajor}
                  onFocus={() => scrollToField('major')}
                  placeholder='e.g. Fashion Design'
                  placeholderTextColor={captionMuted}
                  style={styles.input}
                  autoCapitalize='words'
                  selectionColor={colors.primary}
                />
              </View>
              <View
                style={styles.section}
                collapsable={false}
                onLayout={captureFieldLayout('schoolYear')}
              >
                <FieldLabel text='School year' required />
                <TextInput
                  value={schoolYear}
                  onChangeText={(t) =>
                    setSchoolYear(sanitizeSchoolYearInput(t))
                  }
                  onFocus={() => scrollToField('schoolYear')}
                  placeholder='e.g. 2026'
                  placeholderTextColor={captionMuted}
                  style={styles.input}
                  keyboardType='number-pad'
                  maxLength={4}
                  inputMode='numeric'
                  selectionColor={colors.primary}
                />
              </View>
            </>
          )}

          <View
            style={[styles.section, { maxWidth: contentMaxW }]}
            collapsable={false}
            onLayout={(e) => {
              captureFieldLayout('bio')(e);
              const { y, height } = e.nativeEvent.layout;
              inputShellYRef.current = y;
              inputShellHRef.current = height;
            }}
          >
            <FieldLabel text='Bio' />
            <View
              style={[styles.bioShell, bioFocused && styles.bioShellFocused]}
            >
              <TextInput
                value={bio}
                onChangeText={setBio}
                onFocus={() => {
                  setBioFocused(true);
                  scrollToField('bio');
                  requestAnimationFrame(scrollBioIntoView);
                }}
                onBlur={() => setBioFocused(false)}
                placeholder='Share a bit about yourself — your lifestyle, hobbies, or what you look for in a roommate.'
                placeholderTextColor={captionMuted}
                multiline
                scrollEnabled
                maxLength={MAX_BIO_LENGTH}
                style={styles.bioInput}
                textAlignVertical='top'
                selectionColor={colors.primary}
              />
              <Text style={styles.counter} accessibilityLiveRegion='polite'>
                {bio.length}/{MAX_BIO_LENGTH} Characters
              </Text>
            </View>
          </View>
        </ScrollView>

        <OnboardingBottomCta
          label='Save'
          onPress={onBack}
          padH={padH}
          safeBottomInset={keyboardBottomInset > 0 ? 0 : insets.bottom}
          buttonWidth={primaryButtonWidth}
        />
      </KeyboardAvoidingView>

      <DatePickerSheet
        visible={birthdayPickerOpen}
        onClose={() => setBirthdayPickerOpen(false)}
        onConfirm={(m, d, y) => {
          setBirthMonth(String(m));
          setBirthDay(String(d));
          setBirthYear(String(y));
        }}
        initialMonth={parseBirthPart(birthMonth)}
        initialDay={parseBirthPart(birthDay)}
        initialYear={parseBirthPart(birthYear)}
        title='Birthday'
        hint='Scroll to set month, day, and year.'
        confirmLabel='Done'
        dismissAccessibilityLabel='Dismiss birthday picker'
        confirmAccessibilityLabel='Save birthday'
      />
    </View>
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
  headerSaveBtn: {
    paddingVertical: space.xs,
    paddingHorizontal: space.sm,
  },
  backBtnPressed: {
    opacity: 0.55,
  },
  headerSave: {
    fontSize: type.bodyLarge,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingTop: space.sm,
    width: '100%',
    alignSelf: 'center',
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
  screenSubtitle: {
    fontSize: type.body,
    lineHeight: 22,
    color: labelSecondary,
    fontWeight: '400',
    letterSpacing: -0.2,
    marginBottom: space.xl,
    alignSelf: 'center',
    width: '100%',
  },
  avatarBlock: {
    alignSelf: 'center',
    marginBottom: space.xl,
    position: 'relative',
  },
  profilePhotoFrame: {
    width: 128,
    height: 128,
    borderRadius: 64,
    padding: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(47,109,246,0.12)',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
      },
      android: { elevation: 3 },
    }),
  },
  profilePhoto: {
    flex: 1,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePhotoInitials: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.4,
  },
  avatarEdit: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  photosPromo: {
    alignSelf: 'center',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginBottom: space.xl,
    padding: space.md,
    borderRadius: radius.sm + 2,
    backgroundColor: fieldFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: fieldBorder,
  },
  photosPromoPressed: {
    opacity: 0.9,
  },
  photosPromoIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47,109,246,0.08)',
  },
  photosPromoCopy: {
    flex: 1,
    minWidth: 0,
  },
  photosPromoTitle: {
    fontSize: type.body,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.15,
  },
  photosPromoSub: {
    marginTop: 2,
    fontSize: type.caption,
    fontWeight: '500',
    color: labelSecondary,
    letterSpacing: -0.06,
  },
  section: {
    marginBottom: space.lg + space.sm,
    alignSelf: 'center',
    width: '100%',
  },
  input: {
    backgroundColor: fieldFill,
    borderRadius: radius.sm + 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: fieldBorder,
    paddingHorizontal: space.lg,
    paddingVertical: Platform.select({ ios: 15, default: 14 }),
    fontSize: type.bodyLarge,
    color: ink,
    fontWeight: '400',
    letterSpacing: -0.3,
  },
  helper: {
    marginTop: space.sm,
    fontSize: type.micro,
    lineHeight: 16,
    color: captionMuted,
    letterSpacing: -0.05,
  },
  bioShell: {
    width: '100%',
    height: space.md + BIO_TEXT_INPUT_HEIGHT + space.xl + space.sm,
    backgroundColor: fieldFill,
    borderRadius: radius.sm + 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: fieldBorder,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.xl + space.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  bioShellFocused: {
    borderWidth: 2,
    borderColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.22,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },
  bioInput: {
    height: BIO_TEXT_INPUT_HEIGHT,
    padding: 0,
    fontSize: type.bodyLarge,
    lineHeight: 22,
    color: ink,
    fontWeight: '400',
    letterSpacing: -0.25,
    backgroundColor: 'transparent',
  },
  counter: {
    position: 'absolute',
    right: space.lg,
    bottom: space.sm,
    fontSize: type.micro,
    fontWeight: '600',
    color: captionMuted,
    letterSpacing: -0.02,
  },
  birthdayTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    backgroundColor: fieldFill,
    borderRadius: radius.sm + 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: fieldBorder,
    paddingHorizontal: space.lg,
    paddingVertical: Platform.select({ ios: 15, default: 14 }),
    minHeight: Platform.select({ ios: 52, default: 50 }),
  },
  birthdayTriggerPressed: {
    opacity: 0.88,
  },
  birthdayTriggerText: {
    flex: 1,
    fontSize: type.bodyLarge,
    color: ink,
    fontWeight: '500',
    letterSpacing: -0.25,
    lineHeight: 22,
  },
  birthdayTriggerPlaceholder: {
    color: captionMuted,
    fontWeight: '400',
  },
  genderSegmentTrack: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#E8E9EF',
    borderRadius: radius.pill,
    padding: 3,
    gap: 2,
    overflow: 'visible',
  },
  genderSlidingPill: {
    position: 'absolute',
    left: 3,
    top: 3,
    bottom: 3,
    zIndex: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
      },
      android: { elevation: 5 },
    }),
  },
  genderSegment: {
    flex: 1,
    zIndex: 1,
    minHeight: 44,
    borderRadius: radius.pill,
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xs,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  genderSegmentPressed: {
    opacity: 0.88,
  },
  genderSegmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    maxWidth: '100%',
  },
  genderSegmentCheck: {
    flexShrink: 0,
  },
  genderSegmentLabel: {
    flexShrink: 1,
    fontSize: type.caption,
    fontWeight: '600',
    color: labelSecondary,
    letterSpacing: -0.2,
  },
  genderSegmentLabelSelected: {
    color: ink,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    gap: space.md,
  },
  statusMinimal: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: fieldBorder,
    backgroundColor: fieldFill,
    gap: space.sm,
  },
  statusMinimalSelected: {
    borderColor: selectedChoiceBorder,
    backgroundColor: selectedChoiceBg,
  },
  statusMinimalPressed: {
    opacity: 0.9,
  },
  statusIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: fieldBorder,
  },
  statusIconCircleSelected: {
    borderColor: 'rgba(47,109,246,0.25)',
  },
  statusMinimalLabel: {
    fontSize: type.body,
    fontWeight: '600',
    color: labelSecondary,
    letterSpacing: -0.12,
  },
  statusMinimalLabelSelected: {
    color: ink,
    fontWeight: '700',
  },
});
