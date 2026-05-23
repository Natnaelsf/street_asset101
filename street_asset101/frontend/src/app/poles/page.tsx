'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppShell from '@/components/layout/AppShell';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { polesApi, regionsApi, reportsApi } from '@/lib/api';
import { Pole } from '@/types';
import { formatDate, downloadBlob } from '@/lib/utils';
import { Plus, Upload, Eye, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PolesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPole, setEditingPole] = useState<Pole | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['poles', page, search],
    queryFn: () => polesApi.list({ page, limit: 10, search }).then(r => r.data),
  });

  const { data: regions } = useQuery({
    queryKey: ['regions'],
    queryFn: () => regionsApi.list().then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => polesApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['poles'] }); toast.success('Pole deleted'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const res = await reportsApi.poleInventory({ format });
      downloadBlob(res.data, `pole-inventory.${format}`);
      toast.success(`${format.toUpperCase()} exported`);
    } catch { toast.error('Export failed'); }
  };

  const columns = [
    { key: 'streetLightId', header: 'Pole ID', render: (p: Pole) => <span className="font-medium">{p.streetLightId}</span> },
    { key: 'latitude', header: 'Latitude', render: (p: Pole) => p.latitude.toFixed(4) },
    { key: 'longitude', header: 'Longitude', render: (p: Pole) => p.longitude.toFixed(4) },
    { key: 'lampType', header: 'Lamp Type' },
    { key: 'poleMaterial', header: 'Material' },
    { key: 'status', header: 'Status', render: (p: Pole) => <StatusBadge status={p.status} /> },
    { key: 'maintenanceStatus', header: 'Maintenance', render: (p: Pole) => <StatusBadge status={p.maintenanceStatus} /> },
    { key: 'region', header: 'Region', render: (p: Pole) => p.region?.name || '-' },
    { key: 'installationDate', header: 'Installed', render: (p: Pole) => p.installationDate ? formatDate(p.installationDate) : '-' },
    {
      key: 'actions', header: 'Actions', render: (p: Pole) => (
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); }} className="p-1 hover:text-blue-600"><Eye className="h-4 w-4" /></button>
          <button onClick={(e) => { e.stopPropagation(); setEditingPole(p); setShowForm(true); }} className="p-1 hover:text-green-600"><Edit2 className="h-4 w-4" /></button>
          <button onClick={(e) => { e.stopPropagation(); if (confirm('Delete this pole?')) deleteMutation.mutate(p.id); }} className="p-1 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pole Registry</h1>
            <p className="text-sm text-gray-500">Manage street light pole assets</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleExport('pdf')} className="px-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50">PDF</button>
            <button onClick={() => handleExport('excel')} className="px-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50">Excel</button>
            <button onClick={() => handleExport('csv')} className="px-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50">CSV</button>
            <button onClick={() => { setEditingPole(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Add Pole
            </button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          meta={data?.meta}
          onPageChange={setPage}
          searchValue={search}
          onSearch={setSearch}
          loading={isLoading}
        />
      </div>
    </AppShell>
  );
}
