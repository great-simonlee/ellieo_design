import { Text, StyleSheet } from 'react-native';
import { type } from '../../design/theme';

export const ink = '#1C1C1E';
export const labelSecondary = '#636366';
export const captionMuted = '#8E8E93';
export const fieldFill = '#F2F2F7';
export const fieldBorder = 'rgba(60, 60, 67, 0.12)';
export const required = '#FF3B30';
export const selectedChoiceBg = 'rgba(47, 109, 246, 0.07)';
export const selectedChoiceBorder = 'rgba(47, 109, 246, 0.45)';

export const GENDERS = [
  { id: 'he' as const, title: 'He / him', hint: 'His' },
  { id: 'she' as const, title: 'She / her', hint: 'Hers' },
  { id: 'they' as const, title: 'They / them', hint: 'Theirs' },
];

export type GenderId = (typeof GENDERS)[number]['id'];

export function parseBirthPart(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const n = Number.parseInt(t, 10);
  return Number.isFinite(n) ? n : null;
}

export function sanitizeEnglishNameInput(input: string): string {
  return input.replace(/[^A-Za-z ]/g, '');
}

export function sanitizeSchoolYearInput(input: string): string {
  return input.replace(/\D/g, '').slice(0, 4);
}

export function sanitizeJobTitleInput(input: string): string {
  const s = typeof input === 'string' ? input : String(input ?? '');
  return s.replace(/\d/g, '');
}

export function FieldLabel({
  text,
  required: req,
}: {
  text: string;
  required?: boolean;
}) {
  return (
    <Text style={fieldStyles.fieldLabel}>
      {text}
      {req ? <Text style={fieldStyles.asterisk}> *</Text> : null}
    </Text>
  );
}

export const fieldStyles = StyleSheet.create({
  fieldLabel: {
    fontSize: type.caption,
    fontWeight: '600',
    color: labelSecondary,
    letterSpacing: -0.1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  asterisk: {
    color: required,
    fontWeight: '600',
  },
});
