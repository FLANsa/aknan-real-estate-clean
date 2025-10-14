export type PropertyPurpose = 'sale' | 'rent';
export type PropertyType = 'apartment' | 'villa' | 'land' | 'office' | 'shop';
export type PropertyStatus = 'available' | 'sold' | 'rented' | 'off-market';
export type Currency = 'SAR' | 'USD';

export interface Property {
  id: string;
  titleAr: string;
  descriptionAr?: string;
  city: string;
  district?: string;
  address?: string;
  
  purpose: PropertyPurpose;
  type: PropertyType;
  
  areaM2?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  
  price: number;
  currency: Currency;
  status: PropertyStatus;
  
  features?: string[];
  yearBuilt?: number;
  lat?: number;
  lng?: number;
  
  images: string[];
  featured?: boolean;
  
  slug: string;
  plotId?: string; // bidirectional link to plot
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface PropertyFormData {
  titleAr: string;
  descriptionAr?: string;
  city: string;
  district?: string;
  address?: string;
  
  purpose: PropertyPurpose;
  type: PropertyType;
  
  areaM2?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  
  price: number;
  currency: Currency;
  status: PropertyStatus;
  
  features?: string[];
  yearBuilt?: number;
  lat?: number;
  lng?: number;
  
  images: string[];
  featured?: boolean;
  plotId?: string; // bidirectional link to plot
}

export interface PropertyFilters {
  city?: string;
  district?: string;
  type?: PropertyType;
  purpose?: PropertyPurpose;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  minPrice?: number;
  maxPrice?: number;
  status?: PropertyStatus;
  featured?: boolean;
}

export interface PropertyListResponse {
  properties: Property[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Enum labels for Arabic UI
export const PROPERTY_PURPOSE_LABELS: Record<PropertyPurpose, string> = {
  sale: 'بيع',
  rent: 'إيجار',
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: 'شقة',
  villa: 'فيلا',
  land: 'أرض',
  office: 'مكتب',
  shop: 'محل',
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  available: 'متاح',
  sold: 'مباع',
  rented: 'مؤجر',
  'off-market': 'خارج السوق',
};

export const CURRENCY_LABELS: Record<Currency, string> = {
  SAR: 'ريال',
  USD: 'دولار',
};


