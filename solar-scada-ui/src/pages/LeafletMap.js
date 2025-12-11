import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useNavigate } from 'react-router-dom';

// Fix for missing marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const siteMarkers = [
  { name: 'JSPL SOLAR 21.5 MWp', lat: 21.159000, lng: 74.853000 },
];

const LeafletMap = () => {
  const [view, setView] = useState('Satellite');
  const [selectedSite, setSelectedSite] = useState(null);
  const navigate = useNavigate();

  const toggleView = () => {
    setView(prevView => (prevView === 'default' ? 'satellite' : 'default'));
  };

  const handleMarkerClick = (site) => {
    setSelectedSite(site);
  };

  const handleSiteNameClick = () => {
    navigate('/Heyday-Ventures-Private-Limited/Demo_Solar_SCADA/Dashboard');
  };

  return (
    <div style={{ height: "calc(100vh - 48px)", width: "100%", position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
      <button
        onClick={toggleView}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          padding: '10px',
          backgroundColor: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Switch to {view === 'default' ? 'Satellite View' : 'Default View'}
      </button>
      <MapContainer
        center={[21.159000, 74.853000]}
        zoom={17}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        attributionControl={false} // This removes the Leaflet attribution
      >
        {view === 'default' ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : (
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}
        {siteMarkers.map((site, index) => (
          <Marker
            key={index}
            position={[site.lat, site.lng]}
            eventHandlers={{
              click: () => handleMarkerClick(site),
            }}
          >
            {selectedSite && selectedSite.name === site.name && (
              <Popup>
                <div onClick={handleSiteNameClick} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
                  {site.name}
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
