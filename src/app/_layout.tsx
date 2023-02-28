import { useState, useEffect } from 'react';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import { useAppConfig } from '../state/appConfig';

// default ErrorBoundary is exported from expo-router
// to override it, follow https://expo.github.io/router/docs/features/errors/
export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const { loadConfig, config, configError } = useAppConfig();
  const router = useRouter();

  useEffect(() => {
    loadConfig();
  });

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
        <Stack.Screen name="index" options={{ headerShown: false, title: 'Home' }} />
        <Stack.Screen name="appointment" options={{ headerShown: false, title: 'Appointment' }} />
        <Stack.Screen name="error" options={{ headerShown: false, title: 'Uh-oh' }} />
      </Stack>
    </>
  );
}
