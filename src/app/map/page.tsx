'use client';

import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Property } from '@/types/property';
import { Plot } from '@/types/map';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Home, Building, Phone, MessageCircle } from 'lucide-react';
import GoogleMapsErrorHandler from '@/components/GoogleMapsErrorHandler';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// إعدادات الخريطة
const mapContainerStyle = {
  width: '100%',
  height: '70vh',
};

const defaultCenter = {
  lat: 24.7136, // الرياض
  lng: 46.6753,
};

const defaultZoom = 10;

// أيقونات مختلفة للعقارات والمشاريع
const getMarkerIcon = (type: 'property' | 'plot', status: string) => {
  const colors = {
    available: '#10B981', // أخضر
    sold: '#EF4444', // أحمر
    rented: '#F59E0B', // برتقالي
    'off-market': '#6B7280', // رمادي
  };
  
  const color = colors[status as keyof typeof colors] || '#10B981';
  
  return {
    path: type === 'property' 
      ? 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'
      : 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: 1.5,
  };
};

interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  type: 'property' | 'plot';
  data: Property | Plot;
  title: string;
}

export default function PropertiesMapPage() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'interactive-map-loader',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['drawing', 'geometry', 'places'],
  });

  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(defaultZoom);

  // جلب العقارات
  const fetchProperties = useCallback(async () => {
    try {
      const q = query(
        collection(db, 'properties'),
        where('status', '==', 'available')
      );
      
      const querySnapshot = await getDocs(q);
      const properties: Property[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        properties.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Property);
      });
      
      return properties;
    } catch (err) {
      console.error('Error fetching properties:', err);
      return [];
    }
  }, []);

  // جلب القطع من مجموعة plots المنفصلة
  const fetchPlots = useCallback(async () => {
    try {
      const q = query(collection(db, 'plots'));
      const querySnapshot = await getDocs(q);
      const plots: Plot[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.polygon && data.polygon.length > 0) {
          // حساب مركز القطعة من الـ polygon
          const centerLat = data.polygon.reduce((sum: number, point: any) => sum + point.lat, 0) / data.polygon.length;
          const centerLng = data.polygon.reduce((sum: number, point: any) => sum + point.lng, 0) / data.polygon.length;
          
          plots.push({
            id: doc.id,
            projectId: data.projectId,
            number: data.number,
            status: data.status,
            price: data.price,
            currency: data.currency,
            polygon: data.polygon,
            center: { lat: centerLat, lng: centerLng },
            dimensions: data.dimensions,
            notes: data.notes,
            propertyId: data.propertyId,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        }
      });
      
      return plots;
    } catch (err) {
      console.error('Error fetching plots:', err);
      return [];
    }
  }, []);

  // تحميل البيانات
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [properties, plots] = await Promise.all([
          fetchProperties(),
          fetchPlots(),
        ]);
        
        const mapMarkers: MapMarker[] = [];
        
        // إضافة العقارات
        properties.forEach((property) => {
          if (property.location?.lat && property.location?.lng) {
            mapMarkers.push({
              id: property.id,
              position: { lat: property.location.lat, lng: property.location.lng },
              type: 'property',
              data: property,
              title: property.titleAr,
            });
          }
        });
        
        // إضافة القطع
        plots.forEach((plot) => {
          if (plot.center?.lat && plot.center?.lng) {
            mapMarkers.push({
              id: plot.id,
              position: { lat: plot.center.lat, lng: plot.center.lng },
              type: 'plot',
              data: plot,
              title: `القطعة ${plot.number}`,
            });
          }
        });
        
        setMarkers(mapMarkers);
        
        // تحديث مركز الخريطة إذا كانت هناك بيانات
        if (mapMarkers.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          mapMarkers.forEach(marker => {
            bounds.extend(marker.position);
          });
          
          // يمكن إضافة fitBounds هنا إذا أردت
        }
        
      } catch (err) {
        console.error('Error loading map data:', err);
        setError('فشل في تحميل بيانات الخريطة');
      } finally {
        setLoading(false);
      }
    };
    
    if (isLoaded) {
      loadData();
    }
  }, [isLoaded, fetchProperties, fetchPlots]);

  // معالجة النقر على الماركر
  const handleMarkerClick = useCallback((marker: MapMarker) => {
    setSelectedMarker(marker);
  }, []);

  // إغلاق نافذة المعلومات
  const handleInfoWindowClose = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  // عرض تفاصيل العقار
  const renderPropertyInfo = (property: Property) => (
    <div className="p-4 max-w-sm">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-lg text-right">{property.titleAr}</h3>
          <Badge variant={property.featured ? "default" : "secondary"}>
            {property.featured ? "مميز" : property.status}
          </Badge>
        </div>
        
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{property.city}</span>
          </div>
          
          {property.areaM2 && (
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>{property.areaM2} م²</span>
            </div>
          )}
          
          {property.bedrooms && (
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>{property.bedrooms} غرف</span>
            </div>
          )}
        </div>
        
        <div className="text-lg font-bold text-primary">
          {property.price.toLocaleString()} {property.currency}
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" asChild className="flex-1">
            <a href={`/properties/${property.slug}`}>عرض التفاصيل</a>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}?text=أريد الاستفسار عن العقار: ${property.titleAr}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );

  // عرض تفاصيل القطعة
  const renderPlotInfo = (plot: Plot) => (
    <div className="p-4 max-w-sm">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-lg text-right">القطعة {plot.number}</h3>
          <Badge variant={plot.status === 'available' ? "default" : "secondary"}>
            {plot.status}
          </Badge>
        </div>
        
        <div className="text-sm text-muted-foreground space-y-1">
          {plot.area && (
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>{plot.area} م²</span>
            </div>
          )}
          
          {plot.price && (
            <div className="text-lg font-bold text-primary">
              {plot.price.toLocaleString()} {plot.currency}
            </div>
          )}
          
          {plot.notes && (
            <p className="text-sm">{plot.notes}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}?text=أريد الاستفسار عن القطعة: ${plot.number}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <GoogleMapsErrorHandler error={loadError} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">جاري تحميل الخريطة العقارية...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Header Section */}
        <section className="bg-primary text-primary-foreground py-12">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              خريطتنا العقارية
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
              اكتشف جميع العقارات والمشاريع المتاحة لدينا على الخريطة التفاعلية
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>متاح</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>مباع</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>مؤجر</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span>غير متاح</span>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-8">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  خريطة العقارات والمشاريع
                </CardTitle>
                <p className="text-center text-muted-foreground">
                  اضغط على أي علامة لعرض التفاصيل
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={mapZoom}
                    options={{
                      disableDefaultUI: false,
                      zoomControl: true,
                      streetViewControl: false,
                      mapTypeControl: true,
                      fullscreenControl: true,
                    }}
                  >
                    {markers.map((marker) => (
                      <Marker
                        key={marker.id}
                        position={marker.position}
                        title={marker.title}
                        icon={getMarkerIcon(marker.type, marker.data.status)}
                        onClick={() => handleMarkerClick(marker)}
                      />
                    ))}
                    
                    {selectedMarker && (
                      <InfoWindow
                        position={selectedMarker.position}
                        onCloseClick={handleInfoWindowClose}
                      >
                        {selectedMarker.type === 'property' 
                          ? renderPropertyInfo(selectedMarker.data as Property)
                          : renderPlotInfo(selectedMarker.data as Plot)
                        }
                      </InfoWindow>
                    )}
                  </GoogleMap>
                  
                  {/* Map Stats */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                    <div className="text-sm space-y-1">
                      <div className="font-semibold">إحصائيات الخريطة</div>
                      <div>العقارات: {markers.filter(m => m.type === 'property').length}</div>
                      <div>القطع: {markers.filter(m => m.type === 'plot').length}</div>
                      <div>المجموع: {markers.length}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-muted/50">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              لم تجد ما تبحث عنه؟
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              تواصل معنا وسنساعدك في العثور على العقار المثالي
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-4">
                <a href="/properties">تصفح جميع العقارات</a>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4">
                <a href="/contact">تواصل معنا</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
