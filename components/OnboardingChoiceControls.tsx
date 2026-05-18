import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { useEffect, useRef } from 'react';
import {
  Animated,
  type LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radius, space, type } from '../design/theme';

const ink = '#1C1C1E';
const labelSecondary = '#636366';
const fieldFill = '#F2F2F7';
const fieldBorder = 'rgba(60, 60, 67, 0.12)';
const selectionBorder = '#5A9EFF';
const selectionBorderSoft = 'rgba(90, 158, 255, 0.32)';
/** Status / room cards — light gray border, close to white on `fieldFill`. */
const iconCardBorder = '#FFFFFF';
const iconCardBorderSelected = colors.primary;

type SegmentOption = {
  id: string;
  title: string;
};

type IconChoiceOption = {
  id: string;
  label: string;
  accessibilityLabel?: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  iconSelected?: ComponentProps<typeof Ionicons>['name'];
};

/** Segmented control — 2–3 options in one row (`PersonalOnboardingScreenThree`). */
export function GenderSegmentControl({
  options,
  valueId,
  onChange,
}: {
  options: readonly SegmentOption[];
  valueId: string;
  onChange: (id: string) => void;
}) {
  const segmentLayouts = useRef<
    Partial<Record<string, { x: number; width: number }>>
  >({});
  const slideX = useRef(new Animated.Value(0)).current;
  const slideW = useRef(new Animated.Value(0)).current;

  const activeInTrack = options.some((o) => o.id === valueId);

  useEffect(() => {
    if (!activeInTrack) return;
    const L = segmentLayouts.current[valueId];
    if (L == null || L.width <= 0) return;
    Animated.parallel([
      Animated.spring(slideX, {
        toValue: L.x,
        useNativeDriver: false,
        friction: 9,
        tension: 68,
      }),
      Animated.spring(slideW, {
        toValue: L.width,
        useNativeDriver: false,
        friction: 9,
        tension: 68,
      }),
    ]).start();
  }, [activeInTrack, valueId, slideX, slideW]);

  const onSegmentLayout = (id: string) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    segmentLayouts.current[id] = { x, width };
    if (activeInTrack && valueId === id && width > 0) {
      Animated.parallel([
        Animated.spring(slideX, {
          toValue: x,
          useNativeDriver: false,
          friction: 9,
          tension: 68,
        }),
        Animated.spring(slideW, {
          toValue: width,
          useNativeDriver: false,
          friction: 9,
          tension: 68,
        }),
      ]).start();
    }
  };

  return (
    <View style={styles.genderSegmentTrack}>
      {activeInTrack ? (
        <Animated.View
          pointerEvents='none'
          style={[
            styles.genderSlidingPill,
            {
              width: slideW,
              transform: [{ translateX: slideX }],
            },
          ]}
        />
      ) : null}
      {options.map((opt) => {
        const selected = valueId === opt.id;
        return (
          <Pressable
            key={opt.id}
            accessibilityRole='button'
            accessibilityState={{ selected }}
            accessibilityLabel={opt.title}
            onLayout={onSegmentLayout(opt.id)}
            onPress={() => onChange(opt.id)}
            style={({ pressed }) => [
              styles.genderSegment,
              pressed && styles.genderSegmentPressed,
            ]}
          >
            <View style={styles.genderSegmentContent}>
              <Text
                style={[
                  styles.genderSegmentLabel,
                  selected && styles.genderSegmentLabelSelected,
                ]}
                numberOfLines={1}
              >
                {opt.title}
              </Text>
              {selected ? (
                <Ionicons
                  name='checkmark-circle'
                  size={17}
                  color={colors.primary}
                  style={styles.genderSegmentCheck}
                />
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Four gender/pronoun options in one 2×2 grid inside a single track. */
export function GenderSegmentGrid({
  options,
  valueId,
  onChange,
}: {
  options: readonly SegmentOption[];
  valueId: string | null;
  onChange: (id: string) => void;
}) {
  return (
    <View style={styles.genderGridTrack}>
      <View style={styles.genderGrid}>
        {options.map((opt) => {
          const selected = valueId === opt.id;
          return (
            <Pressable
              key={opt.id}
              accessibilityRole='button'
              accessibilityState={{ selected }}
              accessibilityLabel={opt.title}
              onPress={() => onChange(opt.id)}
              style={({ pressed }) => [
                styles.genderGridCell,
                selected && styles.genderGridCellSelected,
                pressed && styles.genderSegmentPressed,
              ]}
            >
              <Text
                style={[
                  styles.genderGridLabel,
                  selected && styles.genderSegmentLabelSelected,
                ]}
                numberOfLines={1}
              >
                {opt.title}
              </Text>
              {selected ? (
                <Ionicons
                  name='checkmark-circle'
                  size={17}
                  color={colors.primary}
                  style={styles.genderSegmentCheck}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Icon cards — `row` for 2-up; `grid` for 2×2; vertical icon-over-label layout. */
export function IconChoiceCards({
  options,
  valueId,
  onChange,
  layout = 'row',
}: {
  options: readonly IconChoiceOption[];
  valueId: string | null;
  onChange: (id: string) => void;
  layout?: 'row' | 'grid';
}) {
  const containerStyle =
    layout === 'grid' ? styles.choiceGrid : styles.statusRow;

  return (
    <View style={containerStyle}>
      {options.map((opt) => {
        const selected = valueId === opt.id;
        const iconName =
          selected && opt.iconSelected ? opt.iconSelected : opt.icon;
        return (
          <Pressable
            key={opt.id}
            accessibilityRole='button'
            accessibilityState={{ selected }}
            accessibilityLabel={opt.accessibilityLabel ?? opt.label}
            onPress={() => onChange(opt.id)}
            style={({ pressed }) => [
              styles.iconCard,
              layout === 'grid' && styles.iconCardGrid,
              selected && styles.iconCardSelected,
              pressed && styles.iconCardPressed,
            ]}
          >
            <View
              style={[
                styles.statusIconCircle,
                selected && styles.statusIconCircleSelected,
              ]}
            >
              <Ionicons
                name={iconName}
                size={20}
                color={selected ? colors.primary : labelSecondary}
              />
            </View>
            <Text
              style={[
                styles.iconCardLabel,
                selected && styles.iconCardLabelSelected,
              ]}
              numberOfLines={2}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** @deprecated Use `IconChoiceCards` */
export const IconChoiceRow = IconChoiceCards;
/** @deprecated Use `IconChoiceCards` with layout="grid" */
export const IconChoiceGrid = (
  props: Omit<ComponentProps<typeof IconChoiceCards>, 'layout'>,
) => <IconChoiceCards {...props} layout='grid' />;

const styles = StyleSheet.create({
  genderSegmentTrack: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#E8E9EF',
    borderRadius: radius.pill,
    padding: 3,
    gap: 2,
    overflow: 'visible',
  },
  genderSlidingPill: {
    position: 'absolute',
    left: 3,
    top: 3,
    bottom: 3,
    zIndex: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: selectionBorder,
    ...Platform.select({
      ios: {
        shadowColor: selectionBorder,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
      },
      android: { elevation: 5 },
    }),
  },
  genderSegment: {
    flex: 1,
    zIndex: 1,
    minHeight: 44,
    borderRadius: radius.pill,
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xs,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  genderSegmentPressed: {
    opacity: 0.88,
  },
  genderSegmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    maxWidth: '100%',
  },
  genderSegmentCheck: {
    flexShrink: 0,
  },
  genderSegmentLabel: {
    flexShrink: 1,
    fontSize: type.caption,
    fontWeight: '600',
    color: labelSecondary,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  genderSegmentLabelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  genderGridTrack: {
    backgroundColor: '#E8E9EF',
    borderRadius: radius.lg,
    padding: 3,
  },
  genderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  genderGridCell: {
    width: '48.8%',
    flexGrow: 1,
    flexBasis: '47%',
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: space.sm,
    paddingVertical: space.sm + 2,
    borderRadius: radius.md + 2,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  genderGridCellSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: selectionBorder,
    ...Platform.select({
      ios: {
        shadowColor: selectionBorder,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.16,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  genderGridLabel: {
    flexShrink: 1,
    fontSize: type.caption,
    fontWeight: '600',
    color: labelSecondary,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
  },
  iconCard: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    minHeight: 76,
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
    borderRadius: radius.md,
    backgroundColor: fieldFill,
    borderWidth: 2,
    borderColor: iconCardBorder,
  },
  iconCardGrid: {
    width: '48.5%',
    flexGrow: 1,
    flexBasis: '47%',
  },
  iconCardSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: iconCardBorderSelected,
    ...Platform.select({
      ios: {
        shadowColor: iconCardBorderSelected,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  iconCardPressed: {
    opacity: 0.9,
  },
  statusIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(60, 60, 67, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIconCircleSelected: {
    borderWidth: 1,
    borderColor: 'rgba(47, 109, 246, 0.25)',
  },
  iconCardLabel: {
    fontSize: type.caption,
    fontWeight: '600',
    color: ink,
    letterSpacing: -0.15,
    textAlign: 'center',
  },
  iconCardLabelSelected: {
    color: colors.primary,
  },
});
