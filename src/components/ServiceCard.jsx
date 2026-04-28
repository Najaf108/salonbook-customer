// src/components/ServiceCard.jsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

export default function ServiceCard({ service, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.left}>
        {selected && <View style={styles.checkDot} />}
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, selected && styles.nameSelected]}>{service.name}</Text>
          {service.description ? (
            <Text style={styles.desc} numberOfLines={2}>{service.description}</Text>
          ) : null}
          <Text style={styles.duration}>⏱ {service.duration} min</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.price, selected && styles.priceSelected]}>
          PKR {service.price?.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, borderRadius: SIZES.borderRadiusSm,
    padding: SIZES.md, marginBottom: SIZES.sm,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  selected: { borderColor: COLORS.primary, backgroundColor: '#FAF5FF' },
  left: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, gap: 10 },
  checkDot: {
    width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.primary,
    marginTop: 2, flexShrink: 0,
  },
  name: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary, marginBottom: 2 },
  nameSelected: { color: COLORS.primaryDark },
  desc: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  duration: { fontSize: 12, color: COLORS.textMuted },
  right: { marginLeft: 8 },
  price: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  priceSelected: { color: COLORS.primary },
});