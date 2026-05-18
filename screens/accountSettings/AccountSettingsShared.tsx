import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OnboardingNavHeader } from '../../components/OnboardingNavHeader';
import { useOnboardingCtaLayout } from '../../design/onboardingCtaLayout';
import { colors, gradientPrimaryHorizontal, radius, space, type } from '../../design/theme';

export const ink = '#1C1C1E';
export const muted = '#687084';
export const labelSecondary = '#636366';
export const captionMuted = '#8E8E93';
/** Match `ProfileMenuScreen` surfaces. */
export const pageBg = '#FFFFFF';
export const cardBg = '#FFFFFF';
export const cardBorder = 'rgba(60,60,67,0.08)';
export const fieldFill = '#F2F2F7';
export const fieldBorder = 'rgba(60, 60, 67, 0.12)';
export const required = '#FF3B30';

const profileCardShadow = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.045,
    shadowRadius: 18,
  },
  android: { elevation: 2 },
});

export type SettingsScaffoldProps = {
  title?: string;
  subtitle?: string;
  /** Large hero title + body (matches Account Verification). */
  heroHeader?: boolean;
  onBack: () => void;
  headerRight?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export function SettingsScaffold({
  title,
  subtitle,
  heroHeader = false,
  onBack,
  headerRight,
  children,
  footer,
  contentStyle,
}: SettingsScaffoldProps) {
  const insets = useSafeAreaInsets();
  const { padH, contentMaxW } = useOnboardingCtaLayout();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style='dark' />
      <OnboardingNavHeader
        padH={padH}
        onBack={onBack}
        right={headerRight}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: padH,
            paddingBottom: footer
              ? space.xxxl
              : insets.bottom + space.xxxl,
          },
          contentStyle,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
      >
        {title ? (
          <Text
            style={[
              heroHeader ? styles.heroTitle : styles.pageTitle,
              { maxWidth: contentMaxW },
            ]}
          >
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text
            style={[
              heroHeader ? styles.heroSubtitle : styles.pageSubtitle,
              { maxWidth: contentMaxW },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
        <View style={styles.pageBody}>{children}</View>
      </ScrollView>
      {footer ? (
        <View
          style={[
            styles.footer,
            {
              paddingHorizontal: padH,
              paddingBottom: insets.bottom + space.md,
              alignItems: 'center',
            },
          ]}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}

export function SettingsMenuCard({
  children,
  kicker,
}: {
  children: ReactNode;
  kicker?: string;
}) {
  return (
    <View style={styles.menuCard}>
      {kicker ? <Text style={styles.menuCardKicker}>{kicker}</Text> : null}
      {children}
    </View>
  );
}

type SettingsNavRowProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  isLast?: boolean;
  destructive?: boolean;
};

export function SettingsNavRow({
  label,
  icon,
  onPress,
  isLast,
  destructive,
}: SettingsNavRowProps) {
  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.navRow,
        isLast && styles.navRowLast,
        pressed && styles.navRowPressed,
      ]}
    >
      <View style={styles.navIconWrap}>
        <Ionicons
          name={icon}
          size={22}
          color={destructive ? colors.coralDeep : rowIconColor}
        />
      </View>
      <Text style={[styles.navLabel, destructive && styles.navLabelDestructive]}>
        {label}
      </Text>
      <Ionicons name='chevron-forward' size={20} color='rgba(60,60,67,0.45)' />
    </Pressable>
  );
}

type SettingsToggleRowProps = {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  isLast?: boolean;
};

export function SettingsToggleRow({
  title,
  description,
  value,
  onValueChange,
  isLast,
}: SettingsToggleRowProps) {
  return (
    <View style={[styles.toggleRow, isLast && styles.toggleRowLast]}>
      <View style={styles.toggleCopy}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E5EA', true: colors.primary }}
        thumbColor='#FFFFFF'
        ios_backgroundColor='#E5E5EA'
      />
    </View>
  );
}

export function SettingsSectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function SettingsFieldLabel({
  children,
  requiredMark,
}: {
  children: string;
  requiredMark?: boolean;
}) {
  return (
    <Text style={styles.fieldLabel}>
      {children}
      {requiredMark ? <Text style={styles.requiredMark}> *</Text> : null}
    </Text>
  );
}

export function SettingsTextField({
  value,
  onChangeText,
  placeholder,
  multiline,
  maxLength,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={captionMuted}
      multiline={multiline}
      maxLength={maxLength}
      style={[styles.fieldInput, multiline && styles.fieldInputMultiline]}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  );
}

export function SettingsInsetCard({ children }: { children: ReactNode }) {
  return <View style={styles.insetCard}>{children}</View>;
}

export function SettingsPrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.primaryBtnShell, pressed && styles.btnPressed]}
    >
      <LinearGradient
        colors={gradientPrimaryHorizontal}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.primaryBtn}
      >
        <Text style={styles.primaryBtnText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function SettingsDangerButton({
  label,
  onPress,
  width,
}: {
  label: string;
  onPress?: () => void;
  /** Match `OnboardingBottomCta` / Personal Information Save width. */
  width?: number;
}) {
  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.dangerBtnShell,
        width != null && { width },
        pressed && styles.btnPressed,
      ]}
    >
      <LinearGradient
        colors={[colors.coral, colors.coralDeep]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.dangerBtn}
      >
        <Text style={styles.dangerBtnText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function SettingsHeaderSave({
  onPress,
}: {
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel='Save'
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [pressed && { opacity: 0.7 }]}
    >
      <Text style={styles.headerSave}>Save</Text>
    </Pressable>
  );
}

