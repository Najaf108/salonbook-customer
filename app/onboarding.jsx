// app/onboarding.jsx
import { useState, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Dimensions, FlatList, StatusBar, SafeAreaView,
    Animated, Platform,
} from 'react-native';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import storage from '@/lib/storage';

const { width, height } = Dimensions.get('window');

/* ─── Colour tokens from the app design system ─── */
const C = {
    primary: '#963b52',
    primaryLight: '#fbe9f3',
    primaryDark: '#3f0016',
    bg: '#fff7f9',
    surface: '#ffffff',
    muted: '#544245',
    subtle: '#ffd9de',
    text: '#221920',
    chip: '#efdee8',
};

/* ─── Onboarding slides ─── */
const SLIDES = [
    {
        id: '1',
        icon: '💇‍♀️',
        step: 'Step 1',
        title: 'Welcome to\nSalonBook',
        subtitle: 'Your personal salon booking companion. Book any beauty service in minutes — right from your phone.',
        accent: '#963b52',
        bg: '#fff7f9',
        hint: null,
    },
    {
        id: '2',
        icon: '🏪',
        step: 'Step 2',
        title: 'Browse &\nFind Salons',
        subtitle: 'Explore salons near you or filter by category (Hair, Nail, Skin, Spa & more). Tap any salon to see its services, reviews and photos.',
        accent: '#963b52',
        bg: '#fff7f9',
        hint: '💡 Tap a salon card on the Home screen to open it.',
    },
    {
        id: '3',
        icon: '✂️',
        step: 'Step 3',
        title: 'Choose a\nService',
        subtitle: 'Pick from a full menu of services offered by the salon. Each service shows the duration, price and stylist options clearly.',
        accent: '#963b52',
        bg: '#fff7f9',
        hint: '💡 Tap "Book Now" on a service to add it to your booking.',
    },
    {
        id: '4',
        icon: '📅',
        step: 'Step 4',
        title: 'Pick a Date,\nTime & Staff',
        subtitle: 'Select your preferred date and available time slot. You can also choose a specific stylist if you have a favourite.',
        accent: '#963b52',
        bg: '#fff7f9',
        hint: '💡 Green slots are available — tap one to proceed.',
    },
    {
        id: '5',
        icon: '✅',
        step: 'Step 5',
        title: 'Confirm &\nYou\'re Done!',
        subtitle: 'Review your booking summary, confirm the details and you\'re all set! The salon will accept your request and you\'ll get a notification.',
        accent: '#963b52',
        bg: '#fff7f9',
        hint: '💡 Track all your upcoming bookings in the "Bookings" tab.',
    },
];

/* ─── Dot indicator ─── */
function Dot({ active }) {
    return (
        <View
            style={[
                styles.dot,
                active ? styles.dotActive : styles.dotInactive,
            ]}
        />
    );
}

/* ─── Single slide card ─── */
function Slide({ item }) {
    return (
        <View style={[styles.slide, { width }]}>
            {/* Decorative background blob */}
            <View style={styles.blob} />

            {/* Emoji icon */}
            <View style={styles.iconWrapper}>
                <Text style={styles.iconEmoji}>{item.icon}</Text>
            </View>

            {/* Step label */}
            <View style={styles.stepBadge}>
                <Text style={styles.stepText}>{item.step}</Text>
            </View>

            {/* Title */}
            <Text style={styles.slideTitle}>{item.title}</Text>

            {/* Subtitle */}
            <Text style={styles.slideSubtitle}>{item.subtitle}</Text>

            {/* Hint chip */}
            {item.hint && (
                <View style={styles.hintChip}>
                    <Text style={styles.hintText}>{item.hint}</Text>
                </View>
            )}
        </View>
    );
}

