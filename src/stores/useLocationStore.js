import { create } from 'zustand';
import * as Location from 'expo-location';
import storage from '../lib/storage';

export const useLocationStore = create((set, get) => ({
    location: null,
    city: '',
    isLoading: true,
    error: null,

    setLocation: (location) => {
        set({ location });
        storage.set('user_location', location);
    },

    setCity: async (city) => {
        set({ city, isLoading: true });
        storage.set('user_city', city);

        try {
            // Attempt to get coordinates for the selected city to keep "Nearby" results relevant
            const results = await Location.geocodeAsync(city);
            if (results && results.length > 0) {
                const { latitude, longitude } = results[0];
                const newLoc = { latitude, longitude };
                set({ location: newLoc });
                storage.set('user_location', newLoc);
            }
        } catch (err) {
            console.error("Geocoding error:", err);
        } finally {
            set({ isLoading: false });
        }
    },

    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    init: async () => {
        const state = get();
        if (state.location && state.city) {
            set({ isLoading: false });
            return true;
        }

        const savedLocation = await storage.get('user_location');
        const savedCity = await storage.get('user_city');

        if (savedLocation && savedCity) {
            set({
                location: savedLocation,
                city: savedCity,
                isLoading: false
            });
            return true; // Already has saved data
        }

        set({ isLoading: false });
        return false; // No saved data
    }
}));
