import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { radius, space, type } from '../design/theme';

const ink = '#1C1C1E';
const muted = '#687084';
const white = '#FFFFFF';
const logoutRed = '#FF3B30';

const shallowShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  android: { elevation: 6 },
});

type LogoutConfirmModalProps = {
  visible: boolean;
  bottomInset: number;
  onCancel: () => void;
  onConfirm: () => void;
};

/** Bottom sheet — confirm log out (motion matches `MatchCelebrationModal`). */
export function LogoutConfirmModal({
  visible,
  bottomInset,
  onCancel,
  onConfirm,
}: LogoutConfirmModalProps) {
  const { height: windowH } = useWindowDimensions();

  const sheetTravel = useMemo(
    () => Math.min(340, Math.round(windowH * 0.38)),
    [windowH],
  );
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(sheetTravel)).current;

  const dismissAnimated = useCallback(
    (after?: () => void) => {
      backdropOpacity.stopAnimation();
      sheetTranslateY.stopAnimation();
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: sheetTravel,
          duration: 260,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished && after) after();
      });
    },
    [backdropOpacity, sheetTranslateY, sheetTravel],
  );

  const runCancel = useCallback(() => {
    if (!visible) return;
    dismissAnimated(onCancel);
  }, [dismissAnimated, onCancel, visible]);

  const runConfirm = useCallback(() => {
    if (!visible) return;
    dismissAnimated(onConfirm);
  }, [dismissAnimated, onConfirm, visible]);

  useEffect(() => {
    if (!visible) return;
    backdropOpacity.stopAnimation();
    sheetTranslateY.stopAnimation();
    sheetTranslateY.setValue(sheetTravel);
    backdropOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        stiffness: 300,
        damping: 34,
        mass: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, backdropOpacity, sheetTranslateY, sheetTravel]);

  if (!visible) return null;

  return (
    <Modal animationType='none' transparent visible onRequestClose={runCancel}>
      <View style={styles.root}>
        <Animated.View
          pointerEvents='box-none'
          style={[StyleSheet.absoluteFillObject, { opacity: backdropOpacity }]}
        >
          <Pressable
            accessibilityRole='button'
            accessibilityLabel='Dismiss log out'
            style={StyleSheet.absoluteFill}
            onPress={runCancel}
          >
            <BlurView intensity={48} tint='dark' style={StyleSheet.absoluteFill} />
            <View style={styles.dim} />
          </Pressable>
        </Animated.View>

        <View style={styles.sheetStage} pointerEvents='box-none'>
          <Animated.View
            accessibilityViewIsModal
            style={[
              styles.sheet,
              {
                paddingBottom: Math.max(bottomInset, space.md) + space.sm,
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            <LinearGradient
              colors={['#FFECEC', '#FFF8F8', '#FFFFFF']}
              locations={[0, 0.42, 1]}
              style={styles.sheetGlow}
              pointerEvents='none'
            />

            <View style={styles.body}>
              <View style={styles.iconCircle}>
                <Ionicons name='log-out-outline' size={24} color={logoutRed} />
              </View>

              <Text style={styles.title} accessibilityRole='header'>
                Log out?
              </Text>
              <Text style={styles.hint} numberOfLines={2}>
                You can sign back in anytime.
              </Text>

              <Pressable
                accessibilityRole='button'
                accessibilityLabel='Log out'
                onPress={runConfirm}
                style={({ pressed }) => [
                  styles.confirmBtn,
                  pressed && styles.confirmBtnPressed,
                ]}
              >
                <Text style={styles.confirmBtnText}>Log out</Text>
              </Pressable>

              <Pressable
                accessibilityRole='button'
                accessibilityLabel='Cancel'
                onPress={runCancel}
                style={({ pressed }) => [
                  styles.cancelBtn,
                  pressed && styles.cancelBtnPressed,
                ]}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
  },
  sheetStage: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: white,
    borderTopLeftRadius: radius.xl + 4,
    borderTopRightRadius: radius.xl + 4,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.8)',
    ...Platform.select({
      ios: {
        shadowColor: '#1E3A5F',
        shadowOffset: { width: 0, height: -12 },
        shadowOpacity: 0.2,
        shadowRadius: 36,
      },
      android: { elevation: 32 },
    }),
  },
  sheetGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 140,
  },
  body: {
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
    alignItems: 'center',
    gap: space.sm,
    zIndex: 1,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: white,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.18)',
    marginBottom: space.xs,
    ...shallowShadow,
  },
  title: {
    fontSize: type.display + 2,
    lineHeight: 34,
    fontWeight: '800',
    color: ink,
    textAlign: 'center',
    letterSpacing: -0.6,
  },
  hint: {
    fontSize: type.body,
    lineHeight: 22,
    fontWeight: '500',
    color: muted,
    textAlign: 'center',
    letterSpacing: -0.12,
    maxWidth: 300,
    marginBottom: space.md,
  },
  confirmBtn: {
    width: '100%',
    minHeight: 56,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.md + 2,
    paddingHorizontal: space.lg,
    backgroundColor: logoutRed,
    marginTop: space.xs,
    ...shallowShadow,
  },
  confirmBtnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  confirmBtnText: {
    fontSize: type.bodyLarge,
    fontWeight: '800',
    color: white,
    letterSpacing: -0.25,
  },
  cancelBtn: {
    width: '100%',
    minHeight: 48,
    marginTop: space.xs,
    paddingVertical: space.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: '#F4F7FD',
    borderWidth: 1,
    borderColor: 'rgba(47,109,246,0.12)',
  },
  cancelBtnPressed: {
    opacity: 0.85,
    backgroundColor: '#EAF0FC',
  },
  cancelBtnText: {
    fontSize: type.body,
    fontWeight: '700',
    color: muted,
    letterSpacing: -0.15,
  },
});
