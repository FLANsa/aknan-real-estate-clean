import type { LatLng } from '@/types/project';

// تحويل مسار Google Maps Path إلى مصفوفة LatLng
export const toLatLngArray = (path: google.maps.MVCArray<google.maps.LatLng>): LatLng[] => {
  const result: LatLng[] = [];
  for (let i = 0; i < path.getLength(); i++) {
    const point = path.getAt(i);
    result.push({ lat: point.lat(), lng: point.lng() });
  }
  return result;
};

// التأكد من إغلاق المضلع (إضافة النقطة الأولى في النهاية إذا لم تكن موجودة)
export const ensureClosed = (path: LatLng[]): LatLng[] => {
  if (path.length === 0) return path;
  
  const first = path[0];
  const last = path[path.length - 1];
  
  // إذا كانت النقطة الأخيرة مختلفة عن الأولى، أضف النقطة الأولى في النهاية
  if (first.lat !== last.lat || first.lng !== last.lng) {
    return [...path, first];
  }
  
  return path;
};

// حساب مساحة المضلع بالمتر المربع باستخدام صيغة Shoelace
export const polygonAreaSqm = (path: LatLng[]): number => {
  if (path.length < 3) return 0;
  
  // إغلاق المضلع إذا لم يكن مغلقاً
  const closedPath = ensureClosed(path);
  
  let area = 0;
  const n = closedPath.length - 1; // نستبعد النقطة الأخيرة المكررة
  
  // استخدام صيغة Shoelace لحساب المساحة
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += closedPath[i].lng * closedPath[j].lat;
    area -= closedPath[j].lng * closedPath[i].lat;
  }
  
  area = Math.abs(area) / 2;
  
  // تحويل من درجات إلى متر مربع (تقريب)
  // متوسط المسافة بين درجة واحدة من خط العرض = 111,320 متر
  // متوسط المسافة بين درجة واحدة من خط الطول = 111,320 * cos(latitude) متر
  // للحصول على تقريب جيد، نستخدم متوسط خط العرض
  const avgLat = closedPath.reduce((sum, p) => sum + p.lat, 0) / n;
  const latToMeters = 111320; // متر لكل درجة من خط العرض
  const lngToMeters = 111320 * Math.cos((avgLat * Math.PI) / 180); // متر لكل درجة من خط الطول
  
  // تحويل المساحة إلى متر مربع
  area = area * latToMeters * lngToMeters;
  
  return area;
};

// التحقق من صحة المضلع (عدد النقاط كافي)
export const isValidPolygon = (path: LatLng[]): boolean => {
  return path.length >= 3;
};

// التحقق من أن نقطة داخل مضلع باستخدام خوارزمية Ray Casting
const isPointInPolygon = (point: LatLng, polygon: LatLng[]): boolean => {
  let inside = false;
  const n = polygon.length;
  
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    
    const intersect = 
      ((yi > point.lat) !== (yj > point.lat)) &&
      (point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi);
    
    if (intersect) {
      inside = !inside;
    }
  }
  
  return inside;
};

// التحقق من أن المضلع داخل حدود المشروع
export const isPolygonInsideBoundary = (
  polygon: LatLng[],
  boundary: LatLng[]
): { inside: boolean; outsidePoints?: LatLng[] } => {
  if (!boundary || boundary.length < 3) {
    return { inside: true }; // إذا لم تكن هناك حدود، نعتبر المضلع صالحاً
  }
  
  if (polygon.length < 3) {
    return { inside: false };
  }
  
  // التحقق من أن جميع نقاط المضلع داخل الحدود
  const outsidePoints: LatLng[] = [];
  
  for (const point of polygon) {
    if (!isPointInPolygon(point, boundary)) {
      outsidePoints.push(point);
    }
  }
  
  return {
    inside: outsidePoints.length === 0,
    outsidePoints: outsidePoints.length > 0 ? outsidePoints : undefined,
  };
};

// كشف التداخل بين مضلعين
export const checkPolygonOverlap = (
  newPolygon: LatLng[],
  existingPolygons: LatLng[][]
): { overlaps: boolean; overlappingPlot?: string } => {
  if (!window.google?.maps?.geometry?.poly) {
    console.warn('Google Maps Geometry library not loaded');
    // استخدام بديل بسيط
    for (let i = 0; i < existingPolygons.length; i++) {
      const existingPolygon = existingPolygons[i];
      
      // فحص إذا كانت أي نقطة من المضلع الجديد داخل المضلع الموجود
      for (const point of newPolygon) {
        if (isPointInPolygon(point, existingPolygon)) {
          return { overlaps: true, overlappingPlot: `قطعة ${i + 1}` };
        }
      }
      
      // فحص إذا كانت أي نقطة من المضلع الموجود داخل المضلع الجديد
      for (const point of existingPolygon) {
        if (isPointInPolygon(point, newPolygon)) {
          return { overlaps: true, overlappingPlot: `قطعة ${i + 1}` };
        }
      }
    }
    
    return { overlaps: false };
  }
  
  // استخدام Google Maps Geometry API إذا كان متاحاً
  try {
    const newPath = newPolygon.map(p => new google.maps.LatLng(p.lat, p.lng));
    const newPoly = new google.maps.Polygon({ paths: newPath });
    
    for (let i = 0; i < existingPolygons.length; i++) {
      const existingPath = existingPolygons[i].map(p => new google.maps.LatLng(p.lat, p.lng));
      const existingPoly = new google.maps.Polygon({ paths: existingPath });
      
      // فحص إذا كانت أي نقطة من المضلع الجديد داخل المضلع الموجود
      for (const point of newPath) {
        if (google.maps.geometry.poly.containsLocation(point, existingPoly)) {
          return { overlaps: true, overlappingPlot: `قطعة ${i + 1}` };
        }
      }
      
      // فحص إذا كانت أي نقطة من المضلع الموجود داخل المضلع الجديد
      for (const point of existingPath) {
        if (google.maps.geometry.poly.containsLocation(point, newPoly)) {
          return { overlaps: true, overlappingPlot: `قطعة ${i + 1}` };
        }
      }
    }
  } catch (error) {
    console.error('Error checking polygon overlap:', error);
    // استخدام البديل البسيط
    for (let i = 0; i < existingPolygons.length; i++) {
      const existingPolygon = existingPolygons[i];
      
      for (const point of newPolygon) {
        if (isPointInPolygon(point, existingPolygon)) {
          return { overlaps: true, overlappingPlot: `قطعة ${i + 1}` };
        }
      }
      
      for (const point of existingPolygon) {
        if (isPointInPolygon(point, newPolygon)) {
          return { overlaps: true, overlappingPlot: `قطعة ${i + 1}` };
        }
      }
    }
  }
  
  return { overlaps: false };
};
