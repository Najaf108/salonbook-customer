// src/services/auth.service.js
import api from '../lib/api';
import storage from '../lib/storage';

export const authService = {
  async requestOTP(email) {
    const res = await api.post('/auth/request-otp', { email });
    return res.data;
  },

  async loginWithToken(idToken, name, role, otp) {
    const res = await api.post('/auth/verify-otp', { idToken, name, role, otp });
    const { token, user, isNewUser } = res.data;
    await storage.set('token', token);
    await storage.set('user', user);
    return { token, user, isNewUser };
  },

  async getProfile() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.patch('/auth/me', data);
    const currentUser = await storage.get('user');
    await storage.set('user', { ...currentUser, ...res.data });
    return res.data;
  },

  async uploadProfilePhoto(formData) {
    const res = await api.post('/users/profile-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const currentUser = await storage.get('user');
    await storage.set('user', { ...currentUser, profilePhoto: res.data.profilePhoto });
    return res.data;
  },

  async logout() {
    await storage.delete('token');
    await storage.delete('user');
  },

  async updateFCMToken(fcmToken) {
    const res = await api.patch('/auth/fcm-token', { fcmToken });
    return res.data;
  },
};
