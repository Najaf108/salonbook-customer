// app/(app)/(profile)/edit.jsx
import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar,
    ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image as ExpoImage } from 'expo-image';
import { router, Stack } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/useAuthStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

export default function EditProfileScreen() {
    const { user, updateUser } = useAuthStore();
    const [name, setName] = useState(user?.name || '');
    const [gender, setGender] = useState(user?.gender || null);
    const [isNameFocused, setIsNameFocused] = useState(false);
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

    const { mutateAsync, isPending } = useMutation({
        mutationFn: () => authService.updateProfile({ name, gender }),
        onSuccess: (data) => {
            updateUser(data);
            Alert.alert('Saved!', 'Your profile has been updated.', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        },
        onError: (error) => {
            const message = error.response?.data?.error || 'Could not update profile.';
            Alert.alert('Error', message);
        },
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <Stack.Screen options={{ headerShown: false }} />
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.container}>

                    {/* Custom Header */}
                    <View style={styles.appBar}>
                        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8} style={styles.iconBtn}>
                            <MaterialIcons name="arrow-back" size={24} color="#221920" />
                        </TouchableOpacity>
                        <Text style={styles.appTitle}>Edit Profile</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                        <View style={styles.profileHeader}>
                            <TouchableOpacity
                                style={styles.avatarWrap}
                                onPress={handlePickImage}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <ActivityIndicator color="#963b52" />
                                ) : user?.profilePhoto ? (
                                    <ExpoImage
                                        source={{ uri: user.profilePhoto }}
                                        style={styles.avatarImage}
                                        contentFit="cover"
                                        transition={200}
                                    />
                                ) : (
                                    <MaterialIcons name="face" size={48} color="#963b52" />
                                )}
                                <View style={styles.editBadge}>
                                    <MaterialIcons name="camera-alt" size={14} color="#fff" />
                                </View>
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Personal Details</Text>
                            <Text style={styles.headerSub}>Update your account information</Text>
                        </View>

                        <View style={styles.formCard}>
                            <View style={styles.fieldBlock}>
                                <Text style={styles.fieldLabel}>Mobile Number</Text>
                                <View style={styles.disabledInput}>
                                    <MaterialIcons name="phone" size={20} color="#797174" />
                                    <Text style={styles.disabledText}>{user?.phone}</Text>
                                </View>
                                <Text style={styles.helperText}>Phone numbers cannot be changed directly.</Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.fieldBlock}>
                                <Text style={styles.fieldLabel}>Full Name</Text>
                                <View style={[styles.inputWrapper, isNameFocused && styles.inputWrapperFocused]}>
                                    {isNameFocused && <View style={styles.inputHighlight} />}
                                    <MaterialIcons name="person-outline" size={20} color={isNameFocused ? '#963b52' : '#797174'} style={{ marginLeft: 16 }} />
                                    <TextInput
                                        style={styles.input}
                                        value={name}
                                        onChangeText={setName}
                                        placeholder="Enter your full name"
                                        placeholderTextColor="rgba(84, 66, 69, 0.5)"
                                        onFocus={() => setIsNameFocused(true)}
                                        onBlur={() => setIsNameFocused(false)}
                                    />
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.fieldBlock}>
                                <Text style={styles.fieldLabel}>Gender</Text>
                                <View style={styles.genderRow}>
                                    {[
                                        { value: 'MALE', label: 'Male', icon: 'male' },
                                        { value: 'FEMALE', label: 'Female', icon: 'female' },
                                        { value: 'OTHER', label: 'Other', icon: 'transgender' },
                                    ].map(g => {
                                        const isSelected = gender === g.value;
                                        return (
                                            <TouchableOpacity
                                                key={g.value}
                                                style={[styles.genderBtn, isSelected && styles.genderBtnActive]}
                                                onPress={() => setGender(g.value)}
                                            >
                                                <MaterialIcons name={g.icon} size={20} color={isSelected ? '#963b52' : '#797174'} />
                                                <Text style={[styles.genderText, isSelected && styles.genderTextActive]}>
                                                    {g.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        </View>

                    </ScrollView>

                    {/* Bottom Action Bar */}
                    <View style={styles.bottomBarWrapper}>
                        <TouchableOpacity style={{ flex: 1, opacity: isPending ? 0.7 : 1 }} onPress={() => mutateAsync()} disabled={isPending}>
                            <LinearGradient colors={['#963b52', '#b5536a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryBtn}>
                                <Text style={styles.primaryBtnText}>{isPending ? 'Saving...' : 'Save Changes'}</Text>
                                {!isPending && <MaterialIcons name="check-circle" size={20} color="#fff" />}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff7f9' },
    container: { flex: 1, backgroundColor: '#fff7f9' },
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 8,
        paddingBottom: 8,
        backgroundColor: 'rgba(255, 247, 249, 0.95)',
        zIndex: 10,
    },
    iconBtn: {
        backgroundColor: '#ffffff',
        padding: 8,
        borderRadius: 20,
        shadowColor: '#1a1118',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    appTitle: { fontSize: 20, fontWeight: 'bold', color: '#963b52', letterSpacing: -0.5 },
    scrollContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 160 },
    profileHeader: { alignItems: 'center', marginBottom: 32 },
    avatarWrap: {
        width: 80, height: 80,
        borderRadius: 40,
        backgroundColor: '#fbe9f3',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        position: 'relative',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#963b52',
        padding: 5,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#fff7f9',
    },
    headerTitle: { fontSize: 24, fontWeight: '900', color: '#221920', letterSpacing: -0.5, marginBottom: 4 },
    headerSub: { fontSize: 14, color: '#544245' },
    formCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#1a1118',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.05,
        shadowRadius: 40,
        elevation: 6,
    },
    fieldBlock: { marginBottom: 8 },
    fieldLabel: { fontSize: 13, fontWeight: 'bold', color: '#221920', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
    disabledInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        opacity: 0.8,
    },
    disabledText: { fontSize: 15, color: '#544245', fontWeight: '500' },
    helperText: { fontSize: 12, color: '#797174', marginTop: 8, marginLeft: 4 },
    divider: { height: 1, backgroundColor: '#efdee8', marginVertical: 20 },
    inputWrapper: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fbe9f3',
        borderRadius: 16,
        overflow: 'hidden',
    },
    inputWrapperFocused: { backgroundColor: '#f5e3ee' },
    inputHighlight: {
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: 4,
        backgroundColor: '#7b5804',
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#221920',
        fontWeight: '500',
    },
    genderRow: { flexDirection: 'row', gap: 12 },
    genderBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#efdee8',
    },
    genderBtnActive: { backgroundColor: '#fbe9f3', borderColor: 'rgba(123, 88, 4, 0.1)' },
    genderText: { fontSize: 14, color: '#544245', fontWeight: '600' },
    genderTextActive: { color: '#963b52' },
    bottomBarWrapper: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(251, 233, 243, 0.95)',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: Platform.OS === 'ios' ? 36 : 24,
        shadowColor: '#1a1118',
        shadowOffset: { width: 0, height: -12 },
        shadowOpacity: 0.05,
        shadowRadius: 40,
        elevation: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
    },
    primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 32, gap: 8, shadowColor: '#963b52', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 30, elevation: 8 },
    primaryBtnText: { fontSize: 16, fontWeight: 'bold', color: '#ffffff', letterSpacing: 0.5 },
});
