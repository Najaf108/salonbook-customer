// src/hooks/usePackages.js
import { useQuery, useMutation } from '@tanstack/react-query';
import { packagesService } from '../services/packages.service';

export function useFeaturedPackages(city) {
    return useQuery({
        queryKey: ['packages', 'featured', city],
        queryFn: () => packagesService.getFeaturedPackages(city),
        staleTime: 5 * 60 * 1000,
    });
}

export function useSalonPackages(salonId) {
    return useQuery({
        queryKey: ['packages', 'salon', salonId],
        queryFn: () => packagesService.getSalonPackages(salonId),
        enabled: !!salonId,
        staleTime: 2 * 60 * 1000,
    });
}

export function usePackageDetail(id) {
    return useQuery({
        queryKey: ['package', id],
        queryFn: () => packagesService.getPackageById(id),
        enabled: !!id,
    });
}

export function useBookPackage() {
    return useMutation({
        mutationFn: (data) => packagesService.bookPackage(data),
    });
}
