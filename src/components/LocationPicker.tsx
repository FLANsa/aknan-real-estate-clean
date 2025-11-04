'use client';

import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MapPin, Navigation } from 'lucide-react';
import { GOOGLE_MAPS_API_KEY, SAUDI_CITIES } from '@/lib/google-maps-config';
import { logger } from '@/lib/performance';

interface LocationPickerProps {
  center: { lat: number; lng: number };
  zoom: number;
  onLocationChange: (location: { lat: number; lng: number }, zoom: number) => void;
  disabled?: boolean;
}

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
};

const SAUDI_CITIES_WITH_ZOOM = SAUDI_CITIES.map(city => ({
  ...city,
  zoom: 10,
}));

export default function LocationPicker({ center, zoom, onLocationChange, disabled = false }: LocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-maps-loader',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['drawing', 'geometry', 'places'],
  });

  const [mapCenter, setMapCenter] = useState(center);
  const [mapZoom, setMapZoom] = useState(zoom);
  const [selectedLocation, setSelectedLocation] = useState(center);
  const [manualLat, setManualLat] = useState(center.lat.toString());
  const [manualLng, setManualLng] = useState(center.lng.toString());
  const [manualZoom, setManualZoom] = useState(zoom.toString());

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (disabled) return;
    
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const newLocation = { lat, lng };
      
      setSelectedLocation(newLocation);
      setManualLat(lat.toFixed(6));
      setManualLng(lng.toFixed(6));
      onLocationChange(newLocation, mapZoom);
    }
  }, [disabled, mapZoom, onLocationChange]);

  const handleQuickLocation = (city: { lat: number; lng: number; zoom: number }) => {
    if (disabled) return;
    
    const newLocation = { lat: city.lat, lng: city.lng };
    setMapCenter(newLocation);
    setMapZoom(city.zoom);
    setSelectedLocation(newLocation);
    setManualLat(city.lat.toFixed(6));
    setManualLng(city.lng.toFixed(6));
    setManualZoom(city.zoom.toString());
    onLocationChange(newLocation, city.zoom);
  };

  const handleManualLocationChange = () => {
    if (disabled) return;
    
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    const newZoom = parseInt(manualZoom);
    
    if (!isNaN(lat) && !isNaN(lng) && !isNaN(newZoom)) {
      const newLocation = { lat, lng };
      setMapCenter(newLocation);
      setMapZoom(newZoom);
      setSelectedLocation(newLocation);
      onLocationChange(newLocation, newZoom);
    }
  };

  const handleCurrentLocation = () => {
    if (disabled || !navigator.geolocation) return;
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const newLocation = { lat, lng };
        const newZoom = 15;
        
        setMapCenter(newLocation);
        setMapZoom(newZoom);
        setSelectedLocation(newLocation);
        setManualLat(lat.toFixed(6));
        setManualLng(lng.toFixed(6));
        setManualZoom(newZoom.toString());
        onLocationChange(newLocation, newZoom);
      },
      (error) => {
        logger.error('Error getting current location:', error);
        alert('تعذر الحصول على الموقع الحالي');
      }
    );
  };

  if (loadError) {
    return (
      <Card>
        <CardContent className="p-6">
          <GoogleMapsErrorHandler error={loadError} />
        </CardContent>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">
            <h3 className="text-lg font-semibold mb-2">جاري تحميل الخريطة...</h3>
            <p>يرجى الانتظار</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            تحديد موقع المشروع
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Location Buttons */}
          <div className="space-y-2">
            <Label>مواقع سريعة للمدن الرئيسية</Label>
            <div className="flex flex-wrap gap-2">
              {SAUDI_CITIES_WITH_ZOOM.map((city) => (
                <Button
                  key={city.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLocation(city)}
                  disabled={disabled}
                >
                  {city.name}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCurrentLocation}
                disabled={disabled}
              >
                <Navigation className="h-4 w-4 ml-1" />
                موقعي الحالي
              </Button>
            </div>
          </div>

          {/* Manual Input */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manualLat">خط العرض (Latitude)</Label>
              <Input
                id="manualLat"
                type="number"
                step="any"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                disabled={disabled}
                placeholder="مثال: 24.7136"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manualLng">خط الطول (Longitude)</Label>
              <Input
                id="manualLng"
                type="number"
                step="any"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                disabled={disabled}
                placeholder="مثال: 46.6753"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manualZoom">مستوى التكبير (Zoom)</Label>
              <Input
                id="manualZoom"
                type="number"
                min="1"
                max="20"
                value={manualZoom}
                onChange={(e) => setManualZoom(e.target.value)}
                disabled={disabled}
                placeholder="مثال: 10"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={handleManualLocationChange}
            disabled={disabled}
            className="w-full"
          >
            تطبيق الإحداثيات
          </Button>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card>
        <CardHeader>
          <CardTitle>الخريطة التفاعلية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            <p className="text-sm text-muted-foreground">
              انقر على الخريطة لتحديد موقع المشروع
            </p>
            <div className="text-sm">
              <span className="font-medium">الموقع المحدد:</span>{' '}
              <span className="text-muted-foreground">
                {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </span>
            </div>
          </div>
          
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={mapZoom}
            onClick={handleMapClick}
            options={{
              fullscreenControl: false,
              mapTypeControl: true,
              streetViewControl: false,
              zoomControl: true,
            }}
          >
            <Marker
              position={selectedLocation}
              title="موقع المشروع"
            />
          </GoogleMap>
        </CardContent>
      </Card>
    </div>
  );
}
