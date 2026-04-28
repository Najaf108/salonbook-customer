import api from '../lib/api';

export const reviewService = {
  async getSalonReviews(salonId, params = {}) {
    const res = await api.get(`/reviews/salon/${salonId}`, { params });
    return res.data;
  },

  async getSalonSummary(salonId) {
    const res = await api.get(`/reviews/salon/${salonId}/summary`);
    return res.data;
  },

  async createReview(data, photos = []) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        if (Array.isArray(data[key])) {
          data[key].forEach(val => formData.append(key, val));
        } else {
          formData.append(key, data[key]);
        }
      }
    });

    photos.forEach((photo, i) => {
      formData.append('photos', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: `review_photo_${i}.jpg`,
      });
    });

    const res = await api.post('/reviews', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async updateReview(id, data, photos = []) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        if (Array.isArray(data[key])) {
          data[key].forEach(val => formData.append(`${key}[]`, val));
        } else {
          formData.append(key, data[key]);
        }
      }
    });

    photos.forEach((photo, i) => {
      formData.append('photos', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: `review_photo_${i}.jpg`,
      });
    });

    const res = await api.patch(`/reviews/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async deleteReview(id) {
    const res = await api.delete(`/reviews/${id}`);
    return res.data;
  },

  async markHelpful(id) {
    const res = await api.post(`/reviews/${id}/helpful`);
    return res.data;
  },

  async reportReview(id, reason, details) {
    const res = await api.post(`/reviews/${id}/report`, { reason, details });
    return res.data;
  },

  async getPendingReviews() {
    const res = await api.get('/reviews/my/pending');
    return res.data;
  },

  async getMyReviews() {
    const res = await api.get('/reviews/my/all');
    return res.data;
  },
};