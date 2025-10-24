/**
 * Map Marker Icon Component
 * Creates custom SVG markers for different property statuses and types
 */

export interface MarkerIconOptions {
  status: 'available' | 'sold' | 'rented' | 'reserved';
  type?: 'property' | 'project' | 'plot';
  size?: 'small' | 'medium' | 'large';
}

const STATUS_COLORS = {
  available: '#10B981', // Green
  sold: '#EF4444',      // Red
  rented: '#F59E0B',    // Orange
  reserved: '#6B7280',  // Gray
};

const SIZE_VALUES = {
  small: { width: 30, height: 40, fontSize: 14 },
  medium: { width: 40, height: 50, fontSize: 16 },
  large: { width: 50, height: 60, fontSize: 18 },
};

/**
 * Create custom pin marker icon
 */
export function createPinMarkerIcon({ status, size = 'medium' }: MarkerIconOptions): string {
  const color = STATUS_COLORS[status];
  const { width, height } = SIZE_VALUES[size];

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 20 12 20s12-12.8 12-20c0-6.6-5.4-12-12-12z" 
            fill="${color}" 
            stroke="#ffffff" 
            stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="#ffffff"/>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Create cluster marker icon (for grouped projects)
 */
export function createClusterMarkerIcon(count: number, size: 'small' | 'medium' | 'large' = 'medium'): string {
  const dimensions = SIZE_VALUES[size];
  const radius = dimensions.width / 2;

  const svg = `
    <svg width="${dimensions.width}" height="${dimensions.width}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${radius}" cy="${radius}" r="${radius - 2}" 
              fill="#BC5934" 
              stroke="#ffffff" 
              stroke-width="3"
              opacity="0.9"/>
      <text x="${radius}" y="${radius}" 
            font-family="Arial, sans-serif" 
            font-size="${dimensions.fontSize}" 
            font-weight="bold" 
            fill="#ffffff" 
            text-anchor="middle" 
            dominant-baseline="central">
        ${count}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Create polygon fill color based on status
 */
export function getPolygonFillColor(status: 'available' | 'sold' | 'rented' | 'reserved'): string {
  return STATUS_COLORS[status];
}

/**
 * Get polygon style options
 */
export function getPolygonStyle(status: 'available' | 'sold' | 'rented' | 'reserved') {
  const color = STATUS_COLORS[status];
  
  return {
    fillColor: color,
    fillOpacity: 0.35,
    strokeColor: color,
    strokeWeight: 2,
    strokeOpacity: 0.8,
  };
}

/**
 * Create custom marker for Google Maps
 */
export function createCustomMarker(
  position: google.maps.LatLngLiteral,
  options: MarkerIconOptions,
  map: google.maps.Map
): google.maps.Marker {
  const icon = {
    url: createPinMarkerIcon(options),
    scaledSize: new google.maps.Size(
      SIZE_VALUES[options.size || 'medium'].width,
      SIZE_VALUES[options.size || 'medium'].height
    ),
    anchor: new google.maps.Point(
      SIZE_VALUES[options.size || 'medium'].width / 2,
      SIZE_VALUES[options.size || 'medium'].height
    ),
  };

  return new google.maps.Marker({
    position,
    map,
    icon,
    optimized: true,
  });
}


