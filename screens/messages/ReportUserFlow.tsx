import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppTopBar, appTopBarStyles } from '../../components/AppTopBar';
import { OnboardingBottomCta } from '../../components/OnboardingBottomCta';
import { useOnboardingCtaLayout } from '../../design/onboardingCtaLayout';
import { colors, radius, space, type } from '../../design/theme';

const ink = '#1C1C1E';
const muted = '#687084';
const labelSecondary = '#636366';
const fieldFill = '#F2F2F7';
const pageBg = '#FFFFFF';
const maxDetails = 800;
/** Fixed report text box — content scrolls inside when it overflows. */
const REPORT_TEXT_BOX_H = 200;
const REPORT_INPUT_H = 148;

const REPORT_REASONS = [
  "I just don't like this person",
  'Nudity or sexual activity',
  'Bullying or harassment',
  'Violence',
  'Scam or fraud',
  'Suicide or self-injury',
  'Illegal sales or regulated goods',
  'Other',
] as const;

type ReportStep = 'intro' | 'reason' | 'details' | 'thanks';

export type ReportUserFlowProps = {
  visible: boolean;
  reportedName: string;
  onClose: () => void;
};

export function ReportUserFlow({
  visible,
  reportedName,
  onClose,
}: ReportUserFlowProps) {
  const insets = useSafeAreaInsets();
  const { padH, contentMaxW, primaryButtonWidth } = useOnboardingCtaLayout();
  const [step, setStep] = useState<ReportStep>('intro');
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');

  useEffect(() => {
    if (!visible) return;
    setStep('intro');
    setReason(null);
    setDetails('');
  }, [visible]);

  if (!visible) return null;

  const detailsLen = details.length;
  const detailsValid =
    details.trim().length > 0 && detailsLen <= maxDetails;

  const closeFlow = () => {
    onClose();
  };

  const headerClose = (
    <Pressable
      accessibilityRole='button'
      accessibilityLabel='Close report'
      onPress={closeFlow}
      hitSlop={8}
      style={({ pressed }) => [
        appTopBarStyles.iconButton,
        pressed && styles.closePressed,
      ]}
    >
      <Ionicons name='close' size={26} color={ink} />
    </Pressable>
  );

  let title = '';
  let body: ReactNode = null;
  let ctaLabel = '';
  let ctaDisabled = false;
  let onCta = () => {};

  switch (step) {
    case 'intro':
      title = 'Protect Our Roommate Community';
      body = (
        <View style={styles.copyBlock}>
          <Text style={styles.paragraph}>
            At Ellieo, we&apos;re committed to maintaining a clean, respectful,
            and trustworthy roommate community.
          </Text>
          <Text style={styles.paragraph}>
            A high-trust environment is essential for everyone&apos;s comfort and
            safety. That&apos;s why our team actively monitors reports and takes
            every concern seriously.
          </Text>
          <Text style={styles.paragraph}>
            We promise to continue doing our best to ensure a safe and transparent
            space where all users feel secure and supported.
          </Text>
          <Text style={styles.paragraph}>
            Your vigilance helps protect this community. Thank you for helping make
            Ellieo a place where everyone can connect with confidence.
          </Text>
        </View>
      );
      ctaLabel = 'Proceed to Report';
      onCta = () => setStep('reason');
      break;

    case 'reason':
      title = 'Your Privacy Matters';
      body = (
        <View style={styles.copyBlock}>
          <Text style={styles.lead}>
            Your report will be kept private and confidential.
          </Text>
          <View style={styles.reasonList}>
            {REPORT_REASONS.map((label) => {
              const selected = reason === label;
              return (
                <Pressable
                  key={label}
                  accessibilityRole='button'
                  accessibilityState={{ selected }}
                  onPress={() => {
                    setReason(label);
                    setStep('details');
                  }}
                  style={({ pressed }) => [
                    styles.reasonPill,
                    selected && styles.reasonPillSelected,
                    pressed && styles.reasonPillPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.reasonPillText,
                      selected && styles.reasonPillTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      );
      ctaLabel = '';
      break;

    case 'details':
      title = 'Report Details';
      body = (
        <View style={styles.copyBlock}>
          <Text style={styles.lead}>
            Please describe why you believe this is inappropriate or concerning,
            and let us know how you&apos;d like us to handle it.
          </Text>
          <View style={styles.textAreaShell}>
            <TextInput
              value={details}
              onChangeText={(text) => setDetails(text.slice(0, maxDetails))}
              placeholder='Ex. This user has been consistently sending inappropriate and uncomfortable messages.'
              placeholderTextColor={labelSecondary}
              multiline
              scrollEnabled
              textAlignVertical='top'
              maxLength={maxDetails}
              style={styles.textArea}
            />
            <Text
              style={[
                styles.charCount,
                detailsLen > maxDetails && styles.charCountOver,
              ]}
            >
              {detailsLen}/{maxDetails} Characters
            </Text>
          </View>
        </View>
      );
      ctaLabel = 'Send Report';
      ctaDisabled = !detailsValid;
      onCta = () => setStep('thanks');
      break;

    case 'thanks':
      title = 'Thank you for helping us keep Ellieo safe and trustworthy.';
      body = (
        <View style={styles.copyBlock}>
          <Text style={styles.paragraph}>
            We truly appreciate your time and effort in submitting this report
            {reportedName ? ` about ${reportedName}` : ''}.
          </Text>
          <Text style={styles.paragraph}>
            Our team will carefully review your report and take appropriate action
            within 24–48 hours.
          </Text>
          <Text style={styles.paragraph}>
            Your feedback plays an important role in maintaining a respectful and
            reliable community for everyone.
          </Text>
        </View>
      );
      ctaLabel = 'Close';
      onCta = closeFlow;
      break;
  }

  return (
    <Modal
      visible
      animationType='slide'
      presentationStyle='fullScreen'
      onRequestClose={closeFlow}
    >
      <View style={styles.root}>
        <StatusBar style='dark' />

        <AppTopBar
          insetTop={insets.top}
          padH={padH}
          paddingBottom={space.md}
          actions={headerClose}
        />

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={insets.top}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingHorizontal: padH, maxWidth: contentMaxW + padH * 2 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
          >
            <Text style={styles.title} accessibilityRole='header'>
              {title}
            </Text>
            {body}
          </ScrollView>

          {ctaLabel ? (
            <OnboardingBottomCta
              label={ctaLabel}
              onPress={onCta}
              disabled={ctaDisabled}
              padH={padH}
              safeBottomInset={insets.bottom}
              buttonWidth={primaryButtonWidth}
            />
          ) : (
            <View style={{ height: insets.bottom + space.lg }} />
          )}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: pageBg,
  },
  flex: {
    flex: 1,
  },
  closePressed: {
    opacity: 0.7,
  },
  scrollContent: {
    alignSelf: 'center',
    width: '100%',
    paddingTop: space.sm,
    paddingBottom: space.xl,
  },
  title: {
    fontSize: type.display + 2,
    lineHeight: 34,
    fontWeight: '800',
    color: ink,
    letterSpacing: -0.6,
    marginBottom: space.lg,
  },
  copyBlock: {
    gap: space.md,
  },
  lead: {
    fontSize: type.body,
    lineHeight: 22,
    fontWeight: '500',
    color: ink,
    letterSpacing: -0.12,
    marginBottom: space.xs,
  },
  paragraph: {
    fontSize: type.body,
    lineHeight: 22,
    fontWeight: '500',
    color: ink,
    letterSpacing: -0.12,
  },
  reasonList: {
    gap: space.sm,
    marginTop: space.sm,
  },
  reasonPill: {
    minHeight: 48,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: fieldFill,
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonPillSelected: {
    backgroundColor: '#EEF3FF',
    borderColor: 'rgba(47,109,246,0.22)',
  },
  reasonPillPressed: {
    opacity: 0.88,
  },
  reasonPillText: {
    fontSize: type.body,
    fontWeight: '600',
    color: ink,
    textAlign: 'center',
    letterSpacing: -0.15,
  },
  reasonPillTextSelected: {
    fontWeight: '700',
    color: colors.primary,
  },
  textAreaShell: {
    height: REPORT_TEXT_BOX_H,
    borderRadius: radius.md,
    backgroundColor: fieldFill,
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.08)',
    padding: space.md,
  },
  textArea: {
    height: REPORT_INPUT_H,
    fontSize: type.body,
    lineHeight: 22,
    fontWeight: '500',
    color: ink,
    letterSpacing: -0.12,
    padding: 0,
  },
  charCount: {
    marginTop: space.sm,
    fontSize: type.micro,
    fontWeight: '600',
    color: muted,
    textAlign: 'right',
    letterSpacing: -0.02,
  },
  charCountOver: {
    color: colors.coralDeep,
  },
});
