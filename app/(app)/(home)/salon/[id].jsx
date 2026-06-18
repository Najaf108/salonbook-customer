// app/(app)/(home)/salon/[id].jsx
import { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, Linking, Dimensions, Platform, StatusBar, Alert
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { useSalonDetail, useSalonServices, useSalonStaff } from '@/hooks/useSalons';
import { salonService } from '@/services/salon.service';
import { useBookingStore } from '@/stores/useBookingStore';
import { useSalonDeals } from '@/hooks/useDeals';
import { useSalonPackages } from '@/hooks/usePackages';
import LoadingSpinner from '@/components/LoadingSpinner';
import DealCard from '@/components/DealCard';
import PackageCard from '@/components/PackageCard';
import DealBadge from '@/components/DealBadge';
import { LinearGradient } from 'expo-linear-gradient';
import { useSalonReviews, useSalonSummary } from '@/hooks/useReviews';
import RatingSummary from '@/components/RatingSummary';
import ReviewCard from '@/components/ReviewCard';
import SalonLogo from '@/components/SalonLogo';

const { width } = Dimensions.get('window');

export default function SalonDetailScreen() {
    const { id } = useLocalSearchParams();
    const { data: salon, isLoading: salonLoading } = useSalonDetail(id);
    const { data: services, isLoading: servicesLoading } = useSalonServices(id);
    const setSalon = useBookingStore(s => s.setSalon);
    const setAppliedDeal = useBookingStore(s => s.setAppliedDeal);
    const [activeTab, setActiveTab] = useState('services');

    const minPrice = services && services.length > 0
        ? Math.min(...services.map(s => s.price))
        : null;

    const { data: favoriteData, refetch: refetchFavorite } = useQuery({
        queryKey: ['favorite', id],
        queryFn: () => salonService.checkFavoriteStatus(id),
    });

    const handleToggleFavorite = async () => {
        try {
            await salonService.toggleFavorite(id);
            refetchFavorite();
        } catch (err) {
            Alert.alert('Error', 'Could not update favorites');
        }
    };

    if (salonLoading || servicesLoading) return <LoadingSpinner full />;
    if (!salon) return null;

    const handleBook = () => {
        setSalon(salon);
        router.push('/(app)/(home)/services');
    };

    const workingToday = () => {
        const day = new Date().getDay();
        const hours = salon.workingHours?.find(h => h.dayOfWeek === day);
        if (!hours || hours.isClosed) return 'Closed today';
        return `Open ${hours.openTime} – ${hours.closeTime}`;
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                {/* Custom Transparent Header */}
                <View style={styles.customHeader}>
                    <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()} activeOpacity={0.8}>
                        <MaterialIcons name="arrow-back" size={24} color="#963b52" />
                    </TouchableOpacity>
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={styles.headerBtn}
                            activeOpacity={0.8}
                            onPress={handleToggleFavorite}
                        >
                            <MaterialIcons
                                name={favoriteData?.favorited ? "favorite" : "favorite-border"}
                                size={24}
                                color={favoriteData?.favorited ? "#ba1a1a" : "#963b52"}
                            />
                        </TouchableOpacity>
                        {/* <TouchableOpacity style={styles.headerBtn} activeOpacity={0.8}>
                            <MaterialIcons name="ios-share" size={24} color="#963b52" />
                        </TouchableOpacity> */}
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                    {/* Hero Section */}
                    <View style={styles.heroSection}>
                        <Image
                            source={{ uri: salon.coverUrl || salon.photos?.[0] || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80' }}
                            style={styles.heroImage}
                            contentFit="cover"
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(255,247,249,0.4)', '#fff7f9']}
                            style={styles.heroGradient}
                        />
                    </View>

                    {/* Main Content Area */}
                    <View style={styles.mainContent}>
                        {/* Header Info Card */}
                        <View style={styles.infoCard}>
                            <View style={styles.logoWrapper}>
                                <SalonLogo
                                    uri={salon.logoUrl}
                                    name={salon.name}
                                    size={80} // Actual image size inside padding
                                    style={styles.logoImage}
                                />
                            </View>

                            {/* <View style={styles.badgeRow}>
                                <MaterialIcons name="home" size={16} color="#7d283f" />
                                <Text style={styles.badgeText}>Serves at Home</Text>
                            </View> */}

                            <Text style={styles.salonName}>{salon.name}</Text>
                            <Text style={styles.salonAddress}>{salon.address}, {salon.city}</Text>

                            <View style={styles.ratingRow}>
                                <MaterialIcons name="star" size={20} color="#7b5804" />
                                <Text style={styles.ratingValue}>{salon.avgRating?.toFixed(1) || '0.0'}</Text>
                                <Text style={styles.ratingCount}>({salon.totalReviews || 0} reviews)</Text>
                            </View>
                        </View>

                        {/* Aesthetic Divider Tabs */}
                        <View style={styles.tabRow}>
                            {['info', 'services', 'deals', 'reviews'].map(tab => (
                                <TouchableOpacity
                                    key={tab}
                                    style={[styles.tab, activeTab === tab && styles.tabActive]}
                                    onPress={() => setActiveTab(tab)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Tab Views */}
                        <View style={styles.tabContainer}>
                            {activeTab === 'info' && <InfoTab salon={salon} workingToday={workingToday} />}
                            {activeTab === 'services' && <ServicesTab services={services} salonId={id} />}
                            {activeTab === 'deals' && <DealsTab salonId={id} setSalon={() => setSalon(salon)} setAppliedDeal={setAppliedDeal} />}
                            {activeTab === 'reviews' && <ReviewsTab salonId={id} />}
                        </View>
                    </View>
                </ScrollView>

                {/* Sticky Bottom Bar */}
                {services && services.length > 0 && (
                    <View style={styles.bottomBarWrapper}>
                        <View style={styles.bottomBar}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.bottomLabel}>Starting From</Text>
                                <Text style={styles.bottomPrice}>PKR {minPrice?.toLocaleString() || salon.minPrice?.toLocaleString() || '1,500'}</Text>
                            </View>
                            <TouchableOpacity onPress={handleBook} activeOpacity={0.9}>
                                <LinearGradient colors={['#963b52', '#b5536a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bookGradient}>
                                    <Text style={styles.bookBtnText}>Book Appointment</Text>
                                    <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </>
    );
}

function InfoTab({ salon, workingToday }) {
    const { data: staff, isLoading } = useSalonStaff(salon.id);

    return (
        <View style={styles.infoTabWrapper}>
            {/* Quick Actions Restyled */}
            {/* <View style={styles.quickActions}>
                <TouchableOpacity style={styles.quickBtn} onPress={() => Linking.openURL(`tel:${salon.phone}`)}>
                    <View style={styles.quickIcon}><MaterialIcons name="call" size={20} color="#963b52" /></View>
                    <Text style={styles.quickText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickBtn} onPress={() => Linking.openURL(`https://maps.google.com/?q=${salon.latitude},${salon.longitude}`)}>
                    <View style={styles.quickIcon}><MaterialIcons name="directions" size={20} color="#963b52" /></View>
                    <Text style={styles.quickText}>Direction</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickBtn} onPress={() => Linking.openURL(`https://wa.me/92${salon.phone?.slice(1)}`)}>
                    <View style={styles.quickIcon}><MaterialIcons name="chat" size={20} color="#963b52" /></View>
                    <Text style={styles.quickText}>WhatsApp</Text>
                </TouchableOpacity>
            </View> */}

            {salon.description && (
                <View style={styles.infoBlock}>
                    <Text style={styles.blockTitle}>About</Text>
                    <Text style={styles.blockText}>{salon.description}</Text>
                </View>
            )}

            {salon.photos?.length > 0 && (
                <View style={styles.infoBlock}>
                    <Text style={styles.blockTitle}>Gallery</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                        {salon.photos.map((photo, i) => (
                            <Image
                                key={i}
                                source={{ uri: photo }}
                                style={{ width: 140, height: 140, borderRadius: 12 }}
                                contentFit="cover"
                            />
                        ))}
                    </ScrollView>
                </View>
            )}

            <View style={styles.infoBlock}>
                <Text style={styles.blockTitle}>Meet the Professionals</Text>
                {isLoading ? (
                    <View style={{ height: 120, justifyContent: 'center' }}>
                        <LoadingSpinner />
                    </View>
                ) : staff && staff.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 8 }}>
                        {staff.map((member) => (
                            <View key={member.id} style={styles.proCol}>
                                <View style={styles.proAvatarWrap}>
                                    <Image
                                        source={{ uri: member.photo || 'https://ui-avatars.com/api/?background=random&color=fff&name=' + member.name[0] }}
                                        style={styles.proAvatar}
                                        contentFit="cover"
                                    />
                                </View>
                                <View style={{ alignItems: 'center', gap: 2 }}>
                                    <Text style={styles.proName} numberOfLines={1}>{member.name}</Text>
                                    {member.specialty && <Text style={styles.proSpec} numberOfLines={1}>{member.specialty}</Text>}
                                    <View style={styles.proRatingRow}>
                                        <MaterialIcons name="star" size={14} color="#7b5804" />
                                        <Text style={styles.proRatingText}>{member.avgRating?.toFixed(1) || '0.0'}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    <Text style={styles.blockText}>No staff information available.</Text>
                )}
            </View>

            <View style={styles.infoBlock}>
                <Text style={styles.blockTitle}>Working Hours</Text>
                <View style={styles.hoursCard}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => {
                        const h = salon.workingHours?.find(w => w.dayOfWeek === i);
                        const isClosed = !h || h.isClosed;
                        return (
                            <View key={i} style={styles.hoursRow}>
                                <Text style={styles.hoursDay}>{day}</Text>
                                <Text style={[styles.hoursTime, isClosed && { color: '#ba1a1a', fontWeight: 'bold' }]}>
                                    {isClosed ? 'Closed' : `${h.openTime} – ${h.closeTime}`}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

function ServicesTab({ services, salonId }) {
    const { data: deals } = useSalonDeals(salonId);
    const [expandedId, setExpandedId] = useState(null);

    if (!services) return <LoadingSpinner />;

    // Build a map of serviceId → deal for badge display
    const dealsByServiceId = {};
    deals?.forEach(deal => {
        if (deal.applicableServices?.length > 0) {
            deal.applicableServices.forEach(sid => { dealsByServiceId[sid] = deal; });
        }
    });
    const globalDeal = deals?.find(d => d.applicableServices?.length === 0);

    return (
        <View style={styles.servicesTabWrapper}>
            <Text style={styles.sectionTitle}>Popular Services</Text>
            <View style={styles.servicesGrid}>
                {services?.map((s, idx) => {
                    const serviceDeal = dealsByServiceId[s.id] || globalDeal;
                    const isExpanded = expandedId === s.id;
                    return (
                        <TouchableOpacity
                            key={s.id}
                            style={[styles.serviceCard, isExpanded && styles.serviceCardExpanded]}
                            onPress={() => setExpandedId(isExpanded ? null : s.id)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.serviceLeft}>
                                <View style={styles.serviceIconWrap}>
                                    <MaterialIcons
                                        name={idx % 3 === 0 ? "face-retouching-natural" : idx % 3 === 1 ? "content-cut" : "spa"}
                                        size={28} color="#963b52"
                                    />
                                </View>
                                <View style={styles.serviceInfoRow}>
                                    <Text style={styles.serviceName} numberOfLines={isExpanded ? undefined : 1}>{s.name}</Text>
                                    <Text style={styles.serviceDur}>{s.duration} mins</Text>

                                    {isExpanded && s.description && (
                                        <Text style={styles.serviceDesc}>{s.description}</Text>
                                    )}

                                    <Text style={styles.servicePrice}>PKR {s.price?.toLocaleString()}</Text>
                                    {serviceDeal && <View style={{ marginTop: 4 }}><DealBadge deal={serviceDeal} /></View>}
                                </View>
                                <MaterialIcons
                                    name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                                    size={20}
                                    color="#963b52"
                                    style={{ opacity: 0.5 }}
                                />
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

function DealsTab({ salonId, setSalon, setAppliedDeal }) {
    const { data: deals, isLoading } = useSalonDeals(salonId);
    const { data: packages } = useSalonPackages(salonId);

    if (isLoading) return <LoadingSpinner />;

    return (
        <View style={{ gap: 24 }}>
            {/* Deals */}
            <View>
                <Text style={styles.sectionTitle}>Active Deals</Text>
                {!deals?.length ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <Text style={{ color: '#544245', fontSize: 15 }}>No active deals at this salon.</Text>
                    </View>
                ) : (
                    <View style={{ gap: 12 }}>
                        {deals.map(deal => (
                            <View key={deal.id}>
                                <DealCard
                                    deal={deal}
                                    onPress={() => router.push(`/(app)/(home)/deal/${deal.id}`)}
                                />
                                <TouchableOpacity
                                    style={styles.applyDealBtn}
                                    onPress={() => {
                                        setSalon();
                                        setAppliedDeal({
                                            id: deal.id,
                                            title: deal.title,
                                            dealType: deal.dealType,
                                            discountValue: deal.discountValue,
                                            maxDiscount: deal.maxDiscount,
                                            discountAmount: null,
                                            applicableServices: deal.applicableServices ?? [],
                                        });
                                        router.push('/(app)/(home)/services');
                                    }}
                                    activeOpacity={0.85}
                                >
                                    <Text style={styles.applyDealBtnText}>Apply & Book</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {/* Packages */}
            {packages?.length > 0 && (
                <View>
                    <Text style={styles.sectionTitle}>Packages</Text>
                    <View style={{ gap: 12 }}>
                        {packages.map(pkg => (
                            <PackageCard
                                key={pkg.id}
                                pkg={pkg}
                                onPress={() => router.push(`/(app)/(home)/package/${pkg.id}`)}
                            />
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
}

function ReviewsTab({ salonId }) {
    const [sort, setSort] = useState('newest');
    const [rating, setRating] = useState(null);
    const [hasPhotos, setHasPhotos] = useState(false);

    const { data: summary } = useSalonSummary(salonId);
    const {
        data: reviewsData,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useSalonReviews(salonId, { sort, rating, hasPhotos: hasPhotos ? 'true' : undefined });

    const reviews = reviewsData?.pages?.flatMap(page => page.reviews) || [];

    if (isLoading) return <LoadingSpinner />;

    return (
        <View style={styles.reviewsWrapper}>
            {summary && <RatingSummary summary={summary} />}

            {/* Filter Bar */}
            <View style={styles.filterBar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    <TouchableOpacity
                        style={[styles.filterBtn, hasPhotos && styles.filterBtnActive]}
                        onPress={() => setHasPhotos(!hasPhotos)}
                    >
                        <MaterialIcons name="camera-alt" size={16} color={hasPhotos ? '#fff' : '#6B7280'} />
                        <Text style={[styles.filterBtnText, hasPhotos && styles.filterBtnTextActive]}>With Photos</Text>
                    </TouchableOpacity>

                    {['newest', 'highest', 'lowest', 'helpful'].map(s => (
                        <TouchableOpacity
                            key={s}
                            style={[styles.filterBtn, sort === s && styles.filterBtnActive]}
                            onPress={() => setSort(s)}
                        >
                            <Text style={[styles.filterBtnText, sort === s && styles.filterBtnTextActive]}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.starFilterScroll}>
                    <TouchableOpacity
                        style={[styles.starFilter, rating === null && styles.starFilterActive]}
                        onPress={() => setRating(null)}
                    >
                        <Text style={[styles.starFilterText, rating === null && styles.starFilterTextActive]}>All Stars</Text>
                    </TouchableOpacity>
                    {[5, 4, 3, 2, 1].map(s => (
                        <TouchableOpacity
                            key={s}
                            style={[styles.starFilter, rating === s && styles.starFilterActive]}
                            onPress={() => setRating(s)}
                        >
                            <Text style={[styles.starFilterText, rating === s && styles.starFilterTextActive]}>{s} ★</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {reviews.length > 0 ? (
                <>
                    {reviews.map(review => (
                        <ReviewCard key={review.id} review={review} />
                    ))}

                    {hasNextPage && (
                        <TouchableOpacity
                            style={styles.loadMoreBtn}
                            onPress={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                        >
                            <Text style={styles.loadMoreText}>
                                {isFetchingNextPage ? 'Loading...' : 'Load More Reviews'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </>
            ) : (
                <View style={styles.emptyReviews}>
                    <MaterialIcons name="rate-review" size={64} color="#E5E7EB" />
                    <Text style={styles.emptyReviewsTitle}>No reviews yet</Text>
                    <Text style={styles.emptyReviewsSub}>Be the first to share your experience!</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff7f9' },
    customHeader: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        zIndex: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 48,
        paddingBottom: 16,
    },
    headerBtn: {
        width: 48, height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 12,
    },
    heroSection: {
        width: '100%',
        height: 486,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroGradient: {
        position: 'absolute',
        inset: 0,
        top: 0, left: 0, right: 0, bottom: 0,
    },
    mainContent: {
        marginTop: -64,
        paddingHorizontal: 24,
    },
    infoCard: {
        backgroundColor: '#ffeff8',
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingTop: 48,
        paddingBottom: 24,
        alignItems: 'center',
        position: 'relative',
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 4,
        marginBottom: 24,
    },
    logoWrapper: {
        position: 'absolute',
        top: -48,
        width: 96, height: 96,
        borderRadius: 48,
        backgroundColor: '#ffffff',
        padding: 8,
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    logoImage: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffd9de',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 8,
        marginBottom: 12,
    },
    badgeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#7d283f',
    },
    salonName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#221920',
        textAlign: 'center',
        marginBottom: 4,
    },
    salonAddress: {
        fontSize: 16,
        color: '#544245',
        textAlign: 'center',
        marginBottom: 16,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    ratingValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#7b5804',
    },
    ratingCount: {
        fontSize: 14,
        color: '#544245',
    },
    brandLink: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ccfbf1',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        marginTop: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: '#99f6e4',
    },
    brandLinkIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandLinkText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#0d9488',
        flex: 1,
    },
    tabRow: {
        flexDirection: 'row',
        backgroundColor: '#fbe9f3',
        borderRadius: 30,
        padding: 4,
        marginBottom: 24,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 26,
    },
    tabActive: {
        backgroundColor: '#ffffff',
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#544245',
    },
    tabTextActive: {
        color: '#963b52',
    },
    tabContainer: {
        paddingTop: 8,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#221920',
        marginBottom: 20,
    },
    // Info Tab
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    quickBtn: {
        flex: 1,
        alignItems: 'center',
    },
    quickIcon: {
        width: 56, height: 56,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    quickText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#221920',
    },
    infoBlock: {
        marginBottom: 24,
    },
    blockTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#221920',
        marginBottom: 12,
    },
    blockText: {
        fontSize: 15,
        color: '#544245',
        lineHeight: 24,
    },
    hoursCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 1,
    },
    hoursRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#efdee8',
    },
    hoursDay: {
        fontSize: 15,
        color: '#544245',
        fontWeight: '500',
    },
    hoursTime: {
        fontSize: 15,
        color: '#221920',
        fontWeight: '600',
    },
    // Services Tab
    servicesGrid: {
        gap: 16,
    },
    serviceCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 1,
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
    serviceInfoRow: {
        flex: 1,
        paddingRight: 16,
    },
    serviceName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#221920',
        marginBottom: 4,
    },
    serviceDur: {
        fontSize: 14,
        color: '#544245',
        marginBottom: 4,
    },
    servicePrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#963b52',
    },
    serviceDesc: {
        fontSize: 14,
        color: '#544245',
        lineHeight: 20,
        marginVertical: 8,
    },
    serviceCardExpanded: {
        borderColor: '#963b52',
        borderWidth: 1,
    },
    addBtn: {
        width: 48, height: 48,
        borderRadius: 24,
        backgroundColor: '#f5e3ee',
        alignItems: 'center',
        justifyContent: 'center',
    },
    proCol: {
        alignItems: 'center',
        gap: 8,
        width: 100,
    },
    proAvatarWrap: {
        width: 88, height: 88,
        borderRadius: 44,
        padding: 4,
        backgroundColor: '#fdcd74',
    },
    proAvatar: {
        width: '100%', height: '100%',
        borderRadius: 40,
        borderWidth: 4,
        borderColor: '#ffffff',
    },
    proName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#221920',
        textAlign: 'center',
    },
    proRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    proRatingText: {
        fontSize: 13,
        color: '#7b5804',
        fontWeight: '600',
    },
    proSpec: {
        fontSize: 13,
        color: '#544245',
        textAlign: 'center',
    },
    // Reviews
    reviewsWrapper: {
        gap: 16,
    },
    reviewCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 1,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    reviewAvatar: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: '#ffd9de',
        alignItems: 'center',
        justifyContent: 'center',
    },
    reviewAvatarText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#963b52',
    },
    reviewName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#221920',
    },
    reviewDate: {
        fontSize: 12,
        color: '#544245',
    },
    reviewStars: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewText: {
        fontSize: 15,
        color: '#544245',
        lineHeight: 22,
    },
    // New Review Styles
    filterBar: {
        marginBottom: 20,
        gap: 12,
    },
    filterScroll: {
        gap: 8,
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 6,
    },
    filterBtnActive: {
        backgroundColor: '#963b52',
        borderColor: '#963b52',
    },
    filterBtnText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '600',
    },
    filterBtnTextActive: {
        color: '#fff',
    },
    starFilterScroll: {
        gap: 6,
    },
    starFilter: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    starFilterActive: {
        backgroundColor: '#f5e3ee',
        borderColor: '#963b52',
    },
    starFilterText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
    },
    starFilterTextActive: {
        color: '#963b52',
    },
    loadMoreBtn: {
        alignItems: 'center',
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginTop: 8,
    },
    loadMoreText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#963b52',
    },
    emptyReviews: {
        alignItems: 'center',
        paddingVertical: 48,
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    emptyReviewsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginTop: 16,
    },
    emptyReviewsSub: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    // Bottom Bar
    bottomBarWrapper: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(251, 233, 243, 0.9)',
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
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#544245',
    },
    bottomPrice: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#963b52',
    },
    bookGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 32,
        gap: 12,
    },
    bookBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    applyDealBtn: {
        backgroundColor: '#fbe9f3',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#efdee8',
    },
    applyDealBtnText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#963b52',
    },
    servicesTabWrapper: {},
});