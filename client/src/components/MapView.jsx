import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';

// Fix for default Leaflet icon paths in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapView = ({ properties }) => {
  // Default center (India roughly, or calculate based on properties)
  const defaultCenter = [20.5937, 78.9629];
  let center = defaultCenter;
  let zoom = 4;

  const validProperties = properties.filter(p => p.lat && p.lng);

  if (validProperties.length > 0) {
    // Basic calculation for center based on first property for simplicity
    // A bounds calculation would be better for production
    center = [validProperties[0].lat, validProperties[0].lng];
    zoom = 10;
  }

  return (
    <div className="h-[600px] w-full rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 animate-fade-in relative z-0">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validProperties.map(property => (
          <Marker 
            key={property.id} 
            position={[property.lat, property.lng]}
          >
            <Popup className="property-popup">
              <div className="w-48">
                <div className="h-32 bg-gray-200 -mx-5 -mt-4 mb-2 rounded-t-lg overflow-hidden relative">
                  <img 
                    src={property.images && property.images[0] ? property.images[0] : 'https://via.placeholder.com/400x300'} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded text-xs font-bold backdrop-blur-sm">
                    ₹{Number(property.price)?.toLocaleString('en-IN')}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight mb-1">{property.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">{property.location}</p>
                <Link 
                  to={`/property/${property.id}`}
                  className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1.5 rounded transition-colors"
                >
                  View Details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {validProperties.length === 0 && (
        <div className="absolute inset-0 bg-gray-50/80 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Map Data</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">None of the currently filtered properties have location coordinates available.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
