import { useState } from 'react';
import { MapPin, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LocationDebugProps {
  onDetectLocation: () => Promise<void>;
  loading: boolean;
  location: {
    city: string;
    state: string;
    country: string;
  };
  autoDetected: boolean;
}

export function LocationDebug({ onDetectLocation, loading, location, autoDetected }: LocationDebugProps) {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const testLocation = async () => {
    setDebugInfo([]);
    const info: string[] = [];
    
    info.push('🔍 Testing location detection...');
    setDebugInfo([...info]);

    // Test if geolocation is supported
    if (!navigator.geolocation) {
      info.push('❌ Geolocation not supported by this browser');
      setDebugInfo([...info]);
      return;
    }
    info.push('✅ Geolocation is supported');
    setDebugInfo([...info]);

    // Test location permission
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true
        });
      });

      const { latitude, longitude } = position.coords;
      info.push(`✅ Location permission granted`);
      info.push(`📍 Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      setDebugInfo([...info]);

      // Test backend geocoding
      try {
        const response = await fetch('/api/location/detect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude, longitude }),
        });

        if (response.ok) {
          const locationData = await response.json();
          info.push(`✅ Backend geocoding successful`);
          info.push(`🏙️ Detected: ${locationData.city}, ${locationData.state}`);
        } else {
          info.push(`❌ Backend geocoding failed: ${response.status}`);
        }
      } catch (error) {
        info.push(`❌ Backend geocoding error: ${error}`);
      }
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            info.push('❌ Location permission denied by user');
            break;
          case error.POSITION_UNAVAILABLE:
            info.push('❌ Location information unavailable');
            break;
          case error.TIMEOUT:
            info.push('❌ Location request timed out');
            break;
          default:
            info.push(`❌ Location error: ${error.message}`);
        }
      } else {
        info.push(`❌ Unexpected error: ${error}`);
      }
    }

    setDebugInfo([...info]);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location Debug Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">Current Location:</p>
            <div className="flex items-center gap-2">
              <span className="font-medium">{location.city}, {location.state}</span>
              {autoDetected ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Auto-detected
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Default
                </Badge>
              )}
            </div>
          </div>
          <Button
            onClick={testLocation}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Test Location
          </Button>
        </div>

        {debugInfo.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Debug Information:</h4>
            <div className="space-y-1">
              {debugInfo.map((info, index) => (
                <p key={index} className="text-sm font-mono">
                  {info}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Troubleshooting Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Make sure location is enabled in your browser settings</li>
            <li>• Allow location access when prompted</li>
            <li>• Try refreshing the page if location doesn't work</li>
            <li>• Check if you're using HTTPS (required for location)</li>
            <li>• Try using a different browser if issues persist</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 