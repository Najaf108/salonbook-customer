// app/(app)/(home)/brand/[slug].jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { brandService } from '@/services/organization.service';
import BranchListItem from '@/components/BranchListItem';

const COLORS = {
    primary: '#005445',
    background: '#f8fafc',
    verified: '#059669',
};

export default function BrandProfileScreen() {
    const { slug } = useLocalSearchParams();
    const [selectedCity, setSelectedCity] = useState('All');

    const { data: brand, isLoading } = useQuery({
        queryKey: ['brand-profile', slug],
        queryFn: () => brandService.getBrandProfile(slug)
    });

    const { data: branches, isLoading: branchesLoading } = useQuery({
        queryKey: ['brand-branches', slug],
        queryFn: () => brandService.getBrandBranches(slug)
    });

    if (isLoading) return <View style={styles.loading}><ActivityIndicator color={COLORS.primary} /></View>;

    const filteredBranches = selectedCity === 'All'
        ? branches
        : branches?.filter(b => b.city === selectedCity);

    const cities = ['All', ...(brand?.branchCities || [])];

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView stickyHeaderIndices={[2]} showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Image
                        source={{ uri: brand?.coverImage || 'https://via.placeholder.com/800x400' }}
                        style={styles.cover}
                    />
                    <View style={styles.headerOverlay}>
                        <View style={styles.logoWrap}>
                            <Image source={{ uri: brand?.logo }} style={styles.logo} />
                        </View>
                        <View style={styles.identity}>
                            <View style={styles.titleRow}>
                                <Text style={styles.brandName}>{brand?.name}</Text>
                                <View style={styles.verifiedBadge}>
                                    <MaterialIcons name="verified" size={14} color="#fff" />
                                    <Text style={styles.verifiedText}>Verified Brand</Text>
                                </View>
                            </View>
                            <View style={styles.statsSummary}>
                                <MaterialIcons name="star" size={16} color="#fbbf24" />
                                <Text style={styles.statsText}>
                                    {brand?.avgRating?.toFixed(1)} ({brand?.totalReviews} reviews across {brand?.totalBranches} branches)
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.descriptionRow}>
                    <Text style={styles.description}>{brand?.description}</Text>
                </View>

                {/* Filter Bar */}
                <View style={styles.filterBar}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                        {cities.map(city => (
                            <TouchableOpacity
                                key={city}
                                style={[styles.cityTab, selectedCity === city && styles.activeCityTab]}
                                onPress={() => setSelectedCity(city)}
                            >
                                <Text style={[styles.cityTabText, selectedCity === city && styles.activeCityTabText]}>{city}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>Our Locations</Text>
                    {branchesLoading ? <ActivityIndicator color={COLORS.primary} /> : (
                        filteredBranches?.map(branch => (
                            <BranchListItem key={branch.id} branch={branch} />
                        ))
                    )}

                    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Popular Services</Text>
                    <View style={styles.servicesGrid}>
                        {/* Mocked/Derived services that are available at multiple branches */}
                        <ServiceCard name="Signature Haircut" price="1,500" branches={brand?.totalBranches} />
                        <ServiceCard name="Beard Grooming" price="800" branches={brand?.totalBranches - 1} />
                        <ServiceCard name="Facial Treatment" price="2,500" branches={brand?.totalBranches} />
                    </View>

                    <View style={styles.reviewsHeader}>
                        <Text style={styles.sectionTitle}>Brand Reviews</Text>
                        <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
                    </View>
                    {/* Reviews summary or preview */}
                </View>
            </ScrollView>

            {/* Floating Back Button */}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

function ServiceCard({ name, price, branches }) {
    return (
        <View style={styles.serviceCard}>
            <Text style={styles.serviceName}>{name}</Text>
            <Text style={styles.servicePrice}>from Rs. {price}</Text>
            <View style={styles.serviceBadge}>
                <Text style={styles.serviceBadgeText}>Available at {branches} branches</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { height: 280 },
    cover: { width: '100%', height: 200 },
    headerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'flex-end'
    },
    logoWrap: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#fff',
        borderWidth: 4,
        borderColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    logo: { width: '100%', height: '100%', borderRadius: 45 },
    identity: { marginLeft: 16, marginBottom: 10, flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
    brandName: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.verified,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        gap: 4
    },
    verifiedText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    statsSummary: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
    statsText: { fontSize: 13, color: '#666' },
    descriptionRow: { padding: 20, paddingTop: 10 },
    description: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
    filterBar: { backgroundColor: '#fff', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    filterScroll: { paddingHorizontal: 20, gap: 10 },
    cityTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9' },
    activeCityTab: { backgroundColor: COLORS.primary },
    cityTabText: { fontSize: 13, color: '#64748b', fontWeight: '500' },
    activeCityTabText: { color: '#fff', fontWeight: 'bold' },
    content: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 16 },
    servicesGrid: { gap: 12 },
    serviceCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9' },
    serviceName: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a' },
    servicePrice: { fontSize: 13, color: COLORS.primary, marginTop: 4, fontWeight: '600' },
    serviceBadge: { marginTop: 8, backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
    serviceBadgeText: { fontSize: 10, color: COLORS.verified, fontWeight: 'bold' },
    reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, marginBottom: 16 },
    viewAll: { color: COLORS.primary, fontWeight: 'bold', fontSize: 13 },
    backBtn: { position: 'absolute', top: 50, left: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }
});
