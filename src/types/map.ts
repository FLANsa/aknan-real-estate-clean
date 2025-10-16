export type PlotStatus = 'available' | 'sold' | 'reserved';
export type Currency = 'SAR' | 'USD';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PlotDimensions {
  area: number; // in square meters
  perimeter: number; // in meters
}

export interface Plot {
  id: string;
  projectId: string;
  number: string; // custom input by admin
  status: PlotStatus;
  price: number;
  currency: Currency;
  polygon: Coordinates[]; // vertices of the polygon
  center?: Coordinates; // center coordinates for map display
  dimensions: PlotDimensions;
  notes?: string;
  propertyId?: string; // bidirectional link to property
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  location: Coordinates; // center coordinates
  zoom: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ProjectFormData {
  name: string;
  location: Coordinates;
  zoom: number;
  description?: string;
}

export interface PlotFormData {
  projectId: string;
  number: string;
  status: PlotStatus;
  price: number;
  currency: Currency;
  polygon: Coordinates[];
  notes?: string;
  propertyId?: string;
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

export const CURRENCY_LABELS: Record<Currency, string> = {
  SAR: 'ريال',
  USD: 'دولار',
};

// Major Saudi cities for quick location selection
export const SAUDI_CITIES = [
  { name: 'بريدة', lat: 26.3260, lng: 43.9750 },
  { name: 'جدة', lat: 21.4858, lng: 39.1925 },
  { name: 'مكة', lat: 21.3891, lng: 39.8579 },
  { name: 'المدينة', lat: 24.5247, lng: 39.5692 },
  { name: 'الدمام', lat: 26.4207, lng: 50.0888 },
] as const;