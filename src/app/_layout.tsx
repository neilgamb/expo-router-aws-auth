import { useState, useEffect } from 'react';
import { SplashScreen, Stack, useRouter, useSearchParams } from 'expo-router';
import { useAppConfig } from '../state/appConfig';

// default ErrorBoundary is exported from expo-router
// to override it, follow https://expo.github.io/router/docs/features/errors/
export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();
  const { authCode, animalOwnerSmsNumber } = useSearchParams();
  const { loadConfig, config, configError } = useAppConfig();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (authCode && animalOwnerSmsNumber) {
      // authenticate
    }
  }, [authCode, animalOwnerSmsNumber]);

  useEffect(() => {
    if (config) {
      setIsReady(true);
    }
  }, [config]);

  useEffect(() => {
    if (isReady && configError) {
      router.push('error');
    }
  }, [isReady, configError, router]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return (
    <>
      {!isReady && <SplashScreen />}
      {isReady && <RootLayoutNav />}
    </>
  );
}

function RootLayoutNav() {
  return (
    <>
      <Stack>
        <Stack.Screen name="home" options={{ headerShown: false, title: 'Home' }} />
        <Stack.Screen name="appointment" options={{ headerShown: false, title: 'Appointment' }} />
        <Stack.Screen name="error" options={{ headerShown: false, title: 'Uh-oh' }} />
      </Stack>
    </>
  );
}
