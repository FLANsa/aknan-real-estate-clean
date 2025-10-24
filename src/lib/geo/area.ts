import * as turf from '@turf/turf';

export function computeAreaSqm(coords: [ [number,number] ][]): number {
  const poly = turf.polygon([coords]); // outer ring
  return Math.round(turf.area(poly));
}

export function computePerimeterM(coords: [ [number,number] ][]): number {
  const ring = coords[0] === coords[coords.length-1] ? coords : [...coords, coords[0]];
  const line = turf.lineString(ring);
  return Math.round(turf.length(line, { units:'kilometers' }) * 1000);
}

