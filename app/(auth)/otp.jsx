// app/(auth)/otp.jsx
import { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/useAuthStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

export default function OTPScreen() {
    const { phone, name } = useLocalSearchParams();
    const [otp, setOtp] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    const setAuth = useAuthStore(s => s.setAuth);
    const inputs = useRef([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setResendTimer(t => (t > 0 ? t - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (val, idx) => {
        if (!/^\d?$/.test(val)) return;
        const newOtp = [...otp];
        newOtp[idx] = val;
        setOtp(newOtp);
        if (val && idx < 3) inputs.current[idx + 1]?.focus();
        if (!val && idx > 0) inputs.current[idx - 1]?.focus();
        if (newOtp.every(d => d) && val) {
            verifyOtp(newOtp.join(''));
        }
    };

    const verifyOtp = async (code) => {
        setLoading(true);
        try {
            const userName = Array.isArray(name) ? name[0] : name;
            const { user, token } = await authService.verifyOTP(phone, code, userName);
            setAuth(user, token);
            router.replace('/(app)/(home)');
        } catch (err) {
            Alert.alert('Invalid OTP', 'The code you entered is incorrect. Please try again.');
            setOtp(['', '', '', '']);
            inputs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;
        try {
            await authService.requestOTP(phone);
            setResendTimer(30);
            Alert.alert('OTP Sent', 'A new code has been sent to your number.');
        } catch {
            Alert.alert('Error', 'Could not resend OTP. Try again.');
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
                    {/* Header with Back Button */}
                    <View style={styles.appBar}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backBtn}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name="arrow-back" size={24} color="#221920" />
                        </TouchableOpacity>
                        <Text style={styles.appTitle}>Verification</Text>
                        <View style={{ width: 44 }} />
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.title}>Enter OTP Code</Text>
                        <Text style={styles.subtitle}>
                            Please enter the 4-digit code sent to{'\n'}
                            <Text style={styles.phoneHighlight}>{phone}</Text>
                        </Text>

                        {/* OTP Input Grid */}
                        <View style={styles.otpRow}>
                            {otp.map((digit, idx) => (
                                <View key={idx} style={styles.digitBox}>
                                    <TextInput
                                        ref={r => inputs.current[idx] = r}
                                        style={[styles.otpInput, digit && styles.otpInputFilled]}
                                        value={digit}
                                        onChangeText={val => handleChange(val, idx)}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        autoFocus={idx === 0}
                                        textAlign="center"
                                        selectionColor="#963b52"
                                    />
                                    {digit === '' && <View style={styles.digitPlaceholder} />}
                                </View>
                            ))}
                        </View>

                        {loading && (
                            <View style={styles.loadingContainer}>
                                <Text style={styles.verifyingText}>Verifying code...</Text>
                            </View>
                        )}

                        {/* Resend Action */}
                        <View style={styles.resendContainer}>
                            <Text style={styles.resendLabel}>Didn't receive the code?</Text>
                            <TouchableOpacity
                                onPress={handleResend}
                                disabled={resendTimer > 0}
                                style={[styles.resendBtn, resendTimer > 0 && styles.resendBtnDisabled]}
                            >
                                <Text style={[styles.resendText, resendTimer > 0 && styles.resendTextDisabled]}>
                                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code Now'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Decorative Element */}
                    <View style={styles.bottomDecor}>
                        <LinearGradient
                            colors={['transparent', 'rgba(150, 59, 82, 0.05)']}
                            style={styles.decorGradient}
                        />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff7f9' },
    container: { flex: 1 },
    inner: { flex: 1 },
    appBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    backBtn: {
        width: 44, height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1a1118',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    appTitle: { fontSize: 18, fontWeight: '800', color: '#963b52', letterSpacing: -0.5 },
    content: { flex: 1, paddingHorizontal: 32, paddingTop: 40 },
    title: { fontSize: 26, fontWeight: '900', color: '#221920', marginBottom: 12, letterSpacing: -1 },
    subtitle: { fontSize: 15, color: '#544245', lineHeight: 24, marginBottom: 48, opacity: 0.8 },
    phoneHighlight: { fontWeight: 'bold', color: '#963b52' },
    otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
    digitBox: { width: '22%', height: 72, position: 'relative' },
    otpInput: {
        width: '100%', height: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#efdee8',
        fontSize: 28,
        fontWeight: 'bold',
        color: '#221920',
        shadowColor: '#1a1118',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 3,
    },
    otpInputFilled: {
        borderColor: '#963b52',
        backgroundColor: '#fbe9f3',
    },
    digitPlaceholder: {
        position: 'absolute',
        bottom: 20, alignSelf: 'center',
        width: 8, height: 2,
        backgroundColor: 'rgba(150, 59, 82, 0.2)',
        borderRadius: 1,
    },
    loadingContainer: { alignItems: 'center', marginBottom: 24 },
    verifyingText: { color: '#963b52', fontWeight: '600', fontSize: 14 },
    resendContainer: { alignItems: 'center', gap: 8 },
    resendLabel: { fontSize: 14, color: '#797174' },
    resendBtn: { paddingVertical: 8, paddingHorizontal: 16 },
    resendText: { fontSize: 16, color: '#963b52', fontWeight: '800', textDecorationLine: 'underline' },
    resendTextDisabled: { color: '#b0a4aa', textDecorationLine: 'none' },
    bottomDecor: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: 120,
        zIndex: -1
    },
    decorGradient: { flex: 1 },
});
