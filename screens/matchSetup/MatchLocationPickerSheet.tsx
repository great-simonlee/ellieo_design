import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, space, type } from '../../design/theme';

const ink = '#1C1C1E';
const captionMuted = '#8E8E93';
const fieldFill = '#F2F2F7';
const fieldBorder = 'rgba(60, 60, 67, 0.12)';
const white = '#FFFFFF';

type MatchLocationPickerSheetProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  options: readonly string[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  onDismiss: () => void;
};

/** Bottom sheet — area / neighborhood list (Match setup). */
export function MatchLocationPickerSheet({
  visible,
  title,
  subtitle,
  options,
  selectedValue,
  onSelect,
  onDismiss,
}: MatchLocationPickerSheetProps) {
  const insets = useSafeAreaInsets();
  const sheetClosedY = Math.min(420, Dimensions.get('window').height * 0.5);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(sheetClosedY)).current;

  const runDismiss = useCallback(() => {
    backdropOpacity.stopAnimation();
    sheetTranslateY.stopAnimation();
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: sheetClosedY,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onDismiss();
    });
  }, [backdropOpacity, onDismiss, sheetClosedY, sheetTranslateY]);

  const handleSelect = useCallback(
    (value: string) => {
      onSelect(value);
      runDismiss();
    },
    [onSelect, runDismiss],
  );

  useEffect(() => {
    if (!visible) return;
    backdropOpacity.stopAnimation();
    sheetTranslateY.stopAnimation();
    sheetTranslateY.setValue(sheetClosedY);
    backdropOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        stiffness: 320,
        damping: 36,
        mass: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, backdropOpacity, sheetClosedY, sheetTranslateY]);

  if (!visible) return null;

  return (
    <Modal animationType='none' transparent visible onRequestClose={runDismiss}>
      <View style={styles.root}>
        <Animated.View
          pointerEvents='box-none'
          style={[StyleSheet.absoluteFillObject, { opacity: backdropOpacity }]}
        >
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Dismiss picker'
            style={StyleSheet.absoluteFill}
            onPress={runDismiss}
          >
            <BlurView intensity={48} tint='dark' style={StyleSheet.absoluteFill} />
            <View style={styles.dim} />
          </Pressable>
        </Animated.View>

        <View style={styles.stage} pointerEvents='box-none'>
          <Animated.View
            accessibilityViewIsModal
            style={[
              styles.sheet,
              {
                paddingBottom: Math.max(insets.bottom, space.md),
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            <View style={styles.header}>
              <Text style={styles.title} accessibilityRole='header'>
                {title}
              </Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>

            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps='handled'
              showsVerticalScrollIndicator={false}
            >
              {options.map((opt) => {
                const selected = selectedValue === opt;
                return (
                  <Pressable
                    key={opt}
                    accessibilityRole='button'
                    accessibilityState={{ selected }}
                    onPress={() => handleSelect(opt)}
                    style={({ pressed }) => [
                      styles.option,
                      selected && styles.optionSelected,
                      pressed && !selected && styles.optionPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {opt}
                    </Text>
                    {selected ? (
                      <Ionicons name='checkmark-circle' size={22} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
  },
  stage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '72%',
    backgroundColor: white,
    borderTopLeftRadius: radius.xl + 4,
    borderTopRightRadius: radius.xl + 4,
    ...Platform.select({
      ios: {
        shadowColor: '#1E3A5F',
        shadowOffset: { width: 0, height: -12 },
        shadowOpacity: 0.2,
        shadowRadius: 36,
      },
      android: { elevation: 32 },
    }),
  },
  header: {
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
    paddingBottom: space.md,
    gap: space.xs,
  },
  title: {
    fontSize: type.title,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: type.caption,
    lineHeight: 18,
    fontWeight: '500',
    color: captionMuted,
    letterSpacing: -0.06,
  },
  list: {
    maxHeight: 360,
  },
  listContent: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    gap: space.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    minHeight: 52,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: fieldBorder,
    backgroundColor: fieldFill,
  },
  optionSelected: {
    borderColor: 'rgba(47, 109, 246, 0.45)',
    backgroundColor: 'rgba(47, 109, 246, 0.07)',
  },
  optionPressed: {
    opacity: 0.92,
  },
  optionText: {
    flex: 1,
    fontSize: type.bodyLarge,
    fontWeight: '500',
    color: ink,
    letterSpacing: -0.25,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
});
