import React from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');

const ReviewPhotoGrid = ({ photos = [] }) => {
    if (!photos || photos.length === 0) return null;

    const renderGrid = () => {
        switch (photos.length) {
            case 1:
                return (
                    <Image source={{ uri: photos[0] }} style={styles.singlePhoto} resizeMode="cover" />
                );
            case 2:
                return (
                    <View style={styles.row}>
                        <Image source={{ uri: photos[0] }} style={styles.halfPhoto} resizeMode="cover" />
                        <Image source={{ uri: photos[1] }} style={styles.halfPhoto} resizeMode="cover" />
                    </View>
                );
            case 3:
                return (
                    <View style={styles.row}>
                        <Image source={{ uri: photos[0] }} style={[styles.halfPhoto, { height: 200 }]} resizeMode="cover" />
                        <View style={styles.column}>
                            <Image source={{ uri: photos[1] }} style={[styles.quarterPhoto, { height: 98, marginBottom: 4 }]} resizeMode="cover" />
                            <Image source={{ uri: photos[2] }} style={[styles.quarterPhoto, { height: 98 }]} resizeMode="cover" />
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    return <View style={styles.container}>{renderGrid()}</View>;
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 12,
        borderRadius: 12,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
    },
    column: {
        flex: 1,
        marginLeft: 4,
    },
    singlePhoto: {
        width: '100%',
        height: 200,
        borderRadius: 12,
    },
    halfPhoto: {
        flex: 1,
        height: 150,
        borderRadius: 4,
        marginHorizontal: 1,
    },
    quarterPhoto: {
        width: '100%',
        borderRadius: 4,
    },
});

export default ReviewPhotoGrid;
