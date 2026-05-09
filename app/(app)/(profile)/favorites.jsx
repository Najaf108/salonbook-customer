import { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { router, Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salonService } from '@/services/salon.service';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import SalonCard from '@/components/SalonCard';

export default function FavoritesScreen() {
    const queryClient = useQueryClient();
    const { data: favorites, isLoading, refetch } = useQuery({
        queryKey: ['favorites'],
        queryFn: () => salonService.getFavoriteSalons(),
    });

    const toggleMutation = useMutation({
        mutationFn: (salonId) => salonService.toggleFavorite(salonId),
        onSuccess: () => {
            queryClient.invalidateQueries(['favorites']);
        },
    });

    const renderSalon = useCallback(({ item: salon }) => (
        <SalonCard
            salon={salon}
            isFavorite={true}
            onFavoritePress={() => toggleMutation.mutate(salon.id)}
            onPress={() => router.push(`/(app)/(home)/salon/${salon.id}`)}
        />
    ), [toggleMutation]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{
                headerTitle: 'Favorite Salons',
                headerTintColor: '#963b52',
                headerStyle: { backgroundColor: '#fff7f9' },
                headerShadowVisible: false,
            }} />
            <View style={styles.container}>
                {isLoading ? (
                    <LoadingSpinner full />
                ) : !favorites?.length ? (
                    <EmptyState
                        emoji="❤️"
                        title="No favorites yet"
                        subtitle="Salons you mark as favorite will appear here."
                    />
                ) : (
                    <FlatList
                        data={favorites}
                        renderItem={renderSalon}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        onRefresh={refetch}
                        refreshing={isLoading}
                        initialNumToRender={5}
                        maxToRenderPerBatch={10}
                        windowSize={11}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff7f9' },
    container: { flex: 1 },
    listContent: { padding: 24 },
});
