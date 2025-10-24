'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleMap, useJsApiLoader, DrawingManager } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LIBRARIES } from '@/lib/google-maps-config';
import { Coordinates } from '@/types/map';

export default function NewProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: { lat: 24.7136, lng: 46.6753 } as Coordinates, // Riyadh default
    zoom: 15,
    boundary: [] as Coordinates[],
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
  const [saving, setSaving] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'new-project-map-loader',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: [...GOOGLE_MAPS_LIBRARIES],
  });

  const handleDrawingManagerLoad = (drawingManager: google.maps.drawing.DrawingManager) => {
    setDrawingManager(drawingManager);
  };

  const handlePolygonComplete = (polygon: google.maps.Polygon) => {
    const path = polygon.getPath();
    const coordinates: Coordinates[] = [];
    
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coordinates.push({
        lat: point.lat(),
        lng: point.lng(),
      });
    }
    
    setFormData(prev => ({
      ...prev,
      boundary: coordinates,
    }));
    
    setIsDrawing(false);
    drawingManager?.setDrawingMode(null);
  };

  const startDrawing = () => {
    setIsDrawing(true);
    drawingManager?.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
  };

  const clearBoundary = () => {
    setFormData(prev => ({
      ...prev,
      boundary: [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        router.push(`/admin/projects/${data.id}`);
      } else {
        alert('حدث خطأ أثناء إنشاء المشروع');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('حدث خطأ أثناء إنشاء المشروع');
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إنشاء مشروع جديد</h1>
        <p className="text-gray-600">أدخل بيانات المشروع وارسم حدود البلوك السكني</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المشروع *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="مثال: مشروع النخيل السكني"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف المشروع
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder="وصف مختصر عن المشروع..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مستوى التقريب
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.zoom}
                onChange={(e) => setFormData(prev => ({ ...prev, zoom: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Drawing Controls */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                حدود البلوك السكني
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={startDrawing}
                  disabled={isDrawing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isDrawing ? 'ارسم على الخريطة...' : 'بدء الرسم'}
                </button>
                <button
                  type="button"
                  onClick={clearBoundary}
                  disabled={formData.boundary.length === 0}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  مسح الحدود
                </button>
              </div>
              {formData.boundary.length > 0 && (
                <p className="text-sm text-green-600">
                  تم رسم الحدود بنجاح ({formData.boundary.length} نقطة)
                </p>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              الخريطة
            </label>
            <div className="h-96 rounded-lg overflow-hidden border">
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={formData.location}
                zoom={formData.zoom}
                onLoad={(map) => {
                  mapRef.current = map;
                }}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                }}
              >
                <DrawingManager
                  onLoad={handleDrawingManagerLoad}
                  onPolygonComplete={handlePolygonComplete}
                  options={{
                    drawingControl: false,
                    polygonOptions: {
                      fillColor: 'transparent',
                      fillOpacity: 0,
                      strokeColor: '#000000',
                      strokeOpacity: 1,
                      strokeWeight: 3,
                    },
                  }}
                />
              </GoogleMap>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={saving || !formData.name}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'جاري الحفظ...' : 'إنشاء المشروع'}
          </button>
        </div>
      </form>
    </div>
  );
}