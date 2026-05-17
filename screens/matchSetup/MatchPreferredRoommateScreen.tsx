import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OnboardingBottomCta } from '../../components/OnboardingBottomCta';
import { useOnboardingCtaLayout } from '../../design/onboardingCtaLayout';
import { colors, radius, space, type } from '../../design/theme';

const ink = '#1C1C1E';
const labelSecondary = '#636366';
const captionMuted = '#8E8E93';
const fieldFill = '#F2F2F7';
const fieldBorder = 'rgba(60, 60, 67, 0.12)';
const selectedChoiceBg = 'rgba(47, 109, 246, 0.07)';
const selectedChoiceBorder = 'rgba(47, 109, 246, 0.45)';

type PreferenceOption = {
  id: string;
  title: string;
  subtitle?: string;
};

/** Pronoun-first — mirrors profile (She/her · He/him · They/them). */
const PREF_GENDER_OPTIONS: PreferenceOption[] = [
  {
    id: 'she',
    title: 'She / her',
    subtitle: 'Match with roommates who use she/her',
  },
  {
    id: 'he',
    title: 'He / him',
    subtitle: 'Match with roommates who use he/him',
  },
  {
    id: 'they',
    title: 'They / them',
    subtitle: 'Match with roommates who use they/them',
  },
  {
    id: 'any',
    title: 'Open to all',
    subtitle: 'Any gender & pronouns — keep my options wide',
  },
];

const PREF_STATUS: PreferenceOption[] = [
  { id: 'student', title: 'Student preferred' },
  { id: 'working', title: 'Working preferred' },
  { id: 'both', title: 'Open to both' },
];

const PREF_ROOM: PreferenceOption[] = [
  { id: 'master', title: 'Master bedroom preferred' },
  { id: 'regular', title: 'Regular bedroom preferred' },
  { id: 'flex', title: 'Flexroom preferred' },
  { id: 'any', title: 'Open to any room options.' },
];

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
  const { padH, contentMaxW, primaryButtonWidth } = useOnboardingCtaLayout();

  const [prefGenderId, setPrefGenderId] = useState(PREF_GENDER_OPTIONS[0]!.id);
  const [prefStatusId, setPrefStatusId] = useState(PREF_STATUS[0]!.id);
  const [prefRoomId, setPrefRoomId] = useState(PREF_ROOM[0]!.id);
  const [locations, setLocations] = useState('East Village, Gramercy');

  const canContinue = locations.trim().length > 0;

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

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: padH,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.intro, { maxWidth: contentMaxW }]}>
          <Text style={styles.screenTitle}>What you&apos;re looking for</Text>
          <Text style={styles.screenSubtitle}>
            Tell us who you&apos;d like to match with and where you want to live.
          </Text>
        </View>

        <PreferenceSection
          label="Who you'd like to meet"
          options={PREF_GENDER_OPTIONS}
          valueId={prefGenderId}
          onChange={setPrefGenderId}
          maxWidth={contentMaxW}
        />

        <PreferenceSection
          label='Preferred status'
          options={PREF_STATUS}
          valueId={prefStatusId}
          onChange={setPrefStatusId}
          maxWidth={contentMaxW}
        />

        <PreferenceSection
          label='Preferred room'
          options={PREF_ROOM}
          valueId={prefRoomId}
          onChange={setPrefRoomId}
          maxWidth={contentMaxW}
        />

        <View style={[styles.section, { maxWidth: contentMaxW }]}>
          <Text style={styles.fieldLabel}>Preferred locations</Text>
          <TextInput
            value={locations}
            onChangeText={setLocations}
            placeholder='e.g. East Village, Gramercy'
            placeholderTextColor={captionMuted}
            style={styles.input}
            selectionColor={colors.primary}
          />
        </View>
      </ScrollView>

      <OnboardingBottomCta
        label='Start matching'
        onPress={() => canContinue && onContinue()}
        disabled={!canContinue}
        padH={padH}
        safeBottomInset={insets.bottom}
        buttonWidth={primaryButtonWidth}
      />
    </View>
  );
}

function PreferenceSection({
  label,
  options,
  valueId,
  onChange,
  maxWidth,
}: {
  label: string;
  options: readonly PreferenceOption[];
  valueId: string;
  onChange: (id: string) => void;
  maxWidth: number;
}) {
  return (
    <View style={[styles.section, { maxWidth }]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.choiceList}>
        {options.map((opt) => {
          const selected = valueId === opt.id;
          const a11yLabel = opt.subtitle
            ? `${opt.title}. ${opt.subtitle}`
            : opt.title;

          return (
            <Pressable
              key={opt.id}
              accessibilityRole='button'
              accessibilityState={{ selected }}
              accessibilityLabel={a11yLabel}
              onPress={() => onChange(opt.id)}
              style={({ pressed }) => [
                styles.optionRow,
                selected && styles.optionRowSelected,
                pressed && styles.optionRowPressed,
              ]}
            >
              <View style={styles.optionCopy}>
                <Text
                  style={[
                    styles.optionTitle,
                    selected && styles.optionTitleSelected,
                  ]}
                >
                  {opt.title}
                </Text>
                {opt.subtitle ? (
                  <Text style={styles.optionSubtitle} numberOfLines={2}>
                    {opt.subtitle}
                  </Text>
                ) : null}
              </View>
              <View style={styles.optionIndicator}>
                {selected ? (
                  <Ionicons
                    name='checkmark-circle'
                    size={22}
                    color={colors.primary}
                  />
                ) : (
                  <View style={styles.optionRing} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
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
    paddingBottom: space.xs,
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
    paddingTop: space.sm,
    width: '100%',
    alignSelf: 'center',
  },
  intro: {
    alignSelf: 'center',
    width: '100%',
    marginBottom: space.xl,
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
  section: {
    marginBottom: space.xl,
    alignSelf: 'center',
    width: '100%',
  },
  fieldLabel: {
    fontSize: type.caption,
    fontWeight: '600',
    color: labelSecondary,
    letterSpacing: 0.4,
    marginBottom: space.sm,
    textTransform: 'uppercase',
  },
  choiceList: {
    gap: space.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 52,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: fieldBorder,
    backgroundColor: fieldFill,
  },
  optionRowSelected: {
    borderColor: selectedChoiceBorder,
    backgroundColor: selectedChoiceBg,
  },
  optionRowPressed: {
    opacity: 0.92,
  },
  optionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  optionTitle: {
    fontSize: type.bodyLarge,
    fontWeight: '500',
    color: ink,
    letterSpacing: -0.3,
  },
  optionTitleSelected: {
    fontWeight: '600',
  },
  optionSubtitle: {
    fontSize: type.caption,
    lineHeight: 18,
    fontWeight: '400',
    color: labelSecondary,
    letterSpacing: -0.06,
  },
  optionIndicator: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(60, 60, 67, 0.28)',
  },
  input: {
    backgroundColor: fieldFill,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: fieldBorder,
    paddingHorizontal: space.md,
    paddingVertical: Platform.select({ ios: 15, default: 14 }),
    fontSize: type.bodyLarge,
    color: ink,
    fontWeight: '400',
    letterSpacing: -0.3,
  },
});
