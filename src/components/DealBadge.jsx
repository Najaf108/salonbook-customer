// src/components/DealBadge.jsx
import { View, Text, StyleSheet } from 'react-native';

export default function DealBadge({ deal }) {
    if (!deal) return null;

    const label = deal.dealType === 'PERCENTAGE'
        ? `${deal.discountValue}% OFF`
        : deal.dealType === 'FLAT_AMOUNT'
            ? `Rs. ${deal.discountValue} OFF`
            : 'FIXED PRICE';

    return (
        <View style={styles.badge}>
            <Text style={styles.emoji}>🏷️</Text>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffd9de',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
        alignSelf: 'flex-start',
    },
    emoji: { fontSize: 11 },
    label: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#7d283f',
        letterSpacing: 0.3,
    },
});
