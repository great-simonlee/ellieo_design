import { MatchPreferredRoommateScreen } from './MatchPreferredRoommateScreen';

type MatchSetupFlowProps = {
  onComplete: () => void;
  onCancel: () => void;
};

/**
 * First-time Match tab — roommate search preferences only (personal info from app onboarding).
 */
export function MatchSetupFlow({ onComplete, onCancel }: MatchSetupFlowProps) {
  return (
    <MatchPreferredRoommateScreen onBack={onCancel} onContinue={onComplete} />
  );
}
