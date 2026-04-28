// src/components/BookingCard.jsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { COLORS, SIZES } from '../constants/theme';
import { BOOKING_STATUS_LABELS } from '../constants/categories';

export default function BookingCard({ booking, onPress }) {
  const status = BOOKING_STATUS_LABELS[booking.status] || {};
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.salonName}>{booking.salon?.name}</Text>
          <Text style={styles.city}>{booking.salon?.city}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.label}>📅 Date</Text>
        <Text style={styles.value}>
          {format(new Date(booking.scheduledAt), 'dd MMM yyyy, h:mm a')}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>✂️ Services</Text>
        <Text style={styles.value} numberOfLines={1}>
          {booking.items?.map(i => i.service?.name).join(', ')}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>💰 Total</Text>
        <Text style={[styles.value, { fontWeight: '700', color: COLORS.primary }]}>
          PKR {booking.totalAmount?.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface, borderRadius: SIZES.borderRadius,
    padding: SIZES.md, marginBottom: SIZES.md,
    borderWidth: 0.5, borderColor: COLORS.border,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SIZES.sm },
  salonName: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  city: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '600' },
  divider: { height: 0.5, backgroundColor: COLORS.border, marginVertical: SIZES.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 13, color: COLORS.textSecondary },
  value: { fontSize: 13, color: COLORS.textPrimary, flex: 1, textAlign: 'right', marginLeft: 8 },
});