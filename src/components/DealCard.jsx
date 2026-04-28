// src/components/DealCard.jsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const GRADIENT_SETS = [
    ['#963b52', '#b5536a'],
    ['#5b3a8a', '#8a5bbf'],
    ['#1a5f7a', '#2e8fa8'],
    ['#7a3d1a', '#b85f35'],
];

function formatDiscountLabel(deal) {
    if (deal.dealType === 'PERCENTAGE') return `${deal.discountValue}% OFF`;
    if (deal.dealType === 'FLAT_AMOUNT') return `Rs. ${deal.discountValue?.toLocaleString()} OFF`;
    if (deal.dealType === 'FIXED_PRICE') return `Rs. ${deal.discountedPrice?.toLocaleString()}`;
    return '';
}

function getDaysRemaining(validUntil) {
    const diff = new Date(validUntil) - new Date();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function DealCard({ deal, onPress, horizontal = false }) {
    const gradientColors = GRADIENT_SETS[Math.abs(deal.title?.charCodeAt(0) ?? 0) % GRADIENT_SETS.length];
    const daysLeft = getDaysRemaining(deal.validUntil);
    const isExpiringSoon = daysLeft <= 2 && daysLeft > 0;
    const discountLabel = formatDiscountLabel(deal);

    const cardStyle = horizontal
        ? [styles.card, styles.cardHorizontal]
        : [styles.card, styles.cardFullWidth];

    return (
        <TouchableOpacity style={cardStyle} activeOpacity={0.92} onPress={onPress}>
            {/* Banner */}
            <View style={horizontal ? styles.bannerHorizontal : styles.bannerFull}>
                {deal.photo ? (
                    <Image source={{ uri: deal.photo }} style={StyleSheet.absoluteFill} contentFit="cover" />
                ) : (
                    <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
                )}
                {/* Expiring soon warning */}
                {isExpiringSoon && (
                    <View style={styles.expireBanner}>
                        <MaterialIcons name="schedule" size={12} color="#fff" />
                        <Text style={styles.expireText}>Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}!</Text>
                    </View>
                )}
                {/* Discount badge overlay */}
                <View style={styles.discountOverlay}>
                    <Text style={styles.discountLabel}>{discountLabel}</Text>
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>{deal.title}</Text>

                {/* Salon */}
                <View style={styles.salonRow}>
                    <MaterialIcons name="storefront" size={13} color="#544245" />
                    <Text style={styles.salonName} numberOfLines={1}>
                        {deal.salon?.name}
                        {deal.salon?.city ? ` · ${deal.salon.city}` : ''}
                    </Text>
                </View>

                {/* Services chip */}
                <Text style={styles.servicesText} numberOfLines={1}>
                    {deal.applicableServices?.length > 0
                        ? `${deal.applicableServices.length} service${deal.applicableServices.length > 1 ? 's' : ''}`
                        : 'All services'}
                </Text>

                {/* Footer: validity + min order */}
                <View style={styles.footer}>
                    <View style={styles.validityRow}>
                        <MaterialIcons name="event" size={12} color={isExpiringSoon ? '#b45309' : '#544245'} />
                        <Text style={[styles.validText, isExpiringSoon && styles.validTextWarn]}>
                            {daysLeft <= 0 ? 'Expired' : daysLeft === 1 ? 'Expires today' : `${daysLeft}d left`}
                        </Text>
                    </View>
                    {deal.minOrderAmount && (
                        <Text style={styles.minOrder}>Min Rs. {deal.minOrderAmount?.toLocaleString()}</Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.07,
        shadowRadius: 20,
        elevation: 4,
    },
    cardHorizontal: {
        width: 240,
    },
    cardFullWidth: {
        width: '100%',
        marginBottom: 16,
    },
    bannerHorizontal: {
        height: 120,
        position: 'relative',
    },
    bannerFull: {
        height: 140,
        position: 'relative',
    },
    expireBanner: {
        position: 'absolute',
        top: 10,
        left: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#b45309',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    expireText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    discountOverlay: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.35)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    discountLabel: {
        fontSize: 14,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: 0.5,
    },
    content: {
        padding: 14,
        gap: 6,
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#221920',
        letterSpacing: -0.3,
    },
    salonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    salonName: {
        fontSize: 12,
        color: '#544245',
        flex: 1,
    },
    servicesText: {
        fontSize: 11,
        color: '#963b52',
        fontWeight: '600',
        backgroundColor: '#fbe9f3',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 2,
    },
    validityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    validText: {
        fontSize: 11,
        color: '#544245',
    },
    validTextWarn: {
        color: '#b45309',
        fontWeight: 'bold',
    },
    minOrder: {
        fontSize: 11,
        color: '#544245',
        fontStyle: 'italic',
    },
});
