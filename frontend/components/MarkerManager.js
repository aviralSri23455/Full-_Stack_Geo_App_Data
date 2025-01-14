import React, { useEffect, useState } from 'react';
import L from 'leaflet';

export default function MarkerManager({ map }) {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (map) {
      // Add a marker when the map is clicked
      map.on('click', (e) => {
        const marker = L.marker(e.latlng, { draggable: true }).addTo(map);
        
        // Update the state with the new marker
        setMarkers((prev) => [...prev, marker]);

        // Allow the marker to be deleted on double-click
        marker.on('dblclick', () => {
          map.removeLayer(marker);
          setMarkers((prev) => prev.filter((m) => m !== marker));
        });

        // Handle drag and drop to update position
        marker.on('dragend', () => {
          console.log('Marker moved to:', marker.getLatLng());
        });
      });
    }

    // Cleanup on component unmount
    return () => {
      if (map) {
        map.off('click');
      }
    };
  }, [map]);

  return (
    <div>
      <p>Markers: {markers.length}</p>
      <ul>
        {markers.map((marker, index) => (
          <li key={index}>{`Marker ${index + 1}: ${JSON.stringify(marker.getLatLng())}`}</li>
        ))}
      </ul>
    </div>
  );
}
