// src/hooks/useSalons.js
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { salonService } from '../services/salon.service';

export function useNearbySalons(coords, filters) {
  return useQuery({
    queryKey: ['salons', 'nearby', coords, filters],
    queryFn: () => salonService.getNearbySalons({ ...coords, ...filters }),
    enabled: !!coords,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSalonDetail(id) {
  return useQuery({
    queryKey: ['salon', id],
    queryFn: () => salonService.getSalonById(id),
    enabled: !!id,
  });
}

export function useSalonServices(salonId, category) {
  return useQuery({
    queryKey: ['salon-services', salonId, category],
    queryFn: () => salonService.getSalonServices(salonId, category),
    enabled: !!salonId,
  });
}

export function useSalonsByCity(city, category) {
  return useQuery({
    queryKey: ['salons', 'city', city, category],
    queryFn: async () => {
      const res = await salonService.searchSalons({ city, category });
      return res.salons;
    },
    enabled: !!city,
  });
}

export function useSalonStaff(salonId) {
  return useQuery({
    queryKey: ['salon-staff', salonId],
    queryFn: () => salonService.getSalonStaff(salonId),
    enabled: !!salonId,
  });
}

export function useAvailableSlots(salonId, date, staffId, duration) {
  return useQuery({
    queryKey: ['slots', salonId, date, staffId, duration],
    queryFn: () => salonService.getAvailableSlots(salonId, date, staffId, duration),
    enabled: !!salonId && !!date && duration > 0,
  });
}

export function useSearchSalons(params) {
  return useInfiniteQuery({
    queryKey: ['salons', 'search', params],
    queryFn: ({ pageParam = 1 }) => salonService.searchSalons({ ...params, page: pageParam }),
    getNextPageParam: (last, pages) => last.hasMore ? pages.length + 1 : undefined,
    enabled: true,
  });
}