import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { space } from './theme';

export function onboardingPadH(screenW: number): number {
  return Math.max(space.lg, Math.round(screenW * 0.056));
}

export function onboardingContentMaxW(screenW: number, padH: number): number {
  return Math.min(400, screenW - padH * 2);
}

export function onboardingPrimaryButtonWidth(contentMaxW: number): number {
  return Math.min(232, Math.max(172, Math.round(contentMaxW * 0.88)));
}

/** Shared horizontal metrics + primary CTA width (I Agree / Continue / Save). */
export function useOnboardingCtaLayout() {
  const { width: screenW } = useWindowDimensions();
  return useMemo(() => {
    const padH = onboardingPadH(screenW);
    const contentMaxW = onboardingContentMaxW(screenW, padH);
    const primaryButtonWidth = onboardingPrimaryButtonWidth(contentMaxW);
    return { screenW, padH, contentMaxW, primaryButtonWidth };
  }, [screenW]);
}
