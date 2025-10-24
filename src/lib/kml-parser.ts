/**
 * KML/KMZ Parser for extracting polygons from KML files
 * Supports both KML and KMZ (zipped KML) formats
 */

export interface KMLPolygon {
  id?: string;
  name?: string;
  description?: string;
  coordinates: { lat: number; lng: number }[];
  areaM2?: number;
}

export interface KMLParseResult {
  polygons: KMLPolygon[];
  errors: string[];
}

/**
 * Calculate area of polygon in square meters using spherical geometry
 */
function calculatePolygonArea(coordinates: { lat: number; lng: number }[]): number {
  if (coordinates.length < 3) return 0;
  
  const EARTH_RADIUS = 6371000; // meters
  
  // Convert to radians
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  
  let area = 0;
  const coords = [...coordinates, coordinates[0]]; // Close the polygon
  
  for (let i = 0; i < coords.length - 1; i++) {
    const lat1 = toRad(coords[i].lat);
    const lat2 = toRad(coords[i + 1].lat);
    const lng1 = toRad(coords[i].lng);
    const lng2 = toRad(coords[i + 1].lng);
    
    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  
  area = Math.abs((area * EARTH_RADIUS * EARTH_RADIUS) / 2);
  
  return Math.round(area);
}

/**
 * Parse coordinates string from KML format
 * Format: "lng,lat,alt lng,lat,alt ..." or "lng,lat lng,lat ..."
 */
function parseCoordinates(coordinatesString: string): { lat: number; lng: number }[] {
  const coords: { lat: number; lng: number }[] = [];
  const cleanedString = coordinatesString.trim();
  
  if (!cleanedString) return coords;
  
  // Split by whitespace or newlines
  const coordPairs = cleanedString.split(/\s+/);
  
  for (const pair of coordPairs) {
    const parts = pair.split(',');
    if (parts.length >= 2) {
      const lng = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);
      
      if (!isNaN(lng) && !isNaN(lat)) {
        coords.push({ lat, lng });
      }
    }
  }
  
  return coords;
}

/**
 * Extract polygons from KML XML document
 */
function extractPolygonsFromXML(xmlDoc: Document): KMLPolygon[] {
  const polygons: KMLPolygon[] = [];
  
  // Find all Placemark elements (containing polygons)
  const placemarks = xmlDoc.getElementsByTagName('Placemark');
  
  for (let i = 0; i < placemarks.length; i++) {
    const placemark = placemarks[i];
    
    // Extract name and description
    const nameElement = placemark.getElementsByTagName('name')[0];
    const descElement = placemark.getElementsByTagName('description')[0];
    const name = nameElement ? nameElement.textContent?.trim() : `Plot ${i + 1}`;
    const description = descElement ? descElement.textContent?.trim() : undefined;
    
    // Find Polygon elements
    const polygonElements = placemark.getElementsByTagName('Polygon');
    
    for (let j = 0; j < polygonElements.length; j++) {
      const polygonElement = polygonElements[j];
      
      // Get outer boundary coordinates
      const outerBoundary = polygonElement.getElementsByTagName('outerBoundaryIs')[0];
      if (!outerBoundary) continue;
      
      const linearRing = outerBoundary.getElementsByTagName('LinearRing')[0];
      if (!linearRing) continue;
      
      const coordinatesElement = linearRing.getElementsByTagName('coordinates')[0];
      if (!coordinatesElement) continue;
      
      const coordinatesString = coordinatesElement.textContent;
      if (!coordinatesString) continue;
      
      const coordinates = parseCoordinates(coordinatesString);
      
      if (coordinates.length >= 3) {
        // Calculate area
        const areaM2 = calculatePolygonArea(coordinates);
        
        polygons.push({
          id: `polygon-${i}-${j}`,
          name: polygonElements.length > 1 ? `${name} (${j + 1})` : name,
          description,
          coordinates,
          areaM2,
        });
      }
    }
  }
  
  return polygons;
}

/**
 * Parse KML file content
 */
export async function parseKML(kmlContent: string): Promise<KMLParseResult> {
  const errors: string[] = [];
  let polygons: KMLPolygon[] = [];
  
  try {
    // Parse XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlContent, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.getElementsByTagName('parsererror');
    if (parserError.length > 0) {
      errors.push('فشل في قراءة ملف KML. تأكد من أن الملف بصيغة صحيحة.');
      return { polygons: [], errors };
    }
    
    // Extract polygons
    polygons = extractPolygonsFromXML(xmlDoc);
    
    if (polygons.length === 0) {
      errors.push('لم يتم العثور على مضلعات في الملف. تأكد من أن الملف يحتوي على Placemarks مع Polygons.');
    }
  } catch (error) {
    console.error('Error parsing KML:', error);
    errors.push('حدث خطأ أثناء قراءة الملف: ' + (error as Error).message);
  }
  
  return { polygons, errors };
}

/**
 * Parse KMZ file (zipped KML)
 */
export async function parseKMZ(file: File): Promise<KMLParseResult> {
  const errors: string[] = [];
  
  try {
    // Dynamic import of JSZip (only when needed)
    const JSZip = (await import('jszip')).default;
    
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Unzip
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    // Find KML file (usually doc.kml or *.kml)
    let kmlFile = zip.file('doc.kml');
    
    if (!kmlFile) {
      // Search for any .kml file
      const kmlFiles = Object.keys(zip.files).filter(name => name.toLowerCase().endsWith('.kml'));
      if (kmlFiles.length > 0) {
        kmlFile = zip.file(kmlFiles[0]);
      }
    }
    
    if (!kmlFile) {
      errors.push('لم يتم العثور على ملف KML داخل ملف KMZ.');
      return { polygons: [], errors };
    }
    
    // Extract KML content
    const kmlContent = await kmlFile.async('string');
    
    // Parse KML
    return await parseKML(kmlContent);
  } catch (error) {
    console.error('Error parsing KMZ:', error);
    errors.push('حدث خطأ أثناء فك ضغط الملف: ' + (error as Error).message);
    return { polygons: [], errors };
  }
}

/**
 * Main function to parse KML or KMZ file
 */
export async function parseKMLFile(file: File): Promise<KMLParseResult> {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.kmz')) {
    return await parseKMZ(file);
  } else if (fileName.endsWith('.kml')) {
    const content = await file.text();
    return await parseKML(content);
  } else {
    return {
      polygons: [],
      errors: ['نوع الملف غير مدعوم. يرجى رفع ملف KML أو KMZ.'],
    };
  }
}


