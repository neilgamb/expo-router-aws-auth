import { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SplashScreen, Stack, useSegments, useRouter } from 'expo-router';

import { AuthProvider, useAuth } from '../providers/auth';

// default ErrorBoundary is exported from expo-router
// to override it, follow https://expo.github.io/router/docs/features/errors/
export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // simulate loading fonts, etc
    setTimeout(() => {
      setIsReady(true);
    }, 500);
  }, []);

  return (
    <>
      {!isReady && <SplashScreen />}
      {isReady && (
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      )}
    </>
  );
}

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const { authLoaded, isAuthenticated } = useAuth();

  useEffect(() => {
    const isPrivate = segments[0] !== '(public)';

    if (
      // If the user is not signed in and the initial segment is private
      !isAuthenticated &&
      isPrivate
    ) {
      router.replace({ pathname: '/error', params: { message: 'Authentication failed' } });
    }
  }, [isAuthenticated, segments, router]);

  if (!authLoaded) {
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>;
  }

  return (
    <Stack>
      <Stack.Screen name="home" options={{ headerShown: false, title: 'Home' }} />
      <Stack.Screen name="appointment" options={{ headerShown: false, title: 'Appointment' }} />
      <Stack.Screen name="(public)/error" options={{ headerShown: false, title: 'Uh-oh' }} />
    </Stack>
  );
}
