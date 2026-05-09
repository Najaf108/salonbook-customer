// app/(app)/(home)/checkout.jsx
import { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, SafeAreaView, Platform, StatusBar, Linking
} from 'react-native';
import { router, Stack } from 'expo-router';
import { format } from 'date-fns';
import { useBookingStore } from '@/stores/useBookingStore';
import { useCreateBooking } from '@/hooks/useBookings';
import { PAYMENT_METHODS } from '@/constants/categories';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import SalonLogo from '@/components/SalonLogo';
import { dealsService } from '@/services/deals.service';
import { useAuthStore } from '@/stores/useAuthStore';

export default function CheckoutScreen() {
    const { user } = useAuthStore();
    const requiresPrepayment = (user?.noShowCount ?? 0) >= 3;
    const JAZZCASH_NUMBER = '03027168108';

    const {
        salon, selectedServices, selectedStaff, selectedDate, selectedTime,
        paymentMethod, notes, setPaymentMethod, setNotes,
        getTotalPrice, getSubtotal, getTotalDuration, getServiceIds, getScheduledAt, reset,
        appliedDeal, setAppliedDeal, clearAppliedDeal, packageId, selectedPackage
    } = useBookingStore();
    const { mutateAsync: createBooking, isPending } = useCreateBooking();

    const [isNotesFocused, setIsNotesFocused] = useState(false);
    const [isValidatingDeal, setIsValidatingDeal] = useState(false);

    const subtotal = getSubtotal();
    const totalPrice = getTotalPrice();
    const discount = Math.max(0, subtotal - totalPrice);
    const serviceIds = getServiceIds();
    const serviceIdsKey = serviceIds.join(',');

    // Auto-validate deal on mount or when services/deal change if discount is pending
    useEffect(() => {
        const validateDeal = async () => {
            if (appliedDeal && appliedDeal.discountAmount === null && serviceIds.length > 0) {
                setIsValidatingDeal(true);
                try {
                    const result = await dealsService.applyDeal(appliedDeal.id, {
                        serviceIds,
                        totalAmount: subtotal,
                    });
                    setAppliedDeal({
                        ...appliedDeal,
                        discountAmount: result.discountAmount,
                        finalAmount: result.finalAmount
                    });
                } catch (err) {
                    const errorMsg = err.response?.data?.error || 'Deal validation failed';
                    console.error('Auto-validation error:', errorMsg);

                    // If it's a validation error (400), we should still set discountAmount to 0
                    // so the UI knows the deal is invalid for this selection
                    if (err.response?.status === 400) {
                        setAppliedDeal({
                            ...appliedDeal,
                            discountAmount: 0,
                            isInvalid: true,
                            error: errorMsg
                        });
                    }
                } finally {
                    setIsValidatingDeal(false);
                }
            }
        };
        validateDeal();
    }, [appliedDeal?.id, subtotal, serviceIdsKey]);

    const handleConfirm = async () => {
        let finalDeal = appliedDeal;

        // If a deal is still pending (discount not yet computed), validate it now
        if (appliedDeal && appliedDeal.discountAmount === null) {
            setIsValidatingDeal(true);
            try {
                const result = await dealsService.applyDeal(appliedDeal.id, {
                    serviceIds: getServiceIds(),
                    totalAmount: subtotal,
                });
                finalDeal = { ...appliedDeal, discountAmount: result.discountAmount, finalAmount: result.finalAmount };
                setAppliedDeal(finalDeal);
            } catch (err) {
                setIsValidatingDeal(false);
                const msg = err.response?.data?.error || 'The applied deal is no longer valid. Please remove it and try again.';
                Alert.alert('Deal Invalid', msg);
                return;
            } finally {
                setIsValidatingDeal(false);
            }
        }

        try {
            const booking = await createBooking({
                salonId: salon.id,
                staffId: selectedStaff?.id || null,
                scheduledAt: getScheduledAt(),
                serviceIds: getServiceIds(),
                paymentMethod,
                notes,
                ...(packageId && { packageId }),
                ...(finalDeal && { dealId: finalDeal.id }),
            });
            if (paymentMethod !== 'CASH_ON_ARRIVAL') {
                router.push({ pathname: '/(app)/(home)/payment', params: { bookingId: booking.id } });
            } else {
                reset();
                router.replace({ pathname: '/(app)/(home)/confirmation', params: { bookingId: booking.id } });
            }
        } catch (err) {
            Alert.alert('Booking Failed', err.response?.data?.error || 'Something went wrong. Please try again.');
        }
    };

    const getPaymentIconMap = (id) => {
        const safeId = String(id).toLowerCase();
        if (safeId.includes('jazz')) return 'account-balance-wallet';
        if (safeId.includes('easypaisa')) return 'payments';
        if (safeId.includes('cash')) return 'money';
        return 'credit-card';
    };

    const getPaymentSub = (id) => {
        const safeId = String(id).toLowerCase();
        if (safeId.includes('jazz')) return 'Instant digital payment';
        if (safeId.includes('easypaisa')) return 'Pay via EasyPaisa app';
        if (safeId.includes('cash')) return 'Pay after your service';
        return 'Secure digital payment';
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
                    <Text style={styles.appTitle}>SalonBook</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Main Scroll content */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Header Titles */}
                    <View style={styles.headerBlock}>
                        <Text style={styles.pageTitle}>Review Booking</Text>
                        <Text style={styles.pageSubtitle}>Almost there. Please confirm your details.</Text>
                    </View>

                    {/* Atelier Card: Summary */}
                    <View style={styles.atelierCard}>
                        {/* Decorative Top-Right Corner */}
                        <View style={styles.atelierAccent} />

                        {/* Salon Identity */}
                        <View style={styles.salonInfoRow}>
                            <View style={styles.salonImageWrap}>
                                <SalonLogo
                                    uri={salon?.logoUrl}
                                    name={salon?.name}
                                    size={80}
                                />
                            </View>
                            <View style={styles.salonTextWrap}>
                                <Text style={styles.salonName}>{salon?.name}</Text>
                                <View style={styles.iconRow}>
                                    <MaterialIcons name="calendar-month" size={16} color="#544245" />
                                    <Text style={styles.iconRowText}>
                                        {selectedDate && selectedTime ? format(new Date(`${selectedDate}T${selectedTime}`), 'EEE, MMM dd • h:mm a') : '—'}
                                    </Text>
                                </View>
                                <View style={styles.iconRow}>
                                    <MaterialIcons name="person" size={16} color="#544245" />
                                    <Text style={styles.iconRowText}>Stylist: <Text style={{ fontWeight: 'bold', color: '#221920' }}>{selectedStaff?.name || 'Any'}</Text></Text>
                                </View>
                            </View>
                        </View>

                        {/* Services List Nesting */}
                        <View style={styles.servicesNest}>
                            {selectedPackage && (
                                <View style={styles.packageHeader}>
                                    <MaterialIcons name="inventory-2" size={20} color="#963b52" />
                                    <Text style={styles.packageHeaderText}>Package: {selectedPackage.name}</Text>
                                </View>
                            )}
                            {selectedServices.map(s => (
                                <View key={s.id} style={styles.serviceRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.serviceName}>{s.name}</Text>
                                        <Text style={styles.serviceSub}>{selectedPackage ? 'Part of Package' : 'Service Selection'}</Text>
                                    </View>
                                    <Text style={styles.servicePrice}>PKR {s.price?.toLocaleString()}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Deal Section - Only show for regular service bookings, not packages */}
                    {!packageId && !selectedPackage && (
                        <View style={styles.sectionBlock}>
                            <Text style={styles.sectionHeading}>Deal / Discount</Text>
                            {appliedDeal ? (
                                <View style={[styles.appliedDealRow, appliedDeal.isInvalid && styles.invalidDealRow]}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.appliedDealTitle}>🏷️ {appliedDeal.title}</Text>
                                        {appliedDeal.isInvalid ? (
                                            <Text style={styles.invalidDealText}>⚠️ {appliedDeal.error || 'Not applicable to this selection'}</Text>
                                        ) : appliedDeal.discountAmount != null ? (
                                            <Text style={styles.appliedDealDiscount}>- Rs. {appliedDeal.discountAmount?.toLocaleString()} saved</Text>
                                        ) : (
                                            <Text style={styles.appliedDealPending}>⏳ Discount calculated at checkout</Text>
                                        )}
                                    </View>
                                    <TouchableOpacity onPress={clearAppliedDeal} activeOpacity={0.8} style={styles.removeDealBtn}>
                                        <Text style={styles.removeDealText}>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.addDealBtn}
                                    onPress={() => router.push(`/(app)/(home)/deals?salonId=${salon.id}`)}
                                    activeOpacity={0.8}
                                >
                                    <MaterialIcons name="local-offer" size={18} color="#963b52" />
                                    <Text style={styles.addDealText}>Apply a Deal</Text>
                                    <MaterialIcons name="chevron-right" size={18} color="#963b52" />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Payments Block */}
                    <View style={styles.sectionBlock}>
                        <Text style={styles.sectionHeading}>Payment Method</Text>

                        {/* No-Show Prepayment Banner */}
                        {requiresPrepayment && (
                            <View style={styles.prepayBanner}>
                                <View style={styles.prepayBannerHeader}>
                                    <MaterialIcons name="warning" size={20} color="#fff" />
                                    <Text style={styles.prepayBannerTitle}>Prepayment Required</Text>
                                </View>
                                <Text style={styles.prepayBannerBody}>
                                    You have {user.noShowCount} no-shows on record. Please send payment via JazzCash before your booking is confirmed.
                                </Text>
                                <TouchableOpacity
                                    style={styles.prepayJazzBtn}
                                    activeOpacity={0.8}
                                    onPress={() => Linking.openURL(`tel:${JAZZCASH_NUMBER}`)}
                                >
                                    <MaterialIcons name="account-balance-wallet" size={18} color="#E8194B" />
                                    <Text style={styles.prepayJazzBtnText}>📱 JazzCash: {JAZZCASH_NUMBER}</Text>
                                </TouchableOpacity>
                                <Text style={styles.prepayNote}>
                                    Cash on Arrival is disabled for your account.
                                </Text>
                            </View>
                        )}

                        <View style={styles.paymentMethodsGrid}>
                            {PAYMENT_METHODS.map(method => {
                                const isSelected = paymentMethod === method.id;
                                const isCashBlocked = requiresPrepayment && method.id === 'CASH_ON_ARRIVAL';
                                const isComingSoon = method.id === 'JAZZCASH' || method.id === 'EASYPAISA';

                                return (
                                    <View key={method.id} style={{ position: 'relative' }}>
                                        <TouchableOpacity
                                            style={[
                                                styles.paymentCard,
                                                isSelected && styles.paymentCardSelected,
                                                (isCashBlocked || isComingSoon) && styles.paymentCardDisabled,
                                            ]}
                                            activeOpacity={(isCashBlocked || isComingSoon) ? 1 : 0.8}
                                            onPress={() => {
                                                if (isComingSoon) {
                                                    Alert.alert('Coming Soon', 'Online payments will be available in the next update. Please use Cash on Arrival for now.');
                                                    return;
                                                }
                                                if (isCashBlocked) {
                                                    Alert.alert(
                                                        'Cash Not Available',
                                                        `You have ${user.noShowCount} no-shows. Please pay online via JazzCash: ${JAZZCASH_NUMBER}`
                                                    );
                                                    return;
                                                }
                                                setPaymentMethod(method.id);
                                            }}
                                        >
                                            <View style={styles.paymentCardLeft}>
                                                <View style={[styles.paymentIconBox, isSelected && styles.paymentIconBoxSelected]}>
                                                    <MaterialIcons name={getPaymentIconMap(method.id)} size={24} color={isSelected ? '#963b52' : (isCashBlocked || isComingSoon) ? '#b0b0b0' : '#544245'} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.paymentName, (isCashBlocked || isComingSoon) && styles.paymentNameDisabled]}>{method.label}</Text>
                                                    <Text style={styles.paymentSub}>{getPaymentSub(method.id)}</Text>
                                                    {isCashBlocked && (
                                                        <Text style={styles.paymentBlockedNote}>🚫 Not available for your account</Text>
                                                    )}
                                                </View>
                                            </View>
                                            {isSelected && !isCashBlocked && (
                                                <View style={styles.paymentCheckbox}>
                                                    <MaterialIcons name="check" size={16} color="#ffffff" />
                                                </View>
                                            )}
                                            {isCashBlocked && (
                                                <MaterialIcons name="block" size={22} color="#e53e3e" />
                                            )}
                                            {isComingSoon && (
                                                <MaterialIcons name="schedule" size={22} color="#7b5804" style={{ opacity: 0.5 }} />
                                            )}
                                        </TouchableOpacity>

                                        {isComingSoon && (
                                            <View style={styles.comingSoonBadge}>
                                                <Text style={styles.comingSoonText}>Available Soon</Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    {/* Special Requests */}
                    <View style={styles.sectionBlock}>
                        <Text style={styles.sectionHeading}>Special Requests</Text>
                        <View style={[styles.notesWrapper, isNotesFocused && styles.notesWrapperFocused]}>
                            {isNotesFocused && <View style={styles.notesHighlight} />}
                            <TextInput
                                style={styles.notesInput}
                                placeholder={`Any allergies, preferences, or notes for ${selectedStaff?.name || 'the stylist'}?`}
                                placeholderTextColor="rgba(84, 66, 69, 0.5)"
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={4}
                                onFocus={() => setIsNotesFocused(true)}
                                onBlur={() => setIsNotesFocused(false)}
                            />
                        </View>
                    </View>

                </ScrollView>

                {/* Sticky Bottom Actions */}
                <View style={styles.bottomBarWrapper}>
                    <View style={styles.bottomBarInner}>
                        <View style={styles.totalBlock}>
                            {discount > 0 && (
                                <Text style={styles.subtotalLine}>Subtotal  Rs. {subtotal?.toLocaleString()}</Text>
                            )}
                            {discount > 0 && (
                                <Text style={styles.discountLine}>Deal  -Rs. {discount?.toLocaleString()}</Text>
                            )}
                            <Text style={styles.totalLabel}>Grand Total</Text>
                            <Text style={styles.totalPrice}>
                                <Text style={styles.currencyLabel}>PKR </Text>
                                {totalPrice?.toLocaleString()}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                if (requiresPrepayment) {
                                    Alert.alert(
                                        'Prepayment Required',
                                        `You have ${user?.noShowCount} no-shows on record. Please pay online via JazzCash (${JAZZCASH_NUMBER}) before booking.`,
                                        [{ text: 'OK' }]
                                    );
                                    return;
                                }
                                handleConfirm();
                            }}
                            activeOpacity={requiresPrepayment ? 1 : 0.9}
                            disabled={isPending || isValidatingDeal}
                            style={{ flex: 1, opacity: (isPending || isValidatingDeal) ? 0.7 : 1 }}
                        >
                            <LinearGradient
                                colors={requiresPrepayment ? ['#9ca3af', '#6b7280'] : ['#963b52', '#b5536a']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.confirmBtn}
                            >
                                {requiresPrepayment
                                    ? <MaterialIcons name="lock" size={20} color="#fff" />
                                    : null
                                }
                                <Text style={styles.confirmBtnText}>
                                    {requiresPrepayment
                                        ? 'Pay Online First'
                                        : isValidatingDeal ? 'Validating Deal...'
                                            : isPending ? 'Processing...'
                                                : (paymentMethod === 'CASH_ON_ARRIVAL' ? 'Confirm Booking' : 'Confirm & Pay')}
                                </Text>
                                {!isPending && !isValidatingDeal && !requiresPrepayment && <MaterialIcons name="arrow-forward" size={20} color="#fff" />}
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
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 8,
        paddingBottom: 8,
        backgroundColor: 'rgba(255, 247, 249, 0.95)',
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
    headerBlock: { marginBottom: 32 },
    pageTitle: { fontSize: 36, fontWeight: '900', color: '#221920', letterSpacing: -1, marginBottom: 8 },
    pageSubtitle: { fontSize: 16, color: '#544245' },
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
    salonInfoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 24, zIndex: 10 },
    salonImageWrap: {
        width: 80, height: 80,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#1a1118',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 4,
    },
    salonTextWrap: { flex: 1, justifyContent: 'center' },
    salonName: { fontSize: 20, fontWeight: 'bold', color: '#221920', marginBottom: 6 },
    iconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    iconRowText: { fontSize: 14, color: '#544245' },
    servicesNest: {
        backgroundColor: '#fff7f9',
        borderRadius: 16,
        padding: 16,
        gap: 16,
    },
    serviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    serviceName: { fontSize: 16, fontWeight: 'bold', color: '#221920', marginBottom: 2 },
    serviceSub: { fontSize: 13, color: '#544245' },
    servicePrice: { fontSize: 18, fontWeight: 'bold', color: '#963b52' },
    packageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(150, 59, 82, 0.1)',
        marginBottom: 8,
    },
    packageHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#963b52',
    },
    sectionBlock: { marginBottom: 32 },
    sectionHeading: { fontSize: 22, fontWeight: 'bold', color: '#221920', letterSpacing: -0.5, marginBottom: 16 },
    paymentMethodsGrid: { flexDirection: 'column', gap: 12 },
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 3,
        borderColor: 'transparent',
    },
    paymentCardSelected: {
        backgroundColor: '#fbe9f3',
        borderColor: 'rgba(123, 88, 4, 0.1)',
    },
    paymentCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
    paymentIconBox: {
        width: 48, height: 48,
        borderRadius: 12,
        backgroundColor: '#fff7f9',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1a1118',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 1,
    },
    paymentIconBoxSelected: { backgroundColor: '#ffffff' },
    paymentName: { fontSize: 16, fontWeight: 'bold', color: '#221920' },
    paymentSub: { fontSize: 13, color: '#544245' },
    paymentCheckbox: {
        width: 24, height: 24,
        borderRadius: 12,
        backgroundColor: '#963b52',
        alignItems: 'center',
        justifyContent: 'center',
    },
    notesWrapper: {
        position: 'relative',
        backgroundColor: '#fbe9f3',
        borderRadius: 24,
        overflow: 'hidden',
    },
    notesWrapperFocused: { backgroundColor: '#f5e3ee' },
    notesHighlight: {
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: 4,
        backgroundColor: '#7b5804',
        borderTopLeftRadius: 24,
        borderBottomLeftRadius: 24,
    },
    notesInput: {
        padding: 20,
        minHeight: 100,
        fontSize: 16,
        color: '#221920',
        textAlignVertical: 'top',
        lineHeight: 24,
    },
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
    bottomBarInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 24 },
    totalBlock: { flexDirection: 'column' },
    totalLabel: { fontSize: 13, color: '#544245', fontWeight: '500', marginBottom: 2 },
    totalPrice: { flexDirection: 'row', alignItems: 'baseline' },
    currencyLabel: { fontSize: 18, fontWeight: 'bold', color: '#963b52' },
    confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 32, gap: 8, shadowColor: '#963b52', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 30, elevation: 8 },
    confirmBtnText: { fontSize: 16, fontWeight: 'bold', color: '#ffffff', letterSpacing: 0.5 },
    subtotalLine: { fontSize: 12, color: '#544245', marginBottom: 1 },
    discountLine: { fontSize: 12, color: '#16a34a', fontWeight: '600', marginBottom: 2 },
    addDealBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#fbe9f3',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#efdee8',
    },
    addDealText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#963b52' },
    appliedDealRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dcfce7',
        borderRadius: 16,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    invalidDealRow: {
        backgroundColor: '#fee2e2',
        borderColor: '#fecaca',
    },
    invalidDealText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#ba1a1a',
    },
    appliedDealTitle: { fontSize: 15, fontWeight: 'bold', color: '#221920', marginBottom: 4 },
    appliedDealDiscount: { fontSize: 14, fontWeight: '600', color: '#16a34a' },
    appliedDealPending: { fontSize: 13, fontWeight: '500', color: '#b45309', fontStyle: 'italic' },
    removeDealBtn: {
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    removeDealText: { fontSize: 13, fontWeight: 'bold', color: '#544245' },
    // Prepayment banner styles
    prepayBanner: {
        backgroundColor: '#7f1d1d',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        gap: 10,
        borderWidth: 1,
        borderColor: '#991b1b',
    },
    prepayBannerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    prepayBannerTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -0.3,
    },
    prepayBannerBody: {
        fontSize: 13,
        color: '#fecaca',
        lineHeight: 20,
    },
    prepayJazzBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        alignSelf: 'flex-start',
    },
    prepayJazzBtnText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#E8194B',
        letterSpacing: 0.3,
    },
    prepayNote: {
        fontSize: 11,
        color: '#fca5a5',
        fontStyle: 'italic',
    },
    // Disabled payment card
    paymentCardDisabled: {
        opacity: 0.5,
        backgroundColor: '#f3f4f6',
        borderColor: '#e5e7eb',
    },
    paymentNameDisabled: {
        color: '#9ca3af',
    },
    paymentBlockedNote: {
        fontSize: 11,
        color: '#e53e3e',
        fontWeight: '600',
        marginTop: 2,
    },
    comingSoonBadge: {
        position: 'absolute',
        top: -6,
        right: 12,
        backgroundColor: '#7b5804',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        zIndex: 10,
        shadowColor: '#7b5804',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    comingSoonText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#ffffff',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
