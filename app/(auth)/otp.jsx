import { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { verifyEmailOTP, requestEmailOTP } from '@/services/auth.service';
import { useAuthStore } from '@/stores/useAuthStore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function OTPScreen() {
    const { email, password, role } = useLocalSearchParams();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(30);
    const login = useAuthStore(s => s.login);
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
        if (val && idx < 5) inputs.current[idx + 1]?.focus();
        if (!val && idx > 0) inputs.current[idx - 1]?.focus();
        if (newOtp.every(d => d) && val) {
            handleVerify(newOtp.join(''));
        }
    };

    const handleVerify = async (code) => {
        setLoading(true);
        try {
            // Step 1: Verify OTP on the backend
            await verifyEmailOTP(email, code);

            // Step 2: Create Firebase user (since we verified the email now)
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();

            // Step 3: Sync with backend
            const res = await login(idToken, '', role);

            if (res.isNewUser) {
                router.replace('/(auth)/details');
            } else {
                router.replace('/(app)/(home)');
            }
        } catch (err) {
            console.error('OTP Verification Error:', err);
            let message = 'The code you entered is incorrect. Please try again.';
            if (err?.response?.data?.error) {
                message = err.response.data.error;
            } else if (err.code === 'auth/email-already-in-use') {
                message = 'This email is already registered in Firebase.';
            }
            Alert.alert('Verification Failed', message);
            setOtp(['', '', '', '', '', '']);
            inputs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;
        try {
            await requestEmailOTP(email);
            setResendTimer(30);
            Alert.alert('OTP Sent', `A new code has been sent to ${email}.`);
        } catch (err) {
            console.error('Resend Error:', err);
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
                        <Text style={styles.title}>OTP Verification</Text>
                        <Text style={styles.subtitle}>
                            We've sent a 6-digit verification code to{'\n'}
                            <Text style={styles.phoneHighlight}>{email}</Text>
                        </Text>

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
    digitBox: { width: '14%', height: 72, position: 'relative' },
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
