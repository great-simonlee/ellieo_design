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
import { OnboardingBottomCta } from '../components/OnboardingBottomCta';
import { OnboardingNavHeader } from '../components/OnboardingNavHeader';
import { useOnboardingCtaLayout } from '../design/onboardingCtaLayout';
import { colors, radius, space, type } from '../design/theme';

const ink = '#1C1C1E';
const labelSecondary = '#636366';
const captionMuted = '#8E8E93';
const fieldFill = '#F2F2F7';

const REVIEW_ROWS: { id: string; label: string; icon: keyof typeof Ionicons.glyphMap; external?: boolean }[] = [
  { id: 'gender', label: 'My gender', icon: 'person-outline', external: true },
  { id: 'budget', label: 'Budget', icon: 'wallet-outline' },
  { id: 'moveIn', label: 'Move-in date', icon: 'calendar-outline' },
  { id: 'prefGender', label: 'Preferred roommate gender', icon: 'people-outline' },
  { id: 'prefStatus', label: 'Preferred status', icon: 'school-outline' },
  { id: 'prefRoom', label: 'Preferred room', icon: 'bed-outline' },
  { id: 'prefLoc', label: 'Preferred locations', icon: 'location-outline' },
  { id: 'intro', label: 'Brief introduction', icon: 'document-text-outline', external: true },
  { id: 'lifestyle', label: 'Lifestyle', icon: 'heart-outline', external: true },
];

const MOCK: Record<string, string> = {
  gender: 'She / her',
  budget: '$1,850 / mo',
  moveIn: 'Early Aug 2026',
  prefGender: 'Female roommate only',
  prefStatus: 'Student preferred',
  prefRoom: 'Master bedroom preferred',
  prefLoc: 'East Village, Gramercy',
  intro:
    'Quiet weekdays, gallery walks on weekends, and early-morning coffee runs.',
  lifestyle: 'Early bird · Very tidy · Rarely hosts · Introvert',
};

type Props = {
  onBack: () => void;
  onDone: () => void;
  onEditLifestyle?: () => void;
  onEditPersonalInfo?: () => void;
};

export function RoommatePreferencesReviewScreen({
  onBack,
  onDone,
  onEditLifestyle,
  onEditPersonalInfo,
}: Props) {
  const insets = useSafeAreaInsets();
  const { padH, contentMaxW, primaryButtonWidth } = useOnboardingCtaLayout();
  const [values, setValues] = useState(MOCK);
  const [editingId, setEditingId] = useState<string | null>(null);
  const row = REVIEW_ROWS.find((r) => r.id === editingId);

  const open = (id: string, external?: boolean) => {
    if (id === 'lifestyle') return onEditLifestyle?.();
    if (external) return onEditPersonalInfo?.();
    setEditingId(id);
  };

  if (editingId && row) {
    return (
      <View style={[s.root, { paddingTop: insets.top }]}>
        <StatusBar style='dark' />
        <OnboardingNavHeader padH={padH} onBack={() => setEditingId(null)} />
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: padH, paddingBottom: 120 }}
        >
          <Text style={s.title}>{row.label}</Text>
          <TextInput
            value={values[editingId]}
            onChangeText={(t) => setValues((v) => ({ ...v, [editingId]: t }))}
            style={[s.input, { maxWidth: contentMaxW }]}
            multiline={editingId === 'intro' || editingId === 'prefLoc'}
            selectionColor={colors.primary}
          />
        </ScrollView>
        <OnboardingBottomCta
          label='Save'
          onPress={() => setEditingId(null)}
          padH={padH}
          safeBottomInset={insets.bottom}
          buttonWidth={primaryButtonWidth}
        />
      </View>
    );
  }

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar style='dark' />
      <OnboardingNavHeader padH={padH} onBack={onBack} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: padH,
          paddingBottom: insets.bottom + 100,
        }}
      >
        <Text style={s.title}>Roommate information</Text>
        <Text style={s.sub}>Tap a row to update. Matches use these details.</Text>
        <View style={[s.card, { maxWidth: contentMaxW }]}>
          {REVIEW_ROWS.map((r) => (
            <Pressable
              key={r.id}
              onPress={() => open(r.id, r.external)}
              style={({ pressed }) => [s.row, pressed && s.rowPressed]}
            >
              <Ionicons name={r.icon} size={20} color={ink} />
              <View style={s.rowCopy}>
                <Text style={s.rowLabel}>{r.label}</Text>
                <Text style={s.rowVal} numberOfLines={2}>
                  {values[r.id]}
                </Text>
              </View>
              <Ionicons name='chevron-forward' size={20} color='rgba(60,60,67,0.45)' />
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <OnboardingBottomCta
        label='Done'
        onPress={onDone}
        padH={padH}
        safeBottomInset={insets.bottom}
        buttonWidth={primaryButtonWidth}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF' },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: ink,
    marginBottom: space.sm,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: type.body,
    color: labelSecondary,
    marginBottom: space.xl,
    lineHeight: 22,
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.08)',
    padding: space.sm,
    alignSelf: 'center',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 68,
    padding: space.sm,
    borderRadius: radius.lg,
  },
  rowPressed: { backgroundColor: '#F8F8FA' },
  rowCopy: { flex: 1 },
  rowLabel: { fontSize: type.caption, fontWeight: '700', color: labelSecondary },
  rowVal: { fontSize: type.body, fontWeight: '600', color: ink, marginTop: 2 },
  input: {
    backgroundColor: fieldFill,
    borderRadius: radius.sm + 2,
    padding: space.lg,
    fontSize: type.bodyLarge,
    color: ink,
    minHeight: 52,
  },
});
