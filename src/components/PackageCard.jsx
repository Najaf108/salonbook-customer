// src/components/PackageCard.jsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

function formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
}

export default function PackageCard({ pkg, onPress }) {
    const serviceNames = pkg?.items?.map(item => item.service?.name).filter(Boolean) ?? [];

    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.92} onPress={onPress}>
            {/* Banner */}
            <View style={styles.banner}>
                {pkg.photo ? (
                    <Image source={{ uri: pkg.photo }} style={StyleSheet.absoluteFill} contentFit="cover" />
                ) : (
                    <LinearGradient
                        colors={['#1a5f7a', '#2e3a8a']}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                )}
                {/* Package icon */}
                {!pkg.photo && <Text style={styles.packageEmoji}>📦</Text>}
                {/* Savings badge */}
                <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>Save {Math.round(pkg.savingsPercent)}%</Text>
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.name} numberOfLines={2}>{pkg.name}</Text>

                {/* Included services */}
                <Text style={styles.servicesLine} numberOfLines={2}>
                    {serviceNames.map(n => `✓ ${n}`).join('  ')}
                </Text>

                {/* Duration */}
                <View style={styles.durationRow}>
                    <MaterialIcons name="schedule" size={14} color="#544245" />
                    <Text style={styles.durationText}>{formatDuration(pkg.estimatedDuration)} total</Text>
                </View>

                {/* Pricing */}
                <View style={styles.pricingRow}>
                    <View style={styles.priceStack}>
                        <Text style={styles.originalPrice}>Rs. {pkg.originalTotal?.toLocaleString()}</Text>
                        <Text style={styles.packagePrice}>Rs. {pkg.packagePrice?.toLocaleString()}</Text>
                    </View>
                    <View style={styles.savingsPill}>
                        <Text style={styles.savingsPillText}>
                            Save Rs. {pkg.savingsAmount?.toLocaleString()}
                        </Text>
                    </View>
                </View>

                {/* Salon info */}
                <View style={styles.salonRow}>
                    <MaterialIcons name="storefront" size={13} color="#544245" />
                    <Text style={styles.salonName} numberOfLines={1}>{pkg.salon?.name}</Text>
                    {pkg.salon?.avgRating > 0 && (
                        <>
                            <MaterialIcons name="star" size={12} color="#7b5804" />
                            <Text style={styles.ratingText}>{pkg.salon.avgRating?.toFixed(1)}</Text>
                        </>
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
        width: '100%',
        marginBottom: 16,
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.07,
        shadowRadius: 20,
        elevation: 4,
    },
    banner: {
        height: 140,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    packageEmoji: {
        fontSize: 40,
        opacity: 0.8,
    },
    savingsBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: '#16a34a',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    savingsText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    content: {
        padding: 16,
        gap: 8,
    },
    name: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#221920',
        letterSpacing: -0.3,
    },
    servicesLine: {
        fontSize: 12,
        color: '#16a34a',
        fontWeight: '600',
        lineHeight: 18,
    },
    durationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    durationText: {
        fontSize: 12,
        color: '#544245',
    },
    pricingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    priceStack: {
        gap: 2,
    },
    originalPrice: {
        fontSize: 13,
        color: '#544245',
        textDecorationLine: 'line-through',
    },
    packagePrice: {
        fontSize: 20,
        fontWeight: '900',
        color: '#963b52',
        letterSpacing: -0.5,
    },
    savingsPill: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    savingsPillText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#16a34a',
    },
    salonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    salonName: {
        fontSize: 12,
        color: '#544245',
        flex: 1,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#7b5804',
    },
});
