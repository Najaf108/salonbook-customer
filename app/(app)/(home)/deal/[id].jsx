// app/(app)/(home)/deal/[id].jsx
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, StatusBar, Alert } from 'react-native';
import { useState } from 'react';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useDealDetail, useApplyDeal } from '@/hooks/useDeals';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useBookingStore } from '@/stores/useBookingStore';
import { salonService } from '@/services/salon.service';

const GRADIENT_SETS = [
    ['#963b52', '#b5536a'],
    ['#5b3a8a', '#8a5bbf'],
    ['#1a5f7a', '#2e8fa8'],
];

function formatDealType(deal) {
    if (deal.dealType === 'PERCENTAGE') return `${deal.discountValue}% OFF`;
    if (deal.dealType === 'FLAT_AMOUNT') return `Rs. ${deal.discountValue?.toLocaleString()} OFF`;
    return '';
}

function InfoRow({ icon, label, value, valueStyle }) {
    return (
        <View style={styles.infoRow}>
            <MaterialIcons name={icon} size={18} color="#963b52" />
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={[styles.infoValue, valueStyle]}>{value}</Text>
        </View>
    );
}

export default function DealDetailScreen() {
    const { id } = useLocalSearchParams();
    const { data: deal, isLoading } = useDealDetail(id);
    const { setSalon, setAppliedDeal, getServiceIds, getSubtotal, salon, selectedServices } = useBookingStore();
    const applyDealMutation = useApplyDeal();
    const [applying, setApplying] = useState(false);

    if (isLoading) return <LoadingSpinner full />;
    if (!deal) return null;

    const gradientColors = GRADIENT_SETS[Math.abs(deal.title?.charCodeAt(0) ?? 0) % GRADIENT_SETS.length];
    const daysLeft = deal.daysRemaining ?? 0;

    const handleApply = async () => {
        const serviceIds = getServiceIds();
        const subtotal = getSubtotal ? getSubtotal() : 0;
        const hasMidBooking = salon && selectedServices.length > 0;

        setApplying(true);
        try {
            if (hasMidBooking) {
                // User already has services — validate deal against those services now
                const result = await applyDealMutation.mutateAsync({
                    id: deal.id,
                    serviceIds,
                    totalAmount: subtotal,
                });

                setAppliedDeal({
                    id: deal.id,
                    title: deal.title,
                    dealType: deal.dealType,
                    discountValue: deal.discountValue,
                    maxDiscount: deal.maxDiscount,
                    discountAmount: result.discountAmount,
                    finalAmount: result.finalAmount,
                    applicableServices: deal.applicableServices ?? [],
                });

                router.push('/(app)/(home)/checkout');
            } else {
                // No active booking — fetch salon, pre-set it, save deal, go straight to services
                const salonId = deal.salon?.id ?? deal.salonId;
                const salonData = await salonService.getSalonById(salonId);

                setSalon(salonData);
                setAppliedDeal({
                    id: deal.id,
                    title: deal.title,
                    dealType: deal.dealType,
                    discountValue: deal.discountValue,
                    maxDiscount: deal.maxDiscount,
                    discountAmount: null,   // computed at checkout after services selected
                    applicableServices: deal.applicableServices ?? [],
                });

                // Skip salon detail page — jump directly to service selection
                router.push('/(app)/(home)/services');
            }
        } catch (err) {
            const msg = err.response?.data?.error || 'Could not apply this deal. Please try again.';
            Alert.alert('Deal Not Applied', msg);
        } finally {
            setApplying(false);
        }
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>

                {/* Back button */}
                <View style={styles.headerOverlay}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
                        <MaterialIcons name="arrow-back" size={24} color="#963b52" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

                    {/* Banner */}
                    <View style={styles.banner}>
                        {deal.photo ? (
                            <Image source={{ uri: deal.photo }} style={StyleSheet.absoluteFill} contentFit="cover" />
                        ) : (
                            <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
                        )}
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.5)']}
                            style={StyleSheet.absoluteFill}
                        />
                        {/* Deal amount overlaid */}
                        <View style={styles.bannerContent}>
                            <View style={styles.dealTypeBadge}>
                                <Text style={styles.dealTypeBadgeText}>{deal.dealType?.replace('_', ' ')}</Text>
                            </View>
                            <Text style={styles.bannerAmount}>{formatDealType(deal)}</Text>
                        </View>
                    </View>

                    {/* Main content */}
                    <View style={styles.content}>

                        {/* Title + description */}
                        <Text style={styles.title}>{deal.title}</Text>
                        {deal.description && (
                            <Text style={styles.description}>{deal.description}</Text>
                        )}

                        {/* Expiry warning */}
                        {deal.isExpiringSoon && (
                            <View style={styles.expiryBanner}>
                                <MaterialIcons name="warning-amber" size={18} color="#b45309" />
                                <Text style={styles.expiryText}>Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}! Grab it now.</Text>
                            </View>
                        )}

                        {/* Deal info card */}
                        <View style={styles.infoCard}>
                            <Text style={styles.cardSectionTitle}>Deal Details</Text>
                            <InfoRow
                                icon="event-available"
                                label="Valid From"
                                value={new Date(deal.validFrom).toLocaleDateString('en-PK', { dateStyle: 'medium' })}
                            />
                            <View style={styles.divider} />
                            <InfoRow
                                icon="event-busy"
                                label="Valid Until"
                                value={new Date(deal.validUntil).toLocaleDateString('en-PK', { dateStyle: 'medium' })}
                                valueStyle={deal.isExpiringSoon && { color: '#b45309', fontWeight: 'bold' }}
                            />
                            {daysLeft > 0 && (
                                <>
                                    <View style={styles.divider} />
                                    <InfoRow icon="schedule" label="Days Remaining" value={`${daysLeft} days`} />
                                </>
                            )}
                            {deal.minOrderAmount && (
                                <>
                                    <View style={styles.divider} />
                                    <InfoRow
                                        icon="shopping-cart"
                                        label="Min. Order"
                                        value={`Rs. ${deal.minOrderAmount?.toLocaleString()}`}
                                    />
                                </>
                            )}
                            {deal.maxDiscount && (
                                <>
                                    <View style={styles.divider} />
                                    <InfoRow
                                        icon="money-off"
                                        label="Max Discount"
                                        value={`Rs. ${deal.maxDiscount?.toLocaleString()}`}
                                    />
                                </>
                            )}
                            <View style={styles.divider} />
                            <InfoRow
                                icon="person"
                                label="Per Customer"
                                value={`${deal.perUserLimit} use${deal.perUserLimit !== 1 ? 's' : ''}`}
                            />
                        </View>

                        {/* Applicable Services */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Applicable Services</Text>
                            {deal.applicableServices?.length === 0 ? (
                                <View style={styles.allServicesRow}>
                                    <MaterialIcons name="check-circle" size={18} color="#16a34a" />
                                    <Text style={styles.allServicesText}>All services at this salon</Text>
                                </View>
                            ) : (
                                <Text style={styles.specificServicesText}>
                                    This deal applies to {deal.applicableServices?.length} specific service{deal.applicableServices?.length !== 1 ? 's' : ''}.
                                </Text>
                            )}
                        </View>

                        {/* About the Salon */}
                        {deal.salon && (
                            <TouchableOpacity
                                style={styles.salonCard}
                                activeOpacity={0.9}
                                onPress={() => router.push(`/(app)/(home)/salon/${deal.salonId}`)}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.salonLabel}>About the Salon</Text>
                                    <Text style={styles.salonName}>{deal.salon.name}</Text>
                                    <View style={styles.salonMeta}>
                                        <MaterialIcons name="location-on" size={14} color="#544245" />
                                        <Text style={styles.salonCity}>{deal.salon.city}</Text>
                                        {deal.salon.avgRating > 0 && (
                                            <>
                                                <MaterialIcons name="star" size={14} color="#7b5804" />
                                                <Text style={styles.salonRating}>{deal.salon.avgRating?.toFixed(1)}</Text>
                                            </>
                                        )}
                                    </View>
                                </View>
                                <MaterialIcons name="arrow-forward-ios" size={18} color="#963b52" />
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>

                {/* Bottom CTA */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={[styles.applyBtn, applying && { opacity: 0.7 }]}
                        onPress={handleApply}
                        activeOpacity={0.9}
                        disabled={applying}
                    >
                        <LinearGradient colors={['#963b52', '#b5536a']} style={styles.applyGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <Text style={styles.applyBtnText}>
                                {applying
                                    ? 'Applying...'
                                    : (salon && selectedServices.length > 0)
                                        ? 'Apply & Go to Checkout'
                                        : 'Book'}
                            </Text>
                            {!applying && <MaterialIcons name="arrow-forward" size={20} color="#fff" />}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff7f9' },
    headerOverlay: {
        position: 'absolute',
        top: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 52,
        left: 24,
        zIndex: 50,
    },
    backBtn: {
        width: 44, height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    banner: {
        height: 280,
        justifyContent: 'flex-end',
    },
    bannerContent: {
        padding: 24,
        gap: 8,
    },
    dealTypeBadge: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    dealTypeBadgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ffffff',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    bannerAmount: {
        fontSize: 40,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: -1,
    },
    content: {
        padding: 24,
        gap: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#221920',
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 16,
        color: '#544245',
        lineHeight: 24,
        marginTop: -12,
    },
    expiryBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#fef3c7',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#fcd34d',
        marginTop: -12,
    },
    expiryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#b45309',
        flex: 1,
    },
    infoCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 3,
        gap: 4,
    },
    cardSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#221920',
        marginBottom: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
    },
    infoLabel: {
        fontSize: 14,
        color: '#544245',
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#221920',
    },
    divider: {
        height: 1,
        backgroundColor: '#fbe9f3',
        marginHorizontal: 0,
    },
    section: { gap: 12 },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#221920',
        letterSpacing: -0.3,
    },
    allServicesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#dcfce7',
        borderRadius: 12,
        padding: 14,
    },
    allServicesText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#16a34a',
    },
    specificServicesText: {
        fontSize: 14,
        color: '#544245',
        backgroundColor: '#fbe9f3',
        borderRadius: 12,
        padding: 14,
    },
    salonCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 3,
    },
    salonLabel: {
        fontSize: 12,
        color: '#544245',
        fontWeight: '500',
        marginBottom: 4,
    },
    salonName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#221920',
        marginBottom: 8,
    },
    salonMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    salonCity: { fontSize: 13, color: '#544245' },
    salonRating: { fontSize: 13, fontWeight: '600', color: '#7b5804' },
    bottomBar: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(251,233,243,0.95)',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        borderTopWidth: 1,
        borderTopColor: '#efdee8',
    },
    applyBtn: { borderRadius: 32, overflow: 'hidden' },
    applyGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 10,
    },
    applyBtnText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#ffffff',
    },
});
