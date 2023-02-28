import { Text, View, StyleSheet } from 'react-native';
import { useSearchParams } from 'expo-router';

export default function ErrorScreen() {
  const { message } = useSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Error Screen</Text>
      {message ? (
        <Text style={styles.errorMessage}>{message}</Text>
      ) : (
        <Text style={styles.errorMessage}>Something went wrong</Text>
      )}
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
