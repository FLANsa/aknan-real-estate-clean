// Google Maps configuration constants to prevent reload warnings
// Include all libraries needed across the app to avoid Loader conflicts
export const GOOGLE_MAPS_LIBRARIES = ['drawing', 'geometry', 'places'] as const;
export const GOOGLE_MAPS_VERSION = 'weekly' as const;
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Map configuration
export const MAP_CONFIG = {
  defaultZoom: 15,
  minZoom: 1,
  maxZoom: 20,
  defaultCenter: {
    lat: 26.3260, // Buraydah
    lng: 43.9750,
  },
} as const;

// Plot colors
export const PLOT_COLORS = {
  available: '#22c55e', // green
  sold: '#ef4444', // red
  reserved: '#eab308', // yellow
} as const;

// Saudi cities coordinates
export const SAUDI_CITIES = [
  { name: 'بريدة', lat: 26.3260, lng: 43.9750 },
  { name: 'جدة', lat: 21.4858, lng: 39.1925 },
  { name: 'مكة', lat: 21.3891, lng: 39.8579 },
  { name: 'المدينة', lat: 24.5247, lng: 39.5692 },
  { name: 'الدمام', lat: 26.4207, lng: 50.0888 },
] as const;

// Project system colors and labels
export const STATUS_COLORS = {
  available: '#26A65B',
  hold: '#F5A623',
  sold: '#D0021B',
} as const;

export const STATUS_LABELS = {
  available: 'متاحة',
  hold: 'محجوزة',
  sold: 'مباعة',
} as const;

// Map constraints
export const MAP_CONSTRAINTS = {
  minPolygonPoints: 3,
  maxPlotsPerProject: 1000,
  maxImagesPerPlot: 10,
  maxNotesLength: 500,
} as const;

