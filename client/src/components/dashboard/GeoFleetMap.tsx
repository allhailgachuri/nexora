import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Site } from '../../types';

// Custom Map Pins for sites with Organic Tech styling
const createSiteIcon = (hasAnomalies: boolean) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background: ${hasAnomalies ? '#CC5833' : '#30D158'};
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 3px solid #171C19;
        box-shadow: 0 0 16px ${hasAnomalies ? 'rgba(204, 88, 51, 0.7)' : 'rgba(48, 209, 88, 0.7)'};
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 7px; height: 7px; background: white; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

interface GeoFleetMapProps {
  sites: Site[];
  onSelectSite?: (siteId: string) => void;
}

export const GeoFleetMap: React.FC<GeoFleetMapProps> = ({ sites, onSelectSite }) => {
  // Center map around California deployment area
  const centerLat = 35.8;
  const centerLon = -120.0;

  return (
    <div className="relative w-full h-[400px] rounded-[2rem] overflow-hidden border border-[#2E4036] bg-[#111614] shadow-organic-card">
      <div className="absolute top-4 left-4 z-[1000] bg-[#171C19]/90 backdrop-blur-xl border border-[#26372E] px-4 py-2 rounded-full text-xs font-semibold text-white shadow-organic-card flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse" />
        <span className="font-mono text-[11px]">Geographic Fleet Zones</span>
      </div>

      <MapContainer
        center={[centerLat, centerLon]}
        zoom={6}
        scrollWheelZoom={false}
        className="w-full h-full dark-tiles"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {sites.map(site => {
          const hasAnomalies = (site.suspectedCount || 0) > 0 || (site.quarantinedCount || 0) > 0;
          return (
            <React.Fragment key={site.id}>
              <Marker
                position={[site.latitude, site.longitude]}
                icon={createSiteIcon(hasAnomalies)}
                eventHandlers={{
                  click: () => onSelectSite && onSelectSite(site.id)
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-3 bg-[#171C19] text-[#F4F2EC] rounded-2xl border border-[#2E4036] text-xs font-sans">
                    <h4 className="font-bold text-[#F4F2EC] text-sm">{site.name}</h4>
                    <p className="text-[#94A39B] text-[11px] mt-0.5">{site.locationName}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-[#26372E] pt-2">
                      <div>Total Nodes: <span className="text-white font-bold">{site.deviceCount || 0}</span></div>
                      <div>Active: <span className="text-[#30D158] font-bold">{site.activeCount || 0}</span></div>
                      <div>Suspected: <span className="text-[#E85D04] font-bold">{site.suspectedCount || 0}</span></div>
                      <div>Quarantined: <span className="text-[#E30000] font-bold">{site.quarantinedCount || 0}</span></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={[site.latitude, site.longitude]}
                radius={25000}
                pathOptions={{
                  color: hasAnomalies ? '#CC5833' : '#30D158',
                  fillColor: hasAnomalies ? '#CC5833' : '#30D158',
                  fillOpacity: 0.12,
                  weight: 1.5
                }}
              />
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};
