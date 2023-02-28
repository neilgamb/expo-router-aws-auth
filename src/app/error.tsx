import { Text, View, StyleSheet } from 'react-native';

export default function ErrorScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Error Screen</Text>
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
});
