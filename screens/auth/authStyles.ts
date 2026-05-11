import { Platform, StyleSheet } from 'react-native';
import { colors, radius, space } from '../../design/theme';

const tempFabSize = 44;
const tempFabRadius = tempFabSize / 2;

export const authStyles = StyleSheet.create({
  authRoot: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  authBanner: {
    width: '100%',
  },
  modeSwitchWrap: {
    alignSelf: 'center',
    zIndex: 3,
  },
  modeSwitchGlass: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    backgroundColor: 'rgba(18, 20, 26, 0.42)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
  },
  modeSwitchTrack: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modePillIndicator: {
    position: 'absolute',
    backgroundColor: colors.primary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  modePill: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  modeLabel: {
    color: 'rgba(255, 255, 255, 0.52)',
    fontWeight: '500',
    letterSpacing: -0.12,
  },
  modeLabelOnIndicator: {
    color: '#ffffff',
    fontWeight: '600',
  },
  sheet: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    overflow: 'hidden',
  },
  /** Vertically centers logo → disclaimer as one tidy column in the white sheet. */
  sheetBodyCentered: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Shrink-wrapped column (max width set in AuthShell). */
  authSheetCluster: {
    width: '100%',
    alignSelf: 'center',
    flexShrink: 1,
  },
  /** Full width up to maxWidth; stretch children so the actions column matches headline width */
  authMain: {
    width: '100%',
    alignItems: 'stretch',
  },
  /** Primary stack (logo → CTAs) — never flex-grows so gaps stay predictable. */
  authMainCompact: {
    flex: 0,
    flexGrow: 0,
    flexShrink: 0,
  },
  brandBlock: {
    width: '100%',
    alignItems: 'center',
  },
  /** Headline block — height from content; gaps use layout tokens + optional spacer. */
  welcomeRail: {
    flexGrow: 0,
    flexShrink: 0,
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  welcomeBlock: {
    width: '100%',
    alignItems: 'center',
  },
  welcomeText: {
    fontWeight: '500',
    color: '#475569',
    textAlign: 'center',
    letterSpacing: -0.15,
    width: '100%',
  },
  welcomeLead: {
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.2,
  },
  /** Flat stack on the sheet — each button carries its own surface (no grey tray). */
  loginActionsWrap: {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  brandLogoHori: {
    flexShrink: 0,
  },
  loginCol: {
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
  },
  loginBtn: {
    borderRadius: radius.sm + 2,
    width: '100%',
    maxWidth: '100%',
  },
  loginBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: space.sm + 2,
  },
  loginBtnIconSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnLabel: {
    flex: 1,
    textAlign: 'center',
  },
  loginBtnPressed: {
    opacity: 0.9,
  },
  loginBtnGoogle: {
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.14)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  loginBtnApple: {
    backgroundColor: '#000000',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  loginBtnEmail: {
    backgroundColor: 'rgba(47, 109, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(47, 109, 246, 0.42)',
  },
  loginBtnText: {
    color: '#0f172a',
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  loginBtnTextLight: {
    color: '#ffffff',
  },
  loginBtnTextPrimary: {
    color: colors.primary,
    fontWeight: '600',
  },
  joinLine: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: space.md,
    marginBottom: space.xs,
  },
  /** Footer sits in `sheetFooterCluster`; vertical rhythm from cluster `gap`. */
  joinLineInCluster: {
    marginTop: 0,
    marginBottom: 0,
  },
  joinLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  disclaimerText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 11,
    lineHeight: 15,
    paddingHorizontal: 6,
    paddingBottom: space.xs,
  },
  disclaimerInCluster: {
    marginTop: 0,
    paddingTop: 0,
  },
  sheetFooterCluster: {
    width: '100%',
    alignItems: 'center',
    flexShrink: 0,
    gap: space.sm + space.xs,
  },
  /** Design-only: LoginScreen shortcut — matches `OnboardingBottomCta` shadow. */
  tempMainMapFabOuter: {
    position: 'absolute',
    zIndex: 20,
    width: tempFabSize,
    height: tempFabSize,
    borderRadius: tempFabRadius,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
      },
      android: { elevation: 6 },
    }),
  },
  /** 30% opacity on the filled control; shadow stays full strength on outer. */
  tempMainMapFabFace: {
    width: '100%',
    height: '100%',
    borderRadius: tempFabRadius,
    overflow: 'hidden',
    opacity: 0.3,
  },
  tempMainMapFabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: tempFabRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempMainMapFabPressed: {
    transform: [{ scale: 0.98 }],
  },
  tempMainMapFabLogo: {
    width: 26,
    height: 26,
  },
  /** Mock: toggle visibility of Sign in with Apple (shown on all platforms for design preview). */
  androidAppleToggleOuter: {
    position: 'absolute',
    zIndex: 20,
    width: tempFabSize,
    height: tempFabSize,
    borderRadius: tempFabRadius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.14)',
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  androidAppleToggleOuterActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(47, 109, 246, 0.08)',
  },
  androidAppleTogglePressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
});
