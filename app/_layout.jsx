import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/useAuthStore';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import { auth } from '@/lib/firebase';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import storage from '@/lib/storage';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export default function RootLayout() {
  const init = useAuthStore(s => s.init);
  const login = useAuthStore(s => s.login);
  usePushNotifications();
  const [loaded, error] = useFonts({
    ...MaterialIcons.font,
  });

  useEffect(() => {
    init();
  }, []);

  // Handle incoming Email Sign-in Link
  useEffect(() => {
    const handleUrl = async (url) => {
      if (!url) return;

      if (isSignInWithEmailLink(auth, url)) {
        let email = await storage.get('emailForSignIn');

        if (!email) {
          // If email is missing, we might need to ask user for it again
          // but for now let's hope it's there
          console.log('[Auth] Email missing from storage for sign-in link');
          return;
        }

        try {
          const result = await signInWithEmailLink(auth, email, url);
          const idToken = await result.user.getIdToken();

          // Clear the email from storage
          await storage.delete('emailForSignIn');

          // Sync with backend
          const res = await login(idToken, result.user.displayName || 'Customer', 'CUSTOMER');

          if (res.isNewUser) {
            router.replace('/(auth)/details');
          } else {
            router.replace('/(app)/(home)');
          }
          Alert.alert('Success', 'You have been signed in successfully!');
        } catch (error) {
          console.error('[Auth] Email Link Sign-in Error:', error);
          Alert.alert('Sign-in Error', 'The link might be expired or invalid. Please try again.');
        }
      }
    };

    // 1. Check if app was opened by a link
    Linking.getInitialURL().then(handleUrl);

    // 2. Listen for subsequent links while app is open
    const subscription = Linking.addEventListener('url', (event) => handleUrl(event.url));

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
