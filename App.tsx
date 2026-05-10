import { useFonts } from 'expo-font';
import { useEffect, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AgentOnboardingScreen } from './screens/AgentOnboardingScreen';
import { AgentOnboardingScreenFive } from './screens/AgentOnboardingScreenFive';
import { AgentOnboardingScreenFour } from './screens/AgentOnboardingScreenFour';
import { AgentOnboardingScreenThree } from './screens/AgentOnboardingScreenThree';
import { AgentOnboardingScreenTwo } from './screens/AgentOnboardingScreenTwo';
import { LoadingScreen } from './screens/LoadingScreen';
import { PersonalOnboardingScreen } from './screens/PersonalOnboardingScreen';
import { PersonalOnboardingScreenFive } from './screens/PersonalOnboardingScreenFive';
import { PersonalOnboardingScreenFour } from './screens/PersonalOnboardingScreenFour';
import { MockRealEstateMapScreen } from './screens/MockRealEstateMapScreen';
import { PersonalOnboardingScreenEight } from './screens/PersonalOnboardingScreenEight';
import { PersonalOnboardingScreenSeven } from './screens/PersonalOnboardingScreenSeven';
import { PersonalOnboardingScreenSix } from './screens/PersonalOnboardingScreenSix';
import { PersonalOnboardingScreenThree } from './screens/PersonalOnboardingScreenThree';
import { PersonalOnboardingScreenTwo } from './screens/PersonalOnboardingScreenTwo';
import { LoginScreen } from './screens/LoginScreen';
import { SignupScreen } from './screens/SignupScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import {
  EmailAuthModal,
  type EmailAuthPanel,
} from './screens/auth/EmailAuthModal';
import { EmailLoginFlow } from './screens/auth/EmailLoginFlow';
import { EmailSignupFlow } from './screens/auth/EmailSignupFlow';
import { ForgotPasswordFlow } from './screens/auth/ForgotPasswordFlow';

type AuthRoute = 'login' | 'signup';

