import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, LayoutAnimation } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StarRating from './StarRating';
import ReviewPhotoGrid from './ReviewPhotoGrid';
import { format } from 'date-fns';
import { useAuthStore } from '../stores/useAuthStore';
import { useDeleteReview, useMarkHelpful } from '../hooks/useReviews';
import { Alert } from 'react-native';

const ReviewCard = ({ review, showSalonName = false, onReport }) => {
    const { user } = useAuthStore();
    const [expanded, setExpanded] = useState(false);
    const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
    const [isHelpful, setIsHelpful] = useState(review.isHelpful || false);

    const { mutate: deleteReview } = useDeleteReview();
    const { mutate: markHelpful } = useMarkHelpful();

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    const handleHelpful = () => {
        setIsHelpful(!isHelpful);
        setHelpfulCount(prev => isHelpful ? prev - 1 : prev + 1);
        markHelpful(review.id);
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Review",
            "Are you sure you want to delete your review? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteReview(review.id)
                }
            ]
        );
    };

    const isAuthor = user?.id === review.customerId;

    const customerName = review.isAnonymous ? 'Anonymous' : (review.customer?.name || 'User');
    const customerPhoto = review.isAnonymous ? null : review.customer?.profilePhoto;

    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    {customerPhoto ? (
                        <Image source={{ uri: customerPhoto }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.placeholderAvatar]}>
                            <Text style={styles.avatarText}>{customerName[0]}</Text>
                        </View>
                    )}
                    <View>
                        <View style={styles.nameRow}>
                            <Text style={styles.name}>{customerName}</Text>
                            {review.editedAt && <Text style={styles.edited}>(edited)</Text>}
                        </View>
                        <Text style={styles.date}>{format(new Date(review.createdAt), 'MMM dd, yyyy')}</Text>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    {isAuthor && (
                        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => onReport?.(review.id)}>
                        <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Ratings */}
            <View style={styles.ratingSection}>
                <StarRating rating={review.overallRating} size="sm" readonly color="#F5A623" />
                {review.staffRating && (
                    <View style={styles.staffRatingRow}>
                        <Text style={styles.staffRatingText}>Staff: </Text>
                        <StarRating rating={review.staffRating} size="sm" readonly color="#F5A623" />
                    </View>
                )}
            </View>

            {/* Tags */}
            {review.tags?.length > 0 && (
                <View style={styles.tagsContainer}>
                    {review.tags.map((tag, idx) => (
                        <View key={idx} style={styles.tagPill}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Content */}
            <View style={styles.content}>
                {review.title && <Text style={styles.title}>{review.title}</Text>}
                {review.comment && (
                    <TouchableOpacity activeOpacity={0.8} onPress={toggleExpand}>
                        <Text
                            style={styles.comment}
                            numberOfLines={expanded ? undefined : 3}
                        >
                            {review.comment}
                        </Text>
                        {review.comment.length > 150 && !expanded && (
                            <Text style={styles.readMore}>Read more</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Photos */}
            <ReviewPhotoGrid photos={review.photos} />

            {/* Owner Reply */}
            {review.ownerReply && (
                <View style={styles.replyContainer}>
                    <View style={styles.replyHeader}>
                        <Text style={styles.replyLabel}>💬 Owner's Response</Text>
                        <Text style={styles.replyDate}>{format(new Date(review.ownerRepliedAt), 'MMM dd')}</Text>
                    </View>
                    <Text style={styles.replyText}>{review.ownerReply}</Text>
                </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.helpfulButton, isHelpful && styles.helpfulButtonActive]}
                    onPress={handleHelpful}
                >
                    <Ionicons
                        name={isHelpful ? "thumbs-up" : "thumbs-up-outline"}
                        size={16}
                        color={isHelpful ? "#FE2C55" : "#666"}
                    />
                    <Text style={[styles.footerText, isHelpful && styles.helpfulTextActive]}>
                        Helpful ({helpfulCount})
                    </Text>
                </TouchableOpacity>

                {showSalonName && review.salon && (
                    <Text style={styles.salonName}>{review.salon.name}</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    deleteBtn: {
        padding: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    placeholderAvatar: {
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#6B7280',
        fontWeight: '700',
        fontSize: 18,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        fontWeight: '700',
        fontSize: 15,
        color: '#111827',
    },
    edited: {
        fontSize: 12,
        color: '#9CA3AF',
        marginLeft: 4,
        fontStyle: 'italic',
    },
    date: {
        fontSize: 12,
        color: '#6B7280',
    },
    ratingSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    staffRatingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
        paddingLeft: 12,
        borderLeftWidth: 1,
        borderLeftColor: '#E5E7EB',
    },
    staffRatingText: {
        fontSize: 12,
        color: '#6B7280',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10,
    },
    tagPill: {
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 6,
        marginBottom: 6,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    tagText: {
        fontSize: 11,
        color: '#4B5563',
        fontWeight: '500',
    },
    content: {
        marginBottom: 12,
    },
    title: {
        fontWeight: '700',
        fontSize: 16,
        color: '#111827',
        marginBottom: 4,
    },
    comment: {
        fontSize: 14,
        lineHeight: 20,
        color: '#374151',
    },
    readMore: {
        color: '#FE2C55',
        fontWeight: '600',
        marginTop: 4,
    },
    replyContainer: {
        backgroundColor: '#F0FDF4',
        padding: 12,
        borderRadius: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#DCFCE7',
    },
    replyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    replyLabel: {
        fontWeight: '700',
        fontSize: 13,
        color: '#166534',
    },
    replyDate: {
        fontSize: 11,
        color: '#166534',
        opacity: 0.7,
    },
    replyText: {
        fontSize: 13,
        color: '#14532D',
        lineHeight: 18,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    helpfulButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 6,
        borderRadius: 8,
    },
    helpfulButtonActive: {
        backgroundColor: '#FEF2F2',
    },
    footerText: {
        fontSize: 13,
        color: '#6B7280',
        marginLeft: 6,
        fontWeight: '500',
    },
    helpfulTextActive: {
        color: '#FE2C55',
    },
    salonName: {
        fontSize: 12,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
});

export default ReviewCard;
