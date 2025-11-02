'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Pencil, 
  Trash2, 
  Copy, 
  Save, 
  Undo, 
  Grid, 
  MapPin,
  Square
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PlotCoordinate {
  lat: number;
  lng: number;
}

interface PlotDrawingToolProps {
  map: google.maps.Map | null;
  onPlotDrawn: (coordinates: PlotCoordinate[], areaM2: number) => void;
  existingCoordinates?: PlotCoordinate[];
  plotNumber?: number;
}

export default function PlotDrawingTool({ 
  map, 
  onPlotDrawn, 
  existingCoordinates,
  plotNumber 
}: PlotDrawingToolProps) {
  const [drawingMode, setDrawingMode] = useState<'draw' | 'edit' | null>(null);
  const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);
  const [coordinates, setCoordinates] = useState<PlotCoordinate[]>(existingCoordinates || []);
  const [area, setArea] = useState<number>(0);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [history, setHistory] = useState<PlotCoordinate[][]>([]);

  // Calculate polygon area using google.maps.geometry
  const calculateArea = useCallback((coords: PlotCoordinate[]): number => {
    if (coords.length < 3 || !map) return 0;

    try {
      const path = coords.map(coord => new google.maps.LatLng(coord.lat, coord.lng));
      const area = google.maps.geometry.spherical.computeArea(path);
      return Math.round(area);
    } catch (error) {
      console.error('Error calculating area:', error);
      return 0;
    }
  }, [map]);

  // Snap coordinate to grid
  const snapCoordinate = useCallback((coord: PlotCoordinate): PlotCoordinate => {
    if (!snapToGrid) return coord;

    const gridSize = 0.00001; // approximately 1 meter
    return {
      lat: Math.round(coord.lat / gridSize) * gridSize,
      lng: Math.round(coord.lng / gridSize) * gridSize,
    };
  }, [snapToGrid]);

  // Initialize polygon with existing coordinates
  useEffect(() => {
    if (!map || !existingCoordinates || existingCoordinates.length === 0) return;

    const newPolygon = new google.maps.Polygon({
      paths: existingCoordinates.map(c => ({ lat: c.lat, lng: c.lng })),
      fillColor: '#BC5934',
      fillOpacity: 0.35,
      strokeColor: '#BC5934',
      strokeWeight: 2,
      editable: false,
      draggable: false,
    });

    newPolygon.setMap(map);
    setPolygon(newPolygon);
    setCoordinates(existingCoordinates);
    setArea(calculateArea(existingCoordinates));

    return () => {
      newPolygon.setMap(null);
    };
  }, [map, existingCoordinates, calculateArea]);

  // Start drawing
  const startDrawing = useCallback(() => {
    if (!map) return;

    // Clear existing polygon
    if (polygon) {
      polygon.setMap(null);
    }

    // Save to history
    if (coordinates.length > 0) {
      setHistory(prev => [...prev, coordinates]);
    }

    const newPolygon = new google.maps.Polygon({
      paths: [],
      fillColor: '#BC5934',
      fillOpacity: 0.35,
      strokeColor: '#BC5934',
      strokeWeight: 2,
      editable: true,
      draggable: false,
    });

    newPolygon.setMap(map);

    // Add click listener for drawing
    const clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      let coord: PlotCoordinate = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };

      coord = snapCoordinate(coord);

      const path = newPolygon.getPath();
      path.push(new google.maps.LatLng(coord.lat, coord.lng));

      const currentCoords = path.getArray().map(latLng => ({
        lat: latLng.lat(),
        lng: latLng.lng(),
      }));

      setCoordinates(currentCoords);
      setArea(calculateArea(currentCoords));
    });

    // Add path change listener
    const pathListener = google.maps.event.addListener(
      newPolygon.getPath(),
      'set_at',
      () => {
        const path = newPolygon.getPath();
        const currentCoords = path.getArray().map(latLng => ({
          lat: latLng.lat(),
          lng: latLng.lng(),
        }));
        setCoordinates(currentCoords);
        setArea(calculateArea(currentCoords));
      }
    );

    setPolygon(newPolygon);
    setDrawingMode('draw');

    // Cleanup function
    return () => {
      google.maps.event.removeListener(clickListener);
      google.maps.event.removeListener(pathListener);
    };
  }, [map, polygon, coordinates, snapCoordinate, calculateArea]);

  // Enable edit mode
  const enableEdit = useCallback(() => {
    if (!polygon) return;

    // Save to history
    setHistory(prev => [...prev, coordinates]);

    polygon.setEditable(true);
    polygon.setDraggable(false);
    setDrawingMode('edit');

    // Add listeners for path changes
    const pathListeners = [
      google.maps.event.addListener(polygon.getPath(), 'set_at', () => {
        const path = polygon.getPath();
        const currentCoords = path.getArray().map(latLng => ({
          lat: latLng.lat(),
          lng: latLng.lng(),
        }));
        setCoordinates(currentCoords);
        setArea(calculateArea(currentCoords));
      }),
      google.maps.event.addListener(polygon.getPath(), 'insert_at', () => {
        const path = polygon.getPath();
        const currentCoords = path.getArray().map(latLng => ({
          lat: latLng.lat(),
          lng: latLng.lng(),
        }));
        setCoordinates(currentCoords);
        setArea(calculateArea(currentCoords));
      }),
      google.maps.event.addListener(polygon.getPath(), 'remove_at', () => {
        const path = polygon.getPath();
        const currentCoords = path.getArray().map(latLng => ({
          lat: latLng.lat(),
          lng: latLng.lng(),
        }));
        setCoordinates(currentCoords);
        setArea(calculateArea(currentCoords));
      }),
    ];

    return () => {
      pathListeners.forEach(listener => google.maps.event.removeListener(listener));
    };
  }, [polygon, coordinates, calculateArea]);

  // Delete polygon
  const deletePlot = useCallback(() => {
    if (polygon) {
      polygon.setMap(null);
      setPolygon(null);
    }
    setCoordinates([]);
    setArea(0);
    setDrawingMode(null);
  }, [polygon]);

  // Undo last action
  const undo = useCallback(() => {
    if (history.length === 0) return;

    const previousCoords = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));

    if (polygon) {
      const path = polygon.getPath();
      path.clear();
      previousCoords.forEach(coord => {
        path.push(new google.maps.LatLng(coord.lat, coord.lng));
      });
    }

    setCoordinates(previousCoords);
    setArea(calculateArea(previousCoords));
  }, [history, polygon, calculateArea]);

  // Save polygon
  const savePlot = useCallback(() => {
    if (coordinates.length < 3) {
      alert('يجب أن يحتوي المضلع على 3 نقاط على الأقل');
      return;
    }

    onPlotDrawn(coordinates, area);
    
    if (polygon) {
      polygon.setEditable(false);
    }
    setDrawingMode(null);
  }, [coordinates, area, polygon, onPlotDrawn]);

  // Copy polygon
  const copyPlot = useCallback(() => {
    if (coordinates.length < 3) return;

    // Create a copy with a slight offset
    const offset = 0.0001; // approximately 10 meters
    const copiedCoords = coordinates.map(coord => ({
      lat: coord.lat + offset,
      lng: coord.lng + offset,
    }));

    onPlotDrawn(copiedCoords, calculateArea(copiedCoords));
  }, [coordinates, calculateArea, onPlotDrawn]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Square className="h-5 w-5" />
          أدوات الرسم
          {plotNumber && <Badge>قطعة #{plotNumber}</Badge>}
        </CardTitle>
        <CardDescription>
          استخدم الأدوات لرسم وتحرير حدود القطعة على الخريطة
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drawing Tools */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={drawingMode === 'draw' ? 'default' : 'outline'}
            onClick={startDrawing}
            disabled={drawingMode === 'draw'}
          >
            <Pencil className="h-4 w-4 ml-2" />
            رسم جديد
          </Button>
          <Button
            variant={drawingMode === 'edit' ? 'default' : 'outline'}
            onClick={enableEdit}
            disabled={!polygon || drawingMode === 'edit'}
          >
            <Pencil className="h-4 w-4 ml-2" />
            تعديل
          </Button>
          <Button
            variant="outline"
            onClick={copyPlot}
            disabled={coordinates.length < 3}
          >
            <Copy className="h-4 w-4 ml-2" />
            نسخ
          </Button>
          <Button
            variant="outline"
            onClick={deletePlot}
            disabled={!polygon}
          >
            <Trash2 className="h-4 w-4 ml-2" />
            حذف
          </Button>
        </div>

        {/* Options */}
        <div className="flex items-center gap-4 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={snapToGrid ? 'bg-muted' : ''}
          >
            <Grid className="h-4 w-4 ml-2" />
            {snapToGrid ? 'المحاذاة: نشطة' : 'المحاذاة: معطلة'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={history.length === 0}
          >
            <Undo className="h-4 w-4 ml-2" />
            تراجع
          </Button>
        </div>

        {/* Plot Info */}
        {coordinates.length > 0 && (
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                عدد النقاط:
              </span>
              <strong>{coordinates.length}</strong>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>المساحة:</span>
              <strong>{area.toLocaleString('ar-SA')} م²</strong>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>المحيط التقريبي:</span>
              <strong>
                {coordinates.length > 1 
                  ? Math.round(
                      google.maps.geometry.spherical.computeLength(
                        coordinates.map(c => new google.maps.LatLng(c.lat, c.lng))
                      )
                    ).toLocaleString('ar-SA')
                  : 0} م
              </strong>
            </div>
          </div>
        )}

        {/* Save Button */}
        {drawingMode && coordinates.length >= 3 && (
          <Button onClick={savePlot} className="w-full">
            <Save className="h-4 w-4 ml-2" />
            حفظ القطعة
          </Button>
        )}

        {/* Instructions */}
        {drawingMode === 'draw' && (
          <div className="text-xs text-muted-foreground p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="font-medium mb-1">تعليمات الرسم:</p>
            <ul className="list-disc list-inside space-y-1 mr-2">
              <li>انقر على الخريطة لإضافة نقاط الحدود</li>
              <li>يجب إضافة 3 نقاط على الأقل</li>
              <li>سيتم إغلاق المضلع تلقائياً</li>
              <li>انقر على "حفظ القطعة" عند الانتهاء</li>
            </ul>
          </div>
        )}

        {drawingMode === 'edit' && (
          <div className="text-xs text-muted-foreground p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
            <p className="font-medium mb-1">تعليمات التعديل:</p>
            <ul className="list-disc list-inside space-y-1 mr-2">
              <li>اسحب النقاط لتغيير الموقع</li>
              <li>اسحب الخطوط لإضافة نقاط جديدة</li>
              <li>انقر على نقطة واحذفها للإزالة</li>
              <li>انقر على "حفظ القطعة" عند الانتهاء</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}






