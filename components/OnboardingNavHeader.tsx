import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { radius, space } from '../design/theme';

const ink = '#1C1C1E';

export type OnboardingNavHeaderProps = {
  padH: number;
  onBack?: () => void;
  onClose?: () => void;
  backAccessibilityLabel?: string;
  closeAccessibilityLabel?: string;
  center?: ReactNode;
  right?: ReactNode;
};

type NavIconButtonProps = {
  accessibilityLabel: string;
  icon: 'chevron-back' | 'close';
  onPress: () => void;
  align: 'start' | 'end';
};

function NavIconButton({
  accessibilityLabel,
  icon,
  onPress,
  align,
}: NavIconButtonProps) {
  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={12}
      style={({ pressed }) => [
        align === 'start' ? styles.backBtn : styles.closeBtn,
        pressed && styles.navBtnPressed,
      ]}
    >
      <Ionicons name={icon} size={26} color={ink} />
    </Pressable>
  );
}

/** Top nav row matching `PersonalOnboardingScreenTwo` (and dual-action `Six`). */
export function OnboardingNavHeader({
  padH,
  onBack,
  onClose,
  backAccessibilityLabel = 'Go back',
  closeAccessibilityLabel = 'Close',
  center,
  right,
}: OnboardingNavHeaderProps) {
  const hasTrailing = Boolean(right ?? onClose);
  const hasCenter = Boolean(center);

  if (!hasTrailing && !hasCenter) {
    return (
      <View style={[styles.headerRow, { paddingHorizontal: padH }]}>
        {onBack ? (
          <NavIconButton
            accessibilityLabel={backAccessibilityLabel}
            icon='chevron-back'
            onPress={onBack}
            align='start'
          />
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.headerRowSplit, { paddingHorizontal: padH }]}>
      <View style={styles.sideSlot}>
        {onBack ? (
          <NavIconButton
            accessibilityLabel={backAccessibilityLabel}
            icon='chevron-back'
            onPress={onBack}
            align='start'
          />
        ) : null}
      </View>
      {hasCenter ? <View style={styles.centerSlot}>{center}</View> : null}
      <View style={[styles.sideSlot, styles.sideEnd]}>
        {right ??
          (onClose ? (
            <NavIconButton
              accessibilityLabel={closeAccessibilityLabel}
              icon='close'
              onPress={onClose}
              align='end'
            />
          ) : null)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    paddingBottom: space.xs,
  },
  headerRowSplit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: space.xs,
  },
  sideSlot: {
    minWidth: 44,
    /** Match chevron nav button: 26px icon + 8px vertical padding */
    minHeight: 34,
    justifyContent: 'center',
  },
  sideEnd: {
    alignItems: 'flex-end',
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xs,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginLeft: -space.xs,
    padding: space.xs,
    borderRadius: radius.sm,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    marginRight: -space.xs,
    padding: space.xs,
    borderRadius: radius.sm,
  },
  navBtnPressed: {
    opacity: 0.55,
  },
});
