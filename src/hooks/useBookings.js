// src/hooks/useBookings.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../services/booking.service';

export function useMyBookings(status) {
  return useQuery({
    queryKey: ['bookings', status],
    queryFn: () => bookingService.getMyBookings(status),
    staleTime: 60 * 1000,
  });
}

export function useBookingDetail(id) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.getBookingById(id),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => bookingService.cancelBooking(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });
}