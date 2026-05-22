// src/hooks/useLocation.js
import { useEffect } from 'react';
import * as Location from 'expo-location';
import { useLocationStore } from '../stores/useLocationStore';

export function useLocation() {
  const {
    location,
    city,
    error,
    isLoading: loading,
    setLocation,
    setCity,
    setError,
    setLoading,
    init
  } = useLocationStore();

  useEffect(() => {
    (async () => {
      // Check if we already have a saved location
      const hasSaved = await init();
      if (hasSaved) {
        return;
      }

      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation(loc.coords);

        // Reverse geocode to get city name
        const [place] = await Location.reverseGeocodeAsync(loc.coords);
        const cityName = place?.city || place?.district || 'Your area';
        setCity(cityName);
      } catch (err) {
        setError('Failed to get current location');
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { location, city, error, loading };
}