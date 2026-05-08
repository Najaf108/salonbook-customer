// src/components/LoadingSpinner.jsx
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export default function LoadingSpinner({ full = false }) {
  return (
    <View style={full ? styles.full : styles.inline}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  inline: { padding: 32, alignItems: 'center' },
});