// app/(app)/(search)/_layout.jsx
import { Stack } from 'expo-router';
import { COLORS } from '@/constants/theme';

export default function SearchStackLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: COLORS.surface },
                headerTintColor: COLORS.textPrimary,
                headerShadowVisible: false,
                headerBackTitle: '',
            }}
        >
            <Stack.Screen name="index" options={{ title: 'Explore', headerShown: false }} />
        </Stack>
    );
}
