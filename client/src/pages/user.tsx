import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Phone, Shield, Heart, Flame, Building2, Search, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from '@/hooks/use-location';
import { LocationConsent } from '@/components/location-consent';
import { LocationDebug } from '@/components/location-debug';
import { EmergencyContact } from '@shared/schema';

interface LocationData {
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

const serviceIcons = {
  police: Shield,
  medical: Heart,
  fire: Flame,
  municipal: Building2,
};

const serviceColors = {
  police: 'bg-blue-500',
  medical: 'bg-red-500', 
  fire: 'bg-orange-500',
  municipal: 'bg-green-500',
};

function EmergencyContactCard({ contact }: { contact: EmergencyContact }) {
  const Icon = serviceIcons[contact.serviceType as keyof typeof serviceIcons];
  const colorClass = serviceColors[contact.serviceType as keyof typeof serviceColors];

  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`card-contact-${contact.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${colorClass} text-white`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg" data-testid={`text-name-${contact.id}`}>
              {contact.name}
            </CardTitle>
            <p className="text-sm text-gray-600" data-testid={`text-designation-${contact.id}`}>
              {contact.designation}
            </p>
            <p className="text-sm text-gray-500" data-testid={`text-facility-${contact.id}`}>
              {contact.facility}
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {contact.serviceType}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <a 
              href={`tel:${contact.phone}`}
              className="text-blue-600 hover:underline font-medium"
              data-testid={`link-phone-${contact.id}`}
            >
              {contact.phone}
            </a>
          </div>
          {contact.alternatePhone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <a 
                href={`tel:${contact.alternatePhone}`}
                className="text-blue-600 hover:underline text-sm"
                data-testid={`link-alt-phone-${contact.id}`}
              >
                {contact.alternatePhone} (Alt)
              </a>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span data-testid={`text-address-${contact.id}`}>{contact.address}</span>
          </div>
          <div className="text-xs text-gray-500" data-testid={`text-availability-${contact.id}`}>
            Available: {contact.availability}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function UserPage() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useState<LocationData>({ city: 'Mumbai', state: 'Maharashtra', country: 'India' });
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<string>('all');
  const { 
    location: detectedLocation, 
    showConsent, 
    handleConsent, 
    handleDecline,
    detectLocation,
    loading: locationLoading,
    autoDetected
  } = useLocation();

  useEffect(() => {
    // Use the detected location from the hook
    if (detectedLocation) {
      setLocation({
        city: detectedLocation.city,
        state: detectedLocation.state,
        country: detectedLocation.country
      });
    }
  }, [detectedLocation]);

  const { data: contacts = [], isLoading } = useQuery<EmergencyContact[]>({
    queryKey: ['/api/emergency-contacts'],
    select: (data) => {
      let filtered = data;
      
      // Filter by city
      const cityToFilter = selectedCity || location.city;
      filtered = filtered.filter(contact => 
        contact.city.toLowerCase() === cityToFilter.toLowerCase()
      );
      
      // Filter by service type
      if (selectedService !== 'all') {
        filtered = filtered.filter(contact => contact.serviceType === selectedService);
      }
      
      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(contact =>
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.facility?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.designation?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      return filtered;
    }
  });

  const groupedContacts = contacts.reduce((acc: Record<string, EmergencyContact[]>, contact: EmergencyContact) => {
    if (!acc[contact.serviceType]) {
      acc[contact.serviceType] = [];
    }
    acc[contact.serviceType].push(contact);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-bg flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading emergency contacts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900" data-testid="text-app-title">
                Cure It - Emergency Contacts
              </h1>
              <p className="text-sm text-gray-600" data-testid="text-user-welcome">
                Welcome, {user?.email ? user.email.split('@')[0].split(/[._]/)[0].charAt(0).toUpperCase() + user.email.split('@')[0].split(/[._]/)[0].slice(1) : ''}!
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={logout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Location Info */}
      <div className="bg-blue-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900" data-testid="text-location">
              Current Location: {location.city}, {location.state}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Location Debug Tool */}
        <LocationDebug
          onDetectLocation={detectLocation}
          loading={locationLoading}
          location={location}
          autoDetected={autoDetected}
        />
        
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search contacts, facilities, or designations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="select-service"
            >
              <option value="all">All Services</option>
              <option value="police">Police</option>
              <option value="medical">Medical</option>
              <option value="fire">Fire</option>
              <option value="municipal">Municipal</option>
            </select>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="space-y-8">
          {Object.keys(groupedContacts).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg" data-testid="text-no-contacts">
                No emergency contacts found for {selectedCity || location.city}
              </p>
            </div>
          ) : (
            Object.entries(groupedContacts).map(([serviceType, serviceContacts]) => {
              const Icon = serviceIcons[serviceType as keyof typeof serviceIcons];
              return (
                <div key={serviceType}>
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-6 h-6 text-gray-700" />
                    <h2 className="text-xl font-semibold text-gray-900 capitalize" data-testid={`heading-${serviceType}`}>
                      {serviceType} Services
                    </h2>
                    <Badge variant="secondary">{serviceContacts.length}</Badge>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {serviceContacts.map((contact: EmergencyContact) => (
                      <EmergencyContactCard
                        key={contact.id}
                        contact={contact}
                      />
                    ))}
                  </div>
                  
                  {Object.keys(groupedContacts).indexOf(serviceType) < Object.keys(groupedContacts).length - 1 && (
                    <Separator className="mt-8" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Emergency Notice */}
        <div className="mt-12 bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="bg-red-100 p-2 rounded-full">
              <Phone className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900 mb-2" data-testid="text-emergency-title">
                Emergency Notice
              </h3>
              <p className="text-red-800 text-sm" data-testid="text-emergency-notice">
                In case of life-threatening emergencies, dial <strong>112</strong> (National Emergency Number) or 
                the specific emergency services directly. This app provides additional local contacts for your convenience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Location Consent Popup */}
      <LocationConsent
        isOpen={showConsent}
        onConsent={handleConsent}
        onDecline={handleDecline}
        onClose={() => {}}
      />
    </div>
  );
}