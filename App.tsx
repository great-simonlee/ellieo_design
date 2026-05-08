import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { useFonts } from 'expo-font';
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { colors } from './design/theme';

/** Horizontal mark — explicit px so layout doesn’t collapse */
function useLogoSize() {
  const { width: screenW } = useWindowDimensions();
  const logoW = Math.round(Math.min(Math.round(screenW * 0.72), 300) * 0.8);
  const logoH = Math.round(logoW / 2.75);
  return { logoW, logoH };
}

type WelcomeScreenProps = {
  onContinue: () => void;
};

function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { logoW, logoH } = useLogoSize();

  return (
    <Pressable style={styles.root} onPress={onContinue}>
      <ImageBackground
        accessibilityLabel='Welcome background'
        source={require('./assets/img/banner1.png')}
        style={StyleSheet.absoluteFill}
        resizeMode='cover'
      />
      <LinearGradient
        pointerEvents='none'
        colors={['rgba(0,0,0,0.06)', 'rgba(0,0,0,0.20)', 'rgba(0,0,0,0.85)']}
        locations={[0, 0.6, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 },
        ]}
      >
        <View style={styles.topBlock}>
          <View style={styles.heroCluster}>
            <View
              style={[styles.logoShadowWrap, { width: logoW, height: logoH }]}
            >
              <Image
                accessibilityRole='image'
                accessibilityLabel='Ellieo'
                resizeMode='contain'
                source={require('./assets/img/ellieo_logo.png')}
                style={{ width: logoW, height: logoH }}
              />
            </View>
            <View style={styles.taglineBlock}>
              <Text style={styles.taglinePrimary}>Half the Rent</Text>
              <Text style={styles.taglineSecondary}>Twice the Story</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomBlock}>
          <Text style={styles.legal}>
            By continuing, you agree to our{' '}
            <Text style={styles.link}>Terms of Service</Text>. Learn how we
            process your data in our{' '}
            <Text style={styles.link}>Privacy Policy</Text>.
          </Text>
        </View>
      </View>
      <StatusBar style='light' />
    </Pressable>
  );
}

type LoginMode = 'personal' | 'agent';
const TOGGLE_PILL_WIDTH = 110;
const TOGGLE_PILL_GAP = 6;

function AuthLandingScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const [mode, setMode] = useState<LoginMode>('personal');
  const isPersonal = mode === 'personal';
  const loginButtonWidth = Math.min(screenW - 52, 330);
  const toggleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(toggleAnim, {
      toValue: isPersonal ? 0 : 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isPersonal, toggleAnim]);

  const indicatorTranslateX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TOGGLE_PILL_WIDTH + TOGGLE_PILL_GAP],
  });

  return (
    <View style={styles.authRoot}>
      <StatusBar style='dark' />
      <ImageBackground
        source={
          isPersonal
            ? require('./assets/img/user_banner.png')
            : require('./assets/img/agent_banner.png')
        }
        style={styles.authBanner}
        resizeMode='cover'
      >
        <View style={{ height: insets.top + 8 }} />
      </ImageBackground>

      <View style={styles.modeSwitchRow}>
        <Animated.View
          pointerEvents='none'
          style={[
            styles.modePillIndicator,
            { transform: [{ translateX: indicatorTranslateX }] },
          ]}
        />
        <Pressable
          onPress={() => setMode('personal')}
          style={styles.modePill}
        >
          <Text
            style={[styles.modeLabel, isPersonal && styles.modeLabelActive]}
          >
            Personal
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMode('agent')}
          style={styles.modePill}
        >
          <Text
            style={[styles.modeLabel, !isPersonal && styles.modeLabelActive]}
          >
            Agent
          </Text>
        </Pressable>
      </View>

      <View style={styles.sheet}>
        <Image
          source={require('./assets/img/ellieo_logo.png')}
          resizeMode='contain'
          style={styles.sheetLogo}
        />
        <Text style={styles.welcomeText}>Welcome back!</Text>

        <Pressable style={[styles.loginBtn, { width: loginButtonWidth }]}>
          <View style={styles.loginBtnIconSlot}>
            <Ionicons name='logo-google' size={22} color='#4285F4' />
          </View>
          <Text style={styles.loginBtnText}>Log in with Google</Text>
        </Pressable>

        <Pressable style={[styles.loginBtn, { width: loginButtonWidth }]}>
          <View style={styles.loginBtnIconSlot}>
            <Ionicons name='logo-apple' size={24} color='#111827' />
          </View>
          <Text style={styles.loginBtnText}>Log in with Apple</Text>
        </Pressable>

        <Pressable style={[styles.loginBtn, { width: loginButtonWidth }]}>
          <View style={styles.loginBtnIconSlot}>
            <Ionicons name='mail-outline' size={21} color='#111827' />
          </View>
          <Text style={styles.loginBtnText}>Log in with Email</Text>
        </Pressable>

        <Text style={styles.joinLine}>
          Not a member yet?{' '}
          <Text style={styles.joinLink}>Join Ellieo now.</Text>
        </Text>

        <Text style={styles.disclaimer}>
          Ellieo may share your email address with third party vendors in order
          to communicate with you about cash back offers and app changes. By
          creating an account, you accept our Terms of Use and Privacy Policy.
        </Text>
      </View>
    </View>
  );
}

