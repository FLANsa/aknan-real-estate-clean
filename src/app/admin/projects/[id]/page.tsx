'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GoogleMap, useJsApiLoader, Polygon, DrawingManager, InfoWindow } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LIBRARIES } from '@/lib/google-maps-config';
import { Project, Plot, PlotFormData, PLOT_STATUS_COLORS, PLOT_STATUS_LABELS } from '@/types/map';

export default function ProjectManagePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [showPlotForm, setShowPlotForm] = useState(false);
  const [plotFormData, setPlotFormData] = useState<PlotFormData>({
    projectId: projectId,
    plotNumber: '',
    manualArea: 0,
    price: 0,
    polygon: [],
    images: [],
    status: 'available',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'project-manage-map-loader',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: [...GOOGLE_MAPS_LIBRARIES],
  });

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}`);
      const data = await response.json();
      
      if (response.ok) {
        setProject(data.project);
        setPlots(data.plots || []);
      } else {
        alert('المشروع غير موجود');
        router.push('/admin/projects');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      alert('حدث خطأ أثناء جلب بيانات المشروع');
    } finally {
      setLoading(false);
    }
  };

  const handleDrawingManagerLoad = (drawingManager: google.maps.drawing.DrawingManager) => {
    setDrawingManager(drawingManager);
  };

  const handlePolygonComplete = (polygon: google.maps.Polygon) => {
    const path = polygon.getPath();
    const coordinates = [];
    
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coordinates.push({
        lat: point.lat(),
        lng: point.lng(),
      });
    }
    
    setPlotFormData(prev => ({
      ...prev,
      polygon: coordinates,
    }));
    
    setIsDrawing(false);
    setShowPlotForm(true);
    drawingManager?.setDrawingMode(null);
  };

  const startDrawing = () => {
    setIsDrawing(true);
    drawingManager?.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
  };

  const handlePlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/admin/plots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plotFormData),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Refresh plots data
        await fetchProjectData();
        setShowPlotForm(false);
        setPlotFormData({
          projectId: projectId,
          plotNumber: '',
          manualArea: 0,
          price: 0,
          polygon: [],
          images: [],
          status: 'available',
          notes: '',
        });
      } else {
        alert('حدث خطأ أثناء إنشاء القطعة');
      }
    } catch (error) {
      console.error('Error creating plot:', error);
      alert('حدث خطأ أثناء إنشاء القطعة');
    } finally {
      setSaving(false);
    }
  };

  const handlePlotClick = (plot: Plot) => {
    setSelectedPlot(plot);
  };

  const getPlotCenter = (polygon: any[]) => {
    if (polygon.length === 0) return null;
    
    let lat = 0, lng = 0;
    polygon.forEach(point => {
      lat += point.lat;
      lng += point.lng;
    });
    
    return {
      lat: lat / polygon.length,
      lng: lng / polygon.length,
    };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">المشروع غير موجود</h1>
          <button
            onClick={() => router.push('/admin/projects')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            العودة للمشاريع
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Project Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="text-gray-600 mt-2">{project.description}</p>
            )}
          </div>
          <button
            onClick={() => router.push('/admin/projects')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            العودة للمشاريع
          </button>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{project.plotsCount}</div>
            <div className="text-gray-600">إجمالي القطع</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{project.availablePlotsCount}</div>
            <div className="text-gray-600">القطع المتاحة</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">
              {project.plotsCount - project.availablePlotsCount}
            </div>
            <div className="text-gray-600">القطع المباعة</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">خريطة المشروع</h2>
              <button
                onClick={startDrawing}
                disabled={isDrawing}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isDrawing ? 'ارسم القطعة...' : 'إضافة قطعة'}
              </button>
            </div>

            <div className="h-96 rounded-lg overflow-hidden border">
              {isLoaded && (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={project.location}
                  zoom={project.zoom}
                  onLoad={(map) => {
                    mapRef.current = map;
                  }}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                  }}
                >
                  {/* Project Boundary */}
                  {project.boundary && project.boundary.length > 0 && (
                    <Polygon
                      paths={project.boundary}
                      options={{
                        fillColor: 'transparent',
                        fillOpacity: 0,
                        strokeColor: '#000000',
                        strokeOpacity: 1,
                        strokeWeight: 3,
                      }}
                    />
                  )}

                  {/* Plots */}
                  {plots.map((plot) => {
                    const center = getPlotCenter(plot.polygon);
                    if (!center) return null;

                    return (
                      <div key={plot.id}>
                        <Polygon
                          paths={plot.polygon}
                          options={{
                            fillColor: PLOT_STATUS_COLORS[plot.status],
                            fillOpacity: 0.3,
                            strokeColor: PLOT_STATUS_COLORS[plot.status],
                            strokeOpacity: 1,
                            strokeWeight: 2,
                          }}
                          onClick={() => handlePlotClick(plot)}
                        />
                      </div>
                    );
                  })}

                  {/* Drawing Manager */}
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

                  {/* InfoWindow */}
                  {selectedPlot && (
                    <InfoWindow
                      position={getPlotCenter(selectedPlot.polygon)}
                      onCloseClick={() => setSelectedPlot(null)}
                    >
                      <div className="p-2">
                        <h3 className="font-bold text-lg">{project.name}</h3>
                        <div className="space-y-1 text-sm">
                          <div><strong>رقم القطعة:</strong> {selectedPlot.plotNumber}</div>
                          <div><strong>المساحة:</strong> {selectedPlot.manualArea} م²</div>
                          <div><strong>السعر:</strong> {selectedPlot.price.toLocaleString()} ريال</div>
                          <div><strong>الحالة:</strong> {PLOT_STATUS_LABELS[selectedPlot.status]}</div>
                        </div>
                        {selectedPlot.images.length > 0 && (
                          <div className="mt-2">
                            <img 
                              src={selectedPlot.images[0]} 
                              alt="صورة القطعة"
                              className="w-20 h-20 object-cover rounded"
                            />
                          </div>
                        )}
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              )}
            </div>
          </div>
        </div>

        {/* Plot Form */}
        <div className="lg:col-span-1">
          {showPlotForm ? (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-4">بيانات القطعة الجديدة</h3>
              
              <form onSubmit={handlePlotSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم القطعة *
                  </label>
                  <input
                    type="text"
                    required
                    value={plotFormData.plotNumber}
                    onChange={(e) => setPlotFormData(prev => ({ ...prev, plotNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: قطعة 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المساحة (م²) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={plotFormData.manualArea}
                    onChange={(e) => setPlotFormData(prev => ({ ...prev, manualArea: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    السعر (ريال) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={plotFormData.price}
                    onChange={(e) => setPlotFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="500000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الحالة
                  </label>
                  <select
                    value={plotFormData.status}
                    onChange={(e) => setPlotFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="available">متاح</option>
                    <option value="sold">مباع</option>
                    <option value="reserved">محجوز</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ملاحظات
                  </label>
                  <textarea
                    value={plotFormData.notes}
                    onChange={(e) => setPlotFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="ملاحظات إضافية..."
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPlotForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={saving || plotFormData.polygon.length === 0}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'جاري الحفظ...' : 'حفظ القطعة'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-4">القطع الموجودة</h3>
              
              {plots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  لا توجد قطع بعد
                  <br />
                  <button
                    onClick={startDrawing}
                    className="mt-2 text-blue-600 hover:text-blue-700"
                  >
                    إضافة أول قطعة
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {plots.map((plot) => (
                    <div
                      key={plot.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handlePlotClick(plot)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">قطعة {plot.plotNumber}</div>
                          <div className="text-sm text-gray-600">
                            {plot.manualArea} م² - {plot.price.toLocaleString()} ريال
                          </div>
                        </div>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: PLOT_STATUS_COLORS[plot.status] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}