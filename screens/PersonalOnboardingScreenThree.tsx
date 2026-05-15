import { OnboardingProgressBlock } from '../components/OnboardingProgressBlock';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
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
import { OnboardingBottomCta } from '../components/OnboardingBottomCta';
import { useOnboardingCtaLayout } from '../design/onboardingCtaLayout';
import { colors, radius, space, type } from '../design/theme';

const ink = '#1C1C1E';
const labelSecondary = '#636366';
const captionMuted = '#8E8E93';
const fieldFill = '#F2F2F7';
const fieldBorder = 'rgba(60, 60, 67, 0.12)';
const required = '#FF3B30';

const GENDERS = [
  { id: 'he', title: 'He / him', hint: 'His' },
  { id: 'she', title: 'She / her', hint: 'Hers' },
  { id: 'they', title: 'They / them', hint: 'Theirs' },
] as const;

type GenderId = (typeof GENDERS)[number]['id'];

/** Graduation year — digits only, max 4. */
function sanitizeSchoolYearInput(input: string): string {
  return input.replace(/\D/g, '').slice(0, 4);
}

/** Job title — no digits (text-only). */
function sanitizeJobTitleInput(input: string): string {
  const s = typeof input === 'string' ? input : String(input ?? '');
  return s.replace(/\d/g, '');
}

type FieldScrollKey = 'company' | 'jobTitle' | 'major' | 'schoolYear';

type PersonalOnboardingScreenThreeProps = {
  onBack: () => void;
  onComplete?: () => void;
};

export function PersonalOnboardingScreenThree({
  onBack,
  onComplete,
}: PersonalOnboardingScreenThreeProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { padH, primaryButtonWidth } = useOnboardingCtaLayout();

  const ONBOARDING_TOTAL_STEPS = 6;
  const onboardingStepNumber = 2;
  const progressRatio = 2 / 6;

  const [gender, setGender] = useState<GenderId | null>(null);
  const [status, setStatus] = useState<'student' | 'working' | null>(null);
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [major, setMajor] = useState('');
  const [schoolYear, setSchoolYear] = useState('');

  const segmentLayouts = useRef<
    Partial<Record<GenderId, { x: number; width: number }>>
  >({});
  const genderSlideX = useRef(new Animated.Value(0)).current;
  const genderSlideW = useRef(new Animated.Value(0)).current;

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
  }, [gender]);

  const onGenderSegmentLayout =
    (id: GenderId) => (e: LayoutChangeEvent) => {
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

  const profileValid =
    gender != null &&
    status != null &&
    (status === 'working'
      ? company.trim().length > 0 && jobTitle.trim().length > 0
      : major.trim().length > 0 && schoolYear.trim().length === 4);

  const scrollRef = useRef<ScrollView>(null);
  /** Latest vertical offset; avoids scrollTo when unchanged (iOS can drop keys after redundant scroll). */
  const scrollOffsetYRef = useRef(0);
  const fieldLayout = useRef<
    Partial<Record<FieldScrollKey, { y: number; h: number }>>
  >({});
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

  const scrollPaddingBottom =
    space.xl +
    (keyboardBottomInset > 0 ? space.xxl + space.md : 0);

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
      const reservedTop = insets.top + 118;
      const reservedBottom =
        kb > 0 ? kb + 56 + space.md : insets.bottom + 72;
      const viewportH = Math.max(
        220,
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
      // Calling scrollTo with the same offset still disturbs first responder on iOS when
      // moving focus between fields while the keyboard is already open.
      if (Math.abs(scrollY - scrollOffsetYRef.current) < 1.5) {
        return;
      }
      // Non-animated avoids a second in-flight scroll fighting TextInput focus on iOS.
      sv.scrollTo({ y: scrollY, animated: false });
    };

    const tryLayout = (attempt: number) => {
      if (fieldLayout.current[key] && scrollRef.current) {
        applyScroll();
      } else if (attempt < 6) {
        setTimeout(() => tryLayout(attempt + 1), 48);
      }
    };

    requestAnimationFrame(() => {
      setTimeout(() => tryLayout(0), delayMs);
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
      </View>

      <OnboardingProgressBlock
        padH={padH}
        step={onboardingStepNumber}
        totalSteps={ONBOARDING_TOTAL_STEPS}
        title='About you'
        progressRatio={progressRatio}
      />

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
            },
          ]}
          onScroll={(e) => {
            scrollOffsetYRef.current = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps='always'
          keyboardDismissMode={
            Platform.OS === 'ios' ? 'interactive' : 'on-drag'
          }
          showsVerticalScrollIndicator={keyboardBottomInset > 0}
        >
          <Text style={styles.screenTitle}>Let&apos;s get to know you</Text>
          <Text style={styles.screenSubtitle}>
            A few details help us match you with the right roommates and
            experiences.
          </Text>

          <View style={styles.section}>
            <FieldLabel text='Gender' required />
            <View style={styles.genderSegmentTrack}>
              {gender != null ? (
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
              ) : null}
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

          <View style={styles.section}>
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
                    color={status === 'student' ? colors.primary : labelSecondary}
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
                    color={status === 'working' ? colors.primary : labelSecondary}
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
                  autoCorrect
                  keyboardType={
                    Platform.OS === 'ios' ? 'ascii-capable' : 'default'
                  }
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
                  onChangeText={(t) =>
                    setJobTitle(sanitizeJobTitleInput(t))
                  }
                  onFocus={() => scrollToField('jobTitle')}
                  placeholder='e.g. Marketing intern'
                  placeholderTextColor={captionMuted}
                  style={styles.input}
                  autoCapitalize='words'
                  autoCorrect
                  keyboardType={
                    Platform.OS === 'ios' ? 'ascii-capable' : 'default'
                  }
                  selectionColor={colors.primary}
                />
              </View>
            </>
          ) : status === 'student' ? (
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
                  placeholder='e.g. Economics'
                  placeholderTextColor={captionMuted}
                  style={styles.input}
                  autoCapitalize='words'
                  autoCorrect
                  keyboardType={
                    Platform.OS === 'ios' ? 'ascii-capable' : 'default'
                  }
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
                  placeholder='e.g. 2029'
                  placeholderTextColor={captionMuted}
                  style={styles.input}
                  keyboardType='number-pad'
                  maxLength={4}
                  inputMode='numeric'
                  selectionColor={colors.primary}
                />
              </View>
            </>
          ) : null}
        </ScrollView>

        <OnboardingBottomCta
          label='Save'
          onPress={() => profileValid && onComplete?.()}
          disabled={!profileValid}
          padH={padH}
          safeBottomInset={
            keyboardBottomInset > 0 ? 0 : insets.bottom
          }
          buttonWidth={primaryButtonWidth}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

