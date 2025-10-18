'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, DrawingManager, Polygon, InfoWindow } from '@react-google-maps/api';
import { Project, Plot, Coordinates, PLOT_STATUS_COLORS } from '@/types/map';
import { calculateArea, calculatePerimeter, formatArea, formatPerimeter } from '@/lib/google-maps';
import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_API_KEY } from '@/lib/google-maps-config';
import GoogleMapsErrorHandler from './GoogleMapsErrorHandler';

interface InteractiveMapProps {
  project: Project;
  plots: Plot[];
  mode: 'view' | 'edit';
  onPlotClick?: (plot: Plot) => void;
  onPlotDraw?: (polygon: Coordinates[], plotNumber: string) => void;
  onPlotUpdate?: (plot: Plot) => void;
  onPlotDelete?: (plotId: string) => void;
  selectedPlotId?: string;
  className?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '500px',
};

const defaultOptions = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

export default function InteractiveMap({
  project,
  plots,
  mode,
  onPlotClick,
  onPlotDraw,
  onPlotUpdate,
  onPlotDelete,
  selectedPlotId,
  className = '',
}: InteractiveMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'interactive-map-loader',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [infoWindowPosition, setInfoWindowPosition] = useState<Coordinates | null>(null);
  const [newPlotNumber, setNewPlotNumber] = useState('');
  const [showPlotNumberInput, setShowPlotNumberInput] = useState(false);
  const [pendingPolygon, setPendingPolygon] = useState<Coordinates[] | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    if (mode === 'edit') {
      const drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [google.maps.drawing.OverlayType.POLYGON],
        },
        polygonOptions: {
          fillColor: '#22c55e',
          fillOpacity: 0.3,
          strokeColor: '#22c55e',
          strokeWeight: 2,
          clickable: false,
          editable: false,
          zIndex: 1,
        },
      });

      drawingManager.setMap(map);
      setDrawingManager(drawingManager);

      // Listen for polygon completion
      google.maps.event.addListener(drawingManager, 'polygoncomplete', (polygon: google.maps.Polygon) => {
        const path = polygon.getPath();
        const coordinates: Coordinates[] = [];
        
        for (let i = 0; i < path.getLength(); i++) {
          const point = path.getAt(i);
          coordinates.push({
            lat: point.lat(),
            lng: point.lng(),
          });
        }

        setPendingPolygon(coordinates);
        setShowPlotNumberInput(true);
        
        // Remove the polygon from the map
        polygon.setMap(null);
      });
    }
  }, [mode]);

  const onUnmount = useCallback(() => {
    setMap(null);
    setDrawingManager(null);
  }, []);

  const handlePlotClick = useCallback((plot: Plot, event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      setSelectedPlot(plot);
      setInfoWindowPosition({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
    }
    
    if (onPlotClick) {
      onPlotClick(plot);
    }
  }, [onPlotClick]);

  const handlePlotEdit = useCallback((plot: Plot) => {
    if (mode === 'edit' && onPlotUpdate) {
      onPlotUpdate(plot);
    }
  }, [mode, onPlotUpdate]);

  const handlePlotDelete = useCallback((plot: Plot) => {
    if (mode === 'edit' && onPlotDelete) {
      if (confirm(`هل أنت متأكد من حذف القطعة ${plot.number}؟`)) {
        onPlotDelete(plot.id);
        setSelectedPlot(null);
        setInfoWindowPosition(null);
      }
    }
  }, [mode, onPlotDelete]);

  const handleNewPlotSubmit = useCallback(() => {
    if (pendingPolygon && newPlotNumber.trim() && onPlotDraw) {
      onPlotDraw(pendingPolygon, newPlotNumber.trim());
      setPendingPolygon(null);
      setNewPlotNumber('');
      setShowPlotNumberInput(false);
    }
  }, [pendingPolygon, newPlotNumber, onPlotDraw]);

  const handleNewPlotCancel = useCallback(() => {
    setPendingPolygon(null);
    setNewPlotNumber('');
    setShowPlotNumberInput(false);
  }, []);

  const getPolygonOptions = useCallback((plot: Plot) => {
    const isSelected = selectedPlotId === plot.id;
    const color = PLOT_STATUS_COLORS[plot.status];
    
    return {
      fillColor: color,
      fillOpacity: isSelected ? 0.5 : 0.3,
      strokeColor: color,
      strokeWeight: isSelected ? 3 : 2,
      clickable: true,
      editable: mode === 'edit' && isSelected,
      zIndex: isSelected ? 10 : 1,
    };
  }, [selectedPlotId, mode]);

  if (loadError) {
    return (
      <div className={className}>
        <GoogleMapsErrorHandler error={loadError} />
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={mapContainerStyle}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">جاري تحميل الخريطة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={project.location}
        zoom={project.zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={defaultOptions}
        ref={mapRef}
      >
        {/* Render existing plots */}
        {plots.map((plot) => (
          <Polygon
            key={plot.id}
            paths={plot.polygon}
            options={getPolygonOptions(plot)}
            onClick={(event) => handlePlotClick(plot, event)}
          />
        ))}

        {/* Info Window for plot details */}
        {selectedPlot && infoWindowPosition && (
          <InfoWindow
            position={infoWindowPosition}
            onCloseClick={() => {
              setSelectedPlot(null);
              setInfoWindowPosition(null);
            }}
          >
            <div className="p-2 min-w-[200px]">
              <h3 className="font-bold text-lg mb-2">القطعة {selectedPlot.number}</h3>
              <div className="space-y-1 text-sm">
                <p><strong>الحالة:</strong> {selectedPlot.status}</p>
                <p><strong>السعر:</strong> {selectedPlot.price.toLocaleString()} {selectedPlot.currency}</p>
                <p><strong>المساحة:</strong> {formatArea(selectedPlot.dimensions.area)}</p>
                <p><strong>المحيط:</strong> {formatPerimeter(selectedPlot.dimensions.perimeter)}</p>
                {selectedPlot.notes && (
                  <p><strong>ملاحظات:</strong> {selectedPlot.notes}</p>
                )}
              </div>
              {mode === 'edit' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handlePlotEdit(selectedPlot)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handlePlotDelete(selectedPlot)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                  >
                    حذف
                  </button>
                </div>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Plot number input modal */}
      {showPlotNumberInput && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">إضافة قطعة جديدة</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">رقم القطعة</label>
              <input
                type="text"
                value={newPlotNumber}
                onChange={(e) => setNewPlotNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-aknan-400"
                placeholder="مثال: A-1, B-12"
                autoFocus
              />
            </div>
            <div className="mb-4 text-sm text-gray-600">
              <p><strong>المساحة:</strong> {pendingPolygon ? formatArea(calculateArea(pendingPolygon)) : '0 م²'}</p>
              <p><strong>المحيط:</strong> {pendingPolygon ? formatPerimeter(calculatePerimeter(pendingPolygon)) : '0 م'}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleNewPlotSubmit}
                disabled={!newPlotNumber.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إضافة
              </button>
              <button
                onClick={handleNewPlotCancel}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
