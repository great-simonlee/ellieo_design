import type { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { space } from '../design/theme';

/** Shared top bar metrics — keep Match + Profile headers pixel-aligned. */
export const APP_TOP_BAR_ROW_H = 44;
export const APP_TOP_BAR_LOGO_W = 124;
export const APP_TOP_BAR_LOGO_H = 42;
/** Padding below the status bar (inside safe area). */
export const APP_TOP_BAR_PT = space.sm;
/** Default padding under the logo / action row. */
export const APP_TOP_BAR_PB = space.md;

export function appTopBarBlockHeight(
  insetTop: number,
  paddingBottom = APP_TOP_BAR_PB,
): number {
  return insetTop + APP_TOP_BAR_PT + APP_TOP_BAR_ROW_H + paddingBottom;
}

type AppTopBarProps = {
  insetTop: number;
  padH: number;
  paddingBottom?: number;
  actions: ReactNode;
};

export function AppTopBar({
  insetTop,
  padH,
  paddingBottom = APP_TOP_BAR_PB,
  actions,
}: AppTopBarProps) {
  return (
    <View
      style={[
        appTopBarStyles.bar,
        {
          paddingTop: insetTop + APP_TOP_BAR_PT,
          paddingHorizontal: padH,
          paddingBottom,
        },
      ]}
    >
      <Image
        source={require('../assets/img/ellieo_logo_hori.png')}
        resizeMode='contain'
        accessibilityLabel='Ellieo'
        style={appTopBarStyles.logo}
      />
      <View style={appTopBarStyles.actions}>{actions}</View>
    </View>
  );
}

export const appTopBarStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: APP_TOP_BAR_ROW_H,
  },
  logo: {
    width: APP_TOP_BAR_LOGO_W,
    height: APP_TOP_BAR_LOGO_H,
    flexShrink: 0,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flexShrink: 0,
  },
  iconButton: {
    width: APP_TOP_BAR_ROW_H,
    height: APP_TOP_BAR_ROW_H,
    borderRadius: APP_TOP_BAR_ROW_H / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
