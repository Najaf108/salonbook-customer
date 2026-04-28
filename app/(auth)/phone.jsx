// app/(auth)/phone.jsx
import { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, KeyboardAvoidingView, Platform, Alert, SafeAreaView, StatusBar
} from 'react-native';
import { router } from 'expo-router';
import { authService } from '@/services/auth.service';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function PhoneScreen() {
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(null); // 'phone' or 'name'

    const handleSendOTP = async () => {
        if (!name.trim()) {
            Alert.alert('Missing Name', 'Please enter your name to continue.');
            return;
        }
        const cleaned = phone.replace(/\s/g, '');
        if (!/^03\d{9}$/.test(cleaned)) {
            Alert.alert('Invalid Number', 'Please enter a valid Pakistani mobile number starting with 03');
            return;
        }
        setLoading(true);
        try {
            await authService.requestOTP(cleaned);
            router.push({ pathname: '/(auth)/otp', params: { phone: cleaned, name: name.trim() } });
        } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Could not send OTP. Try again.');
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
                <View style={styles.inner}>
                    {/* Artistic Header */}
                    <View style={styles.header}>
                        <View style={styles.logoBadge}>
                            <LinearGradient
                                colors={['#963b52', '#b5536a']}
                                style={styles.logoGradient}
                            >
                                <MaterialIcons name="auto-fix-high" size={32} color="#fff" />
                            </LinearGradient>
                        </View>
                        <Text style={styles.appName}>SalonBook</Text>
                        <Text style={styles.tagline}>Elevate your style experience</Text>
                    </View>

                    {/* Authentication Section */}
                    <View style={styles.authCard}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Enter your mobile number to continue your beauty journey</Text>

                        <View style={[styles.inputContainer, isFocused === 'name' && styles.inputContainerFocused]}>
                            {isFocused === 'name' && <View style={styles.inputHighlight} />}
                            <MaterialIcons name="person-outline" size={20} color="#963b52" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Your Full Name"
                                placeholderTextColor="rgba(84, 66, 69, 0.4)"
                                value={name}
                                onChangeText={setName}
                                onFocus={() => setIsFocused('name')}
                                onBlur={() => setIsFocused(null)}
                                autoFocus
                            />
                        </View>

                        <View style={[styles.inputContainer, isFocused === 'phone' && styles.inputContainerFocused]}>
                            {isFocused === 'phone' && <View style={styles.inputHighlight} />}
                            <MaterialIcons name="phone-iphone" size={20} color="#963b52" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="03XX XXXXXXX"
                                placeholderTextColor="rgba(84, 66, 69, 0.4)"
                                keyboardType="phone-pad"
                                value={phone}
                                onChangeText={setPhone}
                                maxLength={11}
                                onFocus={() => setIsFocused('phone')}
                                onBlur={() => setIsFocused(null)}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.mainBtn, (!phone || !name || loading) && styles.btnDisabled]}
                            onPress={handleSendOTP}
                            disabled={!phone || !name || loading}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={(!phone || loading) ? ['#d1c4c9', '#d1c4c9'] : ['#963b52', '#b5536a']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.btnGradient}
                            >
                                <Text style={styles.btnText}>
                                    {loading ? 'Sending Code...' : 'Get OTP Code'}
                                </Text>
                                {!loading && <MaterialIcons name="arrow-forward" size={20} color="#fff" />}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Footer Policy */}
                    <View style={styles.footer}>
                        <Text style={styles.termsText}>
                            By continuing, you agree to our{' '}
                            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                            <Text style={styles.termsLink}>Privacy Policy</Text>
                        </Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff7f9' },
    container: { flex: 1 },
    inner: { flex: 1, paddingHorizontal: 32, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 48 },
    logoBadge: {
        width: 80, height: 80,
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
    appName: { fontSize: 32, fontWeight: '900', color: '#221920', letterSpacing: -1 },
    tagline: { fontSize: 14, color: '#544245', fontWeight: '500', opacity: 0.7 },
    authCard: {
        backgroundColor: '#ffffff',
        borderRadius: 32,
        padding: 28,
        shadowColor: '#1a1118',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.08,
        shadowRadius: 40,
        elevation: 10,
    },
    title: { fontSize: 24, fontWeight: '800', color: '#221920', marginBottom: 8, letterSpacing: -0.5 },
    subtitle: { fontSize: 14, color: '#544245', lineHeight: 22, marginBottom: 32, opacity: 0.8 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fbe9f3',
        borderRadius: 18,
        height: 64,
        paddingHorizontal: 16,
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 24,
    },
    inputContainerFocused: {
        backgroundColor: '#f5e3ee',
    },
    inputHighlight: {
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: 4,
        backgroundColor: '#963b52',
    },
    countryPicker: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    flag: { fontSize: 20 },
    countryCode: { fontSize: 16, fontWeight: '700', color: '#221920' },
    verticalDivider: { width: 1, height: 24, backgroundColor: 'rgba(150, 59, 82, 0.15)', marginHorizontal: 16 },
    input: { flex: 1, fontSize: 18, color: '#221920', fontWeight: 'bold', paddingHorizontal: 12 },
    inputIcon: { marginLeft: 4 },
    mainBtn: { borderRadius: 32, height: 64, overflow: 'hidden' },
    btnGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
    footer: { marginTop: 40, paddingHorizontal: 20 },
    termsText: { fontSize: 12, color: '#797174', textAlign: 'center', lineHeight: 20 },
    termsLink: { color: '#963b52', fontWeight: 'bold', textDecorationLine: 'underline' },
});
