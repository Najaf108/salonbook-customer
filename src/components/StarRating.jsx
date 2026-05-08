import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StarRating = ({
  rating = 0,
  onChange,
  size = 'md',
  readonly = false,
  showLabel = false,
  color = '#F5A623',
}) => {
  const [currentRating, setCurrentRating] = useState(rating);
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    setCurrentRating(rating);
  }, [rating]);

  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 44,
  };

  const labels = {
    5: "Excellent ✨",
    4: "Very Good 😊",
    3: "Average 😐",
    2: "Poor 😞",
    1: "Terrible 😤",
  };

  const handlePress = (idx) => {
    if (readonly) return;

    setCurrentRating(idx);
    if (onChange) onChange(idx);

    // Bounce animation
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.floor(currentRating);
      const isHalf = i === Math.ceil(currentRating) && currentRating % 1 !== 0;

      stars.push(
        <TouchableOpacity
          key={i}
          disabled={readonly}
          onPress={() => handlePress(i)}
          activeOpacity={0.7}
        >
          <Animated.View style={currentRating === i && !readonly ? { transform: [{ scale: scaleAnim }] } : {}}>
            <Ionicons
              name={isFilled ? "star" : isHalf ? "star-half" : "star-outline"}
              size={sizes[size]}
              color={color}
              style={styles.star}
            />
          </Animated.View>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {renderStars()}
        {readonly && size === 'sm' && (
          <Text style={[styles.ratingTextSmall, { fontSize: sizes.sm * 0.8 }]}>
            {currentRating.toFixed(1)}
          </Text>
        )}
      </View>
      {showLabel && currentRating > 0 && (
        <Text style={[styles.label, { fontSize: sizes[size] * 0.5 }]}>
          {labels[Math.floor(currentRating)]}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 2,
  },
  ratingTextSmall: {
    marginLeft: 4,
    color: '#666',
    fontWeight: '600',
  },
  label: {
    marginTop: 8,
    fontWeight: '600',
    color: '#333',
  },
});

export default StarRating;