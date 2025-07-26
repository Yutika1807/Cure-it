import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/hooks/use-location';

export function LocationDetector() {
  const { location, detectLocation, loading } = useLocation();

  return (
    <div className="flex items-center gap-4">
      <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full" data-testid="text-current-location">
        <MapPin className="w-4 h-4" />
        <span>{location.city}, {location.state}</span>
      </div>
      
      <Button
        onClick={detectLocation}
        disabled={loading}
        className="bg-[hsl(207,90%,54%)] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        data-testid="button-detect-location">
        <MapPin className="w-4 h-4" />
        {loading ? 'Detecting...' : 'Detect Location'}
      </Button>
    </div>
  );
}
