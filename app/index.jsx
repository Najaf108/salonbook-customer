// app/index.jsx  — Splash / redirect
import { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { COLORS } from '@/constants/theme';

export default function SplashScreen() {
    const { isLoading, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!isLoading) {
            router.replace(isAuthenticated ? '/(app)/(home)' : '/(auth)/phone');
        }
    }, [isLoading, isAuthenticated]);

    return (
        <View style={styles.container}>
            <View style={styles.logoBox}>
                <Image
                    source={require('../assets/icon.png')}
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
