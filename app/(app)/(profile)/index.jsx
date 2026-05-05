// app/(app)/(profile)/index.jsx
import { useState } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch, Platform, SafeAreaView, StatusBar,
    ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { authService } from '@/services/auth.service';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAuthStore } from '@/stores/useAuthStore';
import { usePendingReviews } from '@/hooks/useReviews';

export default function ProfileScreen() {
    const { user, logout, updateUser } = useAuthStore();
    const [uploading, setUploading] = useState(false);

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Allow access to your gallery to upload photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri) => {
        setUploading(true);
        try {
            const formData = new FormData();
            const filename = uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;
            formData.append('photo', { uri, name: filename, type });

            const res = await authService.uploadProfilePhoto(formData);
            updateUser({ ...user, profilePhoto: res.profilePhoto });
            Alert.alert('Success', 'Profile photo updated!');
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Failed to upload image.');
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out', style: 'destructive', onPress: logout },
        ]);
    };

    const MenuItem = ({ icon, label, subLabel, onPress, isPrimaryIcon = true, badgeCount }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.menuItemLeft}>
                {icon ? (
                    <View style={[styles.menuIconBox, isPrimaryIcon ? styles.bgPrimaryFixed : styles.bgSurfaceContainer]}>
                        <MaterialIcons
                            name={icon}
                            size={24}
                            color={isPrimaryIcon ? '#7d283f' : '#221920'}
                        />
                    </View>
                ) : null}
                <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={styles.menuLabel}>{label}</Text>
                        {badgeCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{badgeCount}</Text>
                            </View>
                        )}
                    </View>
                    {subLabel ? <Text style={styles.menuSubLabel}>{subLabel}</Text> : null}
                </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#544245" />
        </TouchableOpacity>
    );

    const Divider = () => <View style={styles.divider} />;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* TopAppBar */}
                <View style={styles.appBar}>
                    <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
                        <MaterialIcons name="arrow-back" size={24} color="#963b52" />
                    </TouchableOpacity>
                    <Text style={styles.appTitle}>SalonBook</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Page Title */}
                    <Text style={styles.pageTitle}>Profile & Settings</Text>

                    {/* Avatar & Points */}
                    <View style={styles.profileSection}>
                        <View style={styles.avatarWrapper}>
                            <Image
                                source={{ uri: user?.profilePhoto || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' }}
                                style={styles.avatarImage}
                                contentFit="cover"
                            />
                            <TouchableOpacity
                                style={styles.editBtn}
                                activeOpacity={0.8}
                                onPress={handlePickImage}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                    <MaterialIcons name="camera-alt" size={18} color="#ffffff" />
                                )}
                            </TouchableOpacity>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.userName}>{user?.name || 'User'}</Text>
                            {/* <View style={styles.pointsBadge}>
                                <MaterialIcons name="emoji-events" size={14} color="#785601" />
                                <Text style={styles.pointsText}>450 Loyalty Points</Text>
                            </View> */}
                        </View>
                    </View>

                    {/* Menu Card */}
                    <View style={styles.card}>
                        <MenuItem
                            icon="person-outline"
                            label="Edit Profile"
                            onPress={() => router.push('/(app)/(profile)/edit')}
                        />
                        <Divider />
                        <MenuItem
                            icon="calendar-month"
                            label="My Bookings"
                            onPress={() => router.push('/(app)/(bookings)')}
                        />
                        <Divider />
                        <MenuItem
                            icon="favorite"
                            label="Favorites"
                            onPress={() => router.push('/(app)/(profile)/favorites')}
                        />
                        <Divider />
                        <MenuItem
                            icon="star-rate"
                            label="Reviews"
                            onPress={() => router.push('/(app)/(profile)/reviews')}
                        />
                        <Divider />
                        <MenuItem
                            icon="payments"
                            label="Payment Methods"
                            subLabel="EasyPaisa, JazzCash (Coming Soon)"
                            onPress={() => Alert.alert('Coming Soon', 'Payment methods management will be available in a future update.')}
                        />
                    </View>



                    {/* Log Out */}
                    <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleLogout}>
                        <MaterialIcons name="logout" size={24} color="#ba1a1a" />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff7f9',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff7f9',
    },
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 16,
        paddingBottom: 16,
        backgroundColor: 'transparent',
        width: '100%',
    },
    appTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#963b52',
        letterSpacing: -0.5,
    },
    mainScroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
    },
    pageTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: '#221920',
        letterSpacing: -1,
        marginBottom: 32,
    },
    profileSection: {
        backgroundColor: '#ffeff8',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        gap: 16,
        marginBottom: 32,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatarImage: {
        width: 128,
        height: 128,
        borderRadius: 64,
        borderWidth: 4,
        borderColor: '#fff7f9',
    },
    editBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#963b52',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 4,
    },
    profileInfo: {
        alignItems: 'center',
    },
    userName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#221920',
        marginBottom: 8,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#221920',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    menuIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bgPrimaryFixed: {
        backgroundColor: '#ffd9de',
    },
    bgSurfaceContainer: {
        backgroundColor: '#fbe9f3',
    },
    menuLabel: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#221920',
    },
    menuSubLabel: {
        fontSize: 14,
        color: '#544245',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#efdee8',
        marginHorizontal: 0,
        marginVertical: 4,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 218, 214, 0.5)',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 32,
        gap: 12,
        marginTop: 16,
    },
    logoutText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ba1a1a',
        letterSpacing: 0.5,
    },
    badge: {
        backgroundColor: '#FE2C55',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        height: 20,
        minWidth: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
