'use client';
import MapEditor from '@/components/admin/MapEditor';
import ParcelList from '@/components/admin/ParcelList';
import ParcelForm from '@/components/admin/ParcelForm';
import ProjectSwitch from '@/components/admin/ProjectSwitch';
import StatsBar from '@/components/admin/StatsBar';
import LinkPropertiesDialog from '@/components/admin/LinkPropertiesDialog';
import { useState } from 'react';
import type { Parcel } from '@/types/parcels';

export default function AdminMapPage() {
  const [editingParcelId, setEditingParcelId] = useState<string|null>(null);
  const [linkingParcel, setLinkingParcel] = useState<Parcel|null>(null);

  async function handleLinkProperties(parcelId: string, propertyIds: string[]) {
    try {
      const res = await fetch(`/api/admin/parcels/${parcelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedPropertyIds: propertyIds })
      });
      
      if (res.ok) {
        // Refresh the parcel list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error linking properties:', error);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ProjectSwitch />
        <StatsBar />
      </div>
      
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8">
          <MapEditor onEditParcel={(id)=>setEditingParcelId(id)} />
        </div>
        
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <ParcelList onEdit={(id)=>setEditingParcelId(id)} />
          <ParcelForm 
            parcelId={editingParcelId} 
            onDone={()=>setEditingParcelId(null)} 
          />
        </div>
      </div>

      {linkingParcel && (
        <LinkPropertiesDialog
          parcel={linkingParcel}
          onClose={() => setLinkingParcel(null)}
          onSave={handleLinkProperties}
        />
      )}
    </div>
  );
}

