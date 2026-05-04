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

export function useSendMessage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ bookingId, content }) =>
            messageService.sendMessage(bookingId, content),
        onSuccess: (_, { bookingId }) => {
            queryClient.invalidateQueries({ queryKey: ['conversation', bookingId] });
        }
    });
}
