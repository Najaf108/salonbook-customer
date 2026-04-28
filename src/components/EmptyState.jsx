// src/components/EmptyState.jsx
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export default function EmptyState({ emoji = '🔍', title, subtitle }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 17, fontWeight: '600', color: '#111827', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
});