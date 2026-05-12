// app/(auth)/register.jsx
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { requestEmailOTP } from '@/services/auth.service';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const login = useAuthStore(s => s.login);

    const handleRegister = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            // Step 1: Request OTP — firebase account created AFTER OTP is verified
            await requestEmailOTP(email);

            // Navigate to OTP screen with email + password so it can create the account after verify
            router.push({
                pathname: '/(auth)/otp',
                params: { email, password, role: 'CUSTOMER' }
            });

        } catch (err) {
            console.error('OTP Request Error:', err);
            let message = 'Could not send OTP. Please try again.';
            if (err?.response?.status === 429) {
                message = 'Too many requests. Please wait a minute and try again.';
            }
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <MaterialIcons name="arrow-back" size={24} color="#221920" />
                        </TouchableOpacity>

                        <View style={styles.logoBadge}>
                            <Image
                                source={require('../../assets/salonbooklogo.png')}
                                style={styles.logoImage}
                                resizeMode="cover"
                            />
                        </View>
                        <Text style={styles.appName}>SalonBook</Text>
                        <Text style={styles.tagline}>Create your account</Text>
                    </View>

                    <View style={styles.authCard}>
                        <Text style={styles.welcomeText}>Get Started</Text>
                        <Text style={styles.subtitle}>Join our community of beauty lovers</Text>


                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialIcons name="email" size={20} color="#963b52" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="name@example.com"
                                    placeholderTextColor="#9CA3AF"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialIcons name="lock" size={20} color="#963b52" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Min. 6 characters"
                                    placeholderTextColor="#9CA3AF"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <MaterialIcons
                                        name={showPassword ? "visibility" : "visibility-off"}
                                        size={22}
                                        color="#9CA3AF"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.registerBtn}
                            onPress={handleRegister}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.registerBtnText}>
                                {loading ? 'Sending OTP...' : 'Continue'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity
                            style={styles.googleBtn}
                            onPress={async () => {
                                try {
                                    const res = await useAuthStore.getState().googleLogin();
                                    if (res.isNewUser) {
                                        router.replace('/(auth)/details');
                                    } else {
                                        router.replace('/(app)/(home)');
                                    }
                                } catch (error) {
                                    if (error.message !== 'Google Sign-In was cancelled or failed') {
                                        Alert.alert('Google Sign-In Error', error.message);
                                    }
                                }
                            }}
                            disabled={loading}
                        >
                            <View style={styles.googleIconContainer}>
                                <Text style={styles.googleIcon}>G</Text>
                            </View>
                            <Text style={styles.googleBtnText}>Continue with Google</Text>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/login')}>
                                <Text style={styles.link}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff7f9' },
    scrollContainer: { flexGrow: 1, paddingHorizontal: 32, paddingBottom: 32, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 24, marginTop: 40 },
    backButton: {
        position: 'absolute',
        left: 0,
        top: -20,
        padding: 8,
    },
    logoBadge: {
        width: 64, height: 64,
        borderRadius: 22,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#963b52',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    logoGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    appName: { fontSize: 32, fontWeight: '900', color: '#221920', letterSpacing: -0.5 },
    logoImage: { width: '100%', height: '100%' },
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
    welcomeText: { fontSize: 24, fontWeight: '800', color: '#221920', marginBottom: 4 },
    subtitle: { fontSize: 14, color: '#544245', marginBottom: 20, opacity: 0.6 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '700', color: '#221920', marginBottom: 8, marginLeft: 4 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, color: '#111827', fontSize: 16, fontWeight: '500' },
    eyeIcon: { padding: 8 },
    registerBtn: {
        backgroundColor: '#963b52',
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: '#963b52',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    registerBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
    footerText: { color: '#6B7280', fontSize: 14 },
    link: { color: '#963b52', fontWeight: '700', fontSize: 14 },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#9CA3AF',
        fontWeight: '600',
        fontSize: 12,
    },
    googleBtn: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    googleIconContainer: {
        width: 24,
        height: 24,
        backgroundColor: '#fff',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    googleIcon: {
        color: '#4285F4',
        fontSize: 18,
        fontWeight: '900',
    },
    googleBtnText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '700',
    },
});
