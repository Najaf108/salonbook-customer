import api from '../lib/api';

export const brandService = {
    async getBrandProfile(slug) {
        const res = await api.get(`/organizations/profile/${slug}`);
        return res.data;
    },

    async getBrandBranches(slug) {
        const res = await api.get(`/organizations/profile/${slug}/branches`);
        return res.data;
    }
};
