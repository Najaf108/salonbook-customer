// src/stores/__tests__/useAuthStore.test.js
import { useAuthStore } from '../useAuthStore';
import storage from '../../lib/storage';
import { authService } from '../../services/auth.service';

// Mock dependencies
jest.mock('../../lib/storage', () => ({
    get: jest.fn(),
    set: jest.fn(),
}));

jest.mock('../../services/auth.service', () => ({
    authService: {
        logout: jest.fn(),
    },
}));

describe('useAuthStore', () => {
    const mockUser = { id: 'u1', name: 'Test User' };
    const mockToken = 't123';

    beforeEach(() => {
        // Reset Zustand store state before each test
        useAuthStore.setState({
            user: null,
            token: null,
            isLoading: true,
            isAuthenticated: false,
        });
        jest.clearAllMocks();
    });

    test('init should restore session from storage', async () => {
        storage.get.mockImplementation((key) => {
            if (key === 'token') return Promise.resolve(mockToken);
            if (key === 'user') return Promise.resolve(mockUser);
            return Promise.resolve(null);
        });

        await useAuthStore.getState().init();

        const state = useAuthStore.getState();
        expect(state.user).toEqual(mockUser);
        expect(state.token).toBe(mockToken);
        expect(state.isAuthenticated).toBe(true);
        expect(state.isLoading).toBe(false);
    });

    test('setAuth should update state', () => {
        useAuthStore.getState().setAuth(mockUser, mockToken);

        const state = useAuthStore.getState();
        expect(state.user).toEqual(mockUser);
        expect(state.isAuthenticated).toBe(true);
    });

    test('updateUser should merge data and update storage', () => {
        useAuthStore.setState({ user: mockUser });

        useAuthStore.getState().updateUser({ name: 'New Name' });

        const state = useAuthStore.getState();
        expect(state.user.name).toBe('New Name');
        expect(state.user.id).toBe('u1');
        expect(storage.set).toHaveBeenCalled();
    });

    test('logout should call authService and reset state', async () => {
        useAuthStore.setState({ user: mockUser, isAuthenticated: true });

        await useAuthStore.getState().logout();

        expect(authService.logout).toHaveBeenCalled();
        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
        expect(state.isAuthenticated).toBe(false);
    });
});
