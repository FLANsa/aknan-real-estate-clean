'use client';
import { useEffect, useRef } from 'react';
import { initMap } from '@/lib/geo/maplibre';
import { useAdminMapStore } from '@/store/adminMapStore';

export default function MapEditor({ onEditParcel }:{ onEditParcel:(id:string)=>void }) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement|null>(null);
  const setBounds = useAdminMapStore(s=>s.setMapBounds);

  useEffect(()=>{
    if (!containerRef.current) return;
    const map = initMap(containerRef.current);
    mapRef.current = map;

    map.on('moveend', ()=>{
      const b = map.getBounds();
      setBounds([[b.getSouthWest().lng, b.getSouthWest().lat],[b.getNorthEast().lng, b.getNorthEast().lat]]);
    });

    // TODO: add layers for parcels & properties
    return ()=> map.remove();
  },[setBounds]);

  return <div ref={containerRef} className="h-[70vh] w-full rounded-2xl border" />;
}
