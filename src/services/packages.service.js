// src/services/packages.service.js
import api from '../lib/api';

export const packagesService = {
    async getFeaturedPackages(city) {
        const res = await api.get('/packages/featured', { params: { city } });
        return res.data;
    },

    async getSalonPackages(salonId) {
        const res = await api.get(`/packages/salon/${salonId}`);
        return res.data;
    },

    async getPackageById(id) {
        const res = await api.get(`/packages/${id}`);
        return res.data;
    },

    async bookPackage(data) {
        const res = await api.post('/bookings/package', data);
        return res.data;
    },
};
