// app/(app)/(home)/index.jsx
import { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, TextInput, TouchableOpacity,
    FlatList, RefreshControl, StyleSheet, Platform, SafeAreaView, StatusBar
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Modal } from 'react-native';
import { useLocation } from '@/hooks/useLocation';
import { useLocationStore } from '@/stores/useLocationStore';
import { CITIES } from '@/constants/cities';
import { useNearbySalons, useSalonsByCity } from '@/hooks/useSalons';
import { useFeaturedDeals } from '@/hooks/useDeals';
import { useFeaturedPackages } from '@/hooks/usePackages';
import { useBookingStore } from '@/stores/useBookingStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUnreadCount } from '@/hooks/useNotifications';
import { useUnreadMessageCount } from '@/hooks/useMessages';
import Badge from '@/components/Badge';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import DealCard from '@/components/DealCard';
import PackageCard from '@/components/PackageCard';
import SalonCard from '@/components/SalonCard';
import { CATEGORIES } from '@/constants/categories';

export default function HomeScreen() {
    const { user } = useAuthStore();
    const { location, city, loading: locLoading } = useLocation();
    const { setCity } = useLocationStore();
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [refreshing, setRefreshing] = useState(false);
    const [showCityModal, setShowCityModal] = useState(false);
    const setSalon = useBookingStore(s => s.setSalon);

    const { data: unreadData } = useUnreadCount();
    const { data: unreadMessagesData } = useUnreadMessageCount();
    const unreadCount = unreadData?.count || 0;

    const coords = location ? { lat: location.latitude, lng: location.longitude } : null;
    const catFilter = selectedCategory !== 'ALL' ? selectedCategory : undefined;

    const { data: citySalons, isLoading: cityLoading, refetch: refetchCity } = useSalonsByCity(city, catFilter);
    const { data: nearbySalons, isLoading: nearbyLoading, refetch: refetchNearby } = useNearbySalons(coords, catFilter ? { category: catFilter } : {});
    const { data: featuredDeals, refetch: refetchDeals } = useFeaturedDeals(city);
    const { data: featuredPackages, refetch: refetchPackages } = useFeaturedPackages(city);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([refetchCity(), refetchNearby(), refetchDeals(), refetchPackages()]);
        setRefreshing(false);
    }, [refetchCity, refetchNearby, refetchDeals, refetchPackages]);

    const handleSalonPress = useCallback((salon) => {
        setSalon(salon);
        router.push(`/(app)/(home)/salon/${salon.id}`);
    }, [setSalon]);

    const renderSalonItem = useCallback(({ item: salon }) => (
        <SalonCard
            salon={salon}
            style={{ width: 280 }}
            onPress={() => handleSalonPress(salon)}
        />
    ), [handleSalonPress]);

    const renderDealItem = useCallback(({ item: deal }) => (
        <DealCard
            deal={deal}
            horizontal
            onPress={() => router.push(`/(app)/(home)/deal/${deal.id}`)}
        />
    ), []);

    const renderPackageItem = useCallback(({ item: pkg }) => (
        <View style={{ width: 300 }}>
            <PackageCard
                pkg={pkg}
                onPress={() => router.push(`/(app)/(home)/package/${pkg.id}`)}
            />
        </View>
    ), []);

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* TopAppBar */}
                <View style={styles.appBar}>
                    <View style={styles.appBarLeft}>
                        <Text style={styles.appTitle}>SalonBook</Text>
                    </View>
                    <View style={styles.appBarRight}>
                        <TouchableOpacity
                            style={styles.locationBadge}
                            onPress={() => setShowCityModal(true)}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name="location-on" size={14} color="#3f0016" />
                            <Text style={styles.locationText}>{locLoading ? 'Locating...' : city || 'Location'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.bellBtn}
                            onPress={() => router.push('/(app)/(profile)/notifications')}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name="notifications-none" size={26} color="#221920" />
                            {unreadCount > 0 && (
                                <View style={styles.badgePos}>
                                    <Badge count={unreadCount} size="small" />
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.bellBtn}
                            onPress={() => router.push('/(app)/(chat)/list')}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name="chat-bubble-outline" size={24} color="#221920" />
                            {unreadMessagesData?.count > 0 && (
                                <View style={styles.badgePos}>
                                    <Badge count={unreadMessagesData.count} size="small" />
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    style={styles.mainScroll}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#963b52" />}
                >
                    <View style={styles.paddingContainer}>
                        {/* Header Section */}
                        <View style={styles.headerSection}>
                            <View style={styles.userInfoRow}>
                                <View style={styles.avatarContainer}>
                                    <Image
                                        source={{ uri: user?.profilePhoto || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' }}
                                        style={styles.avatar}
                                        contentFit="cover"
                                    />
                                </View>
                                <View>
                                    <Text style={styles.greetingText}>{greeting()}</Text>
                                    <Text style={styles.userNameText}>Salaam, {user?.name?.split(' ')[0] || 'Guest'}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Search Bar */}
                        {/* <View style={styles.searchSection}>
                            <TouchableOpacity
                                style={styles.searchInputContainer}
                                onPress={() => router.push('/(app)/(search)')}
                                activeOpacity={0.8}
                            >
                                <MaterialIcons name="search" size={22} color="#544245" style={styles.searchIcon} />
                                <Text style={styles.searchPlaceholder}>Search for salons, services...</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.filterBtn} onPress={() => router.push('/(app)/(search)')}>
                                <MaterialIcons name="tune" size={24} color="#ffffff" />
                            </TouchableOpacity>
                        </View> */}

                        {/* Category Chips */}
                        <View style={styles.categoriesSection}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.categoriesContent}
                            >
                                {CATEGORIES.map(cat => {
                                    const isSelected = selectedCategory === cat.id;
                                    return (
                                        <TouchableOpacity
                                            key={cat.id}
                                            style={[styles.chip, isSelected && styles.chipActive]}
                                            onPress={() => setSelectedCategory(cat.id)}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                                                {cat.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        {/* Featured Salons (By City) */}
                        <View style={styles.featuredSection}>
                            <View style={styles.featuredHeader}>
                                <Text style={styles.featuredTitle}>
                                    Salons in {city || 'your city'}
                                </Text>
                                <TouchableOpacity onPress={() => router.push('/(app)/(search)')} style={styles.seeAllBtn}>
                                    <Text style={styles.seeAllText}>See All</Text>
                                    <MaterialIcons name="arrow-forward" size={16} color="#963b52" />
                                </TouchableOpacity>
                            </View>

                            {cityLoading || locLoading ? (
                                <View style={{ height: 200, justifyContent: 'center' }}><LoadingSpinner /></View>
                            ) : !citySalons?.length ? (
                                <EmptyState
                                    emoji="💅"
                                    title={`No salons in ${city || 'your city'}`}
                                    subtitle="We haven't launched in this city yet!"
                                />
                            ) : (
                                <FlatList
                                    data={citySalons}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.salonsScroller}
                                    keyExtractor={item => item.id}
                                    renderItem={renderSalonItem}
                                    initialNumToRender={3}
                                    windowSize={5}
                                />
                            )}
                        </View>

                        {/* Deals & Offers */}
                        {featuredDeals?.length > 0 && (
                            <View style={[styles.featuredSection, { marginTop: 8 }]}>
                                <View style={styles.featuredHeader}>
                                    <Text style={styles.featuredTitle}>Deals & Offers</Text>
                                    <TouchableOpacity onPress={() => router.push('/(app)/(home)/deals')} style={styles.seeAllBtn}>
                                        <Text style={styles.seeAllText}>See All</Text>
                                        <MaterialIcons name="arrow-forward" size={16} color="#963b52" />
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={featuredDeals.slice(0, 4)}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.salonsScroller}
                                    keyExtractor={item => item.id}
                                    renderItem={renderDealItem}
                                    initialNumToRender={2}
                                />
                            </View>
                        )}

                        {/* Service Packages */}
                        {featuredPackages?.length > 0 && (
                            <View style={[styles.featuredSection, { marginTop: 8 }]}>
                                <View style={styles.featuredHeader}>
                                    <Text style={styles.featuredTitle}>Packages</Text>
                                    <TouchableOpacity onPress={() => router.push('/(app)/(home)/packages')} style={styles.seeAllBtn}>
                                        <Text style={styles.seeAllText}>See All</Text>
                                        <MaterialIcons name="arrow-forward" size={16} color="#963b52" />
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={featuredPackages.slice(0, 7)}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.salonsScroller}
                                    keyExtractor={item => item.id}
                                    renderItem={renderPackageItem}
                                    initialNumToRender={2}
                                />
                            </View>
                        )}

                        {/* Nearby Salons */}
                        <View style={[styles.featuredSection, { marginTop: 8 }]}>
                            <View style={styles.featuredHeader}>
                                <Text style={styles.featuredTitle}>Nearby Salons</Text>
                            </View>

                            {nearbyLoading ? (
                                <View style={{ height: 200, justifyContent: 'center' }}><LoadingSpinner /></View>
                            ) : !nearbySalons?.length ? (
                                <EmptyState
                                    emoji="📍"
                                    title="No nearby salons"
                                    subtitle="Try another category or area."
                                />
                            ) : (
                                <FlatList
                                    data={nearbySalons}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.salonsScroller}
                                    keyExtractor={item => item.id}
                                    renderItem={renderSalonItem}
                                    initialNumToRender={3}
                                    windowSize={5}
                                />
                            )}
                        </View>
                    </View>
                </ScrollView>
            </View>

            {/* City Selection Modal */}
            <Modal
                visible={showCityModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCityModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Your City</Text>
                            <TouchableOpacity onPress={() => setShowCityModal(false)}>
                                <MaterialIcons name="close" size={24} color="#221920" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={CITIES}
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.cityItem, city === item && styles.cityItemActive]}
                                    onPress={() => {
                                        setCity(item);
                                        setShowCityModal(false);
                                    }}
                                >
                                    <Text style={[styles.cityItemText, city === item && styles.cityItemTextActive]}>
                                        {item}
                                    </Text>
                                    {city === item && (
                                        <MaterialIcons name="check-circle" size={20} color="#963b52" />
                                    )}
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={styles.cityList}
                        />
                    </View>
                </View>
            </Modal>
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
        paddingBottom: 16,
        backgroundColor: 'transparent',
    },
    appBarLeft: {
        flex: 1,
    },
    appBarRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    bellBtn: {
        padding: 4,
        position: 'relative',
    },
    badgePos: {
        position: 'absolute',
        top: -2,
        right: -2,
    },
    appTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#963b52',
        letterSpacing: -0.5,
    },
    mainScroll: {
        flex: 1,
    },
    paddingContainer: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 40,
    },
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    userInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#efdee8',
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    greetingText: {
        fontSize: 14,
        color: '#544245',
        fontWeight: '500',
    },
    userNameText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#221920',
        letterSpacing: -0.5,
        marginTop: 2,
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffd9de',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 4,
    },
    locationText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#3f0016',
    },
    searchSection: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 32,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fbe9f3',
        borderRadius: 28,
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchPlaceholder: {
        fontSize: 16,
        color: '#544245',
    },
    filterBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#b5536a',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    categoriesSection: {
        marginBottom: 40,
    },
    categoriesContent: {
        gap: 12,
        paddingBottom: 8,
    },
    chip: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        backgroundColor: '#fbe9f3',
    },
    chipActive: {
        backgroundColor: '#963b52',
        shadowColor: '#963b52',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#221920',
    },
    chipTextActive: {
        color: '#ffffff',
    },
    featuredSection: {
        marginBottom: 40,
    },
    featuredHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    featuredTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#221920',
        letterSpacing: -0.5,
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingBottom: 2,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#963b52',
    },
    salonsScroller: {
        gap: 20,
        paddingBottom: 16,
        paddingTop: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(34, 25, 32, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        height: '60%',
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#221920',
    },
    cityList: {
        gap: 8,
    },
    cityItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#fff7f9',
    },
    cityItemActive: {
        backgroundColor: '#fbe9f3',
    },
    cityItemText: {
        fontSize: 16,
        color: '#544245',
        fontWeight: '500',
    },
    cityItemTextActive: {
        color: '#963b52',
        fontWeight: 'bold',
    },
});
