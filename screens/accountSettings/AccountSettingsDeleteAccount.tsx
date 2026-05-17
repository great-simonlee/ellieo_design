import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { space, type } from '../../design/theme';
import {
  SettingsDangerButton,
  SettingsFieldLabel,
  SettingsScaffold,
  SettingsTextField,
  muted,
} from './AccountSettingsShared';

export function AccountSettingsDeleteAccount({ onBack }: { onBack: () => void }) {
  const [reason, setReason] = useState('');

  return (
    <SettingsScaffold
      title='Delete Account'
      onBack={onBack}
      footer={<SettingsDangerButton label='Delete my account' />}
    >
      <Text style={styles.warning}>
        Once you delete your account, your profile, listings, and messages will be
        permanently removed. This action cannot be undone.
      </Text>
      <View style={styles.fieldGroup}>
        <SettingsFieldLabel>
          Tell us why you&apos;re leaving (helps us improve).
        </SettingsFieldLabel>
        <SettingsTextField
          value={reason}
          onChangeText={setReason}
          placeholder='Reason (optional)'
          multiline
        />
      </View>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  warning: {
    fontSize: type.body,
    lineHeight: 22,
    fontWeight: '500',
    color: muted,
    letterSpacing: -0.12,
    marginTop: -space.sm,
  },
  fieldGroup: {
    gap: space.sm,
  },
});
