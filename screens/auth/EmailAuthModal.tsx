import { StatusBar } from 'expo-status-bar';
import {
  cloneElement,
  isValidElement,
  useLayoutEffect,
  useRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { AuthHeroBackdrop } from './AuthHeroBackdrop';

export type EmailAuthPanel = 'login' | 'signup' | 'forgot';

type EmailAuthModalProps = {
  visible: boolean;
  activePanel: EmailAuthPanel | null;
  onRequestClose: () => void;
  panelLogin: ReactElement;
  panelSignup: ReactElement;
  panelForgot: ReactElement;
};

/** First time the email overlay opens. Switches use the same motion but feel snappy. */
const SHEET_ENTER_MS = 320;

function pickPanelEl(
  panel: EmailAuthPanel,
  login: ReactElement,
  signup: ReactElement,
  forgot: ReactElement,
): ReactElement {
  switch (panel) {
    case 'login':
      return login;
    case 'signup':
      return signup;
    case 'forgot':
      return forgot;
  }
}

/**
 * Wraps one auth sheet: starts translated down by `slide`, then eases to 0.
 * Remount whenever `panelKey` changes so the previous sheet is gone immediately
 * (no outgoing animation) and only the new sheet enters from below.
 */
function AuthSheetEnter({ children }: { children: ReactNode }) {
  const { height: windowH } = useWindowDimensions();
  const slide = Math.max(windowH, 480);
  const translateY = useRef(new Animated.Value(slide)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useLayoutEffect(() => {
    translateY.setValue(slide);
    animRef.current?.stop?.();
    const anim = Animated.timing(translateY, {
      toValue: 0,
      duration: SHEET_ENTER_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animRef.current = anim;
    anim.start();
    return () => {
      anim.stop();
    };
  }, [slide, translateY]);

  return (
    <Animated.View
      pointerEvents='box-none'
      style={[
        styles.sheetStage,
        { transform: [{ translateY }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Single fullscreen Modal + fixed hero. Switching login ↔ signup ↔ forgot remounts
 * the sheet (`key={activePanel}`): old panel disappears instantly; only the new sheet slides up.
 */
export function EmailAuthModal({
  visible,
  activePanel,
  onRequestClose,
  panelLogin,
  panelSignup,
  panelForgot,
}: EmailAuthModalProps) {
  const injectVisible = (el: ReactElement, show: boolean) =>
    isValidElement(el) ? cloneElement(el, { visible: show } as any) : el;

  const panelEl =
    activePanel != null
      ? pickPanelEl(activePanel, panelLogin, panelSignup, panelForgot)
      : null;

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='fullScreen'
      onRequestClose={onRequestClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <StatusBar style='light' />
        <AuthHeroBackdrop />
        <View style={styles.layers} pointerEvents='box-none'>
          {visible && panelEl && activePanel ? (
            <AuthSheetEnter key={activePanel}>
              {injectVisible(panelEl, visible)}
            </AuthSheetEnter>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  layers: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  sheetStage: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
});