const rowIconColor = ink;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: pageBg,
  },
  scroll: {
    flex: 1,
    backgroundColor: pageBg,
  },
  scrollContent: {
    paddingTop: space.sm,
  },
  pageTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.45,
    marginBottom: space.md,
  },
  pageSubtitle: {
    marginTop: -space.md,
    marginBottom: space.lg,
    fontSize: type.body,
    lineHeight: 22,
    fontWeight: '500',
    color: labelSecondary,
    letterSpacing: -0.12,
  },
  /** Matches Account Verification / Personal Information hero. */
  heroTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.8,
    lineHeight: 36,
    marginBottom: space.sm,
    alignSelf: 'center',
    width: '100%',
  },
  heroSubtitle: {
    fontSize: type.body,
    lineHeight: 22,
    color: labelSecondary,
    fontWeight: '400',
    letterSpacing: -0.2,
    marginBottom: space.lg,
    alignSelf: 'center',
    width: '100%',
  },
  pageBody: {
    gap: space.lg,
  },
  menuCard: {
    marginTop: space.xs,
    borderRadius: radius.xl,
    backgroundColor: cardBg,
    borderWidth: 1,
    borderColor: cardBorder,
    padding: space.sm,
    ...profileCardShadow,
  },
  menuCardKicker: {
    marginLeft: space.sm,
    marginTop: space.xs,
    marginBottom: space.xs,
    fontSize: type.micro,
    lineHeight: 14,
    fontWeight: '900',
    color: 'rgba(60,60,67,0.48)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  navRow: {
    minHeight: 64,
    borderRadius: radius.lg,
    paddingHorizontal: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    marginBottom: space.sm,
  },
  navRowLast: {
    marginBottom: 0,
  },
  navRowPressed: {
    backgroundColor: '#F8F8FA',
  },
  navIconWrap: {
    width: 32,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    flex: 1,
    fontSize: type.bodyLarge,
    lineHeight: 23,
    fontWeight: '600',
    color: ink,
    letterSpacing: -0.25,
  },
  navLabelDestructive: {
    color: colors.coralDeep,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: type.body,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.2,
    marginBottom: -space.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60,60,67,0.1)',
  },
  toggleRowLast: {
    borderBottomWidth: 0,
  },
  toggleCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  toggleTitle: {
    fontSize: type.bodyLarge,
    lineHeight: 22,
    fontWeight: '700',
    color: ink,
    letterSpacing: -0.22,
  },
  toggleDescription: {
    fontSize: type.caption,
    lineHeight: 18,
    fontWeight: '500',
    color: muted,
    letterSpacing: -0.08,
  },
  fieldLabel: {
    fontSize: type.body,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.18,
  },
  requiredMark: {
    color: required,
    fontWeight: '800',
  },
  fieldInput: {
    minHeight: 52,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    backgroundColor: fieldFill,
    borderWidth: 1,
    borderColor: fieldBorder,
    fontSize: type.body,
    fontWeight: '600',
    color: ink,
    letterSpacing: -0.12,
  },
  fieldInputMultiline: {
    minHeight: 120,
    paddingTop: space.md,
  },
  fieldHint: {
    fontSize: type.caption,
    lineHeight: 17,
    fontWeight: '500',
    color: captionMuted,
    letterSpacing: -0.06,
  },
  insetCard: {
    borderRadius: radius.xl,
    backgroundColor: cardBg,
    borderWidth: 1,
    borderColor: cardBorder,
    overflow: 'hidden',
    ...profileCardShadow,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: space.md,
    backgroundColor: pageBg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(31,41,55,0.08)',
  },
  primaryBtnShell: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: { elevation: 3 },
    }),
  },
  primaryBtn: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  primaryBtnText: {
    fontSize: type.bodyLarge,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  dangerBtnShell: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.coralDeep,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  dangerBtn: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  dangerBtnText: {
    fontSize: type.bodyLarge,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  btnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  headerSave: {
    fontSize: type.bodyLarge,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.2,
  },
});
