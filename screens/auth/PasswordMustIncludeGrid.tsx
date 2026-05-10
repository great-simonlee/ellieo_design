import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius, space, type } from '../../design/theme';

const ink = '#0f172a';
import { evaluatePassword } from './passwordStrength';

const slate = '#475569';
const muted = '#64748b';
const line = '#E2E7EF';
const SUCCESS_GREEN = '#16A34A';

function CriteriaRow({
  met,
  title,
  hint,
  fullWidth,
}: {
  met: boolean;
  title: string;
  hint: string;
  fullWidth?: boolean;
}) {
  return (
    <View
      accessibilityRole='text'
      accessibilityLabel={`${hint}${met ? ', satisfied' : ', needed'}`}
      style={[
        styles.criteriaTile,
        met && styles.criteriaTileMet,
        fullWidth && styles.criteriaTileFull,
      ]}
    >
      <View style={[styles.criteriaIcon, met && styles.criteriaIconMet]}>
        {met ? (
          <Ionicons name='checkmark' size={11} color='#ffffff' />
        ) : (
          <View style={styles.criteriaIconHollow} />
        )}
      </View>
      <Text
        style={[styles.criteriaTitle, met && styles.criteriaTitleMet]}
        numberOfLines={2}
      >
        {title}
      </Text>
    </View>
  );
}

/** “Must include” grid shared by email sign-up and forgot-password reset. */
export function PasswordMustIncludeGrid({ password }: { password: string }) {
  const pwMeta = useMemo(() => evaluatePassword(password), [password]);

  return (
    <View style={styles.pwExtras} accessibilityLiveRegion='polite'>
      <Text style={styles.criteriaHint}>Must include</Text>
      <View style={styles.criteriaGrid}>
        <View style={styles.criteriaGridRow}>
          <View style={styles.criteriaGridCell}>
            <CriteriaRow
              met={pwMeta.lenOk}
              title='10+ characters'
              hint='At least 10 characters'
            />
          </View>
          <View style={styles.criteriaGridCell}>
            <CriteriaRow
              met={pwMeta.upperOk}
              title='Uppercase'
              hint='One uppercase letter A–Z'
            />
          </View>
        </View>
        <View style={styles.criteriaGridRow}>
          <View style={styles.criteriaGridCell}>
            <CriteriaRow
              met={pwMeta.lowerOk}
              title='Lowercase'
              hint='One lowercase letter a–z'
            />
          </View>
          <View style={styles.criteriaGridCell}>
            <CriteriaRow
              met={pwMeta.numOk}
              title='A number'
              hint='One digit 0–9'
            />
          </View>
        </View>
        <View style={styles.criteriaGridFullRow}>
          <CriteriaRow
            met={pwMeta.specialOk}
            title='Special character'
            hint='One special character such as ! @ #'
            fullWidth
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pwExtras: {
    marginTop: space.lg,
  },
  criteriaHint: {
    fontSize: type.micro,
    fontWeight: '700',
    color: muted,
    letterSpacing: 0.15,
    textTransform: 'uppercase',
    marginBottom: space.md,
  },
  criteriaGrid: {
    gap: space.sm + 2,
  },
  criteriaGridRow: {
    flexDirection: 'row',
    gap: space.sm + 2,
  },
  criteriaGridFullRow: {
    width: '100%',
  },
  criteriaGridCell: {
    flex: 1,
    minWidth: 0,
  },
  criteriaTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: line,
    backgroundColor: '#F1F5F9',
    flex: 1,
    minHeight: 38,
  },
  criteriaTileMet: {
    borderColor: 'rgba(22, 163, 74, 0.35)',
    backgroundColor: 'rgba(22, 163, 74, 0.06)',
  },
  criteriaTileFull: {
    width: '100%',
  },
  criteriaIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  criteriaIconMet: {
    borderColor: SUCCESS_GREEN,
    backgroundColor: SUCCESS_GREEN,
  },
  criteriaIconHollow: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  criteriaTitle: {
    flex: 1,
    fontSize: type.micro,
    lineHeight: 15,
    fontWeight: '600',
    color: slate,
    letterSpacing: -0.1,
  },
  criteriaTitleMet: {
    color: ink,
  },
});
