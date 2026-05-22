// app/(app)/(search)/index.jsx
import { useState, useCallback, useMemo } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, FlatList, StyleSheet, ActivityIndicator, Platform, SafeAreaView, StatusBar
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSearchSalons } from '@/hooks/useSalons';
import { useBookingStore } from '@/stores/useBookingStore';
import EmptyState from '@/components/EmptyState';
import SalonCard from '@/components/SalonCard';
import { useDebounce } from '@/hooks/useDebounce';
import { CATEGORIES } from '@/constants/categories';
import { CITIES } from '@/constants/cities';

const GENDERS = [
    { id: null, label: 'All Gender' },
    { id: 'MALE', label: 'Men' },
    { id: 'FEMALE', label: 'Women' },
    { id: 'UNISEX', label: 'Unisex' },
];
const RATINGS = [4.5, 4.0, 3.5, 3.0];

const SearchHeader = ({
    query,
    setQuery,
    showFilters,
    handleToggleFilters,
    tempCity,
    setTempCity,
    tempGender,
    setTempGender,
    tempCategory,
    setTempCategory,
    tempRating,
    setTempRating,
    handleApplyFilters,
    isLoading,
    salonsCount
}) => (
    <>
        <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Explore Salons</Text>
            <Text style={styles.headerSubtitle}>Find your next beauty destination.</Text>
        </View>

        <View style={styles.searchBarWrapper}>
            <MaterialIcons name="search" size={24} color="#877275" style={styles.searchIcon} />
            <TextInput
                style={styles.searchInput}
                placeholder="Search salons, services, stylists..."
                placeholderTextColor="#544245"
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
            />
            {query ? (
                <TouchableOpacity style={styles.tuneBtn} onPress={() => setQuery('')}>
                    <MaterialIcons name="close" size={20} color="#963b52" />
                </TouchableOpacity>
            ) : null}
            <View style={styles.tuneBtnContainer}>
                <TouchableOpacity
                    style={[styles.tuneBtnInner, showFilters && styles.tuneBtnActive]}
                    onPress={handleToggleFilters}
                >
                    <MaterialIcons name="tune" size={20} color={showFilters ? "#ffffff" : "#963b52"} />
                </TouchableOpacity>
            </View>
        </View>

        {showFilters && (
            <View style={styles.filtersContainer}>
                <Text style={styles.filterGroupTitle}>Select City</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                    {CITIES.map(city => {
                        const isActive = tempCity === city;
                        return (
                            <TouchableOpacity
                                key={city}
                                style={[styles.chip, isActive && styles.chipActive]}
                                onPress={() => setTempCity(isActive ? null : city)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{city}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <Text style={styles.filterGroupTitle}>Gender</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                    {GENDERS.filter(g => g.id !== null).map(g => {
                        const isActive = tempGender === g.id;
                        return (
                            <TouchableOpacity
                                key={String(g.id)}
                                style={[styles.chip, isActive && styles.chipActive]}
                                onPress={() => setTempGender(isActive ? null : g.id)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{g.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <Text style={styles.filterGroupTitle}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                    {CATEGORIES.slice(1).map(cat => {
                        const isActive = tempCategory === cat.id;
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                style={[styles.chip, isActive && styles.chipActive]}
                                onPress={() => setTempCategory(isActive ? null : cat.id)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <Text style={styles.filterGroupTitle}>Minimum Rating</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                    {RATINGS.map(rating => {
                        const isActive = tempRating === rating;
                        return (
                            <TouchableOpacity
                                key={rating}
                                style={[styles.chip, isActive && styles.chipActive]}
                                onPress={() => setTempRating(isActive ? null : rating)}
                                activeOpacity={0.8}
                            >
                                <MaterialIcons
                                    name="star"
                                    size={16}
                                    color={isActive ? "#ffffff" : "#ffb800"}
                                    style={{ marginRight: 4 }}
                                />
                                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                                    {rating}+
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <TouchableOpacity style={styles.applyBtn} onPress={handleApplyFilters}>
                    <Text style={styles.applyBtnText}>Apply Filters</Text>
                </TouchableOpacity>
            </View>
        )}

        <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
                {isLoading ? 'SEARCHING...' : `${salonsCount} SALON${salonsCount !== 1 ? 'S' : ''} FOUND`}
            </Text>
        </View>
    </>
);

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 500);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedGender, setSelectedGender] = useState(null);
    const [selectedRating, setSelectedRating] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [tempCity, setTempCity] = useState(null);
    const [tempCategory, setTempCategory] = useState(null);
    const [tempGender, setTempGender] = useState(null);
    const [tempRating, setTempRating] = useState(null);

    const setSalon = useBookingStore(s => s.setSalon);

    const handleApplyFilters = () => {
        setSelectedCity(tempCity);
        setSelectedCategory(tempCategory);
        setSelectedGender(tempGender);
        setSelectedRating(tempRating);
        setShowFilters(false);
    };

    const handleToggleFilters = useCallback(() => {
        if (!showFilters) {
            setTempCity(selectedCity);
            setTempCategory(selectedCategory);
            setTempGender(selectedGender);
            setTempRating(selectedRating);
        }
        setShowFilters(!showFilters);
    }, [showFilters, selectedCity, selectedCategory, selectedGender, selectedRating]);

    const params = useMemo(() => ({
        query: debouncedQuery,
        city: selectedCity,
        category: selectedCategory,
        gender: selectedGender,
        minRating: selectedRating
    }), [debouncedQuery, selectedCity, selectedCategory, selectedGender, selectedRating]);

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useSearchSalons(params);

    const salons = data?.pages?.flatMap(p => p.salons) ?? [];

    const handleSalon = (salon) => {
        setSalon(salon);
        router.push(`/(app)/(home)/salon/${salon.id}`);
    };

    const renderSalonItem = useCallback(({ item: salon }) => (
        <View style={{ marginBottom: 24 }}>
            <SalonCard
                salon={salon}
                onPress={() => handleSalon(salon)}
            />
        </View>
    ), [handleSalon]);

    const renderFooter = () => {
        if (isLoading) return <ActivityIndicator size="large" color="#963b52" style={{ marginTop: 40 }} />;
        if (hasNextPage) {
            return (
                <TouchableOpacity
                    style={styles.loadMoreContainer}
                    onPress={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                >
                    {isFetchingNextPage ? (
                        <ActivityIndicator size="small" color="#963b52" />
                    ) : (
                        <Text style={styles.loadMoreBtnText}>Load more →</Text>
                    )}
                </TouchableOpacity>
            );
        }
        if (salons.length > 0) {
            return (
                <View style={styles.endOfResults}>
                    <MaterialIcons name="check-circle" size={32} color="#797174" style={styles.endIcon} />
                    <Text style={styles.endText}>You've reached the end of the list.</Text>
                </View>
            );
        }
        return null;
    };

    const renderEmpty = () => {
        if (isLoading) return null;
        return <EmptyState emoji="🔍" title="No salons found" subtitle="Try different search terms or filters" />;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* TopAppBar */}
                <View style={styles.appBar}>
                    <TouchableOpacity
                        onPress={() => router.canGoBack() ? router.back() : router.replace('/(app)/(home)')}
                        activeOpacity={0.8}
                        style={styles.backBtn}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#963b52" />
                    </TouchableOpacity>
                    <Text style={styles.appTitle}>SalonBook</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <FlatList
                    data={salons}
                    keyExtractor={item => item.id}
                    style={styles.mainScroll}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    renderItem={renderSalonItem}
                    ListHeaderComponent={
                        <SearchHeader
                            query={query}
                            setQuery={setQuery}
                            showFilters={showFilters}
                            handleToggleFilters={handleToggleFilters}
                            tempCity={tempCity}
                            setTempCity={setTempCity}
                            tempGender={tempGender}
                            setTempGender={setTempGender}
                            tempCategory={tempCategory}
                            setTempCategory={setTempCategory}
                            tempRating={tempRating}
                            setTempRating={setTempRating}
                            handleApplyFilters={handleApplyFilters}
                            isLoading={isLoading}
                            salonsCount={salons.length}
                        />
                    }
                    ListEmptyComponent={renderEmpty}
                    ListFooterComponent={renderFooter}
                    initialNumToRender={5}
                    windowSize={11}
                    maxToRenderPerBatch={10}
                />
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
        paddingBottom: 16,
        backgroundColor: 'transparent',
    },
    backBtn: {
        width: 32,
        alignItems: 'flex-start',
    },
    appTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#963b52',
        letterSpacing: -0.5,
    },
    headerSpacer: {
        width: 32,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingBottom: 16,
        gap: 16,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: '#fbe9f3',
    },
    activeTab: {
        backgroundColor: '#963b52',
    },
    tabText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#963b52',
    },
    activeTabText: {
        color: '#ffffff',
    },
    mainScroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 40,
    },
    headerSection: {
        marginBottom: 32,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#221920',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#544245',
    },
    searchBarWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fbe9f3',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(218, 192, 195, 0.2)',
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#221920',
        paddingVertical: 4,
    },
    tuneBtnContainer: {
        paddingLeft: 12,
    },
    tuneBtnInner: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'transparent',
    },
    tuneBtnActive: {
        backgroundColor: '#963b52',
    },
    filterGroupTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#221920',
        marginBottom: 8,
        marginTop: 12,
    },
    applyBtn: {
        backgroundColor: '#963b52',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 12,
    },
    applyBtnText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    tuneBtn: {
        padding: 4,
    },
    filtersContainer: {
        marginBottom: 24,
        marginHorizontal: -24,
        paddingHorizontal: 24,
    },
    filterRow: {
        gap: 12,
        paddingRight: 24,
        marginBottom: 12,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#fbe9f3',
    },
    chipActive: {
        backgroundColor: '#963b52',
        shadowColor: '#963b52',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 4,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#221920',
    },
    chipTextActive: {
        color: '#ffffff',
    },
    chipIcon: {
        marginLeft: 8,
    },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    resultsCount: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#544245',
        letterSpacing: 1,
    },
    mapBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    mapBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#963b52',
    },
    resultsList: {
        gap: 24,
    },
    loadMoreContainer: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    loadMoreBtnText: {
        color: '#963b52',
        fontWeight: 'bold',
        fontSize: 14,
    },
    endOfResults: {
        alignItems: 'center',
        marginTop: 48,
        marginBottom: 32,
    },
    endIcon: {
        marginBottom: 8,
    },
    endText: {
        fontSize: 14,
        color: '#544245',
    },
});
