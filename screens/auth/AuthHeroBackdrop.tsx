import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground, StyleSheet, View } from 'react-native';

/** Shared blurred hero for email auth screens — mounted once inside `EmailAuthModal` so it stays fixed when switching flows. */
export function AuthHeroBackdrop() {
  return (
    <View style={styles.heroWrap} pointerEvents='none'>
      <ImageBackground
        source={require('../../assets/img/user_banner.png')}
        style={styles.heroBg}
        resizeMode='cover'
      >
        <BlurView intensity={55} tint='dark' style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={['rgba(15,23,42,0.25)', 'rgba(15,23,42,0.72)']}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
  },
});
