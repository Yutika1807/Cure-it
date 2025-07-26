import { Phone, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { EmergencyContact } from '@shared/schema';

interface EmergencyContactCardProps {
  contact: EmergencyContact;
  onDetailsClick?: (contact: EmergencyContact) => void;
}

const serviceTypeColors = {
  police: 'bg-blue-100 text-blue-800',
  medical: 'bg-red-100 text-red-800', 
  fire: 'bg-orange-100 text-orange-800',
  municipal: 'bg-green-100 text-green-800',
};

const serviceTypeButtonColors = {
  police: 'bg-[hsl(207,90%,54%)] hover:bg-blue-700',
  medical: 'bg-[hsl(0,84.2%,60.2%)] hover:bg-red-700',
  fire: 'bg-[hsl(32,95%,44%)] hover:bg-orange-600',
  municipal: 'bg-[hsl(142,71%,45%)] hover:bg-green-700',
};

export function EmergencyContactCard({ contact, onDetailsClick }: EmergencyContactCardProps) {
  const handleCall = () => {
    window.location.href = `tel:${contact.phone}`;
  };

  return (
    <Card className="emergency-card border border-gray-200 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5" data-testid={`card-contact-${contact.id}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-neutral-text" data-testid={`text-contact-name-${contact.id}`}>
            {contact.name}
          </h3>
          <Badge className={`text-xs px-2 py-1 rounded-full ${contact.availability === '24/7' 
            ? serviceTypeColors[contact.serviceType as keyof typeof serviceTypeColors] 
            : 'bg-gray-100 text-gray-800'}`}
            data-testid={`badge-availability-${contact.id}`}>
            {contact.availability}
          </Badge>
        </div>
        
        {contact.designation && (
          <p className="text-sm text-gray-600 mb-3" data-testid={`text-designation-${contact.id}`}>
            {contact.designation}
            {contact.facility && `, ${contact.facility}`}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleCall}
            className={`flex-1 text-white text-center py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              serviceTypeButtonColors[contact.serviceType as keyof typeof serviceTypeButtonColors]
            }`}
            data-testid={`button-call-${contact.id}`}>
            <Phone className="w-4 h-4" />
            {contact.phone}
          </Button>
          
          {onDetailsClick && (
            <Button
              variant="outline"
              onClick={() => onDetailsClick(contact)}
              className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              data-testid={`button-details-${contact.id}`}>
              <Info className="w-4 h-4" />
              Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
