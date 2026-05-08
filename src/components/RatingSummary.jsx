import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import StarRating from './StarRating';

const { width } = Dimensions.get('window');

const RatingSummary = ({ summary }) => {
    if (!summary) return null;

    const {
        totalReviews,
        avgOverallRating,
        avgStaffRating,
        avgCleanlinessRating,
        avgValueRating,
        ratingDistribution,
        topTags,
    } = summary;

    return (
        <View style={styles.container}>
            {/* Top Section */}
            <View style={styles.topSection}>
                <View style={styles.avgContainer}>
                    <Text style={styles.avgRating}>{avgOverallRating.toFixed(1)}</Text>
                    <StarRating rating={avgOverallRating} size="md" readonly color="#F5A623" />
                    <Text style={styles.totalText}>Based on {totalReviews} reviews</Text>
                </View>

                <View style={styles.chartContainer}>
                    {ratingDistribution.map((item) => (
                        <View key={item.stars} style={styles.barRow}>
                            <Text style={styles.starLabel}>{item.stars} ★</Text>
                            <View style={styles.barBackground}>
                                <View
                                    style={[
                                        styles.barFill,
                                        { width: `${item.percent}%` }
                                    ]}
                                />
                            </View>
                            <Text style={styles.percentText}>{item.percent}%</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Sub-ratings */}
            <View style={styles.subRatingsContainer}>
                {[
                    { label: 'Staff', value: avgStaffRating },
                    { label: 'Cleanliness', value: avgCleanlinessRating },
                    { label: 'Value', value: avgValueRating },
                ].map((item, idx) => (
                    <View key={idx} style={styles.subRatingRow}>
                        <Text style={styles.subRatingLabel}>{item.label}</Text>
                        <View style={styles.subRatingRight}>
                            <StarRating rating={item.value} size="sm" readonly color="#F5A623" />
                            <Text style={styles.subRatingValue}>{item.value.toFixed(1)}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Top Tags */}
            {topTags?.length > 0 && (
                <View style={styles.tagsSection}>
                    <Text style={styles.tagsTitle}>Top mentions:</Text>
                    <View style={styles.tagsContainer}>
                        {topTags.map((item, idx) => (
                            <View key={idx} style={styles.tagPill}>
                                <Text style={styles.tagText}>✓ {item.tag} ({item.count})</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    topSection: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    avgContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 20,
        borderRightWidth: 1,
        borderRightColor: '#F3F4F6',
    },
    avgRating: {
        fontSize: 48,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    totalText: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 8,
    },
    chartContainer: {
        flex: 1.5,
        paddingLeft: 20,
        justifyContent: 'center',
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    starLabel: {
        fontSize: 11,
        color: '#4B5563',
        width: 24,
        fontWeight: '600',
    },
    barBackground: {
        flex: 1,
        height: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
        marginHorizontal: 8,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: '#FE2C55',
        borderRadius: 4,
    },
    percentText: {
        fontSize: 10,
        color: '#9CA3AF',
        width: 25,
        textAlign: 'right',
    },
    subRatingsContainer: {
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        marginBottom: 16,
    },
    subRatingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    subRatingLabel: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },
    subRatingRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subRatingValue: {
        fontSize: 13,
        color: '#111827',
        fontWeight: '700',
        marginLeft: 8,
        width: 25,
        textAlign: 'right',
    },
    tagsSection: {
        marginTop: 8,
    },
    tagsTitle: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '700',
        marginBottom: 12,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tagPill: {
        backgroundColor: '#F0F9FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E0F2FE',
    },
    tagText: {
        fontSize: 12,
        color: '#0369A1',
        fontWeight: '600',
    },
});

export default RatingSummary;
