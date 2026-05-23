'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppShell from '@/components/layout/AppShell';
import PoleMap from '@/components/maps/PoleMap';
import { polesApi, regionsApi } from '@/lib/api';

export default function GisMapPage() {
  const [regionId, setRegionId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: poles } = useQuery({
    queryKey: ['poles-gis', regionId, statusFilter],
    queryFn: () => polesApi.getGis({ regionId: regionId || undefined, status: statusFilter || undefined }).then(r => r.data),
  });

  const { data: regions } = useQuery({
    queryKey: ['regions'],
    queryFn: () => regionsApi.list().then(r => r.data),
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">GIS Map View</h1>
            <p className="text-sm text-gray-500">Interactive street light pole map</p>
          </div>
        </div>

        <div className="flex gap-3">
          <select value={regionId} onChange={(e) => setRegionId(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm">
            <option value="">All Regions</option>
            {(regions || []).map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DAMAGED">Damaged</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DECOMMISSIONED">Decommissioned</option>
          </select>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <PoleMap poles={poles || []} height="70vh" />
        </div>

        <div className="grid grid-cols-5 gap-3 text-xs">
          {[{ color: '#22c55e', label: 'Active' }, { color: '#ef4444', label: 'Damaged' }, { color: '#eab308', label: 'Under Maintenance' }, { color: '#6b7280', label: 'Inactive' }, { color: '#a855f7', label: 'Decommissioned' }].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.label} ({poles?.filter((p: any) => p.status === item.label.toUpperCase().replace(/ /g, '_')).length || 0})</span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
