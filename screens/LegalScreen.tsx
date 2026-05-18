import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { space, type } from '../design/theme';
import {
  SettingsInsetCard,
  SettingsScaffold,
  ink,
} from './accountSettings/AccountSettingsShared';

type LegalLink = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const LEGAL_LINKS: LegalLink[] = [
  { label: 'Terms of Service', icon: 'document-text-outline' },
  { label: 'Privacy Policy', icon: 'shield-checkmark-outline' },
];

export function LegalScreen({ onBack }: { onBack: () => void }) {
  return (
    <SettingsScaffold heroHeader title='Legal' onBack={onBack}>
      <SettingsInsetCard>
        {LEGAL_LINKS.map((link, index) => (
          <Pressable
            key={link.label}
            accessibilityRole='button'
            accessibilityLabel={link.label}
            style={({ pressed }) => [
              styles.row,
              index < LEGAL_LINKS.length - 1 && styles.rowBorder,
              pressed && styles.rowPressed,
            ]}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={link.icon} size={22} color={ink} />
            </View>
            <Text style={styles.rowLabel}>{link.label}</Text>
            <Ionicons
              name='chevron-forward'
              size={20}
              color='rgba(60,60,67,0.45)'
            />
          </Pressable>
        ))}
      </SettingsInsetCard>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md + 4,
    paddingHorizontal: space.lg,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60,60,67,0.12)',
  },
  rowPressed: {
    backgroundColor: 'rgba(47, 109, 246, 0.05)',
  },
  iconWrap: {
    width: 28,
    alignItems: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: type.bodyLarge,
    fontWeight: '600',
    color: ink,
    letterSpacing: -0.2,
  },
});
