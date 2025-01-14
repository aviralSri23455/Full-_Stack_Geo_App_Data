import React, { useEffect, useRef, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import * as turf from '@turf/turf';
import { kml } from '@tmcw/togeojson';
import * as d3 from 'd3';
import {
  EyeIcon,
  EyeOffIcon,
  LayersIcon,
  TrashIcon,
  MapPinIcon,
  PenToolIcon,
  MousePointerIcon,
} from 'lucide-react';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const MapContainer = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);
  const d3Container = useRef(null);
  const [selectedTool, setSelectedTool] = useState('select');
  const [mapInitialized, setMapInitialized] = useState(false);
  const [distance, setDistance] = useState(null);
  const [uploadedLayers, setUploadedLayers] = useState([]);
  const [layerVisibility, setLayerVisibility] = useState({});
  const [activeTab, setActiveTab] = useState('draw');
  const [show3DTerrain, setShow3DTerrain] = useState(false);
  const [hoveredLayer, setHoveredLayer] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [lastClick, setLastClick] = useState({ time: 0, coordinates: null });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedMarker, setDraggedMarker] = useState(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12'); // Default map style

  useEffect(() => {
    if (typeof window !== 'undefined' && mapboxgl.accessToken && !map.current && mapContainer.current) {
      initializeMap();
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (mapInitialized && map.current) {
      initializeD3Layer();
    }
  }, [mapInitialized, markers]);

  const initializeMap = () => {
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle, // Dynamically set the map style
      center: [-74.5, 40],
      zoom: 9,
      pitch: 45,
      bearing: 0,
    });

    map.current.on('load', () => {
      draw.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          point: true,
          trash: true,
          polygon: true,
          line_string: true,
        },
        defaultMode: 'simple_select',
      });

      map.current.addControl(draw.current);
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.ScaleControl({ unit: 'imperial' }), 'bottom-right');

      d3Container.current = d3.select(mapContainer.current)
        .append('svg')
        .attr('class', 'absolute top-0 left-0 w-full h-full pointer-events-none');

      setMapInitialized(true);

      map.current.on('draw.create', updateDistance);
      map.current.on('draw.delete', updateDistance);
      map.current.on('draw.update', updateDistance);
      map.current.on('click', handleMapClick);
      map.current.on('mousemove', handleMouseMove);
    });
  };

  const initializeD3Layer = () => {
    if (!d3Container.current) return;

    const svg = d3Container.current;
    svg.selectAll('*').remove();

    const updateMarkerPositions = () => {
      const markerElements = svg.selectAll('.marker')
        .data(markers, d => d.id);

      const markerEnter = markerElements.enter()
        .append('g')
        .attr('class', 'marker cursor-pointer')
        .attr('pointer-events', 'all')
        .on('dblclick', handleMarkerDoubleClick)
        .call(d3.drag()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded));

      markerEnter.append('circle')
        .attr('r', 8)
        .attr('fill', '#3B82F6')
        .attr('stroke', 'white')
        .attr('stroke-width', 2);

      svg.selectAll('.marker')
        .attr('transform', d => {
          const point = map.current.project([d.lng, d.lat]);
          return `translate(${point.x}, ${point.y})`;
        });

      markerElements.exit().remove();
    };

    map.current.on('move', updateMarkerPositions);
    updateMarkerPositions();
  };

  const handleMarkerDoubleClick = (event, d) => {
    setMarkers(markers.filter(marker => marker.id !== d.id));
  };

  const dragStarted = (event, d) => {
    setIsDragging(true);
    setDraggedMarker(d);
    d3.select(event.sourceEvent.target.parentNode)
      .raise()
      .classed('active', true);
  };

  const dragged = (event, d) => {
    const point = map.current.unproject([event.x, event.y]);
    d.lng = point.lng;
    d.lat = point.lat;

    d3.select(event.sourceEvent.target.parentNode)
      .attr('transform', `translate(${event.x}, ${event.y})`);
  };

  const dragEnded = (event, d) => {
    setIsDragging(false);
    setDraggedMarker(null);
    d3.select(event.sourceEvent.target.parentNode)
      .classed('active', false);

    setMarkers(markers.map(m =>
      m.id === d.id ? { ...m, lng: d.lng, lat: d.lat } : m
    ));
  };

  const handleMapClick = (e) => {
    const currentTime = Date.now();
    const clickCoordinates = { lng: e.lngLat.lng, lat: e.lngLat.lat };

    if (currentTime - lastClick.time < 500) {
      if (lastClick.coordinates && lastClick.coordinates.lng === clickCoordinates.lng && lastClick.coordinates.lat === clickCoordinates.lat) {
        setMarkers(markers.filter(marker => marker.id !== lastClick.coordinates.id));
      }
    } else {
      const newMarker = { id: `marker-${currentTime}`, lng: clickCoordinates.lng, lat: clickCoordinates.lat };
      setMarkers([...markers, newMarker]);
    }

    setLastClick({ time: currentTime, coordinates: clickCoordinates });
  };

  const handleMouseMove = (e) => {
    if (isDragging && draggedMarker) {
      const point = map.current.unproject([e.point.x, e.point.y]);
      setMarkers(markers.map(m =>
        m.id === draggedMarker.id ? { ...m, lng: point.lng, lat: point.lat } : m
      ));
    }
  };

  const updateDistance = () => {
    const data = draw.current.getAll();
    const points = data.features.filter((f) => f.geometry.type === 'Point');

    if (points.length >= 2) {
      const line = turf.lineString(points.map((p) => p.geometry.coordinates));
      const km = turf.length(line, { units: 'kilometers' });
      setDistance({
        km: km.toFixed(2),
        miles: (km * 0.621371).toFixed(2),
      });
    } else {
      setDistance(null);
    }
  };

  const handleToolSelect = (tool) => {
    if (!draw.current || !mapInitialized) return;
    setSelectedTool(tool);

    const modes = {
      point: 'draw_point',
      polygon: 'draw_polygon',
      line: 'draw_line_string',
      select: 'simple_select',
    };

    draw.current.changeMode(modes[tool] || 'simple_select');
  };

  const handleStyleChange = (style) => {
    setMapStyle(style); // Update the map style based on selection
    if (map.current) {
      map.current.setStyle(style); // Dynamically set the style of the map
    }
  };

  const toggle3DTerrain = () => {
    setShow3DTerrain(!show3DTerrain);
    if (map.current) {
      map.current.setPitch(show3DTerrain ? 0 : 60); // Toggle between 0 and 60 degrees pitch for 3D effect
    }
  };

  const handleTrashButtonClick = () => {
    draw.current.deleteAll();
    setMarkers([]);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        let geojsonData;

        if (file.name.endsWith('.geojson')) {
          geojsonData = JSON.parse(reader.result);
        } else if (file.name.endsWith('.kml')) {
          const kmlData = new DOMParser().parseFromString(reader.result, 'text/xml');
          geojsonData = kml(kmlData);
        }

        const newLayer = {
          id: Date.now(),
          name: file.name,
          data: geojsonData,
        };

        setUploadedLayers([...uploadedLayers, newLayer]);
      } catch (err) {
        console.error('Failed to parse the file:', err);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="relative w-full h-screen sm:h-[600px]">
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute p-4 space-y-4 bg-white rounded-lg shadow-xl backdrop-blur-sm bg-opacity-95 top-2 left-2 w-72 sm:w-80">
        <div className="space-y-2">
          <button
            onClick={() => handleStyleChange('mapbox://styles/mapbox/satellite-v9')}
            className="w-full px-4 py-2 text-white transition-colors duration-200 bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Satellite
          </button>
          <button
            onClick={() => handleStyleChange('mapbox://styles/mapbox/outdoors-v12')}
            className="w-full px-4 py-2 text-white transition-colors duration-200 bg-green-500 rounded-md hover:bg-green-600"
          >
            Terrain
          </button>
          <button
            onClick={() => handleStyleChange('mapbox://styles/mapbox/streets-v12')}
            className="w-full px-4 py-2 text-white transition-colors duration-200 bg-gray-500 rounded-md hover:bg-gray-600"
          >
            Street View
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('draw')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${activeTab === 'draw' ? 'bg-blue-500 text-white shadow-md' : 'text-blue-700 hover:bg-blue-50'}`}
          >
            Draw
          </button>
          <button
            onClick={() => setActiveTab('layers')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${activeTab === 'layers' ? 'bg-blue-500 text-white shadow-md' : 'text-blue-700 hover:bg-blue-50'}`}
          >
            Layers
          </button>
        </div>

        {activeTab === 'draw' && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleToolSelect('point')}
                className={`flex flex-col items-center p-3 rounded-lg transition-colors duration-200 ${selectedTool === 'point' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
              >
                <MapPinIcon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Point</span>
              </button>
              <button
                onClick={() => handleToolSelect('polygon')}
                className={`flex flex-col items-center p-3 rounded-lg transition-colors duration-200 ${selectedTool === 'polygon' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
              >
                <PenToolIcon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Polygon</span>
              </button>
              <button
                onClick={() => handleToolSelect('line')}
                className={`flex flex-col items-center p-3 rounded-lg transition-colors duration-200 ${selectedTool === 'line' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
              >
                <LayersIcon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Line</span>
              </button>
              <button
                onClick={() => handleToolSelect('select')}
                className={`flex flex-col items-center p-3 rounded-lg transition-colors duration-200 ${selectedTool === 'select' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
              >
                <MousePointerIcon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Select</span>
              </button>
            </div>

            {distance && (
              <div className="p-4 space-y-1 rounded-lg bg-blue-50">
                <div className="flex items-center space-x-2">
                  <LayersIcon className="w-4 h-4 text-blue-500" />
                  <h3 className="font-medium text-blue-900">Measured Distance</h3>
                </div>
                <p className="text-sm text-blue-700">
                  {distance.km} km / {distance.miles} miles
                </p>
              </div>
            )}

            <div className="p-4 space-y-1 rounded-lg bg-blue-50">
              <div className="flex items-center space-x-2">
                <MapPinIcon className="w-4 h-4 text-blue-500" />
                <h3 className="font-medium text-blue-900">Markers</h3>
              </div>
              <p className="text-sm text-blue-700">
                {markers.length} marker{markers.length !== 1 ? 's' : ''} placed
              </p>
            </div>

            <button
              onClick={toggle3DTerrain}
              className="w-full px-4 py-2 text-white transition-colors duration-200 bg-green-500 rounded-md hover:bg-green-600"
            >
              Toggle 3D Terrain
            </button>

            {/* Delete Button */}
            <button
             onClick={handleTrashButtonClick}
             className="w-full px-4 py-2 text-white transition-colors duration-200 bg-red-500 rounded-md hover:bg-red-600"
            >
              Clear All Drawn Features & Markers
            </button>
          </div>
        )}

        {/* Layer Upload & Management */}
        {activeTab === 'layers' && (
          <div className="space-y-4">
            <label className="block">
              <span className="sr-only">Upload file</span>
              <input
                type="file"
                accept=".geojson,.kml"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none"
              />
            </label>

            <div className="space-y-2">
              {uploadedLayers.map((layer) => (
                <div
                  key={layer.id}
                  className="relative flex items-center justify-between p-3 transition-colors duration-200 rounded-lg hover:bg-gray-50"
                  onMouseEnter={() => setHoveredLayer(layer.id)}
                  onMouseLeave={() => setHoveredLayer(null)}
                >
                  <span className="text-sm font-medium text-gray-700">{layer.name}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleLayerVisibility(layer.id)}
                      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors duration-200"
                    >
                      {layerVisibility[layer.id] ? (
                        <EyeIcon className="w-5 h-5 text-blue-600" />
                      ) : (
                        <EyeOffIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => removeLayer(layer.id)}
                      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors duration-200"
                    >
                      <TrashIcon className="w-5 h-5 text-red-500 hover:text-red-600" />
                    </button>
                  </div>

                  {hoveredLayer === layer.id && (
                    <div className="absolute right-0 w-48 p-3 mt-1 space-y-2 bg-white border rounded-lg shadow-lg">
                      <h3 className="font-medium text-gray-700">Layer Info</h3>
                      <p className="text-xs text-gray-500">Name: {layer.name}</p>
                      <p className="text-xs text-gray-500">Type: GeoJSON</p>
                      <p className="text-xs text-gray-500">
                        Visibility: {layerVisibility[layer.id] ? 'Visible' : 'Hidden'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapContainer;
