// app/(app)/(home)/packages.jsx
import { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, RefreshControl, SafeAreaView, Platform, StatusBar,
} from 'react-native';
import { router, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFeaturedPackages } from '@/hooks/usePackages';
import PackageCard from '@/components/PackageCard';
import LoadingSpinner from '@/components/LoadingSpinner';

const FILTERS = [
    { id: 'ALL', label: 'All' },
    { id: 'BRIDAL', label: '💍 Bridal' },
    { id: 'HAIR', label: 'Hair' },
    { id: 'SKIN', label: 'Skin' },
    { id: 'COMBO', label: 'Combo' },
];

export default function PackagesScreen() {
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [refreshing, setRefreshing] = useState(false);
    const { data: packages, isLoading, refetch } = useFeaturedPackages();

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    const filtered = packages?.filter(pkg => {
        if (activeFilter === 'ALL') return true;
        return pkg.name?.toLowerCase().includes(activeFilter.toLowerCase()) ||
            pkg.description?.toLowerCase().includes(activeFilter.toLowerCase());
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
                    <Text style={styles.headerTitle}>Service Packages</Text>
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

                {/* Packages list */}
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
                        {filtered.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyEmoji}>📦</Text>
                                <Text style={styles.emptyTitle}>No packages available</Text>
                                <Text style={styles.emptySub}>Salon packages will appear here when created.</Text>
                            </View>
                        ) : (
                            filtered.map(pkg => (
                                <PackageCard
                                    key={pkg.id}
                                    pkg={pkg}
                                    onPress={() => router.push(`/(app)/(home)/package/${pkg.id}`)}
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
    filters: { flexGrow: 0, marginBottom: 8 },
    filtersContent: { gap: 10, paddingHorizontal: 24, paddingBottom: 8 },
    chip: {
        paddingHorizontal: 18, paddingVertical: 10,
        borderRadius: 24, backgroundColor: '#fbe9f3',
    },
    chipActive: { backgroundColor: '#963b52' },
    chipText: { fontSize: 13, fontWeight: '600', color: '#221920' },
    chipTextActive: { color: '#ffffff' },
    loadingWrap: { flex: 1, justifyContent: 'center' },
    list: { flex: 1 },
    listContent: { paddingHorizontal: 24, paddingTop: 12 },
    emptyState: { alignItems: 'center', paddingVertical: 80, gap: 12 },
    emptyEmoji: { fontSize: 56 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#221920' },
    emptySub: { fontSize: 15, color: '#544245', textAlign: 'center' },
});
