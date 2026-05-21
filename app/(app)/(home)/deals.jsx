// app/(app)/(home)/deals.jsx
import { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, RefreshControl, SafeAreaView, Platform, StatusBar, Alert,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFeaturedDeals, useSalonDeals, useApplyDeal } from '@/hooks/useDeals';
import { useLocation } from '@/hooks/useLocation';
import DealCard from '@/components/DealCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useBookingStore } from '@/stores/useBookingStore';
const FILTERS = [
    { id: 'ALL', label: 'All' },
    { id: 'EXPIRING', label: '⏳ Expiring Soon' },
    { id: 'HAIR', label: 'Hair' },
    { id: 'MAKEUP', label: 'Makeup' },
    { id: 'BRIDAL', label: 'Bridal' },
    { id: 'NAILS', label: 'Nails' },
    { id: 'SPA', label: 'Spa' },
];

export default function DealsScreen() {
    const { salonId } = useLocalSearchParams();
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [refreshing, setRefreshing] = useState(false);
    const [applyingId, setApplyingId] = useState(null);

    const {
        salon, selectedServices, getSubtotal, setAppliedDeal, getServiceIds
    } = useBookingStore();
    const applyDealMutation = useApplyDeal();

    const subtotal = getSubtotal ? getSubtotal() : 0;
    const serviceIds = getServiceIds ? getServiceIds() : [];

    const { city } = useLocation();
    // Fetch either specific salon deals or featured deals globally
    const featuredQuery = useFeaturedDeals(city);
    const salonQuery = useSalonDeals(salonId);

    const { data: deals, isLoading, refetch } = salonId ? salonQuery : featuredQuery;

    const headerTitle = salonId ? 'Available Deals' : 'Deals & Offers';

    const handleDealPress = async (deal) => {
        // 0. Check if already used (per user limit reached)
        if (deal.isUsed) {
            Alert.alert('Limit Reached', `You have already used this deal ${deal.perUserLimit} time(s).`);
            return;
        }

        // If not in a specific salon booking flow, OR IF THE DEAL IS USED, check before routing
        if (!salonId || salon?.id !== deal.salonId || deal.isUsed) {
            if (deal.isUsed) {
                Alert.alert('Limit Reached', `You have already used this deal ${deal.perUserLimit} time(s).`);
                return;
            }
            router.push(`/(app)/(home)/deal/${deal.id}`);
            return;
        }

        // Quick Apply Logic: Try to apply directly if in checkout flow
        setApplyingId(deal.id);
        try {
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

            // Success! Go back to checkout
            router.back();
        } catch (err) {
            const errorMsg = err.response?.data?.error || '';
            // If the error is about usage limits, show an alert and don't go to details
            if (errorMsg.includes('limit') || errorMsg.includes('use this deal')) {
                Alert.alert('Deal Unavailable', errorMsg);
            } else {
                // For other errors (like needing more services), go to details
                router.push(`/(app)/(home)/deal/${deal.id}`);
            }
        } finally {
            setApplyingId(null);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const filteredDeals = deals?.filter(deal => {
        if (activeFilter === 'ALL') return true;
        if (activeFilter === 'EXPIRING') return deal.isExpiringSoon;

        // 1. Match by category (or if it's a universal deal)
        const isUniversal = !deal.applicableServices || deal.applicableServices.length === 0;
        const matchesCategory = isUniversal || deal.applicableCategories?.includes(activeFilter);

        // 2. Match by title (for filters like BRIDAL which might not be a category)
        const matchesTitle = deal.title?.toLowerCase().includes(activeFilter.toLowerCase()) ||
            deal.description?.toLowerCase().includes(activeFilter.toLowerCase());

        return matchesCategory || matchesTitle;
    }) ?? [];

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
                        <MaterialIcons name="arrow-back" size={24} color="#963b52" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{headerTitle}</Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* Filter chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContent}
                    style={styles.filters}
                >
                    {FILTERS.map(f => (
                        <TouchableOpacity
                            key={f.id}
                            style={[styles.chip, activeFilter === f.id && styles.chipActive]}
                            onPress={() => setActiveFilter(f.id)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.chipText, activeFilter === f.id && styles.chipTextActive]}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Deals list */}
                {isLoading ? (
                    <View style={styles.loadingWrap}><LoadingSpinner /></View>
                ) : (
                    <ScrollView
                        style={styles.list}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#963b52" />
                        }
                    >
                        {filteredDeals.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyEmoji}>🎉</Text>
                                <Text style={styles.emptyTitle}>No active deals right now</Text>
                                <Text style={styles.emptySub}>Check back soon! New deals are added often.</Text>
                            </View>
                        ) : (
                            filteredDeals.map(deal => (
                                <DealCard
                                    key={deal.id}
                                    deal={deal}
                                    onPress={() => handleDealPress(deal)}
                                    isApplying={applyingId === deal.id}
                                    isEligible={!!salonId && (
                                        (!deal.minOrderAmount || subtotal >= deal.minOrderAmount) &&
                                        (deal.applicableServices?.length === 0 || serviceIds.some(id => deal.applicableServices.includes(id)))
                                    )}
                                />
                            ))
                        )}
                        <View style={{ height: 32 }} />
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff7f9' },
    container: { flex: 1, backgroundColor: '#fff7f9' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 12,
        paddingBottom: 16,
    },
    backBtn: {
        width: 44, height: 44,
        borderRadius: 22,
        backgroundColor: '#fbe9f3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#221920',
        letterSpacing: -0.5,
    },
    filters: {
        flexGrow: 0,
        marginBottom: 8,
    },
    filtersContent: {
        gap: 10,
        paddingHorizontal: 24,
        paddingBottom: 8,
    },
    chip: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: '#fbe9f3',
    },
    chipActive: {
        backgroundColor: '#963b52',
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#221920',
    },
    chipTextActive: {
        color: '#ffffff',
    },
    loadingWrap: { flex: 1, justifyContent: 'center' },
    list: { flex: 1 },
    listContent: {
        paddingHorizontal: 24,
        paddingTop: 12,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 80,
        gap: 12,
    },
    emptyEmoji: { fontSize: 56 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#221920' },
    emptySub: { fontSize: 15, color: '#544245', textAlign: 'center' },
});