function FieldLabel({
  text,
  required: req,
}: {
  text: string;
  required?: boolean;
}) {
  return (
    <Text style={styles.fieldLabel}>
      {text}
      {req ? <Text style={styles.asterisk}> *</Text> : null}
    </Text>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: { flex: 1 },
  headerRow: { paddingBottom: space.xs },
  backBtn: {
    alignSelf: 'flex-start',
    marginLeft: -space.xs,
    padding: space.xs,
    borderRadius: radius.sm,
  },
  backBtnPressed: { opacity: 0.55 },
  scrollContent: { paddingTop: space.xs },
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
    fontWeight: '400',
    letterSpacing: -0.2,
    marginBottom: space.xl,
  },
  section: {
    marginBottom: space.lg + space.sm,
  },
  fieldLabel: {
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
    textAlign: 'center',
  },
  genderSegmentLabelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    gap: space.sm + 2,
  },
  statusMinimal: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm + 2,
    minHeight: 52,
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: fieldFill,
    borderWidth: 1,
    borderColor: fieldBorder,
  },
  statusMinimalSelected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  statusMinimalPressed: {
    opacity: 0.9,
  },
  statusIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(60, 60, 67, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIconCircleSelected: {
    backgroundColor: 'rgba(60, 60, 67, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(47, 109, 246, 0.25)',
  },
  statusMinimalLabel: {
    fontSize: type.body,
    fontWeight: '600',
    color: ink,
    letterSpacing: -0.25,
  },
  statusMinimalLabelSelected: {
    color: colors.primary,
  },
});
