import React, { useState, useMemo } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput,
    TouchableOpacity, Image, Switch, Alert, ActivityIndicator,
    KeyboardAvoidingView, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import StarRating from '../../../src/components/StarRating';
import { useCreateReview } from '../../../src/hooks/useReviews';
import { SafeAreaView } from 'react-native-safe-area-context';

const POSITIVE_TAGS = [
    "Friendly Staff", "Clean Salon", "On Time",
    "Great Results", "Good Value", "Professional",
    "Relaxing Atmosphere", "Would Visit Again",
    "Highly Recommend", "Amazing Skills"
];

const NEGATIVE_TAGS = [
    "Long Wait Time", "Poor Service", "Not Clean",
    "Overpriced", "Unfriendly Staff", "Wrong Service",
    "Poor Results", "Would Not Return"
];

const ReviewScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { bookingId, salonId, salonName, staffId, staffName, services, date } = params;

    const [overallRating, setOverallRating] = useState(0);
    const [staffRating, setStaffRating] = useState(0);
    const [cleanlinessRating, setCleanlinessRating] = useState(0);
    const [valueRating, setValueRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [showSubRatings, setShowSubRatings] = useState(false);

    const { mutate: createReview, isPending } = useCreateReview();

    const activeTags = useMemo(() => {
        return overallRating >= 3 ? POSITIVE_TAGS : NEGATIVE_TAGS;
    }, [overallRating]);

    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else if (selectedTags.length < 6) {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const pickImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 3 - selectedPhotos.length,
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedPhotos([...selectedPhotos, ...result.assets]);
        }
    };

    const removePhoto = (index) => {
        setSelectedPhotos(selectedPhotos.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        if (overallRating === 0) {
            Alert.alert("Required", "Please select a star rating to continue");
            return;
        }

        const payload = {
            bookingId,
            staffId: staffId || null,
            overallRating,
            staffRating: staffRating || null,
            cleanlinessRating: cleanlinessRating || null,
            valueRating: valueRating || null,
            title: title.trim() || null,
            comment: comment.trim() || null,
            tags: selectedTags,
            isAnonymous,
        };

        createReview(
            { data: payload, photos: selectedPhotos },
            {
                onSuccess: (data) => {
                    router.replace({
                        pathname: '/(app)/(bookings)/review-success',
                        params: {
                            rating: overallRating,
                            salonName,
                            comment: comment.substring(0, 100),
                            tags: selectedTags.slice(0, 2).join(',')
                        }
                    });
                },
                onError: (err) => {
                    Alert.alert("Error", err.response?.data?.error || "Failed to submit review");
                }
            }
        );
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="close" size={28} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Write a Review</Text>
                    <View style={{ width: 28 }} />
                </View>

                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Section 1: Salon Info */}
                    <View style={styles.salonCard}>
                        <Image source={{ uri: 'https://via.placeholder.com/60' }} style={styles.salonPhoto} />
                        <View style={styles.salonInfo}>
                            <Text style={styles.salonNameText}>{salonName}</Text>
                            <Text style={styles.servicesText}>{services || 'Haircut, Facial'}</Text>
                            <Text style={styles.dateText}>{date || 'April 15, 2026'}</Text>
                        </View>
                    </View>

                    {/* Section 2: Overall Rating */}
                    <View style={[styles.section, overallRating > 0 && styles.sectionActive]}>
                        <Text style={styles.sectionTitle}>How was your overall experience?</Text>
                        <StarRating
                            rating={overallRating}
                            onChange={setOverallRating}
                            size="xl"
                            showLabel
                        />
                    </View>

                    {/* Section 3: Staff Rating */}
                    {staffId && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Rate your stylist</Text>
                            <View style={styles.staffRow}>
                                <View style={styles.staffAvatar}>
                                    <Ionicons name="person" size={24} color="#9CA3AF" />
                                </View>
                                <Text style={styles.staffName}>{staffName}</Text>
                            </View>
                            <StarRating
                                rating={staffRating}
                                onChange={setStaffRating}
                                size="lg"
                            />
                        </View>
                    )}

                    {/* Section 4: Sub-Ratings */}
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.expandToggle}
                            onPress={() => setShowSubRatings(!showSubRatings)}
                        >
                            <Text style={styles.expandTitle}>Add more details</Text>
                            <Ionicons
                                name={showSubRatings ? "chevron-up" : "chevron-down"}
                                size={20}
                                color="#6B7280"
                            />
                        </TouchableOpacity>

                        {showSubRatings && (
                            <View style={styles.subRatingsList}>
                                <View style={styles.subRatingRow}>
                                    <Text style={styles.subLabel}>Cleanliness</Text>
                                    <StarRating rating={cleanlinessRating} onChange={setCleanlinessRating} size="md" />
                                </View>
                                <View style={styles.subRatingRow}>
                                    <Text style={styles.subLabel}>Value for Money</Text>
                                    <StarRating rating={valueRating} onChange={setValueRating} size="md" />
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Section 5: Tags */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            {overallRating >= 3 ? "What did you love?" : "Tell us more"}
                        </Text>
                        <View style={styles.tagsGrid}>
                            {activeTags.map(tag => (
                                <TouchableOpacity
                                    key={tag}
                                    style={[
                                        styles.tagPill,
                                        selectedTags.includes(tag) && styles.tagPillSelected
                                    ]}
                                    onPress={() => toggleTag(tag)}
                                >
                                    <Text style={[
                                        styles.tagText,
                                        selectedTags.includes(tag) && styles.tagTextSelected
                                    ]}>
                                        {tag}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Section 6: Title */}
                    <View style={styles.section}>
                        <View style={styles.labelRow}>
                            <Text style={styles.sectionTitle}>Review Headline</Text>
                            <Text style={styles.charCount}>{title.length}/80</Text>
                        </View>
                        <TextInput
                            style={styles.titleInput}
                            placeholder="Add a headline (optional)"
                            value={title}
                            onChangeText={(text) => text.length <= 80 && setTitle(text)}
                            maxLength={80}
                        />
                    </View>

                    {/* Section 7: Comment */}
                    <View style={styles.section}>
                        <View style={styles.labelRow}>
                            <Text style={styles.sectionTitle}>Your Review</Text>
                            <Text style={styles.charCount}>{comment.length}/500</Text>
                        </View>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Share details of your experience..."
                            value={comment}
                            onChangeText={(text) => text.length <= 500 && setComment(text)}
                            multiline
                            maxLength={500}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Section 8: Photos */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Add photos (optional)</Text>
                        <Text style={styles.photoHint}>📷 Photos help others choose the right salon</Text>

                        <View style={styles.photoContainer}>
                            {selectedPhotos.map((photo, index) => (
                                <View key={index} style={styles.photoWrapper}>
                                    <Image source={{ uri: photo.uri }} style={styles.thumbnail} />
                                    <TouchableOpacity
                                        style={styles.removePhotoBtn}
                                        onPress={() => removePhoto(index)}
                                    >
                                        <Ionicons name="close-circle" size={24} color="#FE2C55" />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {selectedPhotos.length < 3 && (
                                <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImages}>
                                    <Ionicons name="camera-outline" size={32} color="#9CA3AF" />
                                    <Text style={styles.addPhotoText}>Add Photo</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <Text style={styles.maxPhotos}>Max 3 photos</Text>
                    </View>

                    {/* Section 9: Anonymous */}
                    <View style={styles.anonymousRow}>
                        <View style={styles.anonymousTextCol}>
                            <Text style={styles.anonymousTitle}>Post anonymously</Text>
                            <Text style={styles.anonymousSub}>Your name won't be shown with this review</Text>
                        </View>
                        <Switch
                            value={isAnonymous}
                            onValueChange={setIsAnonymous}
                            trackColor={{ false: '#D1D5DB', true: '#FE2C5580' }}
                            thumbColor={isAnonymous ? '#FE2C55' : '#F4F3F4'}
                        />
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>

                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={[styles.submitBtn, overallRating === 0 && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={overallRating === 0 || isPending}
                    >
                        {isPending ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitBtnText}>Submit Review</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingsetVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    content: {
        padding: 16,
    },
    salonCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        alignItems: 'center',
    },
    salonPhoto: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 16,
    },
    salonNameText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    servicesText: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    dateText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    sectionActive: {
        backgroundColor: '#FFF1F2',
        borderColor: '#FEE2E2',
        borderWidth: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    staffRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    staffAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    staffName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4B5563',
    },
    expandToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    expandTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6B7280',
    },
    subRatingsList: {
        marginTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 16,
    },
    subRatingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    subLabel: {
        fontSize: 14,
        color: '#4B5563',
    },
    tagsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tagPill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        marginRight: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    tagPillSelected: {
        backgroundColor: '#FE2C5510',
        borderColor: '#FE2C55',
    },
    tagText: {
        fontSize: 13,
        color: '#4B5563',
        fontWeight: '500',
    },
    tagTextSelected: {
        color: '#FE2C55',
        fontWeight: '700',
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    charCount: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    titleInput: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: '#111827',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    commentInput: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: '#111827',
        minHeight: 120,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    photoHint: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 16,
    },
    photoContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    addPhotoBtn: {
        width: 80,
        height: 80,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    addPhotoText: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 4,
        fontWeight: '600',
    },
    photoWrapper: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 12,
        marginBottom: 12,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    removePhotoBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    maxPhotos: {
        fontSize: 11,
        color: '#9CA3AF',
        marginTop: 8,
    },
    anonymousRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
    },
    anonymousTextCol: {
        flex: 1,
        paddingRight: 16,
    },
    anonymousTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },
    anonymousSub: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    submitBtn: {
        backgroundColor: '#FE2C55',
        borderRadius: 30,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FE2C55',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitBtnDisabled: {
        backgroundColor: '#F3F4F6',
        shadowOpacity: 0,
        elevation: 0,
    },
    submitBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});

export default ReviewScreen;
