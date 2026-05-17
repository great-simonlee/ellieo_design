import { useState } from 'react';
import { SettingsScaffold, SettingsToggleRow } from './AccountSettingsShared';

export function AccountSettingsNotifications({ onBack }: { onBack: () => void }) {
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  const [messages, setMessages] = useState(true);
  const [rooms, setRooms] = useState(true);
  const [community, setCommunity] = useState(true);

  return (
    <SettingsScaffold
      title='Notifications'
      subtitle='Manage how and when you receive alerts from Ellieo.'
      onBack={onBack}
    >
      <SettingsToggleRow
        title='Push notifications'
        description='Receive alerts about new messages, matches, and updates from Ellieo.'
        value={push}
        onValueChange={setPush}
      />
      <SettingsToggleRow
        title='Email notifications'
        description='Get important updates and roommate suggestions via email.'
        value={email}
        onValueChange={setEmail}
      />
      <SettingsToggleRow
        title='Message notifications'
        description='Receive alerts when you get a new message from an agent or roommate.'
        value={messages}
        onValueChange={setMessages}
      />
      <SettingsToggleRow
        title='Room updates'
        description='Stay informed about price changes or availability in your saved listings.'
        value={rooms}
        onValueChange={setRooms}
      />
      <SettingsToggleRow
        title='Community announcements'
        description='Hear about Ellieo events, tips, and community updates.'
        value={community}
        onValueChange={setCommunity}
        isLast
      />
    </SettingsScaffold>
  );
}
