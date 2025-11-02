export type PlotStatus = 'available' | 'sold' | 'reserved';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Plot {
  id: string;
  projectId: string;
  plotNumber: string; // رقم القطعة
  polygon: Coordinates[]; // إحداثيات القطعة على الخريطة
  
  // بيانات مُدخلة يدوياً (ليست محسوبة)
  manualArea: number; // المساحة بالمتر المربع
  price: number; // السعر بالريال السعودي (SAR)
  
  // بيانات إضافية
  images: string[]; // صور القطعة
  status: PlotStatus;
  notes?: string;
  
  // ربط مع العقارات
  linkedPropertyIds: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string; // اسم المشروع
  description?: string; // وصف المشروع
  location: Coordinates; // موقع المشروع على الخريطة
  zoom: number; // مستوى التقريب
  boundary?: Coordinates[]; // حدود البلوك السكني (أطراف سوداء)
  plotsCount: number; // عدد القطع
  availablePlotsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectFormData {
  name: string;
  location: Coordinates;
  zoom: number;
  description?: string;
}

export interface PlotFormData {
  projectId: string;
  plotNumber: string;
  manualArea: number; // المساحة بالمتر المربع
  price: number; // السعر بالريال السعودي
  polygon: Coordinates[];
  images?: string[];
  status: PlotStatus;
  notes?: string;
}

// Arabic labels for UI
export const PLOT_STATUS_LABELS: Record<PlotStatus, string> = {
  available: 'متاح',
  sold: 'مباع',
  reserved: 'محجوز',
};

export const PLOT_STATUS_COLORS: Record<PlotStatus, string> = {
  available: '#22c55e', // green
  sold: '#ef4444', // red
  reserved: '#eab308', // yellow
};

// Major Saudi cities for quick location selection
export const SAUDI_CITIES = [
  { name: 'بريدة', lat: 26.3260, lng: 43.9750 },
  { name: 'جدة', lat: 21.4858, lng: 39.1925 },
  { name: 'مكة', lat: 21.3891, lng: 39.8579 },
  { name: 'المدينة', lat: 24.5247, lng: 39.5692 },
  { name: 'الدمام', lat: 26.4207, lng: 50.0888 },
] as const;