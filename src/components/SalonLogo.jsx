import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { COLORS } from '../constants/theme';

const COLORS_PALETTE = [
    '#005445', '#2b685a', '#614400', '#7d283f', '#0a6e5c',
    '#134e4a', '#334155', '#1e293b', '#4338ca', '#6d28d9'
];

export default function SalonLogo({
    uri,
    name,
    size = 60,
    style,
    textStyle,
    placeholderSource = 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=200'
}) {
    const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'S';

    // Deterministic background color based on name
    const colorIndex = name ? name.length % COLORS_PALETTE.length : 0;
    const bgColor = COLORS_PALETTE[colorIndex];

    return (
        <View style={[
            styles.container,
            { width: size, height: size, borderRadius: size / 2 },
            !uri && { backgroundColor: bgColor },
            style
        ]}>
            {uri ? (
                <Image
                    source={{ uri }}
                    style={[styles.image, { borderRadius: size / 2 }]}
                    contentFit="cover"
                    transition={200}
                />
            ) : (
                <Text style={[
                    styles.text,
                    { fontSize: size * 0.4 },
                    textStyle
                ]}>
                    {initials}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#f1f5f9',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    text: {
        color: '#fff',
        fontWeight: 'bold',
    }
});
