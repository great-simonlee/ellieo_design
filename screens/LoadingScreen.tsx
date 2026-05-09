import { StyleSheet, View } from 'react-native';

/** Shown while fonts load — matches prior App blank state */
export function LoadingScreen() {
  return <View style={styles.root} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
