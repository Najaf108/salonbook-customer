// src/services/__tests__/auth.service.test.js
import { authService } from '../auth.service';
import api from '../../lib/api';
import storage from '../../lib/storage';

// Mock the API and storage
jest.mock('../../lib/api', () => ({
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
}));

jest.mock('../../lib/storage', () => ({
    set: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
}));

describe('authService', () => {
    const phone = '03001234567';
    const otp = '1234';

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('requestOTP should call api.post with phone', async () => {
        api.post.mockResolvedValueOnce({ data: { message: 'OTP sent' } });

        await authService.requestOTP(phone);

        expect(api.post).toHaveBeenCalledWith('/auth/request-otp', { phone });
    });

    test('verifyOTP should call api.post and store token/user', async () => {
        const mockData = { token: 'mock-token', user: { id: 1, name: 'Test' } };
        api.post.mockResolvedValueOnce({ data: mockData });

        const result = await authService.verifyOTP(phone, otp);

        expect(api.post).toHaveBeenCalledWith('/auth/verify-otp', { phone, otp });
        expect(storage.set).toHaveBeenCalledWith('token', 'mock-token');
        expect(storage.set).toHaveBeenCalledWith('user', mockData.user);
        expect(result).toEqual(mockData);
    });

    test('getProfile should call api.get', async () => {
        const mockUser = { id: 1, name: 'Test' };
        api.get.mockResolvedValueOnce({ data: mockUser });

        const result = await authService.getProfile();

        expect(api.get).toHaveBeenCalledWith('/auth/me');
        expect(result).toEqual(mockUser);
    });

    test('logout should clear storage', async () => {
        await authService.logout();

        expect(storage.delete).toHaveBeenCalledWith('token');
        expect(storage.delete).toHaveBeenCalledWith('user');
    });
});
