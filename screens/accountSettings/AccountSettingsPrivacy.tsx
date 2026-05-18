import { useState } from 'react';
import { SettingsScaffold, SettingsToggleRow } from './AccountSettingsShared';

export function AccountSettingsPrivacy({ onBack }: { onBack: () => void }) {
  const [legalName, setLegalName] = useState(true);
  const [city, setCity] = useState(true);
  const [age, setAge] = useState(true);
  const [pronouns, setPronouns] = useState(true);
  const [major, setMajor] = useState(true);
  const [schoolYear, setSchoolYear] = useState(true);

  return (
    <SettingsScaffold
      heroHeader
      title='Privacy'
      subtitle='Control how your information is shared within the Ellieo community.'
      onBack={onBack}
    >
      <SettingsToggleRow
        title='Display my legal first name'
        description='If disabled, your preferred name will be visible to others.'
        value={legalName}
        onValueChange={setLegalName}
      />
      <SettingsToggleRow
        title='Display my home city and country'
        description='Example: Seoul, South Korea'
        value={city}
        onValueChange={setCity}
      />
      <SettingsToggleRow
        title='Display my exact age'
        description='If disabled, your age will appear as a range.'
        value={age}
        onValueChange={setAge}
      />
      <SettingsToggleRow
        title='Display my pronouns'
        description="If disabled, your pronouns won't be shown on your profile."
        value={pronouns}
        onValueChange={setPronouns}
      />
      <SettingsToggleRow
        title='Display my major'
        description='If disabled, your major will remain private.'
        value={major}
        onValueChange={setMajor}
      />
      <SettingsToggleRow
        title='Display my school year'
        description="If disabled, your school year won't appear on your profile."
        value={schoolYear}
        onValueChange={setSchoolYear}
        isLast
      />
    </SettingsScaffold>
  );
}
