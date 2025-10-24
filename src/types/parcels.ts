export interface Parcel {
  id: string;
  name?: string;
  projectId?: string | null;

  // Geometry optional (visual aid only)
  geometry?: {
    type: 'Polygon';
    coordinates: [ [number, number] ][]; // [lng, lat] ring(s)
  };

  // Manual-first metrics
  useManualMetrics: boolean;
  manualAreaSqm?: number | null;    // m² (from admin)
  manualPerimeterM?: number | null; // m (from admin)

  // Optional dimensions helper (rectangle or custom)
  dimensions?: {
    shape: 'rectangle' | 'custom';
    lengthM?: number | null; // for rectangle
    widthM?: number | null;  // for rectangle
  };

  // Optional comparison (if geometry exists)
  computedAreaSqm?: number | null;     // from geometry
  computedPerimeterM?: number | null;  // from geometry
  metricsDelta?: {
    areaDiffPct?: number | null;       // (manual - computed)/computed * 100
    perimeterDiffPct?: number | null;
  };

  status: 'available'|'reserved'|'sold';
  linkedPropertyIds: string[];
  notes?: string;

  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export type ParcelStatus = 'available' | 'reserved' | 'sold';

export const PARCEL_STATUS_LABELS: Record<ParcelStatus, string> = {
  available: 'متاح',
  reserved: 'محجوز',
  sold: 'مباع',
};

export const PARCEL_STATUS_COLORS: Record<ParcelStatus, string> = {
  available: '#22c55e', // green
  reserved: '#eab308', // yellow
  sold: '#ef4444', // red
};

