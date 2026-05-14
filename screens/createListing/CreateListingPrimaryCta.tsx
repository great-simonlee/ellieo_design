import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, gradientPrimaryHorizontal, radius, space, type } from '../../design/theme';
import { white } from './createListingTokens';

export function CreateListingPrimaryCta({
  label,
  disabled,
  onPress,
  width,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
  width: number;
}) {
  if (disabled) {
    return (
      <Pressable
        accessibilityRole='button'
        disabled
        style={[styles.ctaDisabled, { width, alignSelf: 'center' }]}
      >
        <Text style={styles.ctaDisabledText}>{label}</Text>
      </Pressable>
    );
  }
  return (
    <Pressable
      accessibilityRole='button'
      onPress={onPress}
      style={({ pressed }) => [
        styles.ctaShell,
        { width, alignSelf: 'center' },
        pressed && styles.ctaShellPressed,
      ]}
    >
      <LinearGradient
        colors={gradientPrimaryHorizontal}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.ctaGradient}
      >
        <Text style={styles.ctaText}>{label}</Text>
        <Ionicons
          name='arrow-forward'
          size={20}
          color={white}
          style={{ marginLeft: space.sm }}
        />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ctaShell: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    minHeight: 58,
    alignSelf: 'center',
  },
  ctaShellPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  ctaGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.lg,
    paddingHorizontal: space.xl,
  },
  ctaText: {
    fontSize: type.bodyLarge,
    fontWeight: '900',
    color: white,
    letterSpacing: -0.2,
  },
  ctaDisabled: {
    borderRadius: radius.pill,
    minHeight: 58,
    paddingVertical: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(104,112,132,0.16)',
  },
  ctaDisabledText: {
    fontSize: type.bodyLarge,
    fontWeight: '800',
    color: 'rgba(53,64,82,0.55)',
    letterSpacing: -0.15,
  },
});
