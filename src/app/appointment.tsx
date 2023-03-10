import { Text, View, StyleSheet } from 'react-native';

export default function AppointmentScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appointment Screen</Text>
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
