import { useSearchParams } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';

export default function ErrorScreen() {
  const params = useSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Error Screen</Text>
      <Text style={styles.errorMessage}>{params.error}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  errorMessage: {
    fontSize: 20,
    marginTop: 10,
  },
});