/* ─── Main Onboarding Screen ─── */
export default function OnboardingScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const isLast = currentIndex === SLIDES.length - 1;

    const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index ?? 0);
        }
    }, []);

    const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const goNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
        }
    };

    const handleGetStarted = async () => {
        await storage.set('onboarding_done', true);
        router.replace('/');
    };

    const handleSkip = async () => {
        await storage.set('onboarding_done', true);
        router.replace('/');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

            {/* Skip button */}
            {!isLast && (
                <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.7}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            )}

            {/* Slides */}
            <Animated.FlatList
                ref={flatListRef}
                data={SLIDES}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                bounces={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                onViewableItemsChanged={handleViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                renderItem={({ item }) => <Slide item={item} />}
            />

            {/* Bottom bar */}
            <View style={styles.bottomBar}>
                {/* Dot indicators */}
                <View style={styles.dotsRow}>
                    {SLIDES.map((_, i) => (
                        <Dot key={i} active={i === currentIndex} />
                    ))}
                </View>

                {/* Action button */}
                {isLast ? (
                    <TouchableOpacity
                        style={styles.getStartedBtn}
                        onPress={handleGetStarted}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.getStartedText}>Get Started</Text>
                        <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.navRow}>
                        {/* Progress fraction */}
                        <Text style={styles.progressFraction}>
                            {currentIndex + 1} / {SLIDES.length}
                        </Text>

                        {/* Next button */}
                        <TouchableOpacity
                            style={styles.nextBtn}
                            onPress={goNext}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.nextText}>Next</Text>
                            <MaterialIcons name="arrow-forward" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const BLOB_SIZE = width * 0.65;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: C.bg,
    },

    /* ── Skip ── */
    skipBtn: {
        position: 'absolute',
        top: Platform.OS === 'android' ? StatusBar.currentHeight + 12 : 16,
        right: 24,
        zIndex: 10,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: C.chip,
        borderRadius: 20,
    },
    skipText: {
        fontSize: 13,
        fontWeight: '600',
        color: C.primary,
    },

    /* ── Slide ── */
    slide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        paddingTop: 60,
        paddingBottom: 20,
    },
    blob: {
        position: 'absolute',
        top: -BLOB_SIZE * 0.3,
        alignSelf: 'center',
        width: BLOB_SIZE,
        height: BLOB_SIZE,
        borderRadius: BLOB_SIZE / 2,
        backgroundColor: C.subtle,
        opacity: 0.35,
    },

    /* ── Icon ── */
    iconWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: C.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
        shadowColor: '#963b52',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: 2,
        borderColor: C.subtle,
    },
    iconEmoji: {
        fontSize: 52,
    },

    /* ── Step badge ── */
    stepBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: C.primaryLight,
        borderRadius: 20,
        marginBottom: 20,
    },
    stepText: {
        fontSize: 12,
        fontWeight: '700',
        color: C.primary,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },

    /* ── Title ── */
    slideTitle: {
        fontSize: 34,
        fontWeight: 'bold',
        color: C.text,
        textAlign: 'center',
        letterSpacing: -0.8,
        lineHeight: 40,
        marginBottom: 20,
    },

    /* ── Subtitle ── */
    slideSubtitle: {
        fontSize: 16,
        color: C.muted,
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 24,
        maxWidth: width - 80,
    },

    /* ── Hint chip ── */
    hintChip: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: C.primaryLight,
        borderRadius: 16,
        borderLeftWidth: 3,
        borderLeftColor: C.primary,
        maxWidth: width - 60,
    },
    hintText: {
        fontSize: 13,
        color: C.primaryDark,
        fontWeight: '500',
        lineHeight: 20,
        textAlign: 'center',
    },

    /* ── Bottom bar ── */
    bottomBar: {
        paddingHorizontal: 32,
        paddingBottom: Platform.OS === 'android' ? 32 : 20,
        paddingTop: 16,
        backgroundColor: C.bg,
        gap: 20,
    },
    dotsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    dotActive: {
        width: 28,
        backgroundColor: C.primary,
    },
    dotInactive: {
        width: 8,
        backgroundColor: C.chip,
    },

    /* ── Nav row (non-last slides) ── */
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    progressFraction: {
        fontSize: 14,
        fontWeight: '600',
        color: C.muted,
    },
    nextBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.primary,
        paddingHorizontal: 28,
        paddingVertical: 16,
        borderRadius: 30,
        gap: 8,
        shadowColor: '#963b52',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    nextText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },

    /* ── Get Started btn (last slide) ── */
    getStartedBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.primary,
        paddingVertical: 18,
        borderRadius: 30,
        gap: 10,
        shadowColor: '#963b52',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
    },
    getStartedText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },
});
