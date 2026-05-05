// d:\business-app\customer-app\src\hooks\useMessages.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService } from '../services/message.service';

export function useConversation(bookingId) {
    return useQuery({
        queryKey: ['conversation', bookingId],
        queryFn: () => messageService.getConversation(bookingId),
        enabled: !!bookingId,
        refetchInterval: 5000,
    });
}

export function useConversations() {
    return useQuery({
        queryKey: ['conversations'],
        queryFn: messageService.getConversations,
        refetchInterval: 30000,
    });
}

export function useSendMessage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ bookingId, content }) =>
            messageService.sendMessage(bookingId, content),
        onSuccess: (_, { bookingId }) => {
            queryClient.invalidateQueries({ queryKey: ['conversation', bookingId] });
            queryClient.invalidateQueries({ queryKey: ['unread-message-count'] });
        }
    });
}

export function useUnreadMessageCount() {
    return useQuery({
        queryKey: ['unread-message-count'],
        queryFn: messageService.getUnreadCount,
        refetchInterval: 10000, // Every 10 seconds
    });
}
