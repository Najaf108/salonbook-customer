// src/services/__tests__/salon.service.test.js
import { salonService } from '../salon.service';
import api from '../../lib/api';

// Mock the API
jest.mock('../../lib/api', () => ({
    get: jest.fn(),
}));

describe('salonService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('getNearbySalons should call api.get with correct params', async () => {
        api.get.mockResolvedValueOnce({ data: [] });

        await salonService.getNearbySalons({ lat: 33.6, lng: 73.0, radius: 10 });

        expect(api.get).toHaveBeenCalledWith('/salons/nearby', {
            params: { lat: 33.6, lng: 73.0, radius: 10, category: undefined, gender: undefined, city: undefined },
        });
    });

    test('searchSalons should call api.get with query', async () => {
        api.get.mockResolvedValueOnce({ data: [] });

        await salonService.searchSalons({ query: 'cut' });

        expect(api.get).toHaveBeenCalledWith('/salons/search', {
            params: { query: 'cut', city: undefined, category: undefined, gender: undefined, minRating: undefined, page: 1, limit: 20 },
        });
    });

    test('getSalonById should call api.get with ID', async () => {
        api.get.mockResolvedValueOnce({ data: { id: 's1' } });

        await salonService.getSalonById('s1');

        expect(api.get).toHaveBeenCalledWith('/salons/s1');
    });

    test('getAvailableSlots should call api.get with date and staff', async () => {
        api.get.mockResolvedValueOnce({ data: [] });

        await salonService.getAvailableSlots('s1', '2026-04-13', 'st1', 30);

        expect(api.get).toHaveBeenCalledWith('/salons/s1/slots', {
            params: { date: '2026-04-13', staffId: 'st1', duration: 30 },
        });
    });
});
