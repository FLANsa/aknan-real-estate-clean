'use client';
import { useEffect, useState } from 'react';
import type { Parcel } from '@/types/parcels';

interface Property {
  id: string;
  titleAr: string;
  city: string;
  price: number;
}

interface LinkPropertiesDialogProps {
  parcel: Parcel | null;
  onClose: () => void;
  onSave: (parcelId: string, propertyIds: string[]) => void;
}

export default function LinkPropertiesDialog({ parcel, onClose, onSave }: LinkPropertiesDialogProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (parcel) {
      setSelectedIds(parcel.linkedPropertyIds || []);
      fetchProperties();
    }
  }, [parcel]);

  async function fetchProperties() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/properties/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '' })
      });
      const data = await res.json();
      setProperties(data.items || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (parcel) {
      onSave(parcel.id, selectedIds);
      onClose();
    }
  }

  function toggleProperty(id: string) {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(pid => pid !== id)
        : [...prev, id]
    );
  }

  if (!parcel) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        <h2 className="text-xl font-bold mb-4">ربط العقارات بالقطعة: {parcel.name}</h2>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">جاري التحميل...</div>
          ) : (
            <div className="space-y-2">
              {properties.map((property) => (
                <label key={property.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(property.id)}
                    onChange={() => toggleProperty(property.id)}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{property.titleAr}</div>
                    <div className="text-sm text-gray-600">
                      {property.city} • {property.price.toLocaleString()} ريال
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mt-4 pt-4 border-t">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            حفظ الربط
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

