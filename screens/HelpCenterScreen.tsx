import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, UIManager, View } from 'react-native';
import { radius, space, type } from '../design/theme';
import { SettingsScaffold, ink, labelSecondary } from './accountSettings/AccountSettingsShared';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'proxy-message',
    question:
      'Can I message someone on Ellieo to find a roommate on behalf of another person?',
    answer:
      'Ellieo is built for people searching for themselves. Messaging on behalf of someone else is not supported and may be restricted to keep matches authentic.',
  },
  {
    id: 'create-account',
    question: 'How do I create an account?',
    answer:
      'Download Ellieo, sign up with your school email or phone number, and complete the onboarding steps for your profile, photos, and roommate preferences.',
  },
  {
    id: 'no-school-email',
    question: 'Can I use Ellieo without a school email?',
    answer:
      'A verified school email unlocks the best experience and bonus credits. Other verification options are rolling out over time.',
  },
  {
    id: 'matching',
    question: 'How does Ellieo match me with roommates?',
    answer:
      'We use your lifestyle answers, location preferences, budget, and profile details to surface compatible roommate candidates. You can refine preferences anytime in settings.',
  },
  {
    id: 'edit-preferences',
    question: 'How can I edit my lifestyle or roommate preferences?',
    answer:
      'Open your profile menu, tap Lifestyle & preferences, and update your choices. Changes apply to future matches.',
  },
  {
    id: 'profile-visibility',
    question: 'Who can see my profile?',
    answer:
      'Other Ellieo users in your matching pool can see the details you choose to display. You control visibility fields under Account settings → Privacy.',
  },
  {
    id: 'agents',
    question: 'Can agents contact me directly?',
    answer:
      'You can allow or block messages from real estate agents in Account settings → Messages. Agents never see your contact info until you choose to share it.',
  },
  {
    id: 'credits',
    question: 'How do credits work?',
    answer:
      'Credits unlock premium actions like extra matches or boosts. Verify your school email to earn bonus credits, and view your balance under Plan & Billing.',
  },
  {
    id: 'nyc-only',
    question: 'Is Ellieo available only in New York City?',
    answer:
      'New York City is our primary launch market. We are expanding to more cities—check the app for the latest supported areas.',
  },
  {
    id: 'report-user',
    question: 'What happens if I report someone?',
    answer:
      'Our team reviews reports promptly. We may warn, restrict, or remove accounts that violate community guidelines. You will not be notified of every outcome for privacy reasons.',
  },
  {
    id: 'report-message',
    question:
      'Can I report a message or user for inappropriate behavior?',
    answer:
      'Yes. Use the report option on a profile or message thread. Include details when possible so we can take appropriate action quickly.',
  },
];

function FaqAccordionRow({
  item,
  expanded,
  onToggle,
  isLast,
}: {
  item: FaqItem;
  expanded: boolean;
  onToggle: () => void;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.faqCard, isLast && styles.faqCardLast]}>
      <Pressable
        accessibilityRole='button'
        accessibilityState={{ expanded }}
        accessibilityLabel={item.question}
        onPress={onToggle}
        style={({ pressed }) => [
          styles.faqHeader,
          pressed && styles.faqHeaderPressed,
        ]}
      >
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color='rgba(60,60,67,0.45)'
          style={styles.faqChevron}
        />
      </Pressable>
      {expanded ? (
        <View style={styles.faqAnswerWrap}>
          <Text style={styles.faqAnswer}>{item.answer}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function HelpCenterScreen({ onBack }: { onBack: () => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <SettingsScaffold
      heroHeader
      title='Help Center'
      subtitle='Get quick answers and guidance for your Ellieo experience.'
      onBack={onBack}
      contentStyle={styles.scrollContent}
    >
      <View style={styles.faqList}>
        {FAQ_ITEMS.map((item, index) => (
          <FaqAccordionRow
            key={item.id}
            item={item}
            expanded={expandedId === item.id}
            onToggle={() => toggle(item.id)}
            isLast={index === FAQ_ITEMS.length - 1}
          />
        ))}
      </View>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 0,
  },
  faqList: {
    gap: space.sm,
    marginTop: -space.xs,
  },
  faqCard: {
    borderRadius: radius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(60, 60, 67, 0.08)',
    overflow: 'hidden',
  },
  faqCardLast: {
    marginBottom: space.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    paddingVertical: space.md + 2,
    paddingHorizontal: space.lg,
  },
  faqHeaderPressed: {
    backgroundColor: 'rgba(47, 109, 246, 0.04)',
  },
  faqQuestion: {
    flex: 1,
    fontSize: type.body,
    lineHeight: 22,
    fontWeight: '600',
    color: ink,
    letterSpacing: -0.15,
  },
  faqChevron: {
    marginTop: 2,
  },
  faqAnswerWrap: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md + 2,
    paddingTop: 0,
  },
  faqAnswer: {
    fontSize: type.caption,
    lineHeight: 20,
    fontWeight: '400',
    color: labelSecondary,
    letterSpacing: -0.08,
  },
});
