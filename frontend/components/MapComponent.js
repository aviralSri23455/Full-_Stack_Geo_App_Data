import React, { useEffect, useRef, useState } from 'react';
import * as turf from '@turf/turf';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

const MapContainer = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const drawnItemsRef = useRef(null);
  const measureToolRef = useRef(null);
  const [uploadedLayers, setUploadedLayers] = useState([]);
  const [measureMode, setMeasureMode] = useState(false);
  const [showHoverCard, setShowHoverCard] = useState(false);
  const [hoverInfo, setHoverInfo] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    const initializeMap = async () => {
      if (typeof window !== 'undefined') {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        await import('@geoman-io/leaflet-geoman-free');
        await import('@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css');
        
        if (!mapRef.current || mapInstance.current) return;

        // Initialize map
        mapInstance.current = L.map(mapRef.current).setView([51.505, -0.09], 13);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance.current);

        // Initialize feature group for drawn items
        drawnItemsRef.current = new L.FeatureGroup();
        mapInstance.current.addLayer(drawnItemsRef.current);

        // Initialize Geoman controls
        mapInstance.current.pm.addControls({
          position: 'topleft',
          drawMarker: true,
          drawCircle: true,
          drawPolyline: true,
          drawRectangle: true,
          drawPolygon: true,
          editMode: true,
          dragMode: true,
          cutPolygon: true,
          removalMode: true,
        });

        // Setup measurement tool
        setupMeasurementTool(L);

        // Handle drawn features
        mapInstance.current.on('pm:create', (e) => {
          const layer = e.layer;
          handleCreatedFeature(layer);
        });

        // Setup hover interactions
        setupHoverInteractions();
      }
    };

    initializeMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
    };
  }, []);

  const setupMeasurementTool = (L) => {
    measureToolRef.current = new L.Polyline([], {
      color: 'red',
      weight: 3,
      opacity: 0.7
    });

    const measureControl = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        container.innerHTML = ` 
          <a href="#" title="Measure Distance" 
             style="display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; background: white; text-decoration: none;">
            📏
          </a>`;

        container.onclick = (e) => {
          e.preventDefault();
          toggleMeasureMode();
        };

        return container;
      }
    });

    mapInstance.current.addControl(new measureControl());
  };

  const toggleMeasureMode = () => {
    setMeasureMode(!measureMode);
    if (!measureMode) {
      mapInstance.current.on('click', handleMeasureClick);
    } else {
      mapInstance.current.off('click', handleMeasureClick);
      measureToolRef.current.setLatLngs([]);
      measureToolRef.current.removeFrom(mapInstance.current);
    }
  };

  const handleMeasureClick = (e) => {
    const points = measureToolRef.current.getLatLngs();
    points.push(e.latlng);
    measureToolRef.current.setLatLngs(points);
    
    if (!measureToolRef.current._map) {
      measureToolRef.current.addTo(mapInstance.current);
    }

    if (points.length > 1) {
      const distance = calculateDistance(points);
      measureToolRef.current.bindTooltip(
        `Distance: ${distance.toFixed(2)} km / ${(distance * 0.621371).toFixed(2)} miles`,
        { permanent: true }
      );
    }
  };

  const calculateDistance = (points) => {
    const coordinates = points.map(p => [p.lng, p.lat]);
    const line = turf.lineString(coordinates);
    return turf.length(line);
  };

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileData = await readFile(file);
      let geoLayer;

      if (file.name.endsWith('.kml')) {
        const kml = new DOMParser().parseFromString(fileData, 'text/xml');
        geoLayer = new L.KML(kml);
      } else if (file.name.endsWith('.geojson')) {
        const geojson = JSON.parse(fileData);
        geoLayer = L.geoJSON(geojson);
      } else if (file.name.endsWith('.tiff')) {
        console.log('TIFF support coming soon');
        return;
      }

      if (geoLayer) {
        geoLayer.addTo(mapInstance.current);
        const newLayer = {
          id: Date.now(),
          name: file.name,
          layer: geoLayer,
          visible: true
        };
        setUploadedLayers(prev => [...prev, newLayer]);
        mapInstance.current.fitBounds(geoLayer.getBounds());
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    }
  };

  const toggleLayerVisibility = (layerId) => {
    setUploadedLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        if (layer.visible) {
          mapInstance.current.removeLayer(layer.layer);
        } else {
          mapInstance.current.addLayer(layer.layer);
        }
        return { ...layer, visible: !layer.visible };
      }
      return layer;
    }));
  };

  const removeLayer = (layerId) => {
    setUploadedLayers(prev => {
      const layerToRemove = prev.find(layer => layer.id === layerId);
      if (layerToRemove) {
        mapInstance.current.removeLayer(layerToRemove.layer);
      }
      return prev.filter(layer => layer.id !== layerId);
    });
  };

  const setupHoverInteractions = () => {
    drawnItemsRef.current.on('mouseover', (e) => {
      const layer = e.layer;
      const info = getLayerInfo(layer);
      setHoverInfo(info);
      setShowHoverCard(true);
      setHoverPosition({ x: e.originalEvent.pageX, y: e.originalEvent.pageY });
    });

    drawnItemsRef.current.on('mouseout', () => {
      setShowHoverCard(false);
    });
  };

  const getLayerInfo = (layer) => {
    if (layer instanceof L.Marker) {
      const latLng = layer.getLatLng();
      return `Marker at ${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)}`;
    } else if (layer instanceof L.Polygon) {
      const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
      return `Polygon Area: ${(area / 1000000).toFixed(2)} km²`;
    }
    return 'Feature information';
  };

  const handleCreatedFeature = (layer) => {
    drawnItemsRef.current.addLayer(layer);
    
    if (layer instanceof L.Marker) {
      layer.dragging.enable();
      layer.on('dragend', () => {
        const pos = layer.getLatLng();
        console.log('Marker moved to:', pos);
      });
    }
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute z-10 top-4 left-4">
        <input
          type="file"
          accept=".geojson,.kml,.tiff"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <div ref={mapRef} className="w-full h-[calc(100vh-4rem)] rounded-lg shadow-lg" />
      
      {showHoverCard && hoverInfo && (
        <div
          className="absolute z-50 p-3 bg-white rounded-lg shadow-lg pointer-events-none"
          style={{
            left: hoverPosition.x + 10,
            top: hoverPosition.y + 10
          }}
        >
          <p className="text-sm font-medium text-gray-900">{hoverInfo}</p>
        </div>
      )}

      {/* Layer Control Panel */}
      <div className="absolute z-10 max-w-sm p-4 bg-white rounded-lg shadow-lg top-4 right-4">
        <h3 className="mb-3 text-lg font-semibold">Layers</h3>
        <div className="space-y-2">
          {uploadedLayers.map(layer => (
            <div key={layer.id} className="flex items-center justify-between p-2 rounded bg-gray-50">
              <span className="text-sm font-medium truncate max-w-[150px]">
                {layer.name}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleLayerVisibility(layer.id)}
                  className="p-1 rounded hover:bg-gray-200"
                >
                  {layer.visible ? (
                    <EyeIcon className="w-5 h-5 text-blue-600" />
                  ) : (
                    <EyeOffIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => removeLayer(layer.id)}
                  className="p-1 text-red-500 rounded hover:bg-red-50"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          {uploadedLayers.length === 0 && (
            <p className="text-sm italic text-gray-500">No layers uploaded yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapContainer;
