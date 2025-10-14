import { Coordinates } from '@/types/map';

// Load Google Maps API dynamically
export const loadGoogleMapsAPI = () => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured');
  }

  return {
    apiKey,
    libraries: ['drawing', 'geometry'] as const,
  };
};

// Calculate area of a polygon using Google Maps Geometry Library
export const calculateArea = (polygon: Coordinates[]): number => {
  if (polygon.length < 3) return 0;

  // Use spherical geometry for accurate calculations
  // This is a simplified calculation - in production, use Google Maps Geometry Library
  let area = 0;
  const n = polygon.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += polygon[i].lng * polygon[j].lat;
    area -= polygon[j].lng * polygon[i].lat;
  }

  area = Math.abs(area) / 2;

  // Convert from degrees to square meters (approximate)
  // This is a rough approximation - for accurate results, use Google Maps Geometry Library
  const earthRadius = 6371000; // Earth radius in meters
  const latRad = (polygon[0].lat * Math.PI) / 180;
  const scaleFactor = Math.cos(latRad) * earthRadius * earthRadius;

  return area * scaleFactor;
};

// Calculate perimeter of a polygon
export const calculatePerimeter = (polygon: Coordinates[]): number => {
  if (polygon.length < 2) return 0;

  let perimeter = 0;
  const n = polygon.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    perimeter += calculateDistance(polygon[i], polygon[j]);
  }

  return perimeter;
};

// Calculate distance between two points using Haversine formula
export const calculateDistance = (point1: Coordinates, point2: Coordinates): number => {
  const R = 6371000; // Earth radius in meters
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Validate polygon (minimum 3 points, no duplicate consecutive points)
export const validatePolygon = (polygon: Coordinates[]): boolean => {
  if (polygon.length < 3) return false;

  // Check for duplicate consecutive points
  for (let i = 0; i < polygon.length; i++) {
    const current = polygon[i];
    const next = polygon[(i + 1) % polygon.length];
    
    if (current.lat === next.lat && current.lng === next.lng) {
      return false;
    }
  }

  return true;
};

// Format area for display
export const formatArea = (area: number): string => {
  if (area < 1000) {
    return `${Math.round(area)} م²`;
  } else if (area < 10000) {
    return `${(area / 1000).toFixed(1)} ألف م²`;
  } else {
    return `${Math.round(area / 1000)} ألف م²`;
  }
};

// Format perimeter for display
export const formatPerimeter = (perimeter: number): string => {
  if (perimeter < 1000) {
    return `${Math.round(perimeter)} م`;
  } else {
    return `${(perimeter / 1000).toFixed(1)} كم`;
  }
};

// Get center point of polygon
export const getPolygonCenter = (polygon: Coordinates[]): Coordinates => {
  if (polygon.length === 0) {
    return { lat: 0, lng: 0 };
  }

  let latSum = 0;
  let lngSum = 0;

  for (const point of polygon) {
    latSum += point.lat;
    lngSum += point.lng;
  }

  return {
    lat: latSum / polygon.length,
    lng: lngSum / polygon.length,
  };
};

// Check if a point is inside a polygon using ray casting algorithm
export const isPointInPolygon = (point: Coordinates, polygon: Coordinates[]): boolean => {
  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    if (
      polygon[i].lng > point.lng !== polygon[j].lng > point.lng &&
      point.lat <
        ((polygon[j].lat - polygon[i].lat) * (point.lng - polygon[i].lng)) /
          (polygon[j].lng - polygon[i].lng) +
          polygon[i].lat
    ) {
      inside = !inside;
    }
  }

  return inside;
};
