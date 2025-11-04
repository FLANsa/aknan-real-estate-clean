'use client';
import { useEffect, useRef, useState, use } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Plot, Project } from '@/types/project';
import GMap from '@/components/GMap';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/google-maps-config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Square, DollarSign, Eye } from 'lucide-react';
import { logger } from '@/lib/performance';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ProjectPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<(Project & { id: string }) | null>(null);
  const [plots, setPlots] = useState<(Plot & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  
  // Map refs for cleanup
  const boundaryPoly = useRef<google.maps.Polygon | null>(null);
  const plotPolys = useRef<google.maps.Polygon[]>([]);

  useEffect(() => {
    loadData();
    setIsMapReady(false); // إعادة تعيين حالة الخريطة عند تغيير المشروع
    
    // Cleanup function
    return () => {
      // Clean up polygons to prevent memory leaks
      if (boundaryPoly.current) {
        boundaryPoly.current.setMap(null);
      }
      plotPolys.current.forEach(poly => {
        poly.setMap(null);
      });
      plotPolys.current = [];
    };
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [projectSnap, plotsSnap] = await Promise.all([
        getDoc(doc(db, 'projects', id)),
        getDocs(collection(db, 'projects', id, 'plots'))
      ]);

      if (!projectSnap.exists()) {
        setError('المشروع غير موجود');
        return;
      }

      const projectData = { id: projectSnap.id, ...projectSnap.data() } as Project & { id: string };
      setProject(projectData);

      const plotsData = plotsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Plot & { id: string }));
      setPlots(plotsData);

      } catch (err) {
        logger.error('Error loading data:', err);
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // مرجع للخريطة
  const mapRef = useRef<google.maps.Map | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // رسم الخريطة عند تحميل المشروع والقطع
  useEffect(() => {
      if (!mapRef.current || !project || !isMapReady) {
        logger.log('Map render waiting:', { mapReady: !!mapRef.current, project: !!project, isMapReady });
        return;
      }

    const map = mapRef.current;

    // Clean up previous polygons
    if (boundaryPoly.current) {
      boundaryPoly.current.setMap(null);
    }
    plotPolys.current.forEach(poly => {
      poly.setMap(null);
    });
    plotPolys.current = [];

    // Close any open InfoWindow
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    // حدود المشروع (أسود)
        if (project.boundaryPath && Array.isArray(project.boundaryPath) && project.boundaryPath.length > 0) {
          logger.log('Drawing project boundary with', project.boundaryPath.length, 'points');
      boundaryPoly.current = new google.maps.Polygon({
        paths: project.boundaryPath,
        strokeColor: '#000',
        strokeWeight: 3,
        fillColor: '#000',
        fillOpacity: 0.1,
        clickable: true,
      });
      boundaryPoly.current.setMap(map);

      // إضافة InfoWindow عند النقر على حدود المشروع
      boundaryPoly.current.addListener('click', (e: google.maps.MapMouseEvent) => {
        const html = `
          <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 300px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: bold;">${project.name}</h3>
            ${project.description ? `<p style="margin: 4px 0; font-size: 14px; color: #4b5563;">${project.description}</p>` : ''}
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #6b7280;">
              عدد القطع: ${plots.length}
            </p>
          </div>
        `;
        
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
        
        infoWindowRef.current = new google.maps.InfoWindow({ 
          content: html,
          maxWidth: 320
        });
        
        if (e.latLng) {
          infoWindowRef.current.setPosition(e.latLng);
          infoWindowRef.current.open(map);
        }
      });
    }

    if (project.center) {
      map.setCenter(project.center);
      // استخدام zoom الافتراضي أو 15
      const defaultZoom = 15;
      map.setZoom(defaultZoom);
    }

    // رسم القطع
        logger.log(`Starting to render ${plots.length} plots`);
        plots.forEach((plot) => {
          if (!plot.polygonPath || !Array.isArray(plot.polygonPath) || plot.polygonPath.length === 0) {
            logger.warn(`Plot ${plot.number} has invalid polygonPath:`, plot.polygonPath);
            return;
          }
          
          logger.log(`Rendering plot ${plot.number} with status ${plot.status}`);

      const poly = new google.maps.Polygon({
        paths: plot.polygonPath,
        strokeColor: STATUS_COLORS[plot.status] || STATUS_COLORS.available,
        strokeWeight: 2,
        fillColor: STATUS_COLORS[plot.status] || STATUS_COLORS.available,
        fillOpacity: 0.4,
        clickable: true,
      });
      poly.setMap(map);
      plotPolys.current.push(poly);

      // إضافة InfoWindow عند النقر
      poly.addListener('click', (e: google.maps.MapMouseEvent) => {
        // إغلاق أي InfoWindow مفتوح سابقاً
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }

        const images = plot.images?.slice(0, 3).map(src => 
          `<div style="width:80px;height:60px;border-radius:6px;margin:2px;background-image:url('${src}');background-size:cover;background-position:center"></div>`
        ).join('') ?? '';
        
        const html = `
          <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 300px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: bold;">قطعة رقم: ${plot.number}</h3>
            ${plot.area ? `<p style="margin: 4px 0; font-size: 14px;"><strong>المساحة:</strong> ${Math.round(plot.area)} م²</p>` : ''}
            ${plot.price ? `<p style="margin: 4px 0; font-size: 14px;"><strong>السعر:</strong> ${plot.price.toLocaleString()} ر.س</p>` : ''}
            <p style="margin: 4px 0; font-size: 14px;"><strong>الحالة:</strong> ${STATUS_LABELS[plot.status] || plot.status}</p>
            ${plot.notes ? `<p style="margin: 4px 0; font-size: 14px;"><strong>ملاحظات:</strong> ${plot.notes}</p>` : ''}
            ${images ? `<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px;">${images}</div>` : ''}
          </div>
        `;
        
        infoWindowRef.current = new google.maps.InfoWindow({ 
          content: html,
          maxWidth: 320
        });
        
        if (e.latLng) {
          infoWindowRef.current.setPosition(e.latLng);
          infoWindowRef.current.open(map);
        }
      });

      // تغيير cursor عند التمرير
      poly.addListener('mouseover', () => {
        map.getDiv().style.cursor = 'pointer';
      });
      
      poly.addListener('mouseout', () => {
        map.getDiv().style.cursor = '';
      });
    });

    logger.log(`Rendered ${plotPolys.current.length} plots on map`);
  }, [project, plots, isMapReady]);

  const onMapLoad = (map: google.maps.Map) => {
    logger.log('Map loaded, setting mapRef');
    mapRef.current = map;
    setIsMapReady(true);
    
    // إذا كانت البيانات جاهزة، رسم العناصر مباشرة
    if (project && plots.length >= 0) {
      logger.log('Data already loaded, will render in useEffect');
    }
  };

  // حساب الإحصائيات
  const stats = plots.reduce((acc, plot) => {
    acc.total++;
    if (plot.status === 'available') acc.available++;
    else if (plot.status === 'hold') acc.hold++;
    else if (plot.status === 'sold') acc.sold++;
    return acc;
  }, { total: 0, available: 0, hold: 0, sold: 0 });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-32">
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
              <div className="h-8 bg-muted animate-pulse rounded w-64" />
              <div className="h-96 bg-muted animate-pulse rounded-xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-32">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-semibold mb-4">المشروع غير موجود</h1>
              <p className="text-muted-foreground">
                يبدو أن المشروع الذي تبحث عنه غير متوفر
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32">
        <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Project Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {project.description}
              </p>
            )}
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                تاريخ الإنشاء: {project.createdAt?.toDate?.()?.toLocaleDateString('ar-SA') ?? 'غير محدد'}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">إجمالي القطع</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold" style={{ color: STATUS_COLORS.available }}>
                  {stats.available}
                </div>
                <div className="text-sm text-muted-foreground">متاحة</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold" style={{ color: STATUS_COLORS.hold }}>
                  {stats.hold}
                </div>
                <div className="text-sm text-muted-foreground">محجوزة</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold" style={{ color: STATUS_COLORS.sold }}>
                  {stats.sold}
                </div>
                <div className="text-sm text-muted-foreground">مباعة</div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Map */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                خريطة المشروع التفاعلية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                انقر على أي قطعة لعرض التفاصيل. الحدود السوداء: حدود المشروع | القطع الملونة: حسب الحالة
              </p>
              <GMap center={project.center} onMapLoad={onMapLoad} height="600px" />
            </CardContent>
          </Card>

          {/* Available Plots */}
          {stats.available > 0 && (
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  القطع المتاحة ({stats.available})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plots
                    .filter(plot => plot.status === 'available')
                    .map((plot) => (
                      <div key={plot.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">قطعة {plot.number}</h3>
                          <Badge 
                            style={{ 
                              backgroundColor: STATUS_COLORS[plot.status],
                              color: 'white'
                            }}
                          >
                            {STATUS_LABELS[plot.status]}
                          </Badge>
                        </div>
                        {plot.area && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Square className="h-4 w-4 ml-2" />
                            {Math.round(plot.area)} م²
                          </div>
                        )}
                        {plot.price && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <DollarSign className="h-4 w-4 ml-2" />
                            {plot.price.toLocaleString()} ر.س
                          </div>
                        )}
                        {plot.notes && (
                          <p className="text-sm text-muted-foreground">
                            {plot.notes.substring(0, 80)}{plot.notes.length > 80 ? '...' : ''}
                          </p>
                          )}
                        </div>
                  ))}
                </div>
            </CardContent>
          </Card>
                  )}
                </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}