// app/index.jsx  — Splash / redirect
import { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { COLORS } from '@/constants/theme';
import storage from '@/lib/storage';

export default function SplashScreen() {
    const { isLoading, isAuthenticated } = useAuthStore();
    const [onboardingChecked, setOnboardingChecked] = useState(false);
    const [onboardingDone, setOnboardingDone] = useState(false);

    // Check onboarding flag from storage
    useEffect(() => {
        (async () => {
            const done = await storage.get('onboarding_done');
            setOnboardingDone(!!done);
            setOnboardingChecked(true);
        })();
    }, []);

    // Redirect once both auth and onboarding checks are complete
    useEffect(() => {
        if (!isLoading && onboardingChecked) {
            if (!onboardingDone) {
                // First-time user → show onboarding
                router.replace('/onboarding');
            } else {
                // Returning user → normal auth flow
                router.replace(isAuthenticated ? '/(app)/(home)' : '/(auth)/login');
            }
        }
    }, [isLoading, isAuthenticated, onboardingChecked, onboardingDone]);

    return (
        <View style={styles.container}>
            <View style={styles.logoBox}>
                <Image
                    source={require('../assets/salonbooklogo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
    logoBox: { alignItems: 'center' },
    logo: { width: 120, height: 120 },
});
