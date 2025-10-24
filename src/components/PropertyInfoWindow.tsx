import React from 'react';
import { Property } from '@/types/property';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, BedDouble, Bath, Maximize, MapPin, ExternalLink, Phone } from 'lucide-react';
import Link from 'next/link';

interface PropertyInfoWindowProps {
  property: Property;
}

const STATUS_LABELS: Record<Property['status'], string> = {
  available: 'متاح',
  sold: 'مباع',
  rented: 'مؤجر',
  reserved: 'محجوز',
};

const STATUS_COLORS: Record<Property['status'], string> = {
  available: 'bg-green-500',
  sold: 'bg-red-500',
  rented: 'bg-orange-500',
  reserved: 'bg-gray-500',
};

const PROPERTY_TYPE_LABELS: Record<Property['type'], string> = {
  apartment: 'شقة',
  villa: 'فيلا',
  townhouse: 'تاون هاوس',
  land: 'أرض',
  office: 'مكتب',
  shop: 'محل تجاري',
};

export function PropertyInfoWindow({ property }: PropertyInfoWindowProps) {
  const slug = property.slug || property.id;
  const firstImage = property.images?.[0] || '/placeholder-property.jpg';

  return (
    <div className="max-w-sm bg-white rounded-lg shadow-lg overflow-hidden" style={{ minWidth: '280px' }}>
      {/* Property Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={firstImage}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge className={`${STATUS_COLORS[property.status]} text-white`}>
            {STATUS_LABELS[property.status]}
          </Badge>
          {property.featured && (
            <Badge className="bg-yellow-500 text-white">
              مميز
            </Badge>
          )}
        </div>
      </div>

      {/* Property Details */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-bold text-lg line-clamp-2">{property.title}</h3>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>
            {property.city} - {property.district}
          </span>
        </div>

        {/* Property Info */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Home className="h-4 w-4 text-gray-500" />
            <span>{PROPERTY_TYPE_LABELS[property.type]}</span>
          </div>
          {property.areaM2 && (
            <div className="flex items-center gap-1">
              <Maximize className="h-4 w-4 text-gray-500" />
              <span>{property.areaM2.toLocaleString('ar-SA')} م²</span>
            </div>
          )}
        </div>

        {/* Bedrooms & Bathrooms */}
        {(property.bedrooms || property.bathrooms) && (
          <div className="flex items-center gap-4 text-sm">
            {property.bedrooms && (
              <div className="flex items-center gap-1">
                <BedDouble className="h-4 w-4 text-gray-500" />
                <span>{property.bedrooms} غرف</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4 text-gray-500" />
                <span>{property.bathrooms} حمامات</span>
              </div>
            )}
          </div>
        )}

        {/* Price */}
        {property.price && (
          <div className="text-lg font-bold text-aknan-500">
            {property.price.toLocaleString('ar-SA')} ريال
          </div>
        )}

        {/* Image Gallery Preview */}
        {property.images && property.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {property.images.slice(0, 4).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${property.title} - ${index + 1}`}
                className="w-16 h-16 object-cover rounded"
              />
            ))}
            {property.images.length > 4 && (
              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-sm font-medium">
                +{property.images.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link href={`/properties/${slug}`} className="flex-1">
            <Button variant="default" className="w-full" size="sm">
              <ExternalLink className="h-4 w-4 ml-2" />
              عرض التفاصيل
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Convert React component to HTML string for Google Maps InfoWindow
 */
export function propertyInfoWindowContent(property: Property): string {
  const slug = property.slug || property.id;
  const firstImage = property.images?.[0] || '/placeholder-property.jpg';
  const statusLabel = STATUS_LABELS[property.status];
  const statusColor = STATUS_COLORS[property.status];
  const typeLabel = PROPERTY_TYPE_LABELS[property.type];

  return `
    <div style="max-width: 280px; font-family: system-ui, -apple-system, sans-serif;">
      <div style="position: relative; height: 160px; overflow: hidden; border-radius: 8px 8px 0 0;">
        <img src="${firstImage}" alt="${property.title}" style="width: 100%; height: 100%; object-fit: cover;">
        <div style="position: absolute; top: 8px; right: 8px;">
          <span style="background: ${statusColor.replace('bg-', '')}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">
            ${statusLabel}
          </span>
        </div>
      </div>
      <div style="padding: 16px;">
        <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 12px 0; line-height: 1.4;">
          ${property.title}
        </h3>
        <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
          📍 ${property.city} - ${property.district}
        </div>
        <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
          🏠 ${typeLabel} ${property.areaM2 ? `• ${property.areaM2.toLocaleString('ar-SA')} م²` : ''}
        </div>
        ${property.price ? `
          <div style="font-size: 18px; font-weight: bold; color: #BC5934; margin-bottom: 12px;">
            ${property.price.toLocaleString('ar-SA')} ريال
          </div>
        ` : ''}
        <a href="/properties/${slug}" style="display: inline-block; background: #BC5934; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">
          عرض التفاصيل →
        </a>
      </div>
    </div>
  `;
}


