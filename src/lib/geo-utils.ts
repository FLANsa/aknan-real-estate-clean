import type { LatLng } from '@/types/project';
import { logger } from './performance';

// تحويل Google Maps MVCArray أو LatLng[] إلى مصفوفة LatLng عادية
export const toLatLngArray = (path: google.maps.MVCArray<google.maps.LatLng> | google.maps.LatLng[]): LatLng[] => {
  const arr: LatLng[] = [];
  const mvcArray = (path as any).getLength ? (path as google.maps.MVCArray<google.maps.LatLng>) : null;
  
  if (mvcArray) {
    for (let i = 0; i < mvcArray.getLength(); i++) {
      const c = mvcArray.getAt(i);
      arr.push({ lat: c.lat(), lng: c.lng() });
    }
  } else {
    (path as google.maps.LatLng[]).forEach((c) => arr.push({ lat: c.lat(), lng: c.lng() }));
  }
  return arr;
};

// التأكد من إغلاق المضلع (النقطة الأولى = النقطة الأخيرة)
export const ensureClosed = (pts: LatLng[]): LatLng[] => {
  if (pts.length < 3) return pts;
  const first = pts[0];
  const last = pts[pts.length - 1];
  if (first.lat !== last.lat || first.lng !== last.lng) {
    return [...pts, first];
  }
  return pts;
};

// حساب مساحة المضلع بالمتر المربع (Shoelace + WebMercator projection)
export function polygonAreaSqm(path: LatLng[]): number {
  if (path.length < 3) return 0;
  const R = 6378137; // Earth radius in meters
  
  // إسقاط WebMercator بسيط
  const proj = (p: LatLng) => {
    const x = (p.lng * Math.PI / 180) * R;
    const y = Math.log(Math.tan((Math.PI / 4) + (p.lat * Math.PI / 360))) * R;
    return { x, y };
  };
  
  const pts = path.map(proj);
  let sum = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    sum += (pts[i].x * pts[i + 1].y) - (pts[i + 1].x * pts[i].y);
  }
  return Math.abs(sum / 2);
}

// التحقق من صحة المضلع (عدد النقاط كافي)
export const isValidPolygon = (path: LatLng[]): boolean => {
  return path.length >= 3;
};

// كشف التداخل بين مضلعين باستخدام Google Maps Geometry
export const checkPolygonOverlap = (
  newPolygon: LatLng[], 
  existingPolygons: LatLng[][]
): { overlaps: boolean; overlappingPlot?: string } => {
  if (typeof window === 'undefined' || !window.google?.maps?.geometry?.poly) {
    logger.warn('Google Maps Geometry library not loaded');
    return { overlaps: false };
  }

  const newPath = newPolygon.map(p => new google.maps.LatLng(p.lat, p.lng));
  
  for (let i = 0; i < existingPolygons.length; i++) {
    const existingPath = existingPolygons[i].map(p => new google.maps.LatLng(p.lat, p.lng));
    
    // فحص إذا كانت أي نقطة من المضلع الجديد داخل المضلع الموجود
    for (const point of newPath) {
      if (google.maps.geometry.poly.containsLocation(point, new google.maps.Polygon({ paths: existingPath }))) {
        return { overlaps: true, overlappingPlot: `قطعة ${i + 1}` };
      }
    }
    
    // فحص إذا كانت أي نقطة من المضلع الموجود داخل المضلع الجديد
    for (const point of existingPath) {
      if (google.maps.geometry.poly.containsLocation(point, new google.maps.Polygon({ paths: newPath }))) {
        return { overlaps: true, overlappingPlot: `قطعة ${i + 1}` };
      }
    }
  }
  
  return { overlaps: false };
};

// التحقق مما إذا كان المضلع الجديد داخل حدود المضلع الرئيسي
export const isPolygonInsideBoundary = (
  newPolygon: LatLng[],
  boundaryPolygon: LatLng[]
): { inside: boolean; outsidePoints?: LatLng[] } => {
  if (typeof window === 'undefined' || !window.google?.maps?.geometry?.poly) {
    logger.warn('Google Maps Geometry library not loaded');
    return { inside: true }; // Fallback to true if library not loaded
  }

  const boundaryPath = boundaryPolygon.map(p => new google.maps.LatLng(p.lat, p.lng));
  const boundaryPoly = new google.maps.Polygon({ paths: boundaryPath });

  const outsidePoints: LatLng[] = [];
  for (const point of newPolygon) {
    const latLng = new google.maps.LatLng(point.lat, point.lng);
    if (!google.maps.geometry.poly.containsLocation(latLng, boundaryPoly)) {
      outsidePoints.push(point);
    }
  }

  return { inside: outsidePoints.length === 0, outsidePoints };
};
