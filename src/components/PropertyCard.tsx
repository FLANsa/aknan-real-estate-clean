import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Property } from '@/types/property';
import { PROPERTY_STATUS_LABELS, PROPERTY_TYPE_LABELS, CURRENCY_LABELS } from '@/types/property';
import { MapPin, Bed, Bath, Square } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const mainImage = property.images?.[0] || '/placeholder-property.jpg';
  
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      <div className="aspect-[4/3] relative">
        <Image
          src={mainImage}
          alt={property.titleAr}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            if (target.src !== '/placeholder-property.jpg') {
              target.src = '/placeholder-property.jpg';
            }
          }}
        />
        {property.featured && (
          <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-500">
            مميز
          </Badge>
        )}
        <Badge 
          variant={
            property.status === 'available' ? 'default' :
            property.status === 'sold' ? 'destructive' :
            property.status === 'rented' ? 'secondary' : 'outline'
          }
          className="absolute top-2 left-2"
        >
          {PROPERTY_STATUS_LABELS[property.status]}
        </Badge>
      </div>
      
      <CardContent className="p-5 space-y-4 flex-1 flex flex-col">
        <div>
          <h3 className="font-semibold text-lg line-clamp-2 mb-1">
            {property.titleAr}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 ml-1" />
            {property.district && `${property.district}, `}{property.city}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">
            {Number(property.price || 0).toLocaleString()} {CURRENCY_LABELS[property.currency]}
          </div>
          <Badge variant="outline">
            {PROPERTY_TYPE_LABELS[property.type]}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {property.bedrooms && Number(property.bedrooms) > 0 && (
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{Number(property.bedrooms)}</span>
            </div>
          )}
          {property.bathrooms && Number(property.bathrooms) > 0 && (
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{Number(property.bathrooms)}</span>
            </div>
          )}
          {property.areaM2 && Number(property.areaM2) > 0 && (
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              <span>{Number(property.areaM2)} م²</span>
            </div>
          )}
        </div>
        
        <Button asChild className="w-full">
          <Link href={`/properties/${property.slug}`}>
            عرض التفاصيل
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}


