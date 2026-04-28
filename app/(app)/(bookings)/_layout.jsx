// app/(app)/(bookings)/_layout.jsx
import { Stack } from 'expo-router';
import { COLORS } from '@/constants/theme';

export default function BookingsStackLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: COLORS.surface },
                headerTintColor: COLORS.textPrimary,
                headerShadowVisible: false,
                headerBackTitle: '',
            }}
        >
            <Stack.Screen name="index" options={{ title: 'My Bookings', headerShown: false }} />
            <Stack.Screen name="[id]" options={{ title: 'Booking Status' }} />
            <Stack.Screen name="review" options={{ title: 'Leave a Review', headerShown: false }} />
            <Stack.Screen name="review-success" options={{ headerShown: false }} />
        </Stack>
    );
}
