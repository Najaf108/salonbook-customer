// src/components/BranchListItem.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const COLORS = {
    primary: '#005445',
    text: '#1a1a1a',
    textSecondary: '#666',
    surface: '#ffffff',
};

export default function BranchListItem({ branch }) {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => router.push(`/(app)/(home)/salon/${branch.id}`)}
        >
            <View style={styles.info}>
                <Text style={styles.name}>{branch.name}</Text>
                <Text style={styles.address} numberOfLines={1}>
                    <MaterialIcons name="location-on" size={12} /> {branch.address}
                </Text>
                <View style={styles.stats}>
                    <View style={styles.stat}>
                        <MaterialIcons name="star" size={14} color="#fbbf24" />
                        <Text style={styles.statText}>{branch.avgRating?.toFixed(1) || '0.0'} ({branch.reviews?.length || 0})</Text>
                    </View>
                    <View style={styles.stat}>
                        <MaterialIcons name="social-distance" size={14} color="#64748b" />
                        <Text style={styles.statText}>1.2 km</Text>
                    </View>
                </View>
            </View>

            <View style={styles.action}>
                <Text style={styles.price}>from Rs. 500</Text>
                <View style={styles.bookBtn}>
                    <Text style={styles.bookBtnText}>Book →</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        alignItems: 'center',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    address: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    stats: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    action: {
        alignItems: 'flex-end',
        marginLeft: 16,
    },
    price: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 6,
    },
    bookBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    bookBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
    }
});
