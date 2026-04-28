// app/(app)/(bookings)/index.jsx
import { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, FlatList,
    StyleSheet, Platform, SafeAreaView, StatusBar
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { format } from 'date-fns';
import { useMyBookings } from '@/hooks/useBookings';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import SalonLogo from '@/components/SalonLogo';
import { BOOKING_STATUS_LABELS } from '@/constants/categories';

const TABS = [
    { key: null, label: 'All' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled' },
];

export default function BookingsScreen() {
    const [activeTab, setActiveTab] = useState(null);
    const { data: response, isLoading } = useMyBookings(activeTab);
    const bookings = response?.bookings || [];

    const renderBooking = ({ item }) => {
        let dateObj;
        try {
            dateObj = new Date(item.scheduledAt);
        } catch (e) {
            dateObj = new Date();
        }

        const day = format(dateObj, 'dd');
        const month = format(dateObj, 'MMM');
        const time = format(dateObj, 'h:mm a');
        let statusObj = BOOKING_STATUS_LABELS[item.status] || { label: item.status, bg: '#efdee8', color: '#544245' };

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.95}
                onPress={() => router.push(`/(app)/(bookings)/${item.id}`)}
            >
                {/* Status Badge Absolute Top Right */}
                <View style={[styles.statusBadge, { backgroundColor: statusObj.bg }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusObj.color }]} />
                    <Text style={[styles.statusText, { color: statusObj.color }]}>{statusObj.label}</Text>
                </View>

                <View style={styles.cardInnerLayout}>
                    {/* Date/Time Column (Left Stack) */}
                    <View style={styles.dateCol}>
                        <View style={styles.dateTop}>
                            <Text style={styles.dateDay}>{day}</Text>
                            <Text style={styles.dateMonth}>{month}</Text>
                        </View>
                        <View style={styles.timeRow}>
                            <MaterialIcons name="schedule" size={14} color="#963b52" />
                            <Text style={styles.timeText}>{time}</Text>
                        </View>
                    </View>

                    {/* Content Column (Right Stack) */}
                    <View style={styles.contentCol}>
                        <View style={styles.salonRow}>
                            <SalonLogo
                                uri={item.salon?.logoUrl}
                                name={item.salon?.name}
                                size={48}
                                style={{ borderRadius: 8 }}
                            />
                            <View style={styles.salonInfo}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={styles.salonName} numberOfLines={1}>{item.salon?.name || 'Salon'}</Text>

                                </View>
                                <View style={styles.locationRow}>
                                    <MaterialIcons name="location-on" size={12} color="#544245" />
                                    <Text style={styles.locationText} numberOfLines={1}>{item.salon?.city || 'Location'}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.horizontalDivider} />

                        <View style={styles.serviceRow}>
                            <View style={styles.serviceInfo}>
                                <Text style={styles.serviceTitle} numberOfLines={1}>
                                    {item.package ? `Package: ${item.package.name}` : (item.items?.map(i => i.service?.name).join(', ') || 'Beauty Services')}
                                </Text>
                                {item.staff?.name ? (
                                    <Text style={styles.serviceStaff} numberOfLines={1}>
                                        with {item.staff.name}
                                    </Text>
                                ) : null}
                            </View>
                            <Text style={styles.priceText}>
                                PKR {item.totalAmount?.toLocaleString() || '0'}
                            </Text>
                        </View>

                        <View style={styles.actionRow}>
                            {item.status === 'COMPLETED' ? (
                                <TouchableOpacity
                                    style={styles.reviewBtn}
                                    activeOpacity={0.8}
                                    onPress={() => {
                                        const services = item.package ? `Package: ${item.package.name}` : (item.items?.map(i => i.service?.name).join(', ') || 'Beauty Services');
                                        const date = format(new Date(item.scheduledAt), 'MMMM dd, yyyy');
                                        router.push({
                                            pathname: '/(app)/(bookings)/review',
                                            params: {
                                                bookingId: item.id,
                                                salonId: item.salonId,
                                                salonName: item.salon?.name,
                                                staffId: item.staffId,
                                                staffName: item.staff?.name,
                                                services,
                                                date
                                            }
                                        });
                                    }}
                                >
                                    <MaterialIcons name="star" size={16} color="#ffffff" />
                                    <Text style={styles.detailsText}>Leave a Review</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={styles.detailsBtn} activeOpacity={0.8} onPress={() => router.push(`/(app)/(bookings)/${item.id}`)}>
                                    <Text style={styles.detailsText}>View Details</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* TopAppBar */}
                <View style={styles.appBar}>
                    <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
                        <MaterialIcons name="arrow-back" size={24} color="#963b52" />
                    </TouchableOpacity>
                    <Text style={styles.appTitle}>SalonBook</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Page Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Bookings</Text>
                    <Text style={styles.headerSubtitle}>Manage your upcoming appointments and past visits.</Text>
                </View>

                {/* Status Tabs */}
                <View style={styles.tabsContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabsContent}
                    >
                        {TABS.map(tab => {
                            const isActive = activeTab === tab.key;
                            return (
                                <TouchableOpacity
                                    key={String(tab.key)}
                                    style={[styles.tab, isActive && styles.tabActive]}
                                    onPress={() => setActiveTab(tab.key)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Bookings List */}
                <View style={styles.listContainer}>
                    {isLoading ? (
                        <LoadingSpinner full />
                    ) : (
                        <FlatList
                            data={bookings}
                            keyExtractor={b => b.id}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <EmptyState
                                    emoji="📅"
                                    title="No bookings yet"
                                    subtitle="Book your first salon appointment to see it here"
                                />
                            }
                            renderItem={renderBooking}
                        />
                    )}
                </View>
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
    appTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#963b52',
        letterSpacing: -0.5,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
    },
    headerTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: '#221920',
        letterSpacing: -1,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#544245',
        lineHeight: 20,
    },
    tabsContainer: {
        marginBottom: 24,
    },
    tabsContent: {
        paddingHorizontal: 24,
        gap: 12,
        paddingBottom: 8,
    },
    tab: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        backgroundColor: '#fbe9f3',
    },
    tabActive: {
        backgroundColor: '#963b52',
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#544245',
    },
    tabTextActive: {
        color: '#ffffff',
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        gap: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 3,
        overflow: 'hidden',
    },
    statusBadge: {
        position: 'absolute',
        top: 20,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
        zIndex: 10,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cardInnerLayout: {
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: 16,
    },
    dateCol: {
        backgroundColor: '#ffeff8',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
    },
    dateTop: {
        alignItems: 'center',
        marginBottom: 8,
    },
    dateDay: {
        fontSize: 32,
        fontWeight: '900',
        color: '#963b52',
        letterSpacing: -1,
        includeFontPadding: false,
    },
    dateMonth: {
        fontSize: 12,
        fontWeight: '600',
        color: '#544245',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: -4,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
        borderTopWidth: 1,
        borderTopColor: 'rgba(218, 192, 195, 0.4)',
        paddingTop: 8,
        width: '100%',
        justifyContent: 'center',
    },
    timeText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#963b52',
    },
    contentCol: {
        flex: 1,
        justifyContent: 'space-between',
        paddingTop: 4,
    },
    salonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
        paddingRight: 80,
    },
    salonImageContainer: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#efdee8',
        overflow: 'hidden',
    },
    salonImage: {
        width: '100%',
        height: '100%',
    },
    salonInfo: {
        flex: 1,
    },
    salonName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#221920',
        marginBottom: 2,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 12,
        color: '#544245',
    },
    horizontalDivider: {
        height: 1,
        backgroundColor: '#efdee8',
        marginBottom: 12,
    },
    serviceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    serviceInfo: {
        flex: 1,
        paddingRight: 16,
    },
    serviceTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#221920',
        marginBottom: 2,
    },
    serviceStaff: {
        fontSize: 12,
        color: '#544245',
    },
    priceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#963b52',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    rescheduleBtn: {
        flex: 1,
        backgroundColor: '#f5e3ee',
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: 'center',
    },
    rescheduleText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#963b52',
    },
    detailsBtn: {
        flex: 1,
        backgroundColor: '#963b52',
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 2,
    },
    detailsText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    reviewBtn: {
        flex: 1,
        backgroundColor: '#7b5804', // Goldish color for reviews
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 2,
    },
    pendingReviewBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef3c7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    pendingReviewText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#7b5804',
        textTransform: 'uppercase',
    },
});
