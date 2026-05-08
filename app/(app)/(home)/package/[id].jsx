// app/(app)/(home)/package/[id].jsx
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, StatusBar, Alert } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { usePackageDetail, useBookPackage } from '@/hooks/usePackages';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useBookingStore } from '@/stores/useBookingStore';
import { useAuthStore } from '@/stores/useAuthStore';

function formatDuration(minutes) {
    if (!minutes) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
}

const CATEGORY_ICONS = {
    HAIR: 'content-cut',
    SKIN: 'face-retouching-natural',
    NAILS: 'spa',
    MAKEUP: 'brush',
    BEARD: 'face',
    SPA: 'hot-tub',
    THREADING: 'auto-fix-high',
    OTHER: 'star',
};

export default function PackageDetailScreen() {
    const { id } = useLocalSearchParams();
    const { data: pkg, isLoading } = usePackageDetail(id);
    const { mutateAsync: bookPackage, isPending } = useBookPackage();
    const setPackage = useBookingStore(s => s.setPackage);
    const setSalon = useBookingStore(s => s.setSalon);
    const currentSalon = useBookingStore(s => s.salon);
    const { user } = useAuthStore();

    if (isLoading) return <LoadingSpinner full />;
    if (!pkg) return null;

    const handleBook = () => {
        // Ensure salon is set in store
        if (!currentSalon || currentSalon.id !== pkg.salonId) {
            if (pkg.salon) {
                setSalon(pkg.salon);
            }
        }
        setPackage(pkg);
        // Navigate to stylist selection first, then slot picker
        router.push(`/(app)/(home)/staff?fromPackage=true&packageId=${pkg.id}&salonId=${pkg.salonId}&duration=${pkg.estimatedDuration}`);
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>

                {/* Back button */}
                <View style={styles.headerOverlay}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
                        <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

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
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.55)']}
                            style={StyleSheet.absoluteFill}
                        />
                        <View style={styles.bannerContent}>
                            <View style={styles.packageBadge}>
                                <Text style={styles.packageBadgeText}>PACKAGE DEAL</Text>
                            </View>
                            <Text style={styles.packageName}>{pkg.name}</Text>
                        </View>
                    </View>

                    {/* Savings banner */}
                    <View style={styles.savingsBanner}>
                        <MaterialIcons name="savings" size={22} color="#16a34a" />
                        <Text style={styles.savingsText}>
                            You save Rs. {pkg.savingsAmount?.toLocaleString()} ({Math.round(pkg.savingsPercent)}%)!
                        </Text>
                    </View>

                    <View style={styles.content}>

                        {/* What's Included */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>What's Included</Text>
                            <View style={styles.servicesCard}>
                                {pkg.items?.map((item, idx) => (
                                    <View key={item.id}>
                                        {idx > 0 && <View style={styles.serviceDivider} />}
                                        <View style={styles.serviceRow}>
                                            <View style={styles.serviceIconWrap}>
                                                <MaterialIcons
                                                    name={CATEGORY_ICONS[item.service?.category] ?? 'spa'}
                                                    size={22}
                                                    color="#963b52"
                                                />
                                            </View>
                                            <View style={styles.serviceInfo}>
                                                <Text style={styles.serviceName}>{item.service?.name}</Text>
                                                <Text style={styles.serviceDuration}>{item.service?.duration} mins</Text>
                                            </View>
                                            <View style={styles.serviceRight}>
                                                <Text style={styles.serviceOriginalPrice}>
                                                    Rs. {item.priceAtTime?.toLocaleString()}
                                                </Text>
                                                <MaterialIcons name="check-circle" size={22} color="#16a34a" />
                                            </View>
                                        </View>
                                    </View>
                                ))}
                                {/* Total Duration */}
                                <View style={styles.totalDurationRow}>
                                    <MaterialIcons name="schedule" size={16} color="#544245" />
                                    <Text style={styles.totalDurationText}>
                                        Total: {formatDuration(pkg.estimatedDuration)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Pricing Summary */}
                        <View style={styles.pricingCard}>
                            <Text style={styles.sectionTitle}>Pricing Summary</Text>
                            <View style={styles.pricingRow}>
                                <Text style={styles.pricingLabel}>Individual Total</Text>
                                <Text style={styles.pricingOriginal}>Rs. {pkg.originalTotal?.toLocaleString()}</Text>
                            </View>
                            <View style={[styles.pricingRow, styles.pricingHighlight]}>
                                <Text style={styles.pricingPackageLabel}>Package Price</Text>
                                <Text style={styles.pricingPackageValue}>Rs. {pkg.packagePrice?.toLocaleString()}</Text>
                            </View>
                            <View style={[styles.pricingRow, styles.savingsRow]}>
                                <Text style={styles.savingsLabel}>You Save</Text>
                                <Text style={styles.savingsValue}>
                                    Rs. {pkg.savingsAmount?.toLocaleString()} ({Math.round(pkg.savingsPercent)}%)
                                </Text>
                            </View>
                        </View>

                        {/* Validity */}
                        {pkg.validUntil && (
                            <View style={styles.validityCard}>
                                <MaterialIcons name="event-available" size={20} color="#963b52" />
                                <Text style={styles.validityText}>
                                    Available until {new Date(pkg.validUntil).toLocaleDateString('en-PK', { dateStyle: 'medium' })}
                                </Text>
                            </View>
                        )}

                        {/* About the Salon */}
                        {pkg.salon && (
                            <TouchableOpacity
                                style={styles.salonCard}
                                activeOpacity={0.9}
                                onPress={() => router.push(`/(app)/(home)/salon/${pkg.salonId}`)}
                            >
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.salonLabel}>About the Salon</Text>
                                    <Text style={styles.salonName}>{pkg.salon.name}</Text>
                                    <View style={styles.salonMeta}>
                                        <MaterialIcons name="location-on" size={14} color="#544245" />
                                        <Text style={styles.salonCity}>{pkg.salon.city}</Text>
                                        {pkg.salon.avgRating > 0 && (
                                            <>
                                                <MaterialIcons name="star" size={14} color="#7b5804" />
                                                <Text style={styles.salonRating}>{pkg.salon.avgRating?.toFixed(1)}</Text>
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
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Package Price</Text>
                        <Text style={styles.priceValue}>Rs. {pkg.packagePrice?.toLocaleString()}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.bookBtn, isPending && { opacity: 0.7 }]}
                        onPress={handleBook}
                        activeOpacity={0.9}
                        disabled={isPending || !pkg.isAvailable}
                    >
                        <LinearGradient
                            colors={pkg.isAvailable ? ['#963b52', '#b5536a'] : ['#888', '#aaa']}
                            style={styles.bookGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.bookBtnText}>
                                {!pkg.isAvailable ? 'Not Available' : isPending ? 'Processing...' : 'Book This Package'}
                            </Text>
                            {pkg.isAvailable && !isPending && (
                                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                            )}
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
        backgroundColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    banner: { height: 300, justifyContent: 'flex-end' },
    bannerContent: { padding: 24, gap: 10 },
    packageBadge: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    packageBadgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#ffffff',
        letterSpacing: 2,
    },
    packageName: {
        fontSize: 30,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: -0.5,
    },
    savingsBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#dcfce7',
        marginHorizontal: 24,
        marginTop: 16,
        borderRadius: 14,
        padding: 14,
    },
    savingsText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#16a34a',
    },
    content: { padding: 24, gap: 24 },
    section: { gap: 14 },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#221920',
        letterSpacing: -0.3,
    },
    servicesCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 3,
        gap: 0,
    },
    serviceDivider: {
        height: 1,
        backgroundColor: '#fbe9f3',
        marginVertical: 2,
    },
    serviceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 12,
    },
    serviceIconWrap: {
        width: 48, height: 48,
        borderRadius: 12,
        backgroundColor: '#ffd9de',
        alignItems: 'center',
        justifyContent: 'center',
    },
    serviceInfo: { flex: 1 },
    serviceName: { fontSize: 15, fontWeight: 'bold', color: '#221920', marginBottom: 2 },
    serviceDuration: { fontSize: 13, color: '#544245' },
    serviceRight: { alignItems: 'flex-end', gap: 4 },
    serviceOriginalPrice: { fontSize: 13, color: '#544245' },
    totalDurationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingTop: 12,
        marginTop: 4,
        borderTopWidth: 1,
        borderTopColor: '#fbe9f3',
    },
    totalDurationText: { fontSize: 14, fontWeight: 'bold', color: '#221920' },
    pricingCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 3,
        gap: 12,
    },
    pricingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pricingLabel: { fontSize: 15, color: '#544245' },
    pricingOriginal: { fontSize: 15, color: '#544245', textDecorationLine: 'line-through' },
    pricingHighlight: {
        backgroundColor: '#fff7f9',
        borderRadius: 12,
        padding: 12,
        marginHorizontal: -4,
    },
    pricingPackageLabel: { fontSize: 17, fontWeight: 'bold', color: '#221920' },
    pricingPackageValue: { fontSize: 22, fontWeight: '900', color: '#963b52' },
    savingsRow: { backgroundColor: '#dcfce7', borderRadius: 12, padding: 12, marginHorizontal: -4 },
    savingsLabel: { fontSize: 14, fontWeight: '600', color: '#16a34a' },
    savingsValue: { fontSize: 15, fontWeight: 'bold', color: '#16a34a' },
    validityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#fbe9f3',
        borderRadius: 14,
        padding: 14,
    },
    validityText: { fontSize: 14, fontWeight: '600', color: '#963b52' },
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
    salonLabel: { fontSize: 12, color: '#544245', fontWeight: '500', marginBottom: 4 },
    salonName: { fontSize: 18, fontWeight: 'bold', color: '#221920', marginBottom: 8 },
    salonMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    salonCity: { fontSize: 13, color: '#544245' },
    salonRating: { fontSize: 13, fontWeight: '600', color: '#7b5804' },
    bottomBar: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(251,233,243,0.97)',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        borderTopWidth: 1,
        borderTopColor: '#efdee8',
        gap: 12,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceLabel: { fontSize: 13, color: '#544245' },
    priceValue: { fontSize: 22, fontWeight: 'bold', color: '#963b52' },
    bookBtn: { borderRadius: 32, overflow: 'hidden' },
    bookGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 10,
    },
    bookBtnText: { fontSize: 17, fontWeight: 'bold', color: '#ffffff' },
});
