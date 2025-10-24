'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { GoogleMap, useJsApiLoader, Polygon, InfoWindow } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_LIBRARIES } from '@/lib/google-maps-config';
import { Project, Plot, PLOT_STATUS_COLORS, PLOT_STATUS_LABELS } from '@/types/map';
import { Property } from '@/types/property';

export default function ProjectClientPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'project-client-map-loader',
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
      const response = await fetch(`/api/projects?id=${projectId}`);
      const data = await response.json();
      
      if (response.ok) {
        setProject(data.project);
        
        // Fetch plots for this project
        const plotsResponse = await fetch(`/api/admin/projects/${projectId}`);
        const plotsData = await plotsResponse.json();
        setPlots(plotsData.plots || []);
        
        // Fetch properties for this project
        const propertiesResponse = await fetch(`/api/properties?projectId=${projectId}`);
        const propertiesData = await propertiesResponse.json();
        setProperties(propertiesData.properties || []);
      } else {
        console.error('Project not found');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
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

  const getPlotProperties = (plotId: string) => {
    return properties.filter(prop => prop.plotId === plotId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200"></div>
          <div className="p-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">المشروع غير موجود</h1>
          <Link
            href="/properties"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            العودة للعقارات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Project Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold mb-4">{project.name}</h1>
            {project.description && (
              <p className="text-xl text-blue-100 mb-6">{project.description}</p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">{project.plotsCount}</div>
                <div className="text-blue-100">إجمالي القطع</div>
          </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold text-green-300">{project.availablePlotsCount}</div>
                <div className="text-blue-100">القطع المتاحة</div>
          </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold text-red-300">
                  {project.plotsCount - project.availablePlotsCount}
                </div>
                <div className="text-blue-100">القطع المباعة</div>
              </div>
                        </div>
                          </div>
                          </div>
                          </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">خريطة المشروع</h2>
              
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
                            onClick={() => setSelectedPlot(plot)}
                          />
                        </div>
                      );
                    })}

                    {/* InfoWindow */}
                    {selectedPlot && getPlotCenter(selectedPlot.polygon) && (
                      <InfoWindow
                        position={getPlotCenter(selectedPlot.polygon)!}
                        onCloseClick={() => setSelectedPlot(null)}
                      >
                        <div className="p-3 max-w-xs">
                          <h3 className="font-bold text-lg mb-2">{project.name}</h3>
                          <div className="space-y-1 text-sm">
                            <div><strong>رقم القطعة:</strong> {selectedPlot.plotNumber}</div>
                            <div><strong>المساحة:</strong> {selectedPlot.manualArea} م²</div>
                            <div><strong>السعر:</strong> {selectedPlot.price.toLocaleString()} ريال</div>
                            <div><strong>الحالة:</strong> {PLOT_STATUS_LABELS[selectedPlot.status]}</div>
                          </div>
                          
                          {selectedPlot.images.length > 0 && (
                            <div className="mt-3">
                              <img 
                                src={selectedPlot.images[0]} 
                                alt="صورة القطعة"
                                className="w-full h-32 object-cover rounded"
                              />
                          </div>
                        )}

                          {getPlotProperties(selectedPlot.id).length > 0 && (
                            <div className="mt-3">
                              <Link
                                href={`/properties/${getPlotProperties(selectedPlot.id)[0].slug}`}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                              >
                                عرض التفاصيل
                              </Link>
                            </div>
                          )}
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                )}
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: PLOT_STATUS_COLORS.available }}></div>
                  <span className="text-sm">متاح</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: PLOT_STATUS_COLORS.sold }}></div>
                  <span className="text-sm">مباع</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: PLOT_STATUS_COLORS.reserved }}></div>
                  <span className="text-sm">محجوز</span>
                    </div>
                  </div>
                    </div>
                  </div>

          {/* Properties List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">العقارات المتاحة</h2>
              
              {properties.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  لا توجد عقارات متاحة حالياً
                </div>
              ) : (
                <div className="space-y-4">
                  {properties.map((property) => (
                    <Link
                      key={property.id}
                      href={`/properties/${property.slug}`}
                      className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex gap-4">
                        {property.images.length > 0 && (
                          <img
                            src={property.images[0]}
                            alt={property.titleAr}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{property.titleAr}</h3>
                          <div className="text-sm text-gray-600 mb-2">
                            {property.city} {property.district && `- ${property.district}`}
                          </div>
                          <div className="text-lg font-bold text-blue-600">
                            {property.price.toLocaleString()} {property.currency}
                          </div>
                          {property.plotNumber && (
                            <div className="text-xs text-gray-500 mt-1">
                              قطعة رقم: {property.plotNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                  )}
                </div>
              </div>
        </div>
      </div>
    </div>
  );
}