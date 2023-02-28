import { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SplashScreen, Stack, useSegments, useRouter, usePathname } from 'expo-router';

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
  const currentPath = usePathname();
  const { authLoaded, isAuthenticated } = useAuth();

  useEffect(() => {
    const isPrivate = segments[0] !== '(public)';

    if (
      // If authentication is complete, the user is not signed in and the initial segment is private
      authLoaded &&
      !isAuthenticated &&
      isPrivate
    ) {
      // send to generic error page with authentication failure message
      router.replace({ pathname: '/error', params: { message: 'Authentication failure' } });
    } else if (
      // If authentication is complete, the user is signed in
      authLoaded &&
      isAuthenticated
    ) {
      // send to original route
      router.replace(currentPath);
    }
  }, [authLoaded, isAuthenticated, segments, router, currentPath]);

  if (!authLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="home" options={{ headerShown: false, title: 'Home' }} />
      <Stack.Screen name="appointment" options={{ headerShown: false, title: 'Appointment' }} />
      <Stack.Screen name="(public)/error" options={{ headerShown: false, title: 'Uh-oh' }} />
    </Stack>
  );
}
