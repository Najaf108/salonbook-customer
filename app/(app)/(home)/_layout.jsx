// app/(app)/(home)/_layout.jsx
import { Stack } from 'expo-router';
import { COLORS } from '@/constants/theme';

export default function HomeStackLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: COLORS.surface },
                headerTintColor: COLORS.textPrimary,
                headerShadowVisible: false,
                headerBackTitle: '',
            }}
        >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="services" options={{ title: 'Services' }} />
            <Stack.Screen name="staff" options={{ title: 'Select Stylist' }} />
            <Stack.Screen name="slot" options={{ title: 'Select Slot' }} />
            <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
            <Stack.Screen name="payment" options={{ title: 'Payment' }} />
            <Stack.Screen name="confirmation" options={{ headerShown: false }} />
        </Stack>
    );
}
