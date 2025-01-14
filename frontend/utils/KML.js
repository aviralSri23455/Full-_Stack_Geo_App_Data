import L from 'leaflet';
import { kml } from '@tmcw/togeojson';

L.KML = L.GeoJSON.extend({
  initialize: function(kmlFile) {
    this._kmlFile = kmlFile;
    L.GeoJSON.prototype.initialize.call(this, {
      features: []
    });
    
    if (this._kmlFile) {
      this.addKML(this._kmlFile);
    }
  },

  addKML: function(xml) {
    if (!(xml instanceof Document)) {
      const parser = new DOMParser();
      xml = parser.parseFromString(xml, 'text/xml');
    }

    const geojson = kml(xml);
    this.addData(geojson);
  }
});

L.kml = function(kmlFile) {
  return new L.KML(kmlFile);
};

// Usage example:
export function handleKMLFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const kmlText = e.target.result;
        const parser = new DOMParser();
        const kmlDoc = parser.parseFromString(kmlText, 'text/xml');
        const kmlLayer = L.kml(kmlDoc);
        resolve(kmlLayer);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading KML file'));
    };
    
    reader.readAsText(file);
  });
}