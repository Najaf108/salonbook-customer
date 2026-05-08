import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import StarRating from '../../../src/components/StarRating';

const ReviewSuccessScreen = () => {
    const router = useRouter();
    const { rating, salonName, comment, tags } = useLocalSearchParams();
    const scaleAnim = new Animated.Value(0);
    const tagList = tags ? tags.split(',') : [];

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Animated.View style={[styles.successIcon, { transform: [{ scale: scaleAnim }] }]}>
                    <Ionicons name="checkmark-circle" size={100} color="#10B981" />
                </Animated.View>

                <Text style={styles.title}>Thank you!</Text>
                <Text style={styles.subtitle}>Your review helps others find great salons</Text>

                <View style={styles.summaryCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.salonName}>{salonName}</Text>
                        <StarRating rating={parseInt(rating)} size="sm" readonly />
                    </View>

                    {tagList.length > 0 && (
                        <View style={styles.tagsRow}>
                            {tagList.map(tag => (
                                <View key={tag} style={styles.tagPill}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {comment && (
                        <Text style={styles.commentPreview} numberOfLines={2}>
                            "{comment}..."
                        </Text>
                    )}
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => {
                        router.dismissAll();
                        router.replace('/(app)/(profile)/reviews');
                    }}
                >
                    <Text style={styles.primaryBtnText}>View My Review</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => {
                        router.dismissAll();
                        router.replace('/(app)/(home)');
                    }}
                >
                    <Text style={styles.secondaryBtnText}>Back to Home</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 24,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    successIcon: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    summaryCard: {
        width: '100%',
        backgroundColor: '#F9FAFB',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    salonName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    tagsRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    tagPill: {
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    tagText: {
        fontSize: 12,
        color: '#4B5563',
        fontWeight: '600',
    },
    commentPreview: {
        fontSize: 14,
        color: '#6B7280',
        fontStyle: 'italic',
        lineHeight: 20,
    },
    footer: {
        marginTop: 'auto',
        gap: 12,
    },
    primaryBtn: {
        backgroundColor: '#FE2C55',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryBtn: {
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    secondaryBtnText: {
        color: '#4B5563',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ReviewSuccessScreen;