export default function App() {
  const [showBlankPage, setShowBlankPage] = useState(false);
  const defaultsPatchedRef = useRef(false);
  const [fontsLoaded] = useFonts({
    Pretendard: require('./assets/fonts/pretendard/Pretendard-Regular.ttf'),
  });

  useEffect(() => {
    if (defaultsPatchedRef.current) return;
    defaultsPatchedRef.current = true;

    const TextComponent = Text as any;
    const TextInputComponent = TextInput as any;

    if (!TextComponent.defaultProps) {
      TextComponent.defaultProps = {};
    }
    TextComponent.defaultProps.style = [
      { fontFamily: 'Pretendard' },
      TextComponent.defaultProps.style,
    ];

    if (!TextInputComponent.defaultProps) {
      TextInputComponent.defaultProps = {};
    }
    TextInputComponent.defaultProps.style = [
      { fontFamily: 'Pretendard' },
      TextInputComponent.defaultProps.style,
    ];
  }, []);

  if (!fontsLoaded) {
    return <View style={styles.blankPage} />;
  }

  return (
    <SafeAreaProvider>
      {showBlankPage ? (
        <AuthLandingScreen />
      ) : (
        <WelcomeScreen onContinue={() => setShowBlankPage(true)} />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  blankPage: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  authRoot: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  authBanner: {
    width: '100%',
    height: 360,
  },
  modeSwitchRow: {
    alignSelf: 'center',
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: TOGGLE_PILL_GAP,
    marginTop: -125,
    marginBottom: 26,
    backgroundColor: 'rgba(15,23,42,0.3)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    padding: 4,
    zIndex: 3,
  },
  modePillIndicator: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    width: TOGGLE_PILL_WIDTH,
    borderRadius: 16,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  modePill: {
    width: TOGGLE_PILL_WIDTH,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 17,
    fontWeight: '500',
  },
  modeLabelActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  sheet: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 56,
    borderTopRightRadius: 56,
    marginTop: -10,
    paddingTop: 30,
    paddingHorizontal: 26,
    alignItems: 'center',
    overflow: 'hidden',
  },
  sheetLogo: {
    width: 150,
    height: 54,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '400',
    color: '#111827',
    marginBottom: 24,
  },
  loginBtn: {
    height: 62,
    borderRadius: 31,
    borderWidth: 1.8,
    borderColor: '#1f2937',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 14,
    backgroundColor: '#ffffff',
  },
  loginBtnIconSlot: {
    width: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '400',
  },
  joinLine: {
    marginTop: 10,
    fontSize: 14,
    color: '#6b7280',
  },
  joinLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  disclaimer: {
    marginTop: 18,
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 11,
    lineHeight: 16,
    paddingHorizontal: 6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  topBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -24,
  },
  heroCluster: {
    alignItems: 'center',
    gap: 10,
  },
  taglineBlock: {
    alignItems: 'center',
    gap: 3,
  },
  logoShadowWrap: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.68,
    shadowRadius: 12,
    elevation: 15,
  },
  taglinePrimary: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.78)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  taglineSecondary: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '500',
    letterSpacing: -0.2,
    textAlign: 'center',
    opacity: 0.95,
    textShadowColor: 'rgba(0,0,0,0.72)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  bottomBlock: {
    paddingBottom: 4,
    marginBottom: 20,
  },
  legal: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.92)',
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
