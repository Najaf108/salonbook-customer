// src/services/booking.service.js
import api from '../lib/api';

export const bookingService = {
  async createBooking(data) {
    const res = await api.post('/bookings', data);
    return res.data;
  },

  async getMyBookings(status, page = 1) {
    const params = { page, limit: 10 };
    if (status && status !== 'null') params.status = status;
    const res = await api.get('/bookings/my', { params });
    return res.data;
  },

  async getBookingById(id) {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  },

  async cancelBooking(id, reason) {
    const res = await api.patch(`/bookings/${id}/cancel`, { reason });
    return res.data;
  },

  async initiateJazzCashPayment(bookingId) {
    const res = await api.post(`/payments/jazzcash/initiate`, { bookingId });
    return res.data; // { redirectUrl, txnRefNo }
  },

  async initiateEasyPaisaPayment(bookingId) {
    const res = await api.post(`/payments/easypaisa/initiate`, { bookingId });
    return res.data;
  },

  async verifyPayment(bookingId, txnRef) {
    const res = await api.post(`/payments/verify`, { bookingId, txnRef });
    return res.data;
  },
};