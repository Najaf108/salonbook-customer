// src/components/SalonCard.jsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, SIZES } from '../constants/theme';
import SalonLogo from './SalonLogo';
import { MaterialIcons } from '@expo/vector-icons';
const SalonCard = React.memo(({ salon, onPress, style, isFavorite, onFavoritePress }) => {
  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.8}>
      <View style={{ position: 'relative', zIndex: 1 }}>
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: salon.coverUrl || salon.photos?.[0] || 'https://images.unsplash.com/photo-1521590832167-7bfcfaa6362f?q=80&w=600&auto=format&fit=crop' }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        </View>
        <SalonLogo
          uri={salon.logoUrl}
          name={salon.name}
          size={50}
          style={styles.logoOverlay}
        />
        {onFavoritePress && (
          <TouchableOpacity
            style={styles.heartBtn}
            onPress={onFavoritePress}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={isFavorite ? "favorite" : "favorite-border"}
              size={22}
              color={isFavorite ? "#ba1a1a" : "#fff"}
            />
          </TouchableOpacity>
        )}
      </View>
      {salon.plan === 'PREMIUM' && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Featured</Text>
        </View>
      )}
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>{salon.name}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {salon.avgRating?.toFixed(1) || '—'}</Text>
          </View>
        </View>
        <Text style={styles.city}>
          {salon.city}{salon.distance ? ` · ${Math.round(salon.distance)} km away` : ''}
        </Text>
        <View style={styles.row}>
          <Text style={styles.gender}>{salon.gender === 'MALE' ? '👨 Men' : salon.gender === 'FEMALE' ? '👩 Women' : '👥 Unisex'}</Text>
          {salon.minPrice != null && (
            <Text style={styles.price}>From PKR {salon.minPrice?.toLocaleString()}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default SalonCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    marginBottom: SIZES.md + 10,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageWrapper: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: SIZES.borderRadius,
    borderTopRightRadius: SIZES.borderRadius,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: COLORS.accent, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  info: { padding: SIZES.md, paddingTop: 30 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, flex: 1, marginRight: 8 },
  ratingBadge: { backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  ratingText: { fontSize: 12, color: '#92400E', fontWeight: '500' },
  city: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6 },
  gender: { fontSize: 12, color: COLORS.textMuted },
  price: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  logoOverlay: {
    position: 'absolute',
    bottom: -25,
    left: 15,
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    padding: 6,
  },
});