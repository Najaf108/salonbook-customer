// src/stores/__tests__/useBookingStore.test.js
import { useBookingStore } from '../useBookingStore';

describe('useBookingStore', () => {
    const mockService = { id: 's1', name: 'Haircut', price: 1000, duration: 30 };
    const mockSalon = { id: 'sa1', name: 'Elite Salon' };

    beforeEach(() => {
        useBookingStore.getState().reset();
        jest.clearAllMocks();
    });

    test('setSalon should set salon and reset other fields', () => {
        useBookingStore.setState({ selectedServices: [mockService] });

        useBookingStore.getState().setSalon(mockSalon);

        const state = useBookingStore.getState();
        expect(state.salon).toEqual(mockSalon);
        expect(state.selectedServices).toEqual([]);
    });

    test('toggleService should add or remove service', () => {
        // Add
        useBookingStore.getState().toggleService(mockService);
        expect(useBookingStore.getState().selectedServices).toHaveLength(1);

        // Remove
        useBookingStore.getState().toggleService(mockService);
        expect(useBookingStore.getState().selectedServices).toHaveLength(0);
    });

    test('getTotalPrice should sum service prices', () => {
        useBookingStore.setState({
            selectedServices: [
                { id: '1', price: 500 },
                { id: '2', price: 1200 },
            ],
        });

        expect(useBookingStore.getState().getTotalPrice()).toBe(1700);
    });

    test('getScheduledAt should format date and time', () => {
        useBookingStore.getState().setDateTime('2026-04-15', '14:30');

        const scheduledAt = useBookingStore.getState().getScheduledAt();
        expect(scheduledAt).toBe(new Date('2026-04-15T14:30:00').toISOString());
    });

    test('reset should clear all fields', () => {
        useBookingStore.setState({ salon: mockSalon, notes: 'Test' });

        useBookingStore.getState().reset();

        const state = useBookingStore.getState();
        expect(state.salon).toBeNull();
        expect(state.notes).toBe('');
    });
});
