import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import {
  cloneElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

export type EmailAuthPanel = 'login' | 'signup' | 'forgot';

type EmailAuthModalProps = {
  visible: boolean;
  activePanel: EmailAuthPanel | null;
  onRequestClose: () => void;
  onAfterClose?: () => void;
  panelLogin: ReactElement;
  panelSignup: ReactElement;
  panelForgot: ReactElement;
};

const SHEET_ENTER_MS = 320;
const SHEET_EXIT_MS = 300;
const BACKDROP_FADE_IN_MS = 160;
const BACKDROP_FADE_OUT_MS = 160;

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
 * In-tree overlay: live auth screen underneath; backdrop appears instantly,
 * while only the email sheet slides in/out.
 */
export function EmailAuthModal({
  visible,
  activePanel,
  onRequestClose,
  onAfterClose,
  panelLogin,
  panelSignup,
  panelForgot,
}: EmailAuthModalProps) {
  const { height: windowH } = useWindowDimensions();
  const slideDistance = Math.max(windowH, 480);

  const injectVisible = (el: ReactElement, show: boolean) =>
    isValidElement(el) ? cloneElement(el, { visible: show } as object) : el;

  const lastPanelRef = useRef<EmailAuthPanel | null>(null);
  if (activePanel != null) {
    lastPanelRef.current = activePanel;
  }
  const resolvedPanel = activePanel ?? lastPanelRef.current;

  const panelEl =
    resolvedPanel != null
      ? pickPanelEl(resolvedPanel, panelLogin, panelSignup, panelForgot)
      : null;

  const [present, setPresent] = useState(false);
  const backdropOp = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(slideDistance)).current;
  const runAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const backdropAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const overlayWasOpenedRef = useRef(false);

  const stopRun = () => {
    runAnimRef.current?.stop?.();
    runAnimRef.current = null;
  };

  const stopBackdrop = () => {
    backdropAnimRef.current?.stop?.();
    backdropAnimRef.current = null;
  };

  /** Mount overlay before paint so the first frame can run enter animations. */
  useLayoutEffect(() => {
    if (visible && activePanel != null) {
      setPresent(true);
    }
  }, [visible, activePanel]);

  /** Open overlay once; panel switches keep the backdrop and sheet position stable. */
  useEffect(() => {
    if (!visible || activePanel == null) return;
    if (overlayWasOpenedRef.current) return;

    overlayWasOpenedRef.current = true;
    stopRun();
    stopBackdrop();
    backdropOp.setValue(0);
    sheetY.setValue(slideDistance);
    backdropAnimRef.current = Animated.timing(backdropOp, {
      toValue: 1,
      duration: BACKDROP_FADE_IN_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    backdropAnimRef.current.start();
    runAnimRef.current = Animated.timing(sheetY, {
      toValue: 0,
      duration: SHEET_ENTER_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    runAnimRef.current.start();
  }, [visible, activePanel, backdropOp, sheetY, slideDistance]);

  /** Close: sheet slides down and then unmounts. */
  useEffect(() => {
    if (visible || !present) return;

    overlayWasOpenedRef.current = false;
    stopRun();
    stopBackdrop();

    backdropAnimRef.current = Animated.timing(backdropOp, {
      toValue: 0,
      duration: BACKDROP_FADE_OUT_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    backdropAnimRef.current.start();
    runAnimRef.current = Animated.timing(sheetY, {
      toValue: slideDistance,
      duration: SHEET_EXIT_MS,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
    runAnimRef.current.start(({ finished }) => {
      if (finished) {
        setPresent(false);
        lastPanelRef.current = null;
        onAfterClose?.();
      }
    });
  }, [visible, present, backdropOp, sheetY, slideDistance, onAfterClose]);

  useEffect(() => {
    if (!visible || !present) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onRequestClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, present, onRequestClose]);

  if (!present) {
    return null;
  }

  return (
    <View style={styles.overlayRoot} pointerEvents='box-none'>
      <StatusBar style='light' />
      <Animated.View
        style={[styles.backdrop, { opacity: backdropOp }]}
        pointerEvents='auto'
      >
        <BlurView intensity={48} tint='dark' style={StyleSheet.absoluteFill} />
        <View style={styles.backdropDim} />
      </Animated.View>
      <View style={styles.layers} pointerEvents='box-none'>
        {present && panelEl && resolvedPanel ? (
          <Animated.View
            pointerEvents='box-none'
            style={[
              styles.sheetStage,
              { transform: [{ translateY: sheetY }] },
            ]}
          >
            {injectVisible(panelEl, present)}
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
    elevation: 2000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 10, 18, 0.42)',
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
