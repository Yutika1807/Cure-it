import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Shield, HeartPulse, Flame, Building2, ChevronDown, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EmergencyContactCard } from '@/components/emergency-contact-card';
import { LocationDetector } from '@/components/location-detector';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from '@/hooks/use-location';
import { useToast } from '@/hooks/use-toast';
import type { EmergencyContact } from '@shared/schema';
import { Link } from 'wouter';

const serviceTypeConfig = {
  police: {
    icon: Shield,
    title: 'Police Services',
    color: 'bg-[hsl(207,90%,54%)]',
  },
  medical: {
    icon: HeartPulse,
    title: 'Medical Services', 
    color: 'bg-[hsl(0,84.2%,60.2%)]',
  },
  fire: {
    icon: Flame,
    title: 'Fire Department',
    color: 'bg-[hsl(32,95%,44%)]',
  },
  municipal: {
    icon: Building2,
    title: 'Municipal Services',
    color: 'bg-[hsl(142,71%,45%)]',
  },
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const { user, logout, isAdmin } = useAuth();
  const { location } = useLocation();
  const { toast } = useToast();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['/api/emergency-contacts', { 
      city: selectedCity || location.city,
      state: location.state,
      search: searchTerm 
    }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCity || location.city) params.append('city', selectedCity || location.city);
      if (location.state) params.append('state', location.state);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/emergency-contacts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch contacts');
      return response.json();
    },
  });

  const groupedContacts = contacts.reduce((acc: Record<string, EmergencyContact[]>, contact: EmergencyContact) => {
    if (!acc[contact.serviceType]) {
      acc[contact.serviceType] = [];
    }
    acc[contact.serviceType].push(contact);
    return acc;
  }, {});

  const handleContactDetails = (contact: EmergencyContact) => {
    toast({
      title: contact.name,
      description: `${contact.designation || 'Emergency Contact'} - ${contact.city}, ${contact.state}`,
    });
  };

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  const emergencyCall = () => {
    window.location.href = 'tel:112';
  };

  return (
    <div className="bg-neutral-bg min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-[hsl(0,84.2%,60.2%)] w-10 h-10 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-text" data-testid="text-app-title">Cure It</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <LocationDetector />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200" data-testid="button-user-menu">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-[hsl(207,90%,54%)] text-white text-sm font-medium">
                        {getInitials(user?.email || '')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium text-neutral-text">{user?.email}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer" data-testid="link-admin-panel">
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={logout} className="cursor-pointer" data-testid="button-logout">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filter Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search emergency contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(207,90%,54%)] focus:border-[hsl(207,90%,54%)]"
                  data-testid="input-search"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-48" data-testid="select-city">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Cities</SelectItem>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                    <SelectItem value="Chennai">Chennai</SelectItem>
                    <SelectItem value="Kolkata">Kolkata</SelectItem>
                    <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                    <SelectItem value="Pune">Pune</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Services Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Loading emergency contacts...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {Object.entries(serviceTypeConfig).map(([serviceType, config]) => {
              const serviceContacts = groupedContacts[serviceType] || [];
              const Icon = config.icon;
              
              return (
                <Card key={serviceType} className="shadow-sm border border-neutral-border" data-testid={`card-service-${serviceType}`}>
                  <CardHeader className={`${config.color} text-white p-4 rounded-t-xl`}>
                    <div className="flex items-center gap-3">
                      <Icon className="w-6 h-6" />
                      <h2 className="text-xl font-semibold">{config.title}</h2>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    {serviceContacts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No {serviceType} contacts found for {selectedCity || location.city}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {serviceContacts.map((contact: EmergencyContact) => (
                          <EmergencyContactCard
                            key={contact.id}
                            contact={contact}
                            onDetailsClick={handleContactDetails}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Mobile Emergency Action Button */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button
          onClick={emergencyCall}
          className="bg-[hsl(0,84.2%,60.2%)] text-white w-16 h-16 rounded-full shadow-lg hover:bg-red-700 transition-all transform hover:scale-105 flex items-center justify-center"
          data-testid="button-emergency-call">
          <Phone className="w-8 h-8" />
        </Button>
      </div>
    </div>
  );
}
