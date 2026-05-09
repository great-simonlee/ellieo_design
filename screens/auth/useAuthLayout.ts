import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { space, type } from '../../design/theme';

/** Responsive metrics for auth — scales with window, clamps for SE → Pro Max (and iPad width cap). */
export function useAuthLayout() {
  const { width: screenW, height: screenH } = useWindowDimensions();
  return useMemo(() => {
    const scale = Math.min(Math.max(screenW / 390, 0.86), 1.12);
    const horizontalInset = Math.max(
      space.lg + space.sm,
      Math.round(screenW * 0.065),
    );
    const contentMaxWidth = Math.min(screenW - horizontalInset * 2, 380);
    const authBannerHeight = Math.round(
      Math.min(
        Math.max(screenH * 0.52, 300),
        Math.min(620, screenH * 0.62),
      ),
    );
    const toggleOverlap = Math.round(authBannerHeight * 0.372);
    const pillW = Math.round(Math.min(Math.max(screenW * 0.28, 92), 124));
    const pillGap = Math.max(2, Math.round(3 * scale));
    const trackPad = Math.max(2, Math.round(3 * scale));
    const trackWidth = trackPad * 2 + pillW * 2 + pillGap;
    const pillRadius = Math.max(9, Math.round(pillW * 0.118));
    const trackRadius = pillRadius + trackPad + 2;
    const glassRadius = trackRadius + Math.max(2, Math.round(3 * scale));
    const glassPad = Math.max(1, Math.round(2 * scale));
    const sheetCornerRadius = Math.min(56, Math.round(screenW * 0.143));
    const sheetPaddingTop = Math.max(
      space.md,
      Math.min(space.lg + space.sm, Math.round(screenH * 0.028)),
    );
    const sheetMarginTop = -Math.round(Math.min(14, 8 + 4 * scale));
    const toggleToSheetGap = Math.max(
      space.xl + space.md,
      Math.round(screenH * 0.024 + 14 * scale),
    );
    const loginBtnMinHeight = Math.max(44, Math.round(46 * scale));
    const brandHoriW = Math.round(
      Math.min(contentMaxWidth * 0.86, screenW * 0.44) * 0.64 * 1.2,
    );
    const brandHoriH = Math.round(brandHoriW * 0.26);
    const iconSize = Math.min(24, Math.max(20, Math.round(22 * scale)));
    const iconMailSize = Math.max(19, iconSize - 1);
    const loginIconSlotW = Math.max(28, Math.round(30 * scale));
    const loginBtnPadV = Math.max(13, Math.round(14 * scale));
    const modeSwitchMarginBottom = toggleToSheetGap;
    const gapLoginCol = Math.round(space.sm + 4);
    const loginActionsPadH = Math.round(space.md * Math.min(scale, 1.05));
    const loginActionsPadV = Math.max(
      space.md,
      Math.round(space.md + space.sm * Math.min(scale, 1.05)),
    );
    const modeLabelSize = Math.max(12, Math.round(13 * scale));
    const modePillPadV = Math.max(6, Math.round(7 * scale));
    const loginBtnFontSize = Math.max(
      type.body,
      Math.min(type.bodyLarge + 1, Math.round(type.body * scale * 1.02)),
    );
    const welcomeFontSize = Math.max(
      type.body,
      Math.min(
        type.bodyLarge + 2,
        Math.round(type.bodyLarge * Math.min(scale, 1.08)),
      ),
    );
    const welcomeLineHeight = Math.round(23 * Math.min(scale, 1.08));

    return {
      scale,
      horizontalInset,
      contentMaxWidth,
      authBannerHeight,
      toggleOverlap,
      pillW,
      pillGap,
      trackPad,
      trackWidth,
      pillRadius,
      trackRadius,
      glassRadius,
      glassPad,
      sheetCornerRadius,
      sheetPaddingTop,
      sheetMarginTop,
      loginBtnMinHeight,
      brandHoriW,
      brandHoriH,
      iconSize,
      iconMailSize,
      loginIconSlotW,
      loginBtnPadV,
      modeSwitchMarginBottom,
      gapLoginCol,
      loginActionsPadH,
      loginActionsPadV,
      modeLabelSize,
      modePillPadV,
      loginBtnFontSize,
      welcomeFontSize,
      welcomeLineHeight,
    };
  }, [screenW, screenH]);
}
