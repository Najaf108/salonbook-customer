import api from '../lib/api';

export const notificationService = {
    getNotifications: async () => {
        const { data } = await api.get('/notifications');
        return data;
    },

    getUnreadCount: async () => {
        const { data } = await api.get('/notifications/unread-count');
        return data;
    },

    markAsRead: async (id) => {
        const { data } = await api.patch(`/notifications/${id}/read`);
        return data;
    },

    markAllAsRead: async () => {
        const { data } = await api.patch('/notifications/read-all');
        return data;
    },
};
