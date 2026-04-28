import { View, Text, StyleSheet } from 'react-native';

export default function Badge({ count, size = 'default' }) {
    if (!count || count <= 0) return null;

    const displayCount = count > 99 ? '99+' : count;

    return (
        <View style={[
            styles.container,
            size === 'small' && styles.containerSmall,
            count > 9 && styles.containerWide
        ]}>
            <Text style={[
                styles.text,
                size === 'small' && styles.textSmall
            ]}>
                {displayCount}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ba1a1a',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: '#ffffff',
    },
    containerSmall: {
        minWidth: 16,
        height: 16,
        borderRadius: 8,
    },
    containerWide: {
        paddingHorizontal: 6,
    },
    text: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    textSmall: {
        fontSize: 8,
    }
});
