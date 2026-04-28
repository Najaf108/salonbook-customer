// src/hooks/useLocation.js
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export function useLocation() {
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(loc.coords);

      // Reverse geocode to get city name
      const [place] = await Location.reverseGeocodeAsync(loc.coords);
      setCity(place?.city || place?.district || 'Your area');
      setLoading(false);
    })();
  }, []);

  return { location, city, error, loading };
}