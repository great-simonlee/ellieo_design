import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { space } from '../../design/theme';
import { useOnboardingCtaLayout } from '../../design/onboardingCtaLayout';
import {
  SettingsDangerButton,
  SettingsFieldLabel,
  SettingsScaffold,
  SettingsTextField,
} from './AccountSettingsShared';

export function AccountSettingsDeleteAccount({ onBack }: { onBack: () => void }) {
  const [reason, setReason] = useState('');
  const { primaryButtonWidth } = useOnboardingCtaLayout();

  return (
    <SettingsScaffold
      heroHeader
      title='Delete Account'
      subtitle='Once you delete your account, your profile, listings, and messages will be permanently removed. This action cannot be undone.'
      onBack={onBack}
      footer={
        <SettingsDangerButton
          label='Delete my account'
          width={primaryButtonWidth}
        />
      }
    >
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
  fieldGroup: {
    gap: space.sm,
  },
});
