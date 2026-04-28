// app/(app)/(profile)/_layout.jsx
import { Stack } from 'expo-router';
import { COLORS } from '@/constants/theme';

export default function ProfileStackLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: COLORS.surface },
                headerTintColor: COLORS.textPrimary,
                headerShadowVisible: false,
                headerBackTitle: '',
            }}
        >
            <Stack.Screen name="index" options={{ title: 'Settings', headerShown: false }} />
            <Stack.Screen name="edit" options={{ title: 'Edit Profile' }} />
            <Stack.Screen name="addresses" options={{ title: 'My Addresses' }} />
        </Stack>
    );
}
