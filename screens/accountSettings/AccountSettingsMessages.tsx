import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, type } from '../../design/theme';
import {
  SettingsFieldLabel,
  SettingsScaffold,
  SettingsToggleRow,
  cardBg,
  cardBorder,
  ink,
} from './AccountSettingsShared';

type Audience = 'all' | 'student' | 'working';

export function AccountSettingsMessages({ onBack }: { onBack: () => void }) {
  const [sameGender, setSameGender] = useState(false);
  const [fromAgents, setFromAgents] = useState(true);
  const [allSchools, setAllSchools] = useState(true);
  const [allAges, setAllAges] = useState(true);
  const [audience, setAudience] = useState<Audience>('all');

  return (
    <SettingsScaffold
      title='Messages'
      subtitle='View and manage your conversations with agents and roommates.'
      onBack={onBack}
    >
      <SettingsToggleRow
        title='Same gender preference'
        description='If disabled, you may receive messages from all genders.'
        value={sameGender}
        onValueChange={setSameGender}
      />
      <SettingsToggleRow
        title='Receive messages from agents'
        description='If disabled, you will not receive messages from real estate agents.'
        value={fromAgents}
        onValueChange={setFromAgents}
      />
      <SettingsToggleRow
        title='Receive messages from all schools'
        description='If disabled, you will receive messages only from users at your school.'
        value={allSchools}
        onValueChange={setAllSchools}
      />
      <SettingsToggleRow
        title='Receive messages from all age ranges'
        description='If disabled, you will receive messages only from users in a similar age range.'
        value={allAges}
        onValueChange={setAllAges}
        isLast
      />

      <View style={styles.segmentBlock}>
        <SettingsFieldLabel>Receive messages only from</SettingsFieldLabel>
        <View style={styles.segment}>
          {(
            [
              { id: 'all' as const, label: 'All' },
              { id: 'student' as const, label: 'Student' },
              { id: 'working' as const, label: 'Working professional' },
            ] as const
          ).map((opt, index) => {
            const on = audience === opt.id;
            return (
              <Pressable
                key={opt.id}
                accessibilityRole='button'
                accessibilityState={{ selected: on }}
                onPress={() => setAudience(opt.id)}
                style={[
                  styles.segmentItem,
                  index > 0 && styles.segmentItemBorder,
                  on && styles.segmentItemOn,
                ]}
              >
                <Text style={[styles.segmentLabel, on && styles.segmentLabelOn]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  segmentBlock: {
    gap: space.sm,
    marginTop: space.xs,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: cardBorder,
    backgroundColor: cardBg,
    overflow: 'hidden',
  },
  segmentItem: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xs,
    paddingVertical: space.sm,
  },
  segmentItemBorder: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: cardBorder,
  },
  segmentItemOn: {
    backgroundColor: colors.primary,
  },
  segmentLabel: {
    fontSize: type.micro,
    lineHeight: 14,
    fontWeight: '700',
    color: ink,
    textAlign: 'center',
    letterSpacing: -0.04,
  },
  segmentLabelOn: {
    color: '#FFFFFF',
  },
});
