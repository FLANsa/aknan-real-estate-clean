'use client';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useMemo } from 'react';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LIBRARIES } from '@/lib/google-maps-config';

type Props = {
  onMapLoad?: (map: google.maps.Map) => void;
  center: google.maps.LatLngLiteral;
  zoom?: number;
  children?: React.ReactNode;
  height?: string;
  mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
};

const defaultHeight = '480px';

// Create a static array reference to prevent LoadScript reload warnings
const libraries = [...GOOGLE_MAPS_LIBRARIES] as ('drawing' | 'geometry' | 'places')[];

export default function GMap({ 
  onMapLoad, 
  center, 
  zoom = 15, 
  children, 
  height = defaultHeight,
  mapType = 'roadmap'
}: Props) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-maps-loader',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });

  const containerStyle = useMemo(() => ({ 
    width: '100%', 
    height: height, 
    borderRadius: '12px' 
  }), [height]);

  const options = useMemo<google.maps.MapOptions>(() => {
    if (!isLoaded) {
      return {
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      };
    }
    
    return {
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_CENTER,
      },
      fullscreenControl: false,
      streetViewControl: false,
      mapTypeId: mapType,
    };
  }, [mapType, isLoaded]);

  if (!isLoaded) return <div style={{ height }} className="bg-muted animate-pulse rounded-xl" />;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      options={options}
      onLoad={(m) => onMapLoad?.(m)}
    >
      {children}
    </GoogleMap>
  );
}