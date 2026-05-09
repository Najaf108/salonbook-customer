// app/(app)/(home)/slot.jsx
import { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar
} from 'react-native';
import { router, Stack } from 'expo-router';
import { format, addDays, isSameDay } from 'date-fns';
import { useBookingStore } from '@/stores/useBookingStore';
import { useAvailableSlots } from '@/hooks/useSalons';
import LoadingSpinner from '@/components/LoadingSpinner';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const getPKTNow = () => {
    const d = new Date();
    return new Date(d.getTime() + (d.getTimezoneOffset() + 300) * 60000);
};

export default function SlotScreen() {
    const {
        salon, selectedStaff, getTotalDuration, getTotalPrice,
        selectedDate, selectedTime, setDateTime
    } = useBookingStore();

    const [viewDate, setViewDate] = useState(getPKTNow());
    const dateStr = format(viewDate, 'yyyy-MM-dd');
    const totalPrice = getTotalPrice ? getTotalPrice() : 0;

    const { data: slots, isLoading } = useAvailableSlots(
        salon?.id, dateStr, selectedStaff?.id, getTotalDuration()
    );

    // Generate next 14 days based on Pakistan current date
    const dates = Array.from({ length: 14 }, (_, i) => addDays(getPKTNow(), i));

    const handleContinue = () => {
        if (!selectedDate || !selectedTime) return;
        router.push('/(app)/(home)/checkout');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.container}>
                {/* TopAppBar */}
                <View style={styles.appBar}>
                    <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={styles.iconBtn}>
                        <MaterialIcons name="arrow-back" size={24} color="#963b52" />
                    </TouchableOpacity>
                    <Text style={styles.appTitle}>SalonBook</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Main Scroll Content */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
                    {/* Page Title */}
                    <View style={styles.pageTitleWrapper}>
                        <Text style={styles.pageTitle}>Schedule{'\n'}Appointment</Text>
                    </View>

                    {/* Calendar Bento Card */}
                    <View style={styles.bentoCard}>
                        <View style={styles.bentoHeader}>
                            <Text style={styles.monthLabel}>{format(viewDate, 'MMMM yyyy')}</Text>
                            <View style={styles.bentoHeaderIcons}>
                                <TouchableOpacity activeOpacity={0.7}><MaterialIcons name="chevron-left" size={24} color="#544245" /></TouchableOpacity>
                                <TouchableOpacity activeOpacity={0.7}><MaterialIcons name="chevron-right" size={24} color="#544245" /></TouchableOpacity>
                            </View>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
                            {dates.map((date, i) => {
                                const isSelected = isSameDay(date, viewDate);
                                return (
                                    <TouchableOpacity
                                        key={i}
                                        style={styles.dateCell}
                                        onPress={() => {
                                            setViewDate(date);
                                            setDateTime(format(date, 'yyyy-MM-dd'), null);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.dateDayText}>{format(date, 'EEEEE')}</Text>
                                        <View style={[styles.dateCirc, isSelected && styles.dateCircActive]}>
                                            <Text style={[styles.dateNumText, isSelected && styles.dateNumTextActive]}>{format(date, 'd')}</Text>
                                            {isSelected && <View style={styles.dateDot} />}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Time Slots Section */}
                    <View style={styles.sectionWrap}>
                        <Text style={styles.sectionTitle}>Available Time</Text>

                        {isLoading ? <LoadingSpinner /> : (
                            <View style={styles.timeGrid}>
                                {slots?.map((slot, i) => {
                                    const isActive = selectedTime === slot.time;
                                    return (
                                        <TouchableOpacity
                                            key={i}
                                            style={[
                                                styles.timePill,
                                                !slot.available && styles.timePillDisabled,
                                                isActive && styles.timePillActive,
                                            ]}
                                            onPress={() => slot.available && setDateTime(dateStr, slot.time)}
                                            disabled={!slot.available}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={[
                                                styles.timePillText,
                                                !slot.available && styles.timePillTextDisabled,
                                                isActive && styles.timePillTextActive,
                                            ]}>
                                                {slot.displayTime}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}

                        {!isLoading && !slots?.length && (
                            <View style={styles.noSlots}>
                                <Text style={styles.noSlotsText}>No available time slots on this day.</Text>
                            </View>
                        )}
                    </View>

                    {/* Service Location (Visual Flair) */}
                    {/*salon && (
                        <View style={styles.sectionWrap}>
                            <Text style={styles.sectionTitle}>Service Location</Text>
                            <View style={styles.locationCard}>
                                <View style={styles.mapWrap}>
                                    <View style={styles.mapLayer}>
                                        <LinearGradient colors={['#b5536a20', '#ffb1bf40']} style={StyleSheet.absoluteFill} />
                                    </View>
                                    <View style={styles.mapPinShadow}>
                                        <View style={styles.mapPin}>
                                            <MaterialIcons name="location-on" size={20} color="#fff" />
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.addressBlock}>
                                    <View style={styles.homeIconWrap}>
                                        <MaterialIcons name="home" size={22} color="#963b52" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.addressTitle}>Salon Address</Text>
                                        <Text style={styles.addressSub} numberOfLines={1}>{salon.address}, {salon.city}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.editBtn}>
                                        <MaterialIcons name="edit" size={20} color="#544245" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )*/}
                </ScrollView>

                {/* Sticky Bottom Confirmation Bar */}
                <View style={styles.bottomBarWrapper}>
                    <View style={styles.bottomBarInner}>
                        <View style={styles.totalBlock}>
                            <Text style={styles.totalLabel}>TOTAL</Text>
                            <Text style={styles.totalPrice}>
                                <Text style={styles.currencyLabel}>PKR (Rs.) </Text>
                                {totalPrice?.toLocaleString()}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleContinue}
                            activeOpacity={0.9}
                            disabled={!(selectedDate && selectedTime)}
                            style={{ opacity: selectedDate && selectedTime ? 1 : 0.6 }}
                        >
                            <LinearGradient colors={['#963b52', '#b5536a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.confirmBtn}>
                                <Text style={styles.confirmBtnText}>Confirm</Text>
                                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
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
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 16,
        paddingBottom: 8,
        backgroundColor: 'rgba(250, 248, 247, 0.9)',
    },
    iconBtn: { padding: 4 },
    appTitle: { fontSize: 20, fontWeight: 'bold', color: '#963b52', letterSpacing: -0.5 },
    pageTitleWrapper: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },
    pageTitle: { fontSize: 40, fontWeight: '900', color: '#221920', lineHeight: 44, letterSpacing: -1 },
    bentoCard: {
        backgroundColor: '#ffeff8',
        borderRadius: 24,
        marginHorizontal: 20,
        marginBottom: 32,
        padding: 24,
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 20,
        elevation: 2,
    },
    bentoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    monthLabel: { fontSize: 18, fontWeight: 'bold', color: '#221920', letterSpacing: -0.5 },
    bentoHeaderIcons: { flexDirection: 'row', gap: 8 },
    dateScroll: { gap: 12 },
    dateCell: { alignItems: 'center', gap: 8 },
    dateDayText: { fontSize: 13, fontWeight: 'bold', color: 'rgba(84, 66, 69, 0.6)' },
    dateCirc: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    dateCircActive: {
        backgroundColor: '#963b52',
        shadowColor: '#963b52',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    dateNumText: { fontSize: 18, color: '#221920', fontWeight: '500' },
    dateNumTextActive: { color: '#ffffff', fontWeight: 'bold' },
    dateDot: {
        position: 'absolute',
        bottom: 4,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#ffffff',
    },
    sectionWrap: { marginHorizontal: 20, marginBottom: 40 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#221920', marginBottom: 16, paddingHorizontal: 8, letterSpacing: -0.5 },
    timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    timePill: {
        width: '30%',
        backgroundColor: '#fbe9f3',
        paddingVertical: 14,
        borderRadius: 24,
        alignItems: 'center',
    },
    timePillActive: {
        backgroundColor: '#b5536a',
        shadowColor: '#b5536a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    timePillDisabled: { backgroundColor: '#efdee8', opacity: 0.4 },
    timePillText: { fontSize: 14, fontWeight: 'bold', color: '#221920' },
    timePillTextActive: { color: '#fff8f8' },
    timePillTextDisabled: { color: '#797174' },
    noSlots: { padding: 40, alignItems: 'center', backgroundColor: '#fbe9f3', borderRadius: 24 },
    noSlotsText: { color: '#797174', fontSize: 15, fontWeight: '500' },
    locationCard: {
        backgroundColor: '#ffeff8',
        borderRadius: 24,
        padding: 12,
        gap: 12,
    },
    mapWrap: { height: 128, borderRadius: 20, backgroundColor: '#efdee8', overflow: 'hidden', position: 'relative' },
    mapLayer: { ...StyleSheet.absoluteFillObject },
    mapPinShadow: {
        position: 'absolute',
        top: '50%', left: '50%',
        transform: [{ translateX: -20 }, { translateY: -20 }],
        shadowColor: '#963b52',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 8,
    },
    mapPin: { backgroundColor: '#963b52', padding: 8, borderRadius: 20 },
    addressBlock: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 },
    homeIconWrap: { backgroundColor: '#ffd9de', padding: 12, borderRadius: 12 },
    addressTitle: { fontSize: 16, fontWeight: 'bold', color: '#221920', marginBottom: 2 },
    addressSub: { fontSize: 14, color: 'rgba(84, 66, 69, 0.8)' },
    editBtn: { padding: 8 },
    bottomBarWrapper: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(251, 233, 243, 0.95)',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: Platform.OS === 'ios' ? 36 : 24,
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: -12 },
        shadowOpacity: 0.05,
        shadowRadius: 40,
        elevation: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(239, 222, 232, 0.3)',
    },
    bottomBarInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    totalBlock: { flexDirection: 'column' },
    totalLabel: { fontSize: 12, fontWeight: 'bold', color: '#544245', tracking: 1, marginBottom: 4 },
    totalPrice: { fontSize: 24, fontWeight: '500', color: '#221920', tracking: -0.5 },
    currencyLabel: { fontSize: 18, fontWeight: 'bold', color: '#963b52' },
    confirmBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 32, gap: 12 },
    confirmBtnText: { fontSize: 16, fontWeight: 'bold', color: '#ffffff', letterSpacing: 0.5 },
});
