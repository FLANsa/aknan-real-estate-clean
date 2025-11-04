'use client';
import { useEffect, useRef, useState, use } from 'react';
import { doc, getDoc, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { ensureClosed, polygonAreaSqm, toLatLngArray, isValidPolygon, checkPolygonOverlap, isPolygonInsideBoundary } from '@/lib/geo-utils';
import { STATUS_COLORS, STATUS_LABELS, MAP_CONSTRAINTS } from '@/lib/google-maps-config';
import type { Plot, Project, LatLng, PlotStatus } from '@/types/project';
import GMap from '@/components/GMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Save, X } from 'lucide-react';
import { logger } from '@/lib/performance';

export default function ProjectAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<(Project & { id: string }) | null>(null);
  const [plots, setPlots] = useState<(Plot & { id: string })[]>([]);
  const [draftPath, setDraftPath] = useState<LatLng[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states for new plot
  const [plotNumber, setPlotNumber] = useState('');
  const [plotPrice, setPlotPrice] = useState<number | ''>('');
  const [plotStatus, setPlotStatus] = useState<PlotStatus>('available');
  const [plotNotes, setPlotNotes] = useState('');
  const [manualArea, setManualArea] = useState<number | ''>('');

  // Map refs
  const boundaryPoly = useRef<google.maps.Polygon | null>(null);
  const plotPolys = useRef<Record<string, google.maps.Polygon>>({});
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  useEffect(() => {
    loadData();
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

  const paintPlot = (map: google.maps.Map, plot: Plot, key: string) => {
    const poly = new google.maps.Polygon({
      paths: plot.polygonPath,
      strokeColor: STATUS_COLORS[plot.status as keyof typeof STATUS_COLORS],
      strokeWeight: 2,
      fillColor: STATUS_COLORS[plot.status as keyof typeof STATUS_COLORS],
      fillOpacity: 0.35,
    });
    poly.setMap(map);
    plotPolys.current[key] = poly;

    poly.addListener('click', (e: google.maps.MapMouseEvent) => {
      const info = new google.maps.InfoWindow({
        content: `
          <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937;">قطعة رقم: ${plot.number}</h3>
            ${plot.area ? `<p style="margin: 4px 0;"><strong>المساحة:</strong> ${Math.round(plot.area)} م²</p>` : ''}
            ${plot.price ? `<p style="margin: 4px 0;"><strong>السعر:</strong> ${plot.price.toLocaleString()} ر.س</p>` : ''}
            <p style="margin: 4px 0;"><strong>الحالة:</strong> ${STATUS_LABELS[plot.status as keyof typeof STATUS_LABELS]}</p>
            ${plot.notes ? `<p style="margin: 4px 0;"><strong>ملاحظات:</strong> ${plot.notes}</p>` : ''}
          </div>
        `
      });
      info.setPosition(e.latLng!);
      info.open({ map, anchor: poly });
    });
  };

  const onMapLoad = (map: google.maps.Map) => {
    if (!project) return;

    // حدود المشروع (أسود)
    if (project.boundaryPath) {
      boundaryPoly.current = new google.maps.Polygon({
        paths: project.boundaryPath,
        strokeColor: '#000',
        strokeWeight: 2,
        fillColor: '#000',
        fillOpacity: 0.05,
        clickable: false,
      });
      boundaryPoly.current.setMap(map);
      map.setCenter(project.center);
    }

    // رسم القطع الموجودة
    plots.forEach(p => paintPlot(map, p, p.id));

    // إعداد DrawingManager لرسم قطعة جديدة
    const drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT,
        drawingModes: [google.maps.drawing.OverlayType.POLYGON],
      },
      polygonOptions: {
        fillColor: '#26A65B55',
        strokeColor: '#26A65B',
        strokeWeight: 2,
        editable: true,
      },
    });
    drawingManager.setMap(map);
    drawingManagerRef.current = drawingManager;

    google.maps.event.addListener(drawingManager, 'overlaycomplete', (e: any) => {
      if (e.type !== google.maps.drawing.OverlayType.POLYGON) return;
      
      const pts = ensureClosed(toLatLngArray(e.overlay.getPath()));
      
      // التحقق من صحة المضلع
      if (!isValidPolygon(pts)) {
        setError('القطعة يجب أن تحتوي على 3 نقاط على الأقل');
        e.overlay.setMap(null); // إزالة المضلع من الخريطة
        return;
      }

      // التحقق من أن القطعة داخل حدود المشروع
      if (project.boundaryPath && project.boundaryPath.length >= 3) {
        const boundaryCheck = isPolygonInsideBoundary(pts, project.boundaryPath);
        
        if (!boundaryCheck.inside) {
          const errorMsg = boundaryCheck.outsidePoints && boundaryCheck.outsidePoints.length > 0
            ? `القطعة خارج حدود المشروع. ${boundaryCheck.outsidePoints.length} نقطة خارج الحدود`
            : 'القطعة خارج حدود المشروع. يجب أن تكون جميع النقاط داخل حدود المشروع';
          setError(errorMsg);
          e.overlay.setMap(null); // إزالة المضلع من الخريطة
          return;
        }
      }

      // كشف التداخل مع القطع الموجودة
      const existingPaths = plots.map(p => p.polygonPath);
      const overlapCheck = checkPolygonOverlap(pts, existingPaths);
      
      if (overlapCheck.overlaps) {
        setError(`القطعة الجديدة تتقاطع مع ${overlapCheck.overlappingPlot}`);
        e.overlay.setMap(null); // إزالة المضلع من الخريطة
        return;
      }

      setDraftPath(pts);
      drawingManager.setDrawingMode(null);
      setIsDrawingMode(false);
      setError(null);
    });
  };

  const savePlot = async () => {
    if (!draftPath || !isValidPolygon(draftPath)) {
      setError('ارسم قطعة صالحة أولاً');
      return;
    }

    if (!plotNumber.trim()) {
      setError('أدخل رقم القطعة');
      return;
    }

    // التحقق من أن القطعة داخل حدود المشروع (فحص إضافي قبل الحفظ)
    if (project && project.boundaryPath && project.boundaryPath.length >= 3) {
      const boundaryCheck = isPolygonInsideBoundary(draftPath, project.boundaryPath);
      
      if (!boundaryCheck.inside) {
        setError('القطعة خارج حدود المشروع. يجب أن تكون جميع النقاط داخل حدود المشروع');
        return;
      }
    }

    // التحقق من عدم تكرار رقم القطعة
    const existingPlot = plots.find(p => p.number === plotNumber.trim());
    if (existingPlot) {
      setError('رقم القطعة موجود مسبقاً');
      return;
    }

    // التحقق من عدم التداخل مع القطع الموجودة (فحص إضافي)
    const existingPaths = plots.map(p => p.polygonPath);
    const overlapCheck = checkPolygonOverlap(draftPath, existingPaths);
    
    if (overlapCheck.overlaps) {
      setError(`القطعة تتقاطع مع ${overlapCheck.overlappingPlot}`);
      return;
    }

    if (plotPrice !== '' && plotPrice < 0) {
      setError('السعر يجب أن يكون أكبر من أو يساوي صفر');
      return;
    }

    if (manualArea !== '' && manualArea <= 0) {
      setError('المساحة يجب أن تكون أكبر من صفر');
      return;
    }

    if (plotNotes.length > MAP_CONSTRAINTS.maxNotesLength) {
      setError(`الملاحظات يجب أن تكون أقل من ${MAP_CONSTRAINTS.maxNotesLength} حرف`);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const area = manualArea || polygonAreaSqm(draftPath);
      const plot: Omit<Plot, 'id'> = {
        number: plotNumber.trim(),
        ...(plotPrice !== '' && { price: plotPrice }),
        status: plotStatus,
        ...(plotNotes.trim() && { notes: plotNotes.trim() }),
        polygonPath: draftPath,
        area,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'projects', id, 'plots'), plot);
      
      // إعادة تحميل البيانات
      await loadData();
      
      // تنظيف النموذج
      setDraftPath(null);
      setPlotNumber('');
      setPlotPrice('');
      setPlotStatus('available');
      setPlotNotes('');
      setManualArea('');
      setIsDrawingMode(false);

    } catch (err) {
      logger.error('Error saving plot:', err);
      setError('حدث خطأ أثناء حفظ القطعة');
    } finally {
      setSaving(false);
    }
  };

  const cancelDraft = () => {
    setDraftPath(null);
    setPlotNumber('');
    setPlotPrice('');
    setPlotStatus('available');
    setPlotNotes('');
    setManualArea('');
    setIsDrawingMode(false);
    setError(null);
    // إعادة تعيين وضع الرسم
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setDrawingMode(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded w-64" />
        <div className="h-96 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">المشروع غير موجود</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة مشروع: {project.name}</h1>
        <Badge variant="outline">
          {plots.length} قطعة
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>خريطة المشروع</span>
            <Badge variant="outline" className="text-sm">
              {!draftPath ? 'جاهز لإضافة قطعة جديدة' : 'قطعة جديدة قيد الإدخال'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                كيفية إضافة قطعة جديدة:
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li>انقر على زر "ابدأ إضافة قطعة جديدة" أدناه أو على أيقونة الرسم في أعلى يسار الخريطة (أيقونة المضلع 📐)</li>
                <li>ارسم القطعة على الخريطة داخل حدود المشروع السوداء</li>
                <li>بعد الانتهاء من الرسم، سيظهر نموذج أدناه لملء بيانات القطعة</li>
                <li>املأ البيانات المطلوبة واضغط على "حفظ القطعة"</li>
              </ol>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span><span className="font-semibold">الحدود السوداء:</span> حدود المشروع</span>
              <span>•</span>
              <span><span className="font-semibold">القطع الملونة:</span> حسب الحالة</span>
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                متاحة
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                محجوزة
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                مباعة
              </span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded p-2">
              ⚠️ <span className="font-semibold">مهم:</span> يجب أن تكون جميع القطع المرسومة داخل حدود المشروع (الحدود السوداء)
            </p>
            {!draftPath && (
              <div className="flex items-center gap-4 pt-2">
                <Button
                  onClick={() => {
                    if (drawingManagerRef.current) {
                      drawingManagerRef.current.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
                      setIsDrawingMode(true);
                    }
                  }}
                  className="flex items-center gap-2"
                  size="lg"
                  disabled={isDrawingMode}
                >
                  <Plus className="h-5 w-5" />
                  {isDrawingMode ? 'وضع الرسم نشط - ارسم على الخريطة' : 'ابدأ إضافة قطعة جديدة'}
                </Button>
                {isDrawingMode && (
                  <Button
                    onClick={() => {
                      if (drawingManagerRef.current) {
                        drawingManagerRef.current.setDrawingMode(null);
                        setIsDrawingMode(false);
                      }
                    }}
                    variant="outline"
                    size="lg"
                  >
                    إلغاء الرسم
                  </Button>
                )}
              </div>
            )}
          </div>
                 <div className="relative">
          <GMap center={project.center} onMapLoad={onMapLoad} height="600px" mapType="satellite" />
          {!draftPath && isDrawingMode && (
            <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-10 flex items-center gap-2">
              <span className="animate-pulse">●</span>
              <span className="font-semibold">وضع الرسم نشط - انقر على الخريطة لبدء الرسم</span>
            </div>
          )}
        </div>
        </CardContent>
      </Card>

      {draftPath && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              بيانات القطعة الجديدة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plotNumber">رقم القطعة *</Label>
                <Input
                  id="plotNumber"
                  placeholder="مثال: 1، أ، ب"
                  value={plotNumber}
                  onChange={(e) => setPlotNumber(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="plotPrice">السعر (ر.س)</Label>
                <Input
                  id="plotPrice"
                  type="number"
                  placeholder="مثال: 500000"
                  value={plotPrice}
                  onChange={(e) => setPlotPrice(Number(e.target.value) || '')}
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="plotStatus">الحالة</Label>
                <Select value={plotStatus} onValueChange={(value: PlotStatus) => setPlotStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">متاحة</SelectItem>
                    <SelectItem value="hold">محجوزة</SelectItem>
                    <SelectItem value="sold">مباعة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="manualArea">المساحة (م²)</Label>
                <Input
                  id="manualArea"
                  type="number"
                  placeholder={`محسوب تلقائياً: ${Math.round(polygonAreaSqm(draftPath))}`}
                  value={manualArea}
                  onChange={(e) => setManualArea(Number(e.target.value) || '')}
                  disabled={saving}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="plotNotes">ملاحظات</Label>
              <Textarea
                id="plotNotes"
                placeholder="ملاحظات إضافية..."
                value={plotNotes}
                onChange={(e) => setPlotNotes(e.target.value)}
                rows={3}
                disabled={saving}
                maxLength={MAP_CONSTRAINTS.maxNotesLength}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {plotNotes.length}/{MAP_CONSTRAINTS.maxNotesLength} حرف
              </p>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={savePlot} 
                disabled={saving || !plotNumber.trim()}
                size="lg"
              >
                <Save className="h-4 w-4 ml-2" />
                {saving ? 'جاري الحفظ...' : 'حفظ القطعة'}
              </Button>
              <Button 
                variant="outline" 
                onClick={cancelDraft}
                size="lg"
                disabled={saving}
              >
                <X className="h-4 w-4 ml-2" />
                إلغاء
              </Button>
          </div>
        </CardContent>
      </Card>
      )}

      {plots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>القطع الموجودة ({plots.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plots.map((plot) => (
                <div key={plot.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">قطعة {plot.number}</h3>
                    <Badge 
                      style={{ 
                        backgroundColor: STATUS_COLORS[plot.status as keyof typeof STATUS_COLORS],
                        color: 'white'
                      }}
                    >
                      {STATUS_LABELS[plot.status as keyof typeof STATUS_LABELS]}
                    </Badge>
                  </div>
                  {plot.area && (
                    <p className="text-sm text-muted-foreground">
                      المساحة: {Math.round(plot.area)} م²
                    </p>
                  )}
                  {plot.price && (
                    <p className="text-sm text-muted-foreground">
                      السعر: {plot.price.toLocaleString()} ر.س
                    </p>
                  )}
                  {plot.notes && (
                    <p className="text-sm text-muted-foreground">
                      {plot.notes.substring(0, 50)}{plot.notes.length > 50 ? '...' : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}