'use client';
import { useEffect, useState } from 'react';
import { useAdminMapStore } from '@/store/adminMapStore';
import { PARCEL_STATUS_LABELS, PARCEL_STATUS_COLORS } from '@/types/parcels';
import type { Parcel } from '@/types/parcels';

export default function ParcelList({ onEdit }:{
  onEdit:(id:string)=>void;
}) {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const activeProjectId = useAdminMapStore(s=>s.activeProjectId);

  useEffect(()=>{
    fetchParcels();
  },[activeProjectId]);

  async function fetchParcels() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/parcels');
      const data = await res.json();
      let filteredParcels = data.items || [];
      
      if (activeProjectId) {
        filteredParcels = filteredParcels.filter((p:Parcel) => p.projectId === activeProjectId);
      }
      
      setParcels(filteredParcels);
    } catch (error) {
      console.error('Error fetching parcels:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteParcel(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذه القطعة؟')) return;
    
    try {
      const res = await fetch(`/api/admin/parcels/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchParcels();
      }
    } catch (error) {
      console.error('Error deleting parcel:', error);
    }
  }

  if (loading) {
    return <div className="p-4 text-center">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg">القطع العقارية</h3>
      {parcels.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          لا توجد قطع عقارية
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {parcels.map((parcel) => (
            <div key={parcel.id} className="p-3 border rounded-lg bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{parcel.name || `قطعة ${parcel.id.slice(0,8)}`}</h4>
                <span 
                  className="px-2 py-1 rounded text-xs text-white"
                  style={{ backgroundColor: PARCEL_STATUS_COLORS[parcel.status] }}
                >
                  {PARCEL_STATUS_LABELS[parcel.status]}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                المساحة: {parcel.useManualMetrics && parcel.manualAreaSqm 
                  ? `${parcel.manualAreaSqm.toLocaleString()} م²` 
                  : parcel.computedAreaSqm 
                    ? `${parcel.computedAreaSqm.toLocaleString()} م²` 
                    : 'غير محدد'}
              </div>
              
              <div className="flex gap-2">
                <button 
                  className="text-blue-600 text-sm hover:underline"
                  onClick={() => onEdit(parcel.id)}
                >
                  تعديل
                </button>
                <button 
                  className="text-red-600 text-sm hover:underline"
                  onClick={() => deleteParcel(parcel.id)}
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

