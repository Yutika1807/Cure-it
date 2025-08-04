import { useState } from 'react';
import { MapPin, Shield, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LocationConsentProps {
  isOpen: boolean;
  onConsent: () => void;
  onDecline: () => void;
  onClose: () => void;
}

export function LocationConsent({ isOpen, onConsent, onDecline, onClose }: LocationConsentProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConsent = async () => {
    setIsLoading(true);
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      // Request location permission
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true
        });
      });

      onConsent();
    } catch (error) {
      console.error('Location permission denied:', error);
      onDecline();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    onDecline();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <DialogTitle className="text-xl font-semibold">
              Enable Location Services
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600">
            To provide you with the most relevant emergency contacts for your area, 
            we need to access your location. This helps us show you emergency services 
            that are closest to you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Benefits */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Why enable location?
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Get emergency contacts for your exact location</li>
              <li>• Find the nearest hospitals, police stations, and fire departments</li>
              <li>• Receive location-specific emergency information</li>
              <li>• Faster access to local emergency services</li>
            </ul>
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Privacy & Security
            </h4>
            <p className="text-sm text-gray-700">
              Your location is only used to find nearby emergency contacts. 
              We don't store your location data and it's never shared with third parties.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleConsent}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-allow-location"
            >
              {isLoading ? 'Enabling...' : 'Allow Location Access'}
            </Button>
            <Button
              onClick={handleDecline}
              variant="outline"
              className="flex-1"
              data-testid="button-decline-location"
            >
              Not Now
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            You can change this later in your browser settings
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 