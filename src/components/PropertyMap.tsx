'use client';

import { useEffect, useRef } from 'react';
import GMap from './GMap';

interface PropertyMapProps {
  lat: number;
  lng: number;
  title: string;
}

export default function PropertyMap({ lat, lng, title }: PropertyMapProps) {
  const markerRef = useRef<google.maps.Marker | null>(null);

  const onMapLoad = (map: google.maps.Map) => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    markerRef.current = new google.maps.Marker({
      position: { lat, lng },
      map,
      title,
    });
  };

  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, []);

  return (
    <GMap
      center={{ lat, lng }}
      zoom={15}
      height="100%"
      mapType="roadmap"
      onMapLoad={onMapLoad}
    />
  );
}


