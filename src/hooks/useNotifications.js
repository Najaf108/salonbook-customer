import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';

export const useNotifications = () => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: notificationService.getNotifications,
        refetchInterval: 30000, // Refetch every 30 seconds
    });
};

export const useUnreadCount = () => {
    return useQuery({
        queryKey: ['notifications-unread-count'],
        queryFn: notificationService.getUnreadCount,
        refetchInterval: 15000,
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificationService.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        },
    });
};

export const useMarkAllAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificationService.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
        },
    });
};
