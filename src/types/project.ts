export type LatLng = { lat: number; lng: number };
export type PlotStatus = 'available' | 'hold' | 'sold';

export interface Project {
  id: string;
  name: string;
  description?: string;
  boundaryPath: LatLng[];  // حدود المشروع (مسار مغلق)
  center: LatLng;          // مركز تمركز الخريطة
  createdAt: any;
  updatedAt: any;
}

export interface Plot {
  id: string;
  number: string;          // رقم القطعة
  area?: number;           // م² (يدوي أو محسوب)
  price?: number;          // SAR
  status: PlotStatus;
  notes?: string;
  polygonPath: LatLng[];   // مسار مغلق
  images?: string[];       // روابط الصور
  createdAt: any;
  updatedAt: any;
}





