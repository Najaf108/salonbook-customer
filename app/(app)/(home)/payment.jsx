// app/(app)/(home)/payment.jsx
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useBookingStore } from '@/stores/useBookingStore';
import { PAYMENT_METHODS } from '@/constants/categories';
import { COLORS, SIZES } from '@/constants/theme';

export default function PaymentScreen() {
    const { paymentMethod, setPaymentMethod } = useBookingStore();

    const handleSelect = (method) => {
        setPaymentMethod(method);
        router.back();
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.list}>
                {PAYMENT_METHODS.map(method => {
                    const isComingSoon = method.id === 'JAZZCASH' || method.id === 'EASYPAISA';
                    return (
                        <TouchableOpacity
                            key={method.id}
                            style={[styles.card, paymentMethod === method.id && styles.cardSelected, isComingSoon && { opacity: 0.5 }]}
                            onPress={() => {
                                if (isComingSoon) {
                                    Alert.alert('Coming Soon', `${method.label} will be available in a future update.`);
                                    return;
                                }
                                handleSelect(method.id);
                            }}
                        >
                            <View style={styles.iconBox}>
                                <Text style={{ fontSize: 24 }}>{method.id === 'CASH' ? '💵' : method.id === 'STRIPE' ? '💳' : '📱'}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.cardTitle}>{method.label}</Text>
                                <Text style={styles.cardSub}>{method.id === 'CASH' ? 'Pay after your service' : 'Secure instant payment'}</Text>
                            </View>
                            <View style={[styles.radio, paymentMethod === method.id && styles.radioActive]}>
                                {paymentMethod === method.id && <View style={styles.radioDot} />}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    list: { padding: SIZES.lg, gap: SIZES.md },
    card: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        padding: SIZES.lg, borderRadius: SIZES.borderRadius, gap: 16,
        borderWidth: 1.5, borderColor: 'transparent',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    cardSelected: { borderColor: COLORS.primary, backgroundColor: '#FAF5FF' },
    iconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
    cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
    cardSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
    radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
    radioActive: { borderColor: COLORS.primary },
    radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },
});
