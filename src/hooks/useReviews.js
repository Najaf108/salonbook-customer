import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../services/review.service';

export function useSalonReviews(salonId, filters = {}) {
    return useInfiniteQuery({
        queryKey: ['reviews', 'salon', salonId, filters],
        queryFn: ({ pageParam = 1 }) =>
            reviewService.getSalonReviews(salonId, { ...filters, page: pageParam }),
        getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
        enabled: !!salonId,
    });
}

export function useSalonSummary(salonId) {
    return useQuery({
        queryKey: ['reviews', 'summary', salonId],
        queryFn: () => reviewService.getSalonSummary(salonId),
        enabled: !!salonId,
    });
}

export function usePendingReviews() {
    return useQuery({
        queryKey: ['reviews', 'pending'],
        queryFn: () => reviewService.getPendingReviews(),
    });
}

export function useMyReviews() {
    return useQuery({
        queryKey: ['reviews', 'my'],
        queryFn: () => reviewService.getMyReviews(),
    });
}

export function useCreateReview() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ data, photos }) => reviewService.createReview(data, photos),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });
}

export function useUpdateReview() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data, photos }) => reviewService.updateReview(id, data, photos),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
        },
    });
}

export function useMarkHelpful() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => reviewService.markHelpful(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
        },
    });
}

export function useReportReview() {
    return useMutation({
        mutationFn: ({ id, reason, details }) => reviewService.reportReview(id, reason, details),
    });
}

export function useDeleteReview() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => reviewService.deleteReview(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });
}
