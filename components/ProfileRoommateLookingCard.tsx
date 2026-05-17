import {
  Platform,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { colors, radius, space, type } from '../design/theme';

const labelSecondary = '#636366';

type ProfileRoommateLookingCardProps = {
  activelyLooking: boolean;
  onActivelyLookingChange: (next: boolean) => void;
};

/** Profile menu — simple “actively looking” toggle for Match visibility. */
export function ProfileRoommateLookingCard({
  activelyLooking,
  onActivelyLookingChange,
}: ProfileRoommateLookingCardProps) {
  return (
    <View style={styles.section}>
      <View style={styles.card}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.statusTitle,
              activelyLooking ? styles.statusTitleOn : styles.statusTitleOff,
            ]}
          >
            {activelyLooking ? 'Match Enabled' : 'Match Disabled'}
          </Text>
          <Switch
            value={activelyLooking}
            onValueChange={onActivelyLookingChange}
            trackColor={{ false: '#E5E5EA', true: colors.primary }}
            thumbColor='#FFFFFF'
            ios_backgroundColor='#E5E5EA'
            accessibilityLabel={`Actively looking for roommates, ${
              activelyLooking ? 'match enabled' : 'match disabled'
            }`}
          />
        </View>
        <Text
          style={styles.statusHint}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.9}
        >
          {activelyLooking
            ? 'Visible on Match — roommates can discover you'
            : "Hidden from Match — you won't appear in the deck"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: space.lg,
  },
  card: {
    borderRadius: radius.xl,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.08)',
    padding: space.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.045,
        shadowRadius: 18,
      },
      android: { elevation: 2 },
    }),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  statusTitle: {
    fontSize: type.title,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.35,
  },
  statusTitleOn: {
    color: colors.primary,
  },
  statusTitleOff: {
    color: labelSecondary,
  },
  statusHint: {
    marginTop: 6,
    fontSize: type.caption,
    lineHeight: 18,
    fontWeight: '400',
    color: labelSecondary,
    letterSpacing: -0.06,
  },
});
