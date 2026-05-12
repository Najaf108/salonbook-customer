// app/(auth)/phone.jsx
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, StatusBar, Image } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase';

WebBrowser.maybeCompleteAuthSession();

// ─── Web client ID from google-services.json (client_type: 3) ─────────────────
const WEB_CLIENT_ID = '70172727359-ddn3ibthvl39usbo6hshc0l30361e865.apps.googleusercontent.com';

// ─── Expo proxy redirect URI — must be registered in Google Cloud Console ─────
// owner=najaf108, slug=salonbook (from app.json)
const REDIRECT_URI = 'https://auth.expo.io/@najaf108/salonbook';

const GOOGLE_DISCOVERY = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export default function PhoneScreen() {
    const [loading, setLoading] = useState(false);
    const login = useAuthStore(s => s.login);

    // ── Authorization Code + PKCE flow ────────────────────────────────────────
    // Google deprecated response_type=id_token (implicit flow).
    // Code + PKCE is the modern, secure replacement — no client secret needed.
    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: WEB_CLIENT_ID,
            redirectUri: REDIRECT_URI,
            scopes: ['openid', 'profile', 'email'],
            responseType: AuthSession.ResponseType.Code,   // code flow, NOT id_token
            usePKCE: true,                                 // PKCE — no client secret needed
        },
        GOOGLE_DISCOVERY
    );

    const handleGoogleSignIn = async () => {
        if (!request) {
            Alert.alert('Not Ready', 'Auth is loading, please try again.');
            return;
        }
        setLoading(true);
        try {
            // Step 1 — Open Google consent screen via Expo proxy
            const authResult = await promptAsync({ useProxy: true });

            if (authResult?.type !== 'success') {
                if (authResult?.type === 'error') {
                    console.error('OAuth error:', authResult.error);
                    Alert.alert('Sign-In Error', authResult.error?.message || 'Google Sign-In failed.');
                }
                setLoading(false);
                return;
            }

            // Step 2 — Exchange authorization code for tokens (PKCE, no secret needed)
            const tokenResponse = await AuthSession.exchangeCodeAsync(
                {
                    clientId: WEB_CLIENT_ID,
                    redirectUri: REDIRECT_URI,
                    code: authResult.params.code,
                    extraParams: {
                        code_verifier: request.codeVerifier,
                    },
                },
                GOOGLE_DISCOVERY
            );

            // Step 3 — Extract id_token from token response
            const id_token = tokenResponse.idToken;
            if (!id_token) {
                Alert.alert('Error', 'No ID token in token response.');
                setLoading(false);
                return;
            }

            // Step 4 — Sign in to Firebase with Google credential
            const credential = GoogleAuthProvider.credential(id_token);
            const userCredential = await signInWithCredential(auth, credential);
            const firebaseIdToken = await userCredential.user.getIdToken();

            // Step 5 — Sync with our backend
            const res = await login(firebaseIdToken, userCredential.user.displayName, 'CUSTOMER');

            if (res.isNewUser) {
                router.replace('/(auth)/details');
            } else {
                router.replace('/(app)/(home)');
            }

        } catch (err) {
            console.error('Google Sign-In Error:', err);
            Alert.alert('Error', err.message || 'Google Sign-In failed.');
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.logoBadge}>
                        <Image
                            source={require('../../assets/salonbooklogo.png')}
                            style={styles.logoImage}
                            resizeMode="cover"
                        />
                    </View>
                    <Text style={styles.appName}>SalonBook</Text>
                    <Text style={styles.tagline}>Book your next look</Text>
                </View>

                <View style={styles.authCard}>
                    <Text style={styles.welcomeText}>Welcome</Text>
                    <Text style={styles.subtitle}>Sign in with email to browse and book the best salons in your city.</Text>

                    {/* <TouchableOpacity
                        style={styles.googleBtn}
                        onPress={handleGoogleSignIn}
                        disabled={loading || !request}
                        activeOpacity={0.7}
                    >
                        <View style={styles.googleIconContainer}>
                            <MaterialIcons name="login" size={24} color="#963b52" />
                        </View>
                        <Text style={styles.googleBtnText}>
                            {loading ? 'Processing...' : 'Continue with Google'}
                        </Text>
                    </TouchableOpacity> */}

                    {/* <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View> */}

                    <TouchableOpacity
                        style={styles.emailBtn}
                        onPress={() => router.push('/login')}
                    >
                        <MaterialIcons name="email" size={20} color="#fff" />
                        <Text style={styles.emailBtnText}>Sign in with Email</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.registerBtn}
                        onPress={() => router.push('/register')}
                    >
                        <Text style={styles.registerText}>
                            New to SalonBook? <Text style={styles.registerLink}>Create Account</Text>
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.footerText}>
                        By continuing, you agree to our{' '}
                        <Text style={styles.footerLink}>Terms</Text> and{' '}
                        <Text style={styles.footerLink}>Privacy Policy</Text>
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff7f9' },
    container: { flex: 1, paddingHorizontal: 32, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 48 },
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
    welcomeText: { fontSize: 24, fontWeight: '800', color: '#221920', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#544245', lineHeight: 20, marginBottom: 32, opacity: 0.8 },
    googleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: 'rgba(150, 59, 82, 0.1)',
        backgroundColor: '#fff',
        gap: 12,
    },
    googleIconContainer: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
    googleBtnText: { fontSize: 16, fontWeight: '700', color: '#221920' },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
    dividerText: { marginHorizontal: 16, color: '#9CA3AF', fontWeight: '500' },
    emailBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 18,
        backgroundColor: '#963b52',
        gap: 12,
        shadowColor: '#963b52',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
    },
    emailBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
    registerBtn: { marginTop: 24, alignItems: 'center' },
    registerText: { fontSize: 14, color: '#544245', opacity: 0.8 },
    registerLink: { color: '#963b52', fontWeight: '700' },
    footerText: { textAlign: 'center', fontSize: 12, color: '#544245', marginTop: 24, opacity: 0.6, lineHeight: 18 },
    footerLink: { color: '#963b52', fontWeight: '700' },
});
