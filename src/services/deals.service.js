// src/services/deals.service.js
import api from '../lib/api';

export const dealsService = {
    async getFeaturedDeals(city) {
        const res = await api.get('/deals/featured', { params: { city } });
        return res.data;
    },

    async getSalonDeals(salonId) {
        const res = await api.get(`/deals/salon/${salonId}`);
        return res.data;
    },

    async getDealById(id) {
        const res = await api.get(`/deals/${id}`);
        return res.data;
    },

    async applyDeal(id, { serviceIds, totalAmount }) {
        const res = await api.post(`/deals/${id}/apply`, { serviceIds, totalAmount });
        return res.data;
    },
};
