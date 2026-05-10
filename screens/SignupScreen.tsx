import { Text, View } from 'react-native';
import { AuthShell } from './auth/AuthShell';
import { authStyles } from './auth/authStyles';
import { useAuthLayout } from './auth/useAuthLayout';

type SignupScreenProps = {
  onGoLogin: () => void;
  onApplePress?: () => void;
  onEmailPress?: () => void;
};

export function SignupScreen({
  onGoLogin,
  onApplePress,
  onEmailPress,
}: SignupScreenProps) {
  const L = useAuthLayout();

  return (
    <AuthShell
      actionVerb='Sign up'
      onApplePress={onApplePress}
      onEmailPress={onEmailPress}
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
            <Text style={authStyles.welcomeLead}>Create your account</Text>
            {` — you're only a few taps away from joining Ellieo.`}
          </Text>
        </View>
      }
      footer={
        <Text style={authStyles.joinLine}>
          Already a member?{' '}
          <Text
            accessibilityRole='link'
            onPress={onGoLogin}
            style={authStyles.joinLink}
          >
            Log in
          </Text>
        </Text>
      }
    />
  );
}
