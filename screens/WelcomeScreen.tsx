import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../design/theme';

function useLogoSize() {
  const { width: screenW } = useWindowDimensions();
  const logoW = Math.round(Math.min(Math.round(screenW * 0.72), 300) * 0.8);
  const logoH = Math.round(logoW / 2.75);
  return { logoW, logoH };
}

type WelcomeScreenProps = {
  onContinue: () => void;
};

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { logoW, logoH } = useLogoSize();

  return (
    <Pressable style={styles.root} onPress={onContinue}>
      <ImageBackground
        accessibilityLabel='Welcome background'
        source={require('../assets/img/banner1.png')}
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
                source={require('../assets/img/ellieo_logo.png')}
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a0a',
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
