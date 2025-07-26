import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

export interface Location {
  city: string;
  state: string;
  country: string;
}

export function useLocation() {
  const [location, setLocation] = useState<Location>({
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const detectLocation = async () => {
    setLoading(true);
    
    try {
      // Try browser geolocation first
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Use our backend endpoint for reverse geocoding
      const response = await fetch('/api/location/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude }),
      });

      if (response.ok) {
        const locationData = await response.json();
        setLocation(locationData);
        toast({
          title: "Location detected",
          description: `${locationData.city}, ${locationData.state}`,
        });
      } else {
        throw new Error('Geocoding failed');
      }
    } catch (error) {
      toast({
        title: "Location detection failed",
        description: "Using default location: Mumbai, Maharashtra",
        variant: "destructive",
      });
      
      // Fallback to default location
      setLocation({
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India'
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-detect location on first load
  useEffect(() => {
    detectLocation();
  }, []);

  return {
    location,
    setLocation,
    detectLocation,
    loading,
  };
}
