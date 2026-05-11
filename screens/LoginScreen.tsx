import { Text, View } from 'react-native';
import { AuthShell } from './auth/AuthShell';
import { authStyles } from './auth/authStyles';
import { useAuthLayout } from './auth/useAuthLayout';

type LoginScreenProps = {
  onGoSignup: () => void;
  onGooglePress: () => void;
  onApplePress: () => void;
  onEmailPress?: () => void;
  /** Design-only: top-right shortcut to main map. */
  onTemporaryMainMapPress?: () => void;
};

export function LoginScreen({
  onGoSignup,
  onGooglePress,
  onApplePress,
  onEmailPress,
  onTemporaryMainMapPress,
}: LoginScreenProps) {
  const L = useAuthLayout();

  return (
    <AuthShell
      actionVerb='Log in'
      onGooglePress={onGooglePress}
      onApplePress={onApplePress}
      onEmailPress={onEmailPress}
      onTemporaryMainMapPress={onTemporaryMainMapPress}
      welcome={
        <View style={authStyles.welcomeBlock}>
          <Text
            style={[
              authStyles.welcomeText,
              {
                fontSize: L.welcomeFontSize,
                lineHeight: L.welcomeLineHeight,
                maxWidth: Math.min(340, L.contentMaxWidth),
                paddingHorizontal: 0,
              },
            ]}
          >
            <Text style={authStyles.welcomeLead}>Welcome!</Text>
            {` So good to see you back.`}
          </Text>
        </View>
      }
      footer={
        <Text style={authStyles.joinLine}>
          Not a member yet?{' '}
          <Text
            accessibilityRole='link'
            onPress={onGoSignup}
            style={authStyles.joinLink}
          >
            Join Ellieo now.
          </Text>
        </Text>
      }
    />
  );
}
