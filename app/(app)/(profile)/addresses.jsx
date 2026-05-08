// app/(app)/(profile)/addresses.jsx
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import EmptyState from '@/components/EmptyState';
import { COLORS, SIZES } from '@/constants/theme';

export default function AddressesScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'My Addresses', headerShown: true }} />
            <View style={styles.container}>
                <EmptyState
                    emoji="📍"
                    title="No addresses saved"
                    subtitle="You can add addresses during the checkout process"
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
});
