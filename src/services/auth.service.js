// src/services/auth.service.js
import api from '../lib/api';
import storage from '../lib/storage';
import { GoogleAuthProvider, signInWithCredential, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

export const requestEmailOTP = async (email) => {
  const res = await api.post('/auth/request-otp', { email });
  return res.data;
};

export const verifyEmailOTP = async (email, otp) => {
  const res = await api.post('/auth/verify-otp', { email, otp });
  return res.data;
};

export const googleLogin = async () => {
  try {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: true,
    });

    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
    }

    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo.data?.idToken;

    if (!idToken) {
      throw new Error('No ID token returned from Google');
    }

    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    const firebaseIdToken = await userCredential.user.getIdToken();

    return await loginWithToken(
      firebaseIdToken,
      userCredential.user.displayName,
      'CUSTOMER'
    );
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error('Google Sign-In was cancelled or failed');
    }
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

export const loginWithToken = async (idToken, name, role) => {
  const res = await api.post('/auth/firebase-sync', { idToken, name, role });
  const { token, user, isNewUser } = res.data;
  await storage.set('token', token);
  await storage.set('user', user);
  return { token, user, isNewUser };
};

export const getProfile = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.patch('/auth/me', data);
  const currentUser = await storage.get('user');
  await storage.set('user', { ...currentUser, ...res.data });
  return res.data;
};

export const uploadProfilePhoto = async (formData) => {
  const res = await api.post('/users/profile-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const currentUser = await storage.get('user');
  await storage.set('user', { ...currentUser, profilePhoto: res.data.profilePhoto });
  return res.data;
};

export const logout = async () => {
  try {
    if (Platform.OS !== 'web') {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        await GoogleSignin.signOut();
      }
    }
    await signOut(auth);
  } catch (e) {
    console.log('Firebase/Google signout error (ignored):', e);
  }
  await storage.delete('token');
  await storage.delete('user');
};

export const updateFCMToken = async (fcmToken) => {
  const res = await api.patch('/auth/fcm-token', { fcmToken });
  return res.data;
};

// Also export as a default object to maintain backward compatibility if needed
export const authService = {
  requestEmailOTP,
  verifyEmailOTP,
  googleLogin,
  loginWithToken,
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  logout,
  updateFCMToken
};

export default authService;
