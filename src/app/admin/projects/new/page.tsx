'use client';
import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { toLatLngArray, ensureClosed, isValidPolygon } from '@/lib/geo-utils';
import { MAP_CONFIG } from '@/lib/google-maps-config';
import type { LatLng, Project } from '@/types/project';
import GMap from '@/components/GMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { logger } from '@/lib/performance';

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    const drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [google.maps.drawing.OverlayType.POLYGON],
      },
      polygonOptions: {
        fillColor: '#000',
        fillOpacity: 0.05,
        strokeColor: '#000',
        strokeWeight: 2,
        editable: true,
        draggable: true,
      },
    });
    drawingManager.setMap(map);
    drawingManagerRef.current = drawingManager;

    // فلترة overlaycomplete للـ POLYGON فقط لمنع الأخطاء
    google.maps.event.addListener(drawingManager, 'overlaycomplete', (e: any) => {
      if (e.type === google.maps.drawing.OverlayType.POLYGON) {
        if (polygonRef.current) {
          polygonRef.current.setMap(null);
        }
        polygonRef.current = e.overlay as google.maps.Polygon;
        drawingManager.setDrawingMode(null);
        setError(null); // Clear any previous errors
      }
      // تجاهل MARKER و POLYLINE لمنع الأخطاء
    });

    // تنظيف الذاكرة عند إغلاق الصفحة
    return () => {
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
      }
      if (drawingManagerRef.current) {
        drawingManagerRef.current.setMap(null);
      }
    };
  }, []);

  const onSave = async () => {
    // التحقق من الحقول المطلوبة
    if (!name.trim()) {
      setError('الرجاء إدخال اسم المشروع');
      return;
    }
    
    if (!polygonRef.current) {
      setError('الرجاء رسم حدود المشروع على الخريطة');
      return;
    }

    try {
      const path = toLatLngArray(polygonRef.current.getPath());
      
      // التحقق من صحة المضلع
      if (!isValidPolygon(path)) {
        setError('حدود المشروع يجب أن تحتوي على 3 نقاط على الأقل');
        return;
      }

      setSaving(true);
      setError(null);

      const closed: LatLng[] = ensureClosed(path);
      const cx = closed.reduce((a, c) => a + c.lng, 0) / closed.length;
      const cy = closed.reduce((a, c) => a + c.lat, 0) / closed.length;

      const projectData: Omit<Project, 'id'> = {
        name: name.trim(),
        ...(description.trim() && { description: description.trim() }),
        boundaryPath: closed,
        center: { lat: cy, lng: cx },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const ref = await addDoc(collection(db, 'projects'), projectData);
      router.push(`/admin/projects/${ref.id}`);
    } catch (err) {
      logger.error('Error saving project:', err);
      setError('حدث خطأ أثناء حفظ المشروع. يرجى المحاولة مرة أخرى');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">إنشاء مشروع جديد</h1>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>معلومات المشروع</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">اسم المشروع *</Label>
            <Input
              id="name"
              placeholder="مثال: مشروع لؤلؤة القمة"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="description">وصف المشروع</Label>
            <Textarea
              id="description"
              placeholder="وصف تفصيلي للمشروع..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>رسم حدود المشروع</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            استخدم أداة الرسم لتحديد حدود المشروع على الخريطة. تأكد من رسم مضلع مغلق بثلاث نقاط على الأقل.
          </p>
                 <GMap onMapLoad={onMapLoad} center={MAP_CONFIG.defaultCenter} zoom={13} mapType="satellite" />
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button 
          onClick={onSave} 
          disabled={saving || !name.trim() || !polygonRef.current} 
          size="lg"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ المشروع'}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => router.back()} 
          size="lg"
          disabled={saving}
        >
          إلغاء
        </Button>
      </div>
    </div>
  );
}