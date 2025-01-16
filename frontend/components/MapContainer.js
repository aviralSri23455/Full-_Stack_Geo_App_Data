import React, { useEffect, useRef, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import * as turf from '@turf/turf';
import { kml } from '@tmcw/togeojson';
import * as d3 from 'd3';
import { EyeIcon, EyeOffIcon, TrashIcon, XCircleIcon } from 'lucide-react';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const MapContainer = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const draw = useRef(null);
  const d3Container = useRef(null);
  const [selectedTool, setSelectedTool] = useState('select');
  const [mapInitialized, setMapInitialized] = useState(false);
  const [distance, setDistance] = useState(null);
  const [area, setArea] = useState(null);
  const [uploadedLayers, setUploadedLayers] = useState([]);
  const [layerVisibility, setLayerVisibility] = useState({});
  const [activeTab, setActiveTab] = useState('draw');
  const [show3DTerrain, setShow3DTerrain] = useState(false);
  const [hoveredLayer, setHoveredLayer] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [lastClick, setLastClick] = useState({ time: 0, coordinates: null });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedMarker, setDraggedMarker] = useState(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');

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
    if (!mapboxgl) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
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
      createBufferZone(newMarker);
    }

    setLastClick({ time: currentTime, coordinates: clickCoordinates });
  };

  const createBufferZone = (marker) => {
    const point = turf.point([marker.lng, marker.lat]);
    const buffer = turf.buffer(point, 1, { units: 'kilometers' });
    draw.current.add(buffer); // Draw the buffer zone on the map
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

    const polygons = data.features.filter((f) => f.geometry.type === 'Polygon');
    if (polygons.length > 0) {
      const areaPolygon = polygons[0];
      const areaInKm2 = turf.area(areaPolygon) / 1000000;
      const areaInMiles2 = areaInKm2 * 0.386102;
      setArea({
        km2: areaInKm2.toFixed(2),
        miles2: areaInMiles2.toFixed(2),
      });
    } else {
      setArea(null);
    }
  };

  const clearMeasurements = () => {
    setDistance(null);
    setArea(null);
    const features = draw.current.getAll();
    const measurementFeatures = features.features.filter(
      f => f.geometry.type === 'LineString' || f.geometry.type === 'Polygon'
    );
    measurementFeatures.forEach(feature => {
      draw.current.delete(feature.id);
    });
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
      map.current.setPitch(show3DTerrain ? 0 : 60);
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
          type: file.name.endsWith('.geojson') ? 'GeoJSON' : 'KML',
          visibility: true,
          data: geojsonData,
        };

        setUploadedLayers([...uploadedLayers, newLayer]);
      } catch (err) {
        console.error('Failed to parse the file:', err);
      }
    };

    reader.readAsText(file);
  };

  const toggleLayerVisibility = (layerId) => {
    setLayerVisibility({
      ...layerVisibility,
      [layerId]: !layerVisibility[layerId],
    });
  };

  return (
    <div className="relative w-full h-screen sm:h-[600px] md:h-[800px]">
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute w-full p-4 space-y-4 bg-white rounded-lg shadow-xl top-2 left-2 sm:w-72 md:w-80 backdrop-blur-sm bg-opacity-95">
        <div className="space-y-2">
          <button
            onClick={() => handleStyleChange('mapbox://styles/mapbox/standard-satellite')}
            className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Satellite
          </button>
          <button
            onClick={() => handleStyleChange('mapbox://styles/mapbox/outdoors-v12')}
            className="w-full px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
          >
            Terrain
          </button>
          <button
            onClick={() => handleStyleChange('mapbox://styles/mapbox/streets-v12')}
            className="w-full px-4 py-2 text-white bg-gray-500 rounded-md hover:bg-gray-600"
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
          <div className="space-y-2">
            <button
              onClick={() => handleToolSelect('point')}
              className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600"
            >
              Point Tool
            </button>
            <button
              onClick={() => handleToolSelect('polygon')}
              className="w-full px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
            >
              Polygon Tool
            </button>
            <button
              onClick={() => handleToolSelect('line')}
              className="w-full px-4 py-2 text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
            >
              Line Tool
            </button>
            <button
              onClick={() => handleToolSelect('select')}
              className="w-full px-4 py-2 text-white bg-gray-500 rounded-md hover:bg-gray-600"
            >
              Select Tool
            </button>
          </div>
        )}

        {activeTab === 'layers' && (
          <div className="space-y-2">
            <button
              onClick={handleTrashButtonClick}
              className="w-full px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
            >
              Clear Layers
            </button>
            <input
              type="file"
              accept=".geojson,.kml"
              onChange={handleFileUpload}
              className="w-full px-4 py-2 text-gray-600 bg-gray-100 rounded-md"
            />
            {uploadedLayers.length > 0 && (
              <ul className="space-y-2">
                {uploadedLayers.map((layer) => (
                  <li key={layer.id} className="relative flex items-center justify-between">
                    <div
                      onMouseEnter={() => setHoveredLayer(layer)}
                      onMouseLeave={() => setHoveredLayer(null)}
                      className="flex items-center space-x-2 text-sm font-semibold text-gray-800"
                    >
                      <span>{layer.name}</span>
                      {layerVisibility[layer.id] ? (
                        <EyeIcon
                          onClick={() => toggleLayerVisibility(layer.id)}
                          className="w-5 h-5 text-green-500 cursor-pointer"
                        />
                      ) : (
                        <EyeOffIcon
                          onClick={() => toggleLayerVisibility(layer.id)}
                          className="w-5 h-5 text-gray-500 cursor-pointer"
                        />
                      )}
                    </div>

                    {/* Hover card */}
                    {hoveredLayer && hoveredLayer.id === layer.id && (
                      <div className="absolute left-0 z-10 w-48 p-2 mt-2 bg-white border border-gray-300 rounded-md shadow-lg top-full">
                        <div className="text-xs text-gray-500">{`Name: ${layer.name}`}</div>
                        <div className="text-xs text-gray-500">{`Type: ${layer.type}`}</div>
                        <div className="text-xs text-gray-500">{`Visibility: ${layerVisibility[layer.id] ? 'Visible' : 'Hidden'}`}</div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Distance:</span>
            <span className="text-sm text-gray-600">{distance ? `${distance.km} km (${distance.miles} miles)` : '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Area:</span>
            <span className="text-sm text-gray-600">{area ? `${area.km2} km² (${area.miles2} miles²)` : '—'}</span>
          </div>

          <button
            onClick={clearMeasurements}
            className="flex items-center justify-center w-full px-4 py-2 mt-2 text-white bg-gray-500 rounded-md hover:bg-gray-600"
          >
            <XCircleIcon className="w-5 h-5 mr-2" />
            Clear Measurements
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapContainer;
