'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

interface PoleMapProps {
  poles: Array<{
    id: string;
    streetLightId: string;
    latitude: number;
    longitude: number;
    status: string;
    maintenanceStatus: string;
    region?: { name: string };
    subcity?: { name: string };
  }>;
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export default function PoleMap({ poles, center = [9.0243, 38.7468], zoom = 12, height = '500px' }: PoleMapProps) {
  const [L, setL] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      import('leaflet'),
      import('leaflet.markercluster'),
    ]).then(([leaflet]) => {
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      setL(leaflet);
      setLoaded(true);
    });
  }, []);

  const getIconColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: '#22c55e',
      DAMAGED: '#ef4444',
      UNDER_MAINTENANCE: '#eab308',
      INACTIVE: '#6b7280',
      DECOMMISSIONED: '#a855f7',
    };
    return colors[status] || '#3b82f6';
  };

  if (!loaded) return <div style={{ height }} className="bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">Loading map...</div>;

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {poles.map((pole) => (
          <Marker
            key={pole.id}
            position={[pole.latitude, pole.longitude]}
            icon={L && L.divIcon({
              className: 'custom-marker',
              html: `<div style="width:12px;height:12px;background:${getIconColor(pole.status)};border:2px solid white;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6],
            })}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold">{pole.streetLightId}</p>
                <p>Status: {pole.status}</p>
                <p>Maintenance: {pole.maintenanceStatus}</p>
                <p>Region: {pole.region?.name || 'N/A'}</p>
                <p>Subcity: {pole.subcity?.name || 'N/A'}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
