import { StepProgressBlock, type StepProgressBlockProps } from './StepProgressBlock';

export type OnboardingProgressBlockProps = StepProgressBlockProps;

/** Personal / agent onboarding progress chrome (shelled track). */
export function OnboardingProgressBlock(props: OnboardingProgressBlockProps) {
  return <StepProgressBlock {...props} />;
}
