
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Image } from 'expo-image';
import { router, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { salonService } from '@/services/salon.service';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';

export default function FavoritesScreen() {
    const { data: favorites, isLoading, refetch } = useQuery({
        queryKey: ['favorites'],
        queryFn: () => salonService.getFavoriteSalons(),
    });

    const renderSalon = ({ item: salon }) => (
        <TouchableOpacity
            style={styles.salonCard}
            activeOpacity={0.9}
            onPress={() => router.push(`/(app)/(home)/salon/${salon.id}`)}
        >
            <View style={styles.cardImageContainer}>
                <Image
                    source={{ uri: salon.photos?.[0] || 'https://images.unsplash.com/photo-1521590832167-7bfcfaa6362f?q=80&w=300' }}
                    style={styles.cardImage}
                    contentFit="cover"
                />
                <View style={styles.ratingBadge}>
                    <MaterialIcons name="star" size={12} color="#7b5804" />
                    <Text style={styles.ratingText}>{salon.avgRating?.toFixed(1) || '—'}</Text>
                </View>
            </View>
            <View style={styles.cardInfo}>
                <Text style={styles.salonName} numberOfLines={1}>{salon.name}</Text>
                <View style={styles.cardLocationRow}>
                    <MaterialIcons name="location-on" size={14} color="#544245" />
                    <Text style={styles.salonLocation} numberOfLines={1}>{salon.city}</Text>
                </View>
                <View style={styles.cardBottomRow}>
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceSymbol}>PKR </Text>
                        <Text style={styles.priceValue}>{salon.minPrice?.toLocaleString() || '0'}+</Text>
                    </View>
                    <View style={styles.heartIcon}>
                        <MaterialIcons name="favorite" size={20} color="#ba1a1a" />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

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
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff7f9' },
    container: { flex: 1 },
    listContent: { padding: 24, gap: 20 },
    salonCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 12,
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 3,
    },
    cardImageContainer: {
        height: 160,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
    },
    cardImage: { width: '100%', height: '100%' },
    ratingBadge: {
        position: 'absolute',
        top: 12, right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(251, 233, 243, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    ratingText: { fontSize: 12, fontWeight: 'bold', color: '#221920' },
    cardInfo: { paddingHorizontal: 8, paddingBottom: 4 },
    salonName: { fontSize: 18, fontWeight: 'bold', color: '#221920', marginBottom: 4 },
    cardLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
    salonLocation: { fontSize: 14, color: '#544245' },
    cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    priceContainer: { flexDirection: 'row', alignItems: 'center' },
    priceSymbol: { fontSize: 14, fontWeight: 'bold', color: '#963b52' },
    priceValue: { fontSize: 14, color: '#221920' },
    heartIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff0f3', alignItems: 'center', justifyContent: 'center' },
});
