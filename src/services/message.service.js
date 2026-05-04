// d:\business-app\customer-app\src\services\message.service.js
import api from '../lib/api';

export const messageService = {
    async getConversation(bookingId) {
        const res = await api.get(`/messages/${bookingId}`);
        return res.data;
    },

    async sendMessage(bookingId, content) {
        const res = await api.post(`/messages/${bookingId}`, { content });
        return res.data;
    }
};
