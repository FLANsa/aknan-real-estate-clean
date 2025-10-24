import maplibregl from 'maplibre-gl';

export function initMap(container: HTMLDivElement, opts?: any) {
  return new maplibregl.Map({
    container,
    style: 'https://demotiles.maplibre.org/style.json',
    center: [46.6753, 24.7136], // Riyadh default
    zoom: 9,
    ...opts,
  });
}
