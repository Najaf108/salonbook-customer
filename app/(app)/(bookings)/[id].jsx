// app/(app)/(bookings)/[id].jsx
import { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Platform, StatusBar
} from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import * as Linking from 'expo-linking';
import { format } from 'date-fns';
import { useBookingDetail, useCancelBooking } from '@/hooks/useBookings';
import LoadingSpinner from '@/components/LoadingSpinner';
import { BOOKING_STATUS_LABELS } from '@/constants/categories';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import SalonLogo from '@/components/SalonLogo';

export default function BookingDetailScreen() {
    const { id } = useLocalSearchParams();
    const { data: booking, isLoading } = useBookingDetail(id);
    const { mutateAsync: cancelBooking, isPending } = useCancelBooking();

    if (isLoading) return <LoadingSpinner full />;
    if (!booking) return null;

    const status = BOOKING_STATUS_LABELS[booking.status] || { bg: '#efdee8', color: '#544245', label: 'Unknown' };
    const canCancel = booking.status === 'PENDING';
    const canReview = booking.status === 'COMPLETED' && !booking.review;

    const handleCancel = () => {
        Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
            { text: 'No', style: 'cancel' },
            {
                text: 'Yes, Cancel',
                style: 'destructive',
                onPress: async () => {
                    await cancelBooking({ id: booking.id, reason: 'Customer cancelled' });
                    router.back();
                },
            },
        ]);
    };

    const handleGetDirections = () => {
        if (!booking.salon) return;
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

                {/* Custom Header */}
                <View style={styles.appBar}>
                    <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={styles.iconBtn}>
                        <MaterialIcons name="arrow-back" size={24} color="#221920" />
                    </TouchableOpacity>
                    <Text style={styles.appTitle}>Booking Details</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Status Hero */}
                    <View style={styles.headerBlock}>
                        <View style={styles.statusBadgeWrap}>
                            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                                <MaterialIcons name="circle" size={10} color={status.color} />
                                <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
                            </View>
                        </View>
                        <Text style={styles.bookingIdLabel}>ID #{booking.id?.slice(0, 8).toUpperCase()}</Text>
                    </View>

                    {/* Atelier Card: Salon & Appointment Info */}
                    <View style={styles.atelierCard}>
                        {/* Decorative Top-Right Corner */}
                        <View style={styles.atelierAccent} />

                        {/* Salon Identity */}
                        <View style={styles.salonInfoRow}>
                            <SalonLogo
                                uri={booking.salon?.logoUrl}
                                name={booking.salon?.name}
                                size={64}
                                style={{ borderRadius: 16 }}
                            />
                            <View style={styles.salonTextWrap}>
                                <Text style={styles.salonName}>{booking.salon?.name}</Text>
                                <Text style={styles.salonAddr}>{booking.salon?.address}, {booking.salon?.city}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.headerChatBtn}
                                onPress={() => router.push(`/(app)/(chat)/${booking.id}`)}
                            >
                                <MaterialIcons name="chat" size={24} color="#963b52" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.divider} />

                        {/* Appointment Info */}
                        <View style={styles.infoGrid}>
                            <View style={styles.iconRow}>
                                <MaterialIcons name="calendar-month" size={18} color="#963b52" />
                                <Text style={styles.iconRowText}>
                                    {format(new Date(booking.scheduledAt), 'EEE, MMM dd • h:mm a')}
                                </Text>
                            </View>
                            <View style={styles.iconRow}>
                                <MaterialIcons name="person" size={18} color="#963b52" />
                                <Text style={styles.iconRowText}>Stylist: <Text style={{ fontWeight: 'bold', color: '#221920' }}>{booking.staff?.name || 'Any available'}</Text></Text>
                            </View>
                        </View>

                        {/* Services List Nesting */}
                        <View style={styles.servicesNest}>
                            <Text style={styles.servicesNestTitle}>{booking.package ? `Package: ${booking.package.name}` : 'Services Selected'}</Text>
                            {booking.items?.map(item => (
                                <View key={item.id} style={styles.serviceRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.serviceName}>{item.service?.name}</Text>
                                        <Text style={styles.serviceSub}>⏱ {item.duration} min</Text>
                                    </View>
                                    <Text style={styles.servicePrice}>
                                        {booking.package ? 'Included' : `PKR ${item.price?.toLocaleString()}`}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Location & Directions (Confirmed only) */}
                    {booking.status === 'CONFIRMED' && booking.salon?.latitude && (
                        <View style={styles.sectionBlock}>
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

                    {/* Payment Summary */}
                    <View style={styles.sectionBlock}>
                        <Text style={styles.sectionHeading}>Payment Summary</Text>
                        <View style={styles.paymentCard}>
                            <View style={styles.paymentCardRow}>
                                <View style={styles.paymentIconBox}>
                                    <MaterialIcons name="payments" size={24} color="#963b52" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.paymentMethodText}>{booking.paymentMethod?.replace(/_/g, ' ')}</Text>
                                    <Text style={styles.paymentStatusText}>Status: <Text style={{ fontWeight: 'bold', color: booking.paymentStatus === 'PAID' ? '#059669' : '#b5536a' }}>{booking.paymentStatus}</Text></Text>
                                </View>
                                <View style={styles.totalPriceBlock}>
                                    <Text style={styles.totalSub}>Total</Text>
                                    <Text style={styles.totalAmountText}>PKR {booking.totalAmount?.toLocaleString()}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Special Requests */}
                    {booking.notes && (
                        <View style={styles.sectionBlock}>
                            <Text style={styles.sectionHeading}>Special Requests</Text>
                            <View style={styles.notesWrapper}>
                                <Text style={styles.notesText}>{booking.notes}</Text>
                            </View>
                        </View>
                    )}

                </ScrollView>

                {/* Sticky Bottom Actions */}
                <View style={styles.bottomBarWrapper}>
                    <View style={[styles.bottomBarInner, (!canReview && !canCancel) && { justifyContent: 'center' }]}>
                        {canReview && (
                            <TouchableOpacity
                                style={{ flex: 1 }}
                                onPress={() => router.push({
                                    pathname: '/(app)/(bookings)/review',
                                    params: {
                                        bookingId: id,
                                        salonId: booking.salonId,
                                        salonName: booking.salon?.name,
                                        staffId: booking.staffId,
                                        staffName: booking.staff?.name,
                                        services: booking.items?.map(i => i.service?.name).join(', '),
                                        date: format(new Date(booking.scheduledAt), 'MMMM dd, yyyy')
                                    }
                                })}
                            >
                                <LinearGradient colors={['#963b52', '#b5536a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryBtn}>
                                    <MaterialIcons name="star" size={20} color="#fff" />
                                    <Text style={styles.primaryBtnText}>Leave a Review</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                        {canCancel && (
                            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} disabled={isPending}>
                                <Text style={styles.cancelBtnText}>{isPending ? 'Cancelling...' : 'Cancel Booking'}</Text>
                            </TouchableOpacity>
                        )}
                        {(!canReview && !canCancel) && (
                            <TouchableOpacity style={{ flex: 1, ...styles.cancelBtn, borderColor: 'transparent', backgroundColor: '#fbe9f3' }} onPress={() => router.back()}>
                                <Text style={[styles.cancelBtnText, { color: '#963b52' }]}>Go Back</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff7f9' },
    container: { flex: 1, backgroundColor: '#fff7f9' },
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 8,
        paddingBottom: 8,
        backgroundColor: 'rgba(255, 247, 249, 0.95)',
        zIndex: 10,
    },
    iconBtn: {
        backgroundColor: '#ffffff',
        padding: 8,
        borderRadius: 20,
        shadowColor: '#1a1118',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    appTitle: { fontSize: 20, fontWeight: 'bold', color: '#963b52', letterSpacing: -0.5 },
    scrollContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 160 },
    headerBlock: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    statusBadgeWrap: { flexDirection: 'row' },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    statusBadgeText: { fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase' },
    bookingIdLabel: { fontSize: 16, fontWeight: 'bold', color: '#221920' },
    atelierCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
        shadowColor: '#1a1118',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.05,
        shadowRadius: 40,
        elevation: 6,
        position: 'relative',
        overflow: 'hidden',
    },
    atelierAccent: {
        position: 'absolute',
        top: 0, right: 0,
        width: 100, height: 100,
        backgroundColor: 'rgba(150, 59, 82, 0.05)',
        borderBottomLeftRadius: 100,
    },
    salonInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 16, zIndex: 10 },
    salonImageWrap: {
        width: 64, height: 64,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#1a1118',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 4,
    },
    salonImage: { width: '100%', height: '100%' },
    salonTextWrap: { flex: 1, justifyContent: 'center' },
    salonName: { fontSize: 18, fontWeight: 'bold', color: '#221920', marginBottom: 2 },
    salonAddr: { fontSize: 13, color: '#544245' },
    divider: { height: 1, backgroundColor: '#efdee8', marginVertical: 20 },
    infoGrid: { gap: 12, marginBottom: 20 },
    iconRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    iconRowText: { fontSize: 14, color: '#544245' },
    servicesNest: {
        backgroundColor: '#fff7f9',
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    servicesNestTitle: { fontSize: 13, fontWeight: 'bold', color: '#544245', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
    serviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    serviceName: { fontSize: 15, fontWeight: 'bold', color: '#221920', marginBottom: 2 },
    serviceSub: { fontSize: 12, color: '#544245' },
    servicePrice: { fontSize: 16, fontWeight: 'bold', color: '#963b52' },
    sectionBlock: { marginBottom: 32 },
    sectionHeading: { fontSize: 20, fontWeight: 'bold', color: '#221920', letterSpacing: -0.5, marginBottom: 16 },
    paymentCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#1a1118',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 1,
    },
    paymentCardRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    paymentIconBox: {
        width: 48, height: 48,
        borderRadius: 12,
        backgroundColor: '#fff7f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paymentMethodText: { fontSize: 16, fontWeight: 'bold', color: '#221920', marginBottom: 2, textTransform: 'capitalize' },
    paymentStatusText: { fontSize: 13, color: '#544245' },
    totalPriceBlock: { alignItems: 'flex-end' },
    totalSub: { fontSize: 12, color: '#544245', marginBottom: 2 },
    totalAmountText: { fontSize: 16, fontWeight: 'bold', color: '#963b52' },
    notesWrapper: {
        backgroundColor: '#fbe9f3',
        borderRadius: 20,
        padding: 16,
    },
    notesText: { fontSize: 14, color: '#221920', lineHeight: 22 },
    bottomBarWrapper: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(251, 233, 243, 0.95)',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: Platform.OS === 'ios' ? 36 : 24,
        shadowColor: '#1a1118',
        shadowOffset: { width: 0, height: -12 },
        shadowOpacity: 0.05,
        shadowRadius: 40,
        elevation: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
    },
    bottomBarInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
    primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 32, gap: 8, shadowColor: '#963b52', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 30, elevation: 8 },
    primaryBtnText: { fontSize: 16, fontWeight: 'bold', color: '#ffffff', letterSpacing: 0.5 },
    cancelBtn: { flex: 1, backgroundColor: '#ffffff', paddingVertical: 18, borderRadius: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#efdee8' },
    cancelBtnText: { fontSize: 16, fontWeight: 'bold', color: '#544245' },
    headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    directionsBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fbe9f3', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    directionsBtnText: { fontSize: 12, fontWeight: 'bold', color: '#963b52' },
    mapCard: { height: 200, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#efdee8' },
    map: { flex: 1 },
    headerChatBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff7f9',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
});