import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, space, type } from '../../design/theme';
import {
  SettingsInsetCard,
  SettingsScaffold,
  SettingsSectionLabel,
  captionMuted,
  ink,
  muted,
} from './AccountSettingsShared';

export function AccountSettingsVerification({ onBack }: { onBack: () => void }) {
  return (
    <SettingsScaffold title='Account verification' onBack={onBack}>
      <SettingsSectionLabel>User verification</SettingsSectionLabel>
      <SettingsInsetCard>
        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Ionicons name='school-outline' size={22} color={captionMuted} />
          </View>
          <Text style={styles.rowLabelDone}>School email connect</Text>
          <Ionicons name='checkmark-circle' size={22} color={colors.primary} />
        </View>
        <View style={styles.divider} />
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='LinkedIn connect'
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        >
          <View style={styles.rowIcon}>
            <Ionicons name='logo-linkedin' size={22} color={ink} />
          </View>
          <Text style={styles.rowLabel}>LinkedIn connect</Text>
          <Ionicons name='chevron-forward' size={20} color='rgba(60,60,67,0.45)' />
        </Pressable>
      </SettingsInsetCard>
      <Text style={styles.hint}>
        Verified profiles get better roommate matches and more trust in messages.
      </Text>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md + 2,
    paddingHorizontal: space.lg,
  },
  rowPressed: {
    backgroundColor: 'rgba(47,109,246,0.05)',
  },
  rowIcon: {
    width: 28,
    alignItems: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: type.bodyLarge,
    fontWeight: '600',
    color: ink,
    letterSpacing: -0.2,
    textTransform: 'capitalize',
  },
  rowLabelDone: {
    flex: 1,
    fontSize: type.bodyLarge,
    fontWeight: '600',
    color: muted,
    letterSpacing: -0.2,
    textTransform: 'capitalize',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(60,60,67,0.12)',
    marginHorizontal: space.lg,
  },
  hint: {
    fontSize: type.caption,
    lineHeight: 18,
    fontWeight: '500',
    color: muted,
    letterSpacing: -0.08,
    marginTop: -space.sm,
  },
});
