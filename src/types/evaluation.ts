export type EvaluationStatus = 'new' | 'scheduled' | 'completed' | 'cancelled';

export interface EvaluationRequest {
  id: string;
  // Owner Information
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  
  // Property Information
  propertyType: 'apartment' | 'villa' | 'townhouse' | 'office' | 'shop' | 'land';
  propertyAddress: string;
  city: string;
  district: string;
  
  // Property Details
  areaM2: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  yearBuilt?: number;
  
  // Additional Information
  description?: string;
  specialFeatures?: string;
  expectedPrice?: number;
  
  // Images
  images?: string[];
  
  // Status and timestamps
  status: EvaluationStatus;
  createdAt: Date;
  processedAt?: Date;
  updatedAt?: Date;
}

export const EVALUATION_STATUS_LABELS: Record<EvaluationStatus, string> = {
  new: 'جديد',
  scheduled: 'مجدول',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

export const PROPERTY_TYPE_LABELS: Record<EvaluationRequest['propertyType'], string> = {
  apartment: 'شقة',
  villa: 'فيلا',
  townhouse: 'تاون هاوس',
  office: 'مكتب',
  shop: 'محل تجاري',
  land: 'أرض',
};

