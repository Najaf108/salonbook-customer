// src/services/salon.service.js
import api from '../lib/api';

export const salonService = {
  async getNearbySalons({ lat, lng, radius = 15, category, gender, city }) {
    const res = await api.get('/salons/nearby', {
      params: { lat, lng, radius, category, gender, city },
    });
    return res.data;
  },

  async searchSalons({ query, city, category, gender, minRating, page = 1 }) {
    const res = await api.get('/salons/search', {
      params: { query, city, category, gender, minRating, page, limit: 20 },
    });
    return res.data;
  },

  async getSalonById(id) {
    const res = await api.get(`/salons/${id}`);
    return res.data;
  },

  async getSalonServices(salonId, category) {
    const res = await api.get(`/salons/${salonId}/services`, {
      params: { category },
    });
    return res.data;
  },

  async getSalonStaff(salonId) {
    const res = await api.get(`/salons/${salonId}/staff`);
    return res.data;
  },

  async getAvailableSlots(salonId, date, staffId, durationMinutes) {
    const res = await api.get(`/salons/${salonId}/slots`, {
      params: { date, staffId, duration: durationMinutes },
    });
    return res.data; // Array of { time: '09:00', available: true }
  },

  async getSalonReviews(salonId, page = 1) {
    const res = await api.get(`/salons/${salonId}/reviews`, {
      params: { page, limit: 10 },
    });
    return res.data;
  },

  async getFeaturedSalons() {
    const res = await api.get('/salons/featured');
    return res.data;
  },

  async toggleFavorite(salonId) {
    const res = await api.post(`/salons/${salonId}/favorite`);
    return res.data;
  },

  async checkFavoriteStatus(salonId) {
    const res = await api.get(`/salons/${salonId}/favorite`);
    return res.data;
  },

  async getFavoriteSalons() {
    const res = await api.get('/users/favorites');
    return res.data;
  },
};