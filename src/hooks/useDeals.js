// src/hooks/useDeals.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsService } from '../services/deals.service';

export function useFeaturedDeals() {
    return useQuery({
        queryKey: ['deals', 'featured'],
        queryFn: () => dealsService.getFeaturedDeals(),
        staleTime: 5 * 60 * 1000,
    });
}

export function useSalonDeals(salonId) {
    return useQuery({
        queryKey: ['deals', 'salon', salonId],
        queryFn: () => dealsService.getSalonDeals(salonId),
        enabled: !!salonId,
        staleTime: 2 * 60 * 1000,
    });
}

export function useDealDetail(id) {
    return useQuery({
        queryKey: ['deal', id],
        queryFn: () => dealsService.getDealById(id),
        enabled: !!id,
    });
}

export function useApplyDeal() {
    return useMutation({
        mutationFn: ({ id, serviceIds, totalAmount }) =>
            dealsService.applyDeal(id, { serviceIds, totalAmount }),
    });
}
