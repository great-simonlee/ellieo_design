import { PersonalOnboardingScreenSix } from '../PersonalOnboardingScreenSix';

export function AccountSettingsVerification({ onBack }: { onBack: () => void }) {
  return <PersonalOnboardingScreenSix mode='settings' onBack={onBack} />;
}
