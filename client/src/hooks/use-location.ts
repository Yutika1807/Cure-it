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
  const [autoDetected, setAutoDetected] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [hasAskedForConsent, setHasAskedForConsent] = useState(false);
  const { toast } = useToast();

  const detectLocation = async () => {
    setLoading(true);
    console.log('Starting location detection...');
    
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        console.error('Geolocation not supported by browser');
        throw new Error('Geolocation not supported');
      }

      console.log('Requesting location permission...');
      
      // Try browser geolocation first
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log('Location permission granted, coordinates received');
            resolve(pos);
          },
          (error) => {
            console.error('Geolocation error:', error);
            reject(error);
          },
          {
            timeout: 15000, // Increased timeout
            enableHighAccuracy: true,
            maximumAge: 60000 // Allow cached position up to 1 minute old
          }
        );
      });

      const { latitude, longitude } = position.coords;
      console.log('Coordinates received:', { latitude, longitude });
      
      // Use our backend endpoint for reverse geocoding
      console.log('Sending coordinates to backend for geocoding...');
      const response = await fetch('/api/location/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude }),
      });

      console.log('Backend response status:', response.status);

      if (response.ok) {
        const locationData = await response.json();
        console.log('Location data received:', locationData);
        setLocation(locationData);
        setAutoDetected(true);
        toast({
          title: "Location detected successfully!",
          description: `${locationData.city}, ${locationData.state}`,
        });
      } else {
        const errorText = await response.text();
        console.error('Backend geocoding failed:', errorText);
        throw new Error(`Geocoding failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Location detection error:', error);
      
      let errorMessage = 'Location detection failed';
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please allow location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'Location detection failed.';
        }
      }
      
      toast({
        title: "Location detection failed",
        description: errorMessage + " Using default location: Mumbai, Maharashtra",
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

  const requestLocationConsent = () => {
    if (!hasAskedForConsent) {
      setShowConsent(true);
      setHasAskedForConsent(true);
    }
  };

  const handleConsent = async () => {
    setShowConsent(false);
    localStorage.setItem('location-consent', 'true');
    await detectLocation();
  };

  const handleDecline = () => {
    setShowConsent(false);
    toast({
      title: "Location access declined",
      description: "Using default location. You can enable location access later.",
    });
  };

  // Auto-detect location on first load
  useEffect(() => {
    // Check if user has previously given consent
    const hasConsented = localStorage.getItem('location-consent') === 'true';
    
    if (hasConsented) {
      detectLocation();
    } else {
      // Show consent popup on first visit
      setTimeout(() => {
        requestLocationConsent();
      }, 1000); // Small delay to let the app load
    }
  }, []);

  return {
    location,
    setLocation,
    detectLocation,
    loading,
    autoDetected,
    showConsent,
    requestLocationConsent,
    handleConsent,
    handleDecline,
  };
}
