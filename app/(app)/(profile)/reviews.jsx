// app/(app)/(profile)/reviews.jsx
import React from 'react';
import {
    View, Text, FlatList, StyleSheet, TouchableOpacity,
    Platform, SafeAreaView, StatusBar, ActivityIndicator
} from 'react-native';
import { Stack, router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMyReviews } from '@/hooks/useReviews';
import ReviewCard from '@/components/ReviewCard';
import EmptyState from '@/components/EmptyState';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function MyReviewsScreen() {
    const { data: reviews, isLoading, refetch } = useMyReviews();

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ title: 'My Reviews', headerShown: false }} />
            <View style={styles.container}>
                {/* Custom App Bar */}
                <View style={styles.appBar}>
                    <TouchableOpacity
                        onPress={() => router.canGoBack() ? router.back() : router.replace('/(app)/(home)')}
                        activeOpacity={0.8}
                        style={styles.backBtn}
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#963b52" />
                    </TouchableOpacity>
                    <Text style={styles.appTitle}>My Reviews</Text>
                    <View style={{ width: 40 }} />
                </View>

                {isLoading ? (
                    <LoadingSpinner full />
                ) : (
                    <FlatList
                        data={reviews}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <ReviewCard
                                review={item}
                                showSalonName={true}
                            // On the "My Reviews" page, the customer info is already known,
                            // but we show the Salon name instead.
                            />
                        )}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        onRefresh={refetch}
                        refreshing={isLoading}
                        ListEmptyComponent={
                            <EmptyState
                                emoji="⭐"
                                title="No reviews yet"
                                subtitle="Once you finish a booking, you can share your feedback here."
                            />
                        }
                    />
                )}
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
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 8,
        paddingBottom: 8,
        backgroundColor: '#fff7f9',
    },
    backBtn: {
        backgroundColor: '#ffffff',
        padding: 8,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    appTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#221920',
        letterSpacing: -0.5,
    },
    listContent: {
        padding: 24,
        paddingBottom: 40,
    },
});
