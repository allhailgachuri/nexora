import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Site } from '../../types';

// Custom Map Pins for sites
const createSiteIcon = (hasAnomalies: boolean) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background: ${hasAnomalies ? '#ef4444' : '#06b6d4'};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid #0a0d14;
        box-shadow: 0 0 15px ${hasAnomalies ? '#ef4444' : '#06b6d4'};
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
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
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-slate-800 bg-[#0a0d14] shadow-xl">
      <div className="absolute top-3 left-3 z-[1000] bg-[#101522]/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-lg flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span>Geographic Fleet Deployment Zones</span>
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
                  <div className="p-2 bg-[#101522] text-white rounded-lg border border-slate-700 text-xs">
                    <h4 className="font-bold text-cyan-400">{site.name}</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">{site.locationName}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-slate-800 pt-2">
                      <div>Total Nodes: <span className="text-white font-bold">{site.deviceCount || 0}</span></div>
                      <div>Active: <span className="text-emerald-400 font-bold">{site.activeCount || 0}</span></div>
                      <div>Suspected: <span className="text-amber-400 font-bold">{site.suspectedCount || 0}</span></div>
                      <div>Quarantined: <span className="text-rose-400 font-bold">{site.quarantinedCount || 0}</span></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={[site.latitude, site.longitude]}
                radius={25000}
                pathOptions={{
                  color: hasAnomalies ? '#ef4444' : '#06b6d4',
                  fillColor: hasAnomalies ? '#ef4444' : '#06b6d4',
                  fillOpacity: 0.1,
                  weight: 1
                }}
              />
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};
