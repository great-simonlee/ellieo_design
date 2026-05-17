import {
  SettingsMenuCard,
  SettingsNavRow,
  SettingsScaffold,
} from './AccountSettingsShared';
import type { AccountSettingsRoute } from './types';

export function AccountSettingsHub({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (route: AccountSettingsRoute) => void;
}) {
  return (
    <SettingsScaffold onBack={onBack}>
      <SettingsMenuCard kicker='Account settings'>
        <SettingsNavRow
          label='Personal Information'
          icon='person-outline'
          onPress={() => onNavigate('personalInfo')}
        />
        <SettingsNavRow
          label='Account verification'
          icon='shield-checkmark-outline'
          onPress={() => onNavigate('verification')}
        />
        <SettingsNavRow
          label='Privacy'
          icon='hand-left-outline'
          onPress={() => onNavigate('privacy')}
        />
        <SettingsNavRow
          label='Notifications'
          icon='notifications-outline'
          onPress={() => onNavigate('notifications')}
        />
        <SettingsNavRow
          label='Messages'
          icon='chatbubbles-outline'
          onPress={() => onNavigate('messages')}
        />
        <SettingsNavRow
          label='Plan & Billing'
          icon='rocket-outline'
          onPress={() => onNavigate('planBilling')}
        />
        <SettingsNavRow
          label='Delete Account'
          icon='person-remove-outline'
          onPress={() => onNavigate('deleteAccount')}
          isLast
          destructive
        />
      </SettingsMenuCard>
    </SettingsScaffold>
  );
}
