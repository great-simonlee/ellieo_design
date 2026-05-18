import { useCallback, useState } from 'react';
import { AccountSettingsDeleteAccount } from './accountSettings/AccountSettingsDeleteAccount';
import { AccountSettingsHub } from './accountSettings/AccountSettingsHub';
import { AccountSettingsMessages } from './accountSettings/AccountSettingsMessages';
import { AccountSettingsNotifications } from './accountSettings/AccountSettingsNotifications';
import { AccountSettingsPersonalInfo } from './accountSettings/AccountSettingsPersonalInfo';
import { AccountSettingsPlanBilling } from './accountSettings/AccountSettingsPlanBilling';
import { AccountSettingsPrivacy } from './accountSettings/AccountSettingsPrivacy';
import { AccountSettingsVerification } from './accountSettings/AccountSettingsVerification';
import { PersonalOnboardingScreenFour } from './PersonalOnboardingScreenFour';
import type { AccountSettingsRoute } from './accountSettings/types';

export type AccountSettingsScreenProps = {
  onBack: () => void;
};

export function AccountSettingsScreen({ onBack }: AccountSettingsScreenProps) {
  const [route, setRoute] = useState<AccountSettingsRoute>('hub');

  const goHub = useCallback(() => setRoute('hub'), []);
  const goPersonalInfo = useCallback(() => setRoute('personalInfo'), []);

  const handleBack =
    route === 'hub'
      ? onBack
      : route === 'updatePhotos'
        ? goPersonalInfo
        : goHub;

  switch (route) {
    case 'personalInfo':
      return (
        <AccountSettingsPersonalInfo
          onBack={handleBack}
          onOpenPhotos={() => setRoute('updatePhotos')}
        />
      );
    case 'updatePhotos':
      return <PersonalOnboardingScreenFour mode='settings' onBack={handleBack} />;
    case 'verification':
      return <AccountSettingsVerification onBack={handleBack} />;
    case 'privacy':
      return <AccountSettingsPrivacy onBack={handleBack} />;
    case 'notifications':
      return <AccountSettingsNotifications onBack={handleBack} />;
    case 'messages':
      return <AccountSettingsMessages onBack={handleBack} />;
    case 'planBilling':
      return <AccountSettingsPlanBilling onBack={handleBack} />;
    case 'deleteAccount':
      return <AccountSettingsDeleteAccount onBack={handleBack} />;
    case 'hub':
    default:
      return (
        <AccountSettingsHub onBack={onBack} onNavigate={setRoute} />
      );
  }
}
