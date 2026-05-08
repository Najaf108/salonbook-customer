// app/(app)/(home)/confirmation.jsx
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar, ScrollView } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { useBookingDetail } from '@/hooks/useBookings';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import SalonLogo from '@/components/SalonLogo';
import MapView, { Marker } from 'react-native-maps';
import * as Linking from 'expo-linking';

export default function ConfirmationScreen() {
    const { bookingId } = useLocalSearchParams();
    const { data: booking } = useBookingDetail(bookingId);

    const handleGetDirections = () => {
        if (!booking?.salon) return;
        const { latitude, longitude, name } = booking.salon;
        const url = Platform.select({
            ios: `maps:0,0?q=${name}@${latitude},${longitude}`,
            android: `geo:0,0?q=${latitude},${longitude}(${name})`,
        });
        Linking.openURL(url);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>

                {/* Header Navbar */}
                <View style={styles.appBar}>
                    <Text style={styles.appTitle}>SalonBook</Text>
                </View>

                {/* Decorative Blob */}
                <View style={styles.decorativeBlob} />

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.mainCanvas}>
                        {/* Success Icon */}
                        <View style={styles.successIconWrapper}>
                            <LinearGradient colors={['rgba(150, 59, 82, 0.1)', 'rgba(181, 83, 106, 0.2)']} style={StyleSheet.absoluteFill} />
                            <MaterialIcons name="check-circle" size={48} color="#963b52" />
                        </View>

                        {/* Typography */}
                        <View style={styles.textCenter}>
                            <Text style={styles.mainHeading}>Booking Added!</Text>
                            <Text style={styles.subtext}>
                                You'll receive an SMS shortly with your appointment details.
                            </Text>
                        </View>

                        {/* Details Card */}
                        {booking && (
                            <View style={styles.detailsCard}>
                                {/* Decorative bleed */}
                                <View style={styles.cardBleed} />

                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={styles.metaLabel}>Booking ID</Text>
                                        <Text style={styles.metaValue}>#{booking.id?.slice(0, 8).toUpperCase()}</Text>
                                    </View>
                                    <View style={styles.statusPill}>
                                        <MaterialIcons name="star" size={14} color="#7b5804" />
                                        <Text style={styles.statusPillText}>Added</Text>
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.rowsContainer}>
                                    <View style={styles.infoRow}>
                                        <SalonLogo
                                            uri={booking.salon?.logoUrl}
                                            name={booking.salon?.name}
                                            size={48}
                                        />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.metaLabel}>Salon</Text>
                                            <Text style={styles.infoValue}>{booking.salon?.name}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <View style={styles.iconBox}>
                                            <MaterialIcons name={booking.package ? "inventory-2" : "spa"} size={24} color="#963b52" />
                                        </View>
                                        <View style={{ flex: 1, paddingRight: 8 }}>
                                            <Text style={styles.metaLabel}>{booking.package ? 'Package' : 'Services'}</Text>
                                            <Text style={styles.infoValue}>
                                                {booking.package ? booking.package.name : booking.items?.map(i => i.service?.name).join(', ')}
                                            </Text>
                                            {booking.package && (
                                                <Text style={{ fontSize: 12, color: '#544245', marginTop: 2 }}>
                                                    {booking.items?.map(i => i.service?.name).join(', ')}
                                                </Text>
                                            )}
                                        </View>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <View style={styles.iconBox}>
                                            <MaterialIcons name="event" size={24} color="#963b52" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.metaLabel}>Date & Time</Text>
                                            <Text style={styles.infoValue}>{format(new Date(booking.scheduledAt), 'MMM dd, yyyy • h:mm a')}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.totalRow}>
                                    <View>
                                        <Text style={styles.totalLabel}>Total Amount</Text>
                                        {booking.package && (
                                            <Text style={{ fontSize: 12, color: '#059669', fontWeight: 'bold' }}>
                                                You saved Rs. {(booking.items?.reduce((sum, i) => sum + i.price, 0) - booking.totalAmount)?.toLocaleString()}!
                                            </Text>
                                        )}
                                    </View>
                                    <Text style={styles.totalAmountText}>
                                        PKR (Rs.) <Text style={styles.totalAmountValue}>{booking.totalAmount?.toLocaleString()}</Text>
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Location & Directions */}
                        {booking?.salon?.latitude && (
                            <View style={styles.mapSection}>
                                <View style={styles.headingRow}>
                                    <Text style={styles.sectionHeading}>Salon Location</Text>
                                    <TouchableOpacity style={styles.directionsBtn} onPress={handleGetDirections}>
                                        <MaterialIcons name="directions" size={18} color="#963b52" />
                                        <Text style={styles.directionsBtnText}>Get Directions</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.mapCard}>
                                    <MapView
                                        style={styles.map}
                                        initialRegion={{
                                            latitude: booking.salon.latitude,
                                            longitude: booking.salon.longitude,
                                            latitudeDelta: 0.005,
                                            longitudeDelta: 0.005,
                                        }}
                                        scrollEnabled={false}
                                        zoomEnabled={false}
                                    >
                                        <Marker
                                            coordinate={{
                                                latitude: booking.salon.latitude,
                                                longitude: booking.salon.longitude,
                                            }}
                                            title={booking.salon.name}
                                            description={booking.salon.address}
                                        />
                                    </MapView>
                                </View>
                            </View>
                        )}

                        {/* Actions */}
                        <View style={styles.actionsBox}>
                            <TouchableOpacity onPress={() => router.replace('/(app)/(bookings)')} activeOpacity={0.9}>
                                <LinearGradient colors={['#963b52', '#b5536a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryBtn}>
                                    <MaterialIcons name="calendar-month" size={20} color="#fff" />
                                    <Text style={styles.primaryBtnText}>View My Bookings</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace('/(app)/(home)')} activeOpacity={0.7}>
                                <Text style={styles.secondaryBtnText}>Back to Home</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff7f9' },
    container: { flex: 1, backgroundColor: '#fff7f9', position: 'relative' },
    scrollContent: { paddingBottom: 40 },
    appBar: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 16,
        paddingBottom: 24,
        zIndex: 10,
    },
    appTitle: { fontSize: 20, fontWeight: 'bold', color: '#963b52', letterSpacing: -0.5 },
    decorativeBlob: {
        position: 'absolute',
        top: '25%',
        left: '50%',
        transform: [{ translateX: -128 }],
        width: 256, height: 256,
        borderRadius: 128,
        backgroundColor: '#ffd9de',
        opacity: 0.4,
        zIndex: 0,
        ...Platform.select({
            ios: { shadowColor: '#ffd9de', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 60 },
            android: { elevation: 20 },
        }),
    },
    mainCanvas: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 32,
        zIndex: 10,
    },
    successIconWrapper: {
        width: 96, height: 96,
        borderRadius: 48,
        backgroundColor: '#ffd9de',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginBottom: 24,
    },
    textCenter: { alignItems: 'center', marginBottom: 32 },
    mainHeading: { fontSize: 32, fontWeight: '900', color: '#221920', letterSpacing: -1, marginBottom: 12, textAlign: 'center' },
    subtext: { fontSize: 16, color: '#544245', textAlign: 'center', lineHeight: 24, maxWidth: 280 },
    detailsCard: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.05,
        shadowRadius: 40,
        elevation: 4,
        position: 'relative',
        overflow: 'hidden',
    },
    cardBleed: {
        position: 'absolute',
        top: -24, right: -24,
        width: 80, height: 80,
        borderRadius: 40,
        backgroundColor: '#ffdea6',
        opacity: 0.2,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 },
    metaLabel: { fontSize: 14, color: '#544245', fontWeight: '500', marginBottom: 2 },
    metaValue: { fontSize: 18, fontWeight: 'bold', color: '#221920', letterSpacing: -0.5 },
    statusPill: {
        backgroundColor: '#fbe9f3',
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusPillText: { fontSize: 12, fontWeight: 'bold', color: '#221920' },
    divider: { height: 2, width: '100%', backgroundColor: '#efdee8', borderRadius: 2, opacity: 0.5, marginVertical: 20 },
    rowsContainer: { gap: 16, zIndex: 10 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    iconBox: {
        width: 48, height: 48,
        borderRadius: 12,
        backgroundColor: '#fbe9f3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoValue: { fontSize: 16, fontWeight: 'bold', color: '#221920' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 8, zIndex: 10 },
    totalLabel: { fontSize: 14, fontWeight: '600', color: '#544245' },
    totalAmountText: { fontSize: 20, fontWeight: 'bold', color: '#963b52' },
    totalAmountValue: { fontSize: 24, color: '#221920' },
    actionsBox: { width: '100%', gap: 16 },
    primaryBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 32,
        gap: 8,
        shadowColor: '#963b52',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 30,
        elevation: 8,
    },
    primaryBtnText: { fontSize: 18, fontWeight: 'bold', color: '#ffffff', letterSpacing: 0.5 },
    secondaryBtn: {
        width: '100%',
        backgroundColor: '#f5e3ee',
        paddingVertical: 16,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryBtnText: { fontSize: 18, fontWeight: 'bold', color: '#963b52', letterSpacing: 0.5 },
    mapSection: { width: '100%', marginBottom: 32 },
    headingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionHeading: { fontSize: 20, fontWeight: 'bold', color: '#221920', letterSpacing: -0.5 },
    directionsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#fbe9f3',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    directionsBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#963b52',
    },
    mapCard: {
        height: 200,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#efdee8',
    },
    map: {
        flex: 1,
    },
});
