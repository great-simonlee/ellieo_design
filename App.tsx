import { useFonts } from 'expo-font';
import { useEffect, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoadingScreen } from './screens/LoadingScreen';
import { PersonalOnboardingScreen } from './screens/PersonalOnboardingScreen';
import { PersonalOnboardingScreenFive } from './screens/PersonalOnboardingScreenFive';
import { PersonalOnboardingScreenFour } from './screens/PersonalOnboardingScreenFour';
import { PersonalOnboardingScreenSix } from './screens/PersonalOnboardingScreenSix';
import { PersonalOnboardingScreenThree } from './screens/PersonalOnboardingScreenThree';
import { PersonalOnboardingScreenTwo } from './screens/PersonalOnboardingScreenTwo';
import { LoginScreen } from './screens/LoginScreen';
import { SignupScreen } from './screens/SignupScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';

type AuthRoute = 'login' | 'signup';

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [authRoute, setAuthRoute] = useState<AuthRoute>('login');
  const [showPersonalOnboarding, setShowPersonalOnboarding] = useState(false);
  const [showPersonalOnboardingTwo, setShowPersonalOnboardingTwo] =
    useState(false);
  const [showPersonalOnboardingThree, setShowPersonalOnboardingThree] =
    useState(false);
  const [showPersonalOnboardingFour, setShowPersonalOnboardingFour] =
    useState(false);
  const [showPersonalOnboardingFive, setShowPersonalOnboardingFive] =
    useState(false);
  const [showPersonalOnboardingSix, setShowPersonalOnboardingSix] =
    useState(false);
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

  useEffect(() => {
    if (!showAuth) {
      setAuthRoute('login');
      setShowPersonalOnboarding(false);
      setShowPersonalOnboardingTwo(false);
      setShowPersonalOnboardingThree(false);
      setShowPersonalOnboardingFour(false);
      setShowPersonalOnboardingFive(false);
      setShowPersonalOnboardingSix(false);
    }
  }, [showAuth]);

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      {showPersonalOnboardingSix ? (
        <PersonalOnboardingScreenSix
          onBack={() => {
            setShowPersonalOnboardingSix(false);
            setShowPersonalOnboardingFive(true);
          }}
          onSkip={() => {
            setShowPersonalOnboardingSix(false);
            setShowPersonalOnboardingFive(false);
            setShowPersonalOnboardingFour(false);
            setShowPersonalOnboardingThree(false);
            setShowPersonalOnboardingTwo(false);
            setShowPersonalOnboarding(false);
          }}
          onComplete={() => {
            setShowPersonalOnboardingSix(false);
            setShowPersonalOnboardingFive(false);
            setShowPersonalOnboardingFour(false);
            setShowPersonalOnboardingThree(false);
            setShowPersonalOnboardingTwo(false);
            setShowPersonalOnboarding(false);
          }}
        />
      ) : showPersonalOnboardingFive ? (
        <PersonalOnboardingScreenFive
          onBack={() => {
            setShowPersonalOnboardingFive(false);
            setShowPersonalOnboardingFour(true);
          }}
          onSkip={() => {
            setShowPersonalOnboardingFive(false);
            setShowPersonalOnboardingSix(false);
            setShowPersonalOnboardingFour(false);
            setShowPersonalOnboardingThree(false);
            setShowPersonalOnboardingTwo(false);
            setShowPersonalOnboarding(false);
          }}
          onComplete={() => {
            setShowPersonalOnboardingFive(false);
            setShowPersonalOnboardingSix(true);
          }}
        />
      ) : showPersonalOnboardingFour ? (
        <PersonalOnboardingScreenFour
          onBack={() => {
            setShowPersonalOnboardingFour(false);
            setShowPersonalOnboardingThree(true);
          }}
          onSkip={() => {
            setShowPersonalOnboardingFour(false);
            setShowPersonalOnboardingFive(false);
            setShowPersonalOnboardingSix(false);
            setShowPersonalOnboardingThree(false);
            setShowPersonalOnboardingTwo(false);
            setShowPersonalOnboarding(false);
          }}
          onContinue={() => {
            setShowPersonalOnboardingFour(false);
            setShowPersonalOnboardingFive(true);
          }}
        />
      ) : showPersonalOnboardingThree ? (
        <PersonalOnboardingScreenThree
          onBack={() => {
            setShowPersonalOnboardingThree(false);
            setShowPersonalOnboardingTwo(true);
          }}
          onComplete={() => {
            setShowPersonalOnboardingThree(false);
            setShowPersonalOnboardingFour(true);
          }}
        />
      ) : showPersonalOnboardingTwo ? (
        <PersonalOnboardingScreenTwo
          onExit={() => {
            setShowPersonalOnboardingTwo(false);
            setShowPersonalOnboarding(true);
          }}
          onContinue={() => {
            setShowPersonalOnboardingTwo(false);
            setShowPersonalOnboardingThree(true);
          }}
        />
      ) : showPersonalOnboarding ? (
        <PersonalOnboardingScreen
          onClose={() => {
            setShowPersonalOnboarding(false);
            setShowPersonalOnboardingTwo(false);
            setShowPersonalOnboardingThree(false);
            setShowPersonalOnboardingFour(false);
            setShowPersonalOnboardingFive(false);
            setShowPersonalOnboardingSix(false);
          }}
          onAgree={() => {
            setShowPersonalOnboardingTwo(true);
            setShowPersonalOnboardingThree(false);
            setShowPersonalOnboardingFour(false);
            setShowPersonalOnboardingFive(false);
            setShowPersonalOnboardingSix(false);
          }}
        />
      ) : !showAuth ? (
        <WelcomeScreen onContinue={() => setShowAuth(true)} />
      ) : authRoute === 'login' ? (
        <LoginScreen
          onGoSignup={() => setAuthRoute('signup')}
          onGooglePress={() => {
            setShowPersonalOnboarding(true);
            setShowPersonalOnboardingTwo(false);
            setShowPersonalOnboardingThree(false);
            setShowPersonalOnboardingFour(false);
            setShowPersonalOnboardingFive(false);
            setShowPersonalOnboardingSix(false);
          }}
        />
      ) : (
        <SignupScreen onGoLogin={() => setAuthRoute('login')} />
      )}
    </SafeAreaProvider>
  );
}
