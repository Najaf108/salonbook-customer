// app/(app)/(home)/services.jsx
import { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, Platform, StatusBar
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useBookingStore } from '@/stores/useBookingStore';
import { useSalonServices } from '@/hooks/useSalons';
import LoadingSpinner from '@/components/LoadingSpinner';
import { CATEGORIES } from '@/constants/categories';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ServicesScreen() {
    const { salon, selectedServices, toggleService, getTotalPrice, getTotalDuration, appliedDeal } = useBookingStore();
    const [activeCategory, setActiveCategory] = useState('ALL');
    const { data: services, isLoading } = useSalonServices(salon?.id);

    // If the deal restricts to specific services, filter to only those
    const dealServiceIds = appliedDeal?.applicableServices?.length > 0
        ? appliedDeal.applicableServices
        : null;

    const filtered = dealServiceIds
        ? services?.filter(s => dealServiceIds.includes(s.id))
        : (activeCategory === 'ALL'
            ? services
            : services?.filter(s => s.category === activeCategory));

    const totalPrice = getTotalPrice();
    const totalDuration = getTotalDuration();

    const renderServiceCard = ({ item, index }) => {
        const isSelected = selectedServices.some(s => s.id === item.id);
        return (
            <TouchableOpacity
                style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
                onPress={() => toggleService(item)}
                activeOpacity={0.8}
            >
                <View style={styles.serviceLeft}>
                    <View style={[styles.serviceIconWrap, isSelected && styles.serviceIconWrapSelected]}>
                        <MaterialIcons
                            name={index % 3 === 0 ? "face-retouching-natural" : index % 3 === 1 ? "content-cut" : "spa"}
                            size={28} color={isSelected ? "#ffffff" : "#963b52"}
                        />
                    </View>
                    <View style={styles.serviceInfoRow}>
                        <Text style={[styles.serviceName, isSelected && styles.serviceSelectedText]} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.serviceDur}>{item.duration} mins</Text>
                        <Text style={styles.servicePrice}>PKR {item.price?.toLocaleString()}</Text>
                    </View>
                </View>
                <View style={[styles.checkboxOutline, isSelected && styles.checkboxActive]}>
                    {isSelected && <MaterialIcons name="check" size={16} color="#ffffff" />}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                {/* Custom Header */}
                <View style={styles.appBar}>
                    <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
                        <MaterialIcons name="arrow-back" size={24} color="#963b52" />
                    </TouchableOpacity>
                    <Text style={styles.appTitle}>Select Services</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Deal Filter Banner */}
                {dealServiceIds && appliedDeal && (
                    <View style={styles.dealBanner}>
                        <MaterialIcons name="local-offer" size={16} color="#963b52" />
                        <Text style={styles.dealBannerText}>
                            Showing {filtered?.length ?? 0} service{filtered?.length !== 1 ? 's' : ''} eligible for
                            <Text style={styles.dealBannerBold}> {appliedDeal.title}</Text>
                        </Text>
                    </View>
                )}

                {/* Categories — hidden when deal filters services */}
                {!dealServiceIds && (
                    <View style={styles.categoriesWrapper}>
                        <ScrollView
                            horizontal showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoryContent}
                        >
                            {CATEGORIES.map(cat => {
                                const isActive = activeCategory === cat.id;
                                return (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[styles.chip, isActive && styles.chipActive]}
                                        onPress={() => setActiveCategory(cat.id)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                                            {cat.emoji && cat.id !== 'ALL' ? cat.emoji + ' ' : ''}{cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* Services List */}
                <View style={styles.listContainer}>
                    {isLoading ? <LoadingSpinner full /> : (
                        <FlatList
                            data={filtered}
                            keyExtractor={i => i.id}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            renderItem={renderServiceCard}
                        />
                    )}
                </View>

                {/* Bottom Summary Floating */}
                {selectedServices.length > 0 && (
                    <View style={styles.bottomBarWrapper}>
                        <View style={styles.bottomBarInner}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.summaryLabel}>
                                    {selectedServices.length} Selected • {totalDuration} min
                                </Text>
                                <Text style={styles.summaryPrice}>PKR {totalPrice.toLocaleString()}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => router.push('/(app)/(home)/staff')}
                                activeOpacity={0.9}
                            >
                                <LinearGradient colors={['#963b52', '#b5536a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.nextBtn}>
                                    <Text style={styles.nextBtnText}>Continue</Text>
                                    <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff7f9',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff7f9',
    },
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 16,
        paddingBottom: 24,
        backgroundColor: 'transparent',
    },
    appTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#221920',
        letterSpacing: -0.5,
    },
    categoriesWrapper: {
        marginBottom: 16,
    },
    categoryContent: {
        paddingHorizontal: 24,
        gap: 8,
    },
    chip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: '#fbe9f3',
    },
    chipActive: {
        backgroundColor: '#963b52',
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#544245',
    },
    chipTextActive: {
        color: '#ffffff',
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 140, // Space for floating bottom bar
        gap: 16,
    },
    serviceCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 1,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    serviceCardSelected: {
        borderColor: '#963b52',
        backgroundColor: '#fffcfd',
    },
    serviceLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    serviceIconWrap: {
        width: 56, height: 56,
        borderRadius: 12,
        backgroundColor: '#ffd9de',
        alignItems: 'center',
        justifyContent: 'center',
    },
    serviceIconWrapSelected: {
        backgroundColor: '#963b52',
    },
    serviceInfoRow: {
        flex: 1,
        paddingRight: 16,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#221920',
        marginBottom: 4,
    },
    serviceSelectedText: {
        color: '#963b52',
    },
    serviceDur: {
        fontSize: 13,
        color: '#544245',
        marginBottom: 4,
    },
    servicePrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#963b52',
    },
    checkboxOutline: {
        width: 28, height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#efdee8',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
    },
    checkboxActive: {
        backgroundColor: '#963b52',
        borderColor: '#963b52',
    },
    bottomBarWrapper: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(251, 233, 243, 0.95)',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
    },
    bottomBarInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    summaryLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#544245',
    },
    summaryPrice: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#963b52',
    },
    nextBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 32,
        gap: 8,
    },
    nextBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    dealBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fce8ef',
        paddingHorizontal: 24,
        paddingVertical: 12,
        marginBottom: 16,
        gap: 8,
    },
    dealBannerText: {
        fontSize: 14,
        color: '#963b52',
        flex: 1,
    },
    dealBannerBold: {
        fontWeight: 'bold',
    },
});
