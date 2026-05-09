import { StyleSheet } from 'react-native';
import { colors, radius, space } from '../../design/theme';

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
  sheetBody: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  /** Full width up to maxWidth; stretch children so the actions column matches headline width */
  authMain: {
    width: '100%',
    alignItems: 'stretch',
  },
  brandBlock: {
    width: '100%',
    alignItems: 'center',
  },
  /** Fills space between logo and buttons; headline is vertically centered in this band */
  welcomeRail: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    justifyContent: 'center',
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
  loginActionsWrap: {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: '#f4f6f9',
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.45)',
    overflow: 'hidden',
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
    marginTop: space.sm,
    marginBottom: space.xs,
  },
  joinLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  disclaimer: {
    marginTop: 'auto',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 11,
    lineHeight: 15,
    paddingHorizontal: 6,
    paddingBottom: space.xs,
  },
});
