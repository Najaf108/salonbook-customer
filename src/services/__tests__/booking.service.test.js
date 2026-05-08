// src/services/__tests__/booking.service.test.js
import { bookingService } from '../booking.service';
import api from '../../lib/api';

// Mock the API
jest.mock('../../lib/api', () => ({
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
}));

describe('bookingService', () => {
    const mockBookingData = {
        salonId: 'salon-1',
        staffId: 'staff-1',
        scheduledAt: new Date().toISOString(),
        serviceIds: ['svc-1', 'svc-2'],
        paymentMethod: 'CASH',
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('createBooking should call api.post with correct data', async () => {
        api.post.mockResolvedValueOnce({ data: { id: 'bk-1', ...mockBookingData } });

        const result = await bookingService.createBooking(mockBookingData);

        expect(api.post).toHaveBeenCalledWith('/bookings', mockBookingData);
        expect(result.id).toBe('bk-1');
    });

    test('getMyBookings should call api.get with status and pagination', async () => {
        api.get.mockResolvedValueOnce({ data: [] });

        await bookingService.getMyBookings('CONFIRMED', 2);

        expect(api.get).toHaveBeenCalledWith('/bookings/my', {
            params: { status: 'CONFIRMED', page: 2, limit: 10 },
        });
    });

    test('cancelBooking should call api.patch', async () => {
        api.patch.mockResolvedValueOnce({ data: { message: 'Cancelled' } });

        await bookingService.cancelBooking('bk-1', 'Change of plan');

        expect(api.patch).toHaveBeenCalledWith('/bookings/bk-1/cancel', { reason: 'Change of plan' });
    });

    test('initiateJazzCashPayment should call api.post', async () => {
        const mockRes = { redirectUrl: 'http://jazz', txnRefNo: 'ref123' };
        api.post.mockResolvedValueOnce({ data: mockRes });

        const result = await bookingService.initiateJazzCashPayment('bk-1');

        expect(api.post).toHaveBeenCalledWith('/payments/jazzcash/initiate', { bookingId: 'bk-1' });
        expect(result).toEqual(mockRes);
    });
});
