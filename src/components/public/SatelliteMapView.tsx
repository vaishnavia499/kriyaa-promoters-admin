import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ExternalLink, Layers, Navigation, AlertTriangle } from 'lucide-react';
import { Project } from '../../types';

interface SatelliteMapViewProps {
  project: Project;
}

export const SatelliteMapView: React.FC<SatelliteMapViewProps> = ({ project }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapStyle, setMapStyle] = useState<'satellite' | 'streets'>('satellite');

  const geo = project.geoCoordinates;
  const hasValidCoordinates =
    geo &&
    typeof geo.lat === 'number' &&
    typeof geo.lng === 'number' &&
    !isNaN(geo.lat) &&
    !isNaN(geo.lng) &&
    geo.lat !== 0 &&
    geo.lng !== 0;

  useEffect(() => {
    if (!hasValidCoordinates || !mapContainerRef.current) return;

    // Clean up prior map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const { lat, lng } = geo!;

    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: false,
      attributionControl: true,
    });

    mapInstanceRef.current = map;

    // Layer 1: Esri World Imagery (Satellite)
    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
        maxZoom: 19,
      }
    );

    // Layer 2: OpenStreetMap (Streets)
    const streetsLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    });

    if (mapStyle === 'satellite') {
      satelliteLayer.addTo(map);
    } else {
      streetsLayer.addTo(map);
    }

    // Custom pulse marker for layout location
    const customIcon = L.divIcon({
      className: 'custom-pulse-marker',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background-color: rgba(234, 179, 8, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 28px; height: 28px; border-radius: 50%; background-color: #0B2516; border: 2.5px solid #EAB308; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.6);">
            <span style="font-size: 14px;">📍</span>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    });

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

    const popupHtml = `
      <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 180px;">
        <h4 style="margin: 0; font-size: 13px; font-weight: 800; color: #0F172A;">${project.name}</h4>
        <p style="margin: 3px 0 6px; font-size: 10px; color: #15803D; font-weight: 700;">${project.dtcpNumber || 'DTCP Sanctioned'}</p>
        <p style="margin: 0 0 6px; font-size: 10px; color: #64748B;">${project.location}, ${project.district || 'Tamil Nadu'}</p>
        <div style="font-size: 9px; font-family: monospace; color: #047857; background: #ECFDF5; padding: 3px 6px; border-radius: 6px; margin-bottom: 6px;">
          GPS: ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E
        </div>
        <a href="https://maps.google.com/?q=${lat},${lng}" target="_blank" rel="noreferrer" style="display: block; text-align: center; font-size: 10px; font-weight: 700; color: #FFFFFF; background: #15803D; padding: 4px 8px; border-radius: 6px; text-decoration: none;">
          Open in Google Maps ↗
        </a>
      </div>
    `;

    marker.bindPopup(popupHtml).openPopup();

    // Invalidate size on resize/load
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [hasValidCoordinates, geo, project, mapStyle]);

  // Case 1: No valid GPS coordinates
  if (!hasValidCoordinates) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#07130B] p-6 text-white select-none">
        <div className="max-w-md w-full bg-[#04170D] border border-amber-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[#EAB308] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              Field-Verified GPS Coordinates Required
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Geographic coordinates have not yet been assigned to <span className="text-[#EAB308] font-bold">{project.name}</span>. Field survey boundary verification is pending in project settings.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-left text-[11px] text-slate-400 font-mono space-y-1">
            <div>• Project ID: {project.id}</div>
            <div>• Registered Location: {project.location}</div>
            <div>• Georeferencing Status: Unverified</div>
          </div>
          <div className="pt-1">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(`${project.name} ${project.location}`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#113B24] text-white font-bold text-xs transition cursor-pointer shadow-md"
            >
              <span>Search Location on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Valid GPS coordinates -> Live Leaflet Satellite Map
  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden select-none bg-slate-950">
      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating HUD: Satellite vs Street Toggle & Project Coordinates */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="bg-black/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 text-white shadow-2xl flex items-center gap-2.5 pointer-events-auto">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <span className="text-[10px] text-emerald-300 font-bold block uppercase tracking-wider">
              Field GPS Coordinates
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {geo!.lat.toFixed(5)}° N, {geo!.lng.toFixed(5)}° E
            </span>
          </div>
        </div>

        {/* Style Switcher */}
        <div className="bg-black/85 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-2xl flex items-center gap-1 pointer-events-auto self-start">
          <button
            type="button"
            onClick={() => setMapStyle('satellite')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
              mapStyle === 'satellite'
                ? 'bg-[#15803D] text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Satellite</span>
          </button>
          <button
            type="button"
            onClick={() => setMapStyle('streets')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1.5 ${
              mapStyle === 'streets'
                ? 'bg-[#15803D] text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Navigation className="w-3 h-3" />
            <span>Roadmap</span>
          </button>
        </div>
      </div>

      {/* Floating External Directions Button */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
        <a
          href={`https://maps.google.com/?q=${geo!.lat},${geo!.lng}`}
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-2 rounded-xl bg-black/85 hover:bg-black text-white text-xs font-bold border border-white/20 flex items-center gap-2 backdrop-blur-md shadow-2xl transition cursor-pointer"
        >
          <span>Open Directions</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#EAB308]" />
        </a>
      </div>
    </div>
  );
};

