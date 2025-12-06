// app/index.tsx
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from './_context/AuthContext';

export default function Index() {
  const { user, isLoading } = useAuth();

  // Mostrar loading mientras verifica sesión
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498DB" />
      </View>
    );
  }

  // Si hay usuario, redirigir al dashboard
  if (user) {
    return <Redirect href="/(tabs)/dashboard" />;
  }

  // Si no hay usuario, redirigir al login
  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
//npx expo start --clear