type AgentProfilePhase = 'intro' | 'bio' | 'licenseName' | 'congrat';

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
  const [showPersonalOnboardingSeven, setShowPersonalOnboardingSeven] =
    useState(false);
  const [showPersonalOnboardingEight, setShowPersonalOnboardingEight] =
    useState(false);
  const [showExploreHome, setShowExploreHome] = useState(false);
  const [showAgentOnboarding, setShowAgentOnboarding] = useState(false);
  const [showAgentProfileOnboarding, setShowAgentProfileOnboarding] =
    useState(false);
  const [agentProfilePhase, setAgentProfilePhase] =
    useState<AgentProfilePhase>('intro');
  const [emailAuthPanel, setEmailAuthPanel] = useState<EmailAuthPanel | null>(
    null,
  );
  const [forgotPrefillEmail, setForgotPrefillEmail] = useState('');
  const [blockEmailAuthClose, setBlockEmailAuthClose] = useState(false);
  const defaultsPatchedRef = useRef(false);

  const emailAuthOverlayOpen = showAuth && emailAuthPanel !== null;
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
      setShowPersonalOnboardingSeven(false);
      setShowPersonalOnboardingEight(false);
      // Do not call setShowExploreHome(false) here: email login/sign-up sets
      // showAuth false and showExploreHome true in the same transition; this
      // effect would immediately clear the map navigation.
      setShowAgentOnboarding(false);
      setShowAgentProfileOnboarding(false);
      setAgentProfilePhase('intro');
      setEmailAuthPanel(null);
      setForgotPrefillEmail('');
      setBlockEmailAuthClose(false);
    }
  }, [showAuth]);

  useEffect(() => {
    if (!emailAuthOverlayOpen) setBlockEmailAuthClose(false);
  }, [emailAuthOverlayOpen]);

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <EmailAuthModal
        visible={emailAuthOverlayOpen}
        activePanel={emailAuthPanel}
        onRequestClose={() => {
          if (blockEmailAuthClose) return;
          setEmailAuthPanel(null);
          setForgotPrefillEmail('');
        }}
        panelSignup={
          <EmailSignupFlow
            visible={false}
            onHardwareCloseBlockedChange={setBlockEmailAuthClose}
            onClose={() => setEmailAuthPanel(null)}
            onSwitchToLogin={() => {
              setAuthRoute('login');
              setEmailAuthPanel('login');
            }}
            onFinished={() => {
              setEmailAuthPanel(null);
              setShowAuth(false);
              setShowAgentOnboarding(false);
              setShowAgentProfileOnboarding(false);
              setShowPersonalOnboarding(false);
              setShowPersonalOnboardingTwo(false);
              setShowPersonalOnboardingThree(false);
              setShowPersonalOnboardingFour(false);
              setShowPersonalOnboardingFive(false);
              setShowPersonalOnboardingSix(false);
              setShowPersonalOnboardingSeven(false);
              setShowPersonalOnboardingEight(false);
              setShowExploreHome(true);
            }}
          />
        }
        panelLogin={
          <EmailLoginFlow
            visible={false}
            onClose={() => setEmailAuthPanel(null)}
            onSwitchToSignup={() => {
              setAuthRoute('signup');
              setEmailAuthPanel('signup');
            }}
            onLoggedIn={() => {
              setEmailAuthPanel(null);
              setShowAuth(false);
              setShowAgentOnboarding(false);
              setShowAgentProfileOnboarding(false);
              setShowPersonalOnboarding(false);
              setShowPersonalOnboardingTwo(false);
              setShowPersonalOnboardingThree(false);
              setShowPersonalOnboardingFour(false);
              setShowPersonalOnboardingFive(false);
              setShowPersonalOnboardingSix(false);
              setShowPersonalOnboardingSeven(false);
              setShowPersonalOnboardingEight(false);
              setShowExploreHome(true);
            }}
            onForgotPasswordPress={(emailFromLogin) => {
              setForgotPrefillEmail(emailFromLogin);
              setEmailAuthPanel('forgot');
            }}
          />
        }
        panelForgot={
          <ForgotPasswordFlow
            visible={false}
            initialEmail={forgotPrefillEmail}
            onClose={() => {
              setEmailAuthPanel('login');
            }}
            onFinished={() => {
              setEmailAuthPanel('login');
            }}
          />
        }
      />
      {showExploreHome ? (
        <MockRealEstateMapScreen
          onExit={() => {
            setShowExploreHome(false);
            setShowAuth(false);
          }}
        />
      ) : showAgentProfileOnboarding ? (
        agentProfilePhase === 'intro' ? (
          <AgentOnboardingScreenTwo
            onBackToRules={() => {
              setShowAgentProfileOnboarding(false);
              setShowAgentOnboarding(true);
              setAgentProfilePhase('intro');
            }}
            onIntroContinue={() => setAgentProfilePhase('bio')}
          />
        ) : agentProfilePhase === 'bio' ? (
          <AgentOnboardingScreenThree
            onBack={() => setAgentProfilePhase('intro')}
            onContinue={() => setAgentProfilePhase('licenseName')}
          />
        ) : agentProfilePhase === 'licenseName' ? (
          <AgentOnboardingScreenFour
            onBackToBio={() => setAgentProfilePhase('bio')}
            onComplete={() => setAgentProfilePhase('congrat')}
          />
        ) : agentProfilePhase === 'congrat' ? (
          <AgentOnboardingScreenFive
            onStartExploring={() => {
              setShowExploreHome(true);
              setShowAgentProfileOnboarding(false);
              setShowAgentOnboarding(false);
              setAgentProfilePhase('intro');
            }}
          />
        ) : null
      ) : showAgentOnboarding ? (
        <AgentOnboardingScreen
          onClose={() => setShowAgentOnboarding(false)}
          onAgree={() => {
            setShowAgentOnboarding(false);
            setShowAgentProfileOnboarding(true);
            setAgentProfilePhase('intro');
          }}
        />
      ) : showPersonalOnboardingEight ? (
        <PersonalOnboardingScreenEight
          onStartExploring={() => {
            setShowPersonalOnboardingEight(false);
            setShowPersonalOnboardingSeven(false);
            setShowPersonalOnboardingSix(false);
            setShowPersonalOnboardingFive(false);
            setShowPersonalOnboardingFour(false);
            setShowPersonalOnboardingThree(false);
            setShowPersonalOnboardingTwo(false);
            setShowPersonalOnboarding(false);
            setShowExploreHome(true);
          }}
        />
      ) : showPersonalOnboardingSeven ? (
        <PersonalOnboardingScreenSeven
          onBack={() => {
            setShowPersonalOnboardingSeven(false);
            setShowPersonalOnboardingSix(true);
          }}
          onSkip={() => {
            setShowPersonalOnboardingEight(false);
            setShowPersonalOnboardingSeven(false);
            setShowPersonalOnboardingSix(false);
            setShowPersonalOnboardingFive(false);
            setShowPersonalOnboardingFour(false);
            setShowPersonalOnboardingThree(false);
            setShowPersonalOnboardingTwo(false);
            setShowPersonalOnboarding(false);
            setShowExploreHome(true);
          }}
          onComplete={() => {
            setShowPersonalOnboardingSeven(false);
            setShowPersonalOnboardingEight(true);
          }}
        />
      ) : showPersonalOnboardingSix ? (
        <PersonalOnboardingScreenSix
          onBack={() => {
            setShowPersonalOnboardingSix(false);
            setShowPersonalOnboardingFive(true);
          }}
          onSkip={() => {
            setShowPersonalOnboardingEight(false);
            setShowPersonalOnboardingSeven(false);
            setShowPersonalOnboardingSix(false);
            setShowPersonalOnboardingFive(false);
            setShowPersonalOnboardingFour(false);
            setShowPersonalOnboardingThree(false);
            setShowPersonalOnboardingTwo(false);
            setShowPersonalOnboarding(false);
            setShowExploreHome(false);
          }}
          onComplete={() => {
            setShowPersonalOnboardingSix(false);
            setShowPersonalOnboardingSeven(true);
          }}
        />
      ) : showPersonalOnboardingFive ? (
        <PersonalOnboardingScreenFive
          onBack={() => {
            setShowPersonalOnboardingFive(false);
            setShowPersonalOnboardingFour(true);
          }}
          onSkip={() => {
            setShowPersonalOnboardingEight(false);
            setShowPersonalOnboardingSeven(false);
            setShowPersonalOnboardingFive(false);
            setShowPersonalOnboardingSix(false);
            setShowPersonalOnboardingFour(false);
            setShowPersonalOnboardingThree(false);
            setShowPersonalOnboardingTwo(false);
            setShowPersonalOnboarding(false);
            setShowExploreHome(false);
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
            setShowPersonalOnboardingEight(false);
            setShowPersonalOnboardingSeven(false);
            setShowPersonalOnboardingFour(false);
            setShowPersonalOnboardingFive(false);
            setShowPersonalOnboardingSix(false);
            setShowPersonalOnboardingThree(false);
            setShowPersonalOnboardingTwo(false);
            setShowPersonalOnboarding(false);
            setShowExploreHome(false);
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
            setShowPersonalOnboardingSeven(false);
            setShowPersonalOnboardingEight(false);
            setShowExploreHome(false);
            setShowAgentProfileOnboarding(false);
          }}
          onAgree={() => {
            setShowPersonalOnboardingTwo(true);
            setShowPersonalOnboardingThree(false);
            setShowPersonalOnboardingFour(false);
            setShowPersonalOnboardingFive(false);
            setShowPersonalOnboardingSix(false);
            setShowPersonalOnboardingSeven(false);
            setShowPersonalOnboardingEight(false);
            setShowExploreHome(false);
            setShowAgentProfileOnboarding(false);
          }}
        />
      ) : !showAuth ? (
        <WelcomeScreen onContinue={() => setShowAuth(true)} />
      ) : authRoute === 'login' ? (
        <LoginScreen
          onGoSignup={() => setAuthRoute('signup')}
          onEmailPress={() => setEmailAuthPanel('login')}
          onGooglePress={() => {
            setShowAgentOnboarding(false);
            setShowAgentProfileOnboarding(false);
            setShowPersonalOnboarding(true);
            setShowPersonalOnboardingTwo(false);
            setShowPersonalOnboardingThree(false);
            setShowPersonalOnboardingFour(false);
            setShowPersonalOnboardingFive(false);
            setShowPersonalOnboardingSix(false);
            setShowPersonalOnboardingSeven(false);
            setShowPersonalOnboardingEight(false);
            setShowExploreHome(false);
          }}
          onApplePress={() => setShowAgentOnboarding(true)}
        />
      ) : (
        <SignupScreen
          onGoLogin={() => setAuthRoute('login')}
          onApplePress={() => setShowAgentOnboarding(true)}
          onEmailPress={() => setEmailAuthPanel('signup')}
        />
      )}
    </SafeAreaProvider>
  );
}
