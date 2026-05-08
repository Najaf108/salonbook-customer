// app/(auth)/details.jsx
import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, Alert, SafeAreaView, StatusBar, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/useAuthStore';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function DetailsScreen() {
    const { user, updateUser } = useAuthStore();
    // Clear default 'Userxxxx' names so the placeholder shows up
    const [name, setName] = useState('');

    const [phone, setPhone] = useState(user?.phone || '');
    const [age, setAge] = useState(user?.age?.toString() || '');
    const [gender, setGender] = useState(user?.gender || null); // 'MALE' | 'FEMALE' | 'OTHER'
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) return Alert.alert('Missing Name', 'Please enter your name.');
        if (!phone.trim()) return Alert.alert('Missing WhatsApp Number', 'Please enter your WhatsApp number.');
        if (!/^03\d{9}$/.test(phone.trim())) return Alert.alert('Invalid Number', 'Please enter a valid Pakistani mobile number (e.g. 03001234567).');
        if (!age.trim()) return Alert.alert('Missing Age', 'Please enter your age.');
        if (!gender) return Alert.alert('Missing Gender', 'Please select your gender.');

        setLoading(true);
        try {
            await authService.updateProfile({
                name: name.trim(),
                phone: phone.trim(),
                age: parseInt(age),
                gender: gender
            });

            // Update local store so Home tab reflects changes
            updateUser({ name: name.trim(), phone: phone.trim(), age: parseInt(age), gender });

            router.replace('/(app)/(home)');
        } catch (err) {
            console.error('Update Profile Error:', err);
            Alert.alert('Error', 'Could not save your details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <View style={styles.logoBadge}>
                            <LinearGradient
                                colors={['#963b52', '#b5536a']}
                                style={styles.logoGradient}
                            >
                                <MaterialIcons name="person-add" size={32} color="#fff" />
                            </LinearGradient>
                        </View>
                        <Text style={styles.appName}>Almost there!</Text>
                        <Text style={styles.tagline}>Tell us a bit about yourself</Text>
                    </View>

                    <View style={styles.authCard}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="person-outline" size={20} color="#963b52" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="enter your full name"
                                placeholderTextColor="rgba(84, 66, 69, 0.4)"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        <Text style={styles.label}>WhatsApp Number</Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="phone" size={20} color="#963b52" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="03XX XXXXXXX"
                                placeholderTextColor="rgba(84, 66, 69, 0.4)"
                                keyboardType="phone-pad"
                                maxLength={11}
                                value={phone}
                                onChangeText={setPhone}
                            />
                        </View>

                        <Text style={styles.label}>Age</Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="cake" size={20} color="#963b52" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="How old are you?"
                                placeholderTextColor="rgba(84, 66, 69, 0.4)"
                                keyboardType="number-pad"
                                value={age}
                                onChangeText={setAge}
                                maxLength={3}
                            />
                        </View>

                        <Text style={styles.label}>Gender</Text>
                        <View style={styles.genderRow}>
                            {['MALE', 'FEMALE', 'OTHER'].map((g) => (
                                <TouchableOpacity
                                    key={g}
                                    style={[
                                        styles.genderBox,
                                        gender === g && styles.genderBoxActive
                                    ]}
                                    onPress={() => setGender(g)}
                                >
                                    <Text style={[
                                        styles.genderText,
                                        gender === g && styles.genderTextActive
                                    ]}>
                                        {g.charAt(0) + g.slice(1).toLowerCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[styles.mainBtn, loading && styles.btnDisabled]}
                            onPress={handleSave}
                            disabled={loading}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={['#963b52', '#b5536a']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.btnGradient}
                            >
                                <Text style={styles.btnText}>
                                    {loading ? 'Saving...' : 'Complete Profile'}
                                </Text>
                                {!loading && <MaterialIcons name="check-circle" size={20} color="#fff" />}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff7f9' },
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 32, paddingVertical: 40, justifyContent: 'center', minHeight: '100%' },
    header: { alignItems: 'center', marginBottom: 32 },
    logoBadge: {
        width: 70, height: 70,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#963b52',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    logoGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    appName: { fontSize: 28, fontWeight: '900', color: '#221920', letterSpacing: -0.5 },
    tagline: { fontSize: 14, color: '#544245', fontWeight: '500', opacity: 0.7, marginTop: 4 },
    authCard: {
        backgroundColor: '#ffffff',
        borderRadius: 32,
        padding: 24,
        shadowColor: '#1a1118',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.08,
        shadowRadius: 40,
        elevation: 10,
    },
    label: { fontSize: 14, fontWeight: '700', color: '#544245', marginBottom: 8, marginLeft: 4 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fbe9f3',
        borderRadius: 18,
        height: 56,
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, color: '#221920', fontWeight: '600' },
    genderRow: { flexDirection: 'row', gap: 10, marginBottom: 32 },
    genderBox: {
        flex: 1,
        height: 50,
        borderRadius: 15,
        backgroundColor: '#fbe9f3',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    genderBoxActive: {
        backgroundColor: '#963b52',
        borderColor: '#963b52',
    },
    genderText: { fontSize: 14, fontWeight: '700', color: '#963b52' },
    genderTextActive: { color: '#fff' },
    mainBtn: { borderRadius: 28, height: 60, overflow: 'hidden', marginTop: 10 },
    btnGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});
