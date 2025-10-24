import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Maximize, ExternalLink, Phone, Home } from 'lucide-react';
import Link from 'next/link';

interface Plot {
  id: string;
  number: string;
  status: 'available' | 'sold' | 'reserved';
  price?: number;
  projectId?: string;
  projectName?: string;
  propertyId?: string;
  dimensions?: {
    area: number;
  };
}

interface PlotInfoWindowProps {
  plot: Plot;
}

const STATUS_LABELS: Record<Plot['status'], string> = {
  available: 'متاح',
  sold: 'مباع',
  reserved: 'محجوز',
};

const STATUS_COLORS: Record<Plot['status'], string> = {
  available: 'bg-green-500',
  sold: 'bg-red-500',
  reserved: 'bg-gray-500',
};

export function PlotInfoWindow({ plot }: PlotInfoWindowProps) {
  return (
    <div className="max-w-sm bg-white rounded-lg shadow-lg overflow-hidden" style={{ minWidth: '260px' }}>
      {/* Plot Header */}
      <div className="bg-gradient-to-r from-aknan-500 to-aknan-600 p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg">قطعة #{plot.number}</h3>
          <Badge className={`${STATUS_COLORS[plot.status]} text-white`}>
            {STATUS_LABELS[plot.status]}
          </Badge>
        </div>
        {plot.projectName && (
          <div className="flex items-center gap-2 text-sm opacity-90">
            <Home className="h-4 w-4" />
            <span>{plot.projectName}</span>
          </div>
        )}
      </div>

      {/* Plot Details */}
      <div className="p-4 space-y-3">
        {/* Area */}
        <div className="flex items-center justify-between py-2 border-b">
          <div className="flex items-center gap-2 text-gray-600">
            <Maximize className="h-5 w-5" />
            <span className="font-medium">المساحة</span>
          </div>
          <span className="font-bold text-lg">
            {plot.dimensions?.area?.toLocaleString('ar-SA') || 0} م²
          </span>
        </div>

        {/* Price */}
        {plot.price && (
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600 font-medium">السعر</span>
            <span className="font-bold text-lg text-aknan-500">
              {plot.price.toLocaleString('ar-SA')} ريال
            </span>
          </div>
        )}

        {/* Property Link */}
        {plot.propertyId && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-800 mb-2">
              <Home className="h-4 w-4" />
              <span className="font-medium">مرتبط بعقار</span>
            </div>
            <Link href={`/properties/${plot.propertyId}`}>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="h-4 w-4 ml-2" />
                عرض العقار
              </Button>
            </Link>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {plot.projectId && (
            <Link href={`/projects/${plot.projectId}`} className="flex-1">
              <Button variant="default" className="w-full" size="sm">
                <ExternalLink className="h-4 w-4 ml-2" />
                عرض المشروع
              </Button>
            </Link>
          )}
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
export function plotInfoWindowContent(plot: Plot): string {
  const statusLabel = STATUS_LABELS[plot.status];
  const statusColor = STATUS_COLORS[plot.status].replace('bg-', '');

  return `
    <div style="max-width: 260px; font-family: system-ui, -apple-system, sans-serif;">
      <div style="background: linear-gradient(to right, #BC5934, #A54E2E); padding: 16px; color: white; border-radius: 8px 8px 0 0;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <h3 style="font-size: 18px; font-weight: bold; margin: 0;">قطعة #${plot.number}</h3>
          <span style="background: ${statusColor}; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">
            ${statusLabel}
          </span>
        </div>
        ${plot.projectName ? `
          <div style="font-size: 14px; opacity: 0.9;">
            🏠 ${plot.projectName}
          </div>
        ` : ''}
      </div>
      <div style="padding: 16px;">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
          <span style="color: #666; font-weight: 500;">📐 المساحة</span>
          <span style="font-size: 18px; font-weight: bold;">
            ${plot.dimensions?.area?.toLocaleString('ar-SA') || 0} م²
          </span>
        </div>
        ${plot.price ? `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
            <span style="color: #666; font-weight: 500;">السعر</span>
            <span style="font-size: 18px; font-weight: bold; color: #BC5934;">
              ${plot.price.toLocaleString('ar-SA')} ريال
            </span>
          </div>
        ` : ''}
        ${plot.propertyId ? `
          <div style="background: #eff6ff; padding: 12px; border-radius: 6px; margin: 12px 0;">
            <div style="font-size: 12px; color: #1e40af; font-weight: 500; margin-bottom: 8px;">
              🏠 مرتبط بعقار
            </div>
            <a href="/properties/${plot.propertyId}" style="display: block; text-align: center; background: white; border: 1px solid #e5e7eb; color: #374151; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 13px;">
              عرض العقار →
            </a>
          </div>
        ` : ''}
        <div style="margin-top: 16px;">
          ${plot.projectId ? `
            <a href="/projects/${plot.projectId}" style="display: inline-block; width: 100%; background: #BC5934; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; text-align: center; font-size: 14px; font-weight: 500;">
              عرض المشروع →
            </a>
          ` : `
            <a href="/contact" style="display: inline-block; width: 100%; background: #BC5934; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; text-align: center; font-size: 14px; font-weight: 500;">
              اتصل بنا
            </a>
          `}
        </div>
      </div>
    </div>
  `;
}

