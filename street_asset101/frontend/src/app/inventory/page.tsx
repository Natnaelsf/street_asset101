'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppShell from '@/components/layout/AppShell';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { inventoryApi } from '@/lib/api';
import { InventoryItem } from '@/types';
import { Package, AlertTriangle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const [view, setView] = useState<'items' | 'requests'>('items');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: items } = useQuery({ queryKey: ['inventory-items'], queryFn: () => inventoryApi.items().then(r => r.data) });
  const { data: requests, isLoading: reqLoading } = useQuery({ queryKey: ['inventory-requests', page], queryFn: () => inventoryApi.requests({ page, limit: 10 }).then(r => r.data) });
  const { data: lowStock } = useQuery({ queryKey: ['inventory-low-stock'], queryFn: () => inventoryApi.lowStock().then(r => r.data) });

  const columns = [
    { key: 'name', header: 'Item Name', render: (i: InventoryItem) => <span className="font-medium">{i.name}</span> },
    { key: 'quantity', header: 'Quantity', render: (i: InventoryItem) => (
      <span className={i.quantity <= i.minQuantity ? 'text-red-600 font-semibold' : ''}>{i.quantity}</span>
    )},
    { key: 'unit', header: 'Unit' },
    { key: 'minQuantity', header: 'Min Stock' },
    { key: 'location', header: 'Location' },
    { key: 'status', header: 'Status', render: (i: InventoryItem) => i.quantity <= i.minQuantity ? <StatusBadge status="CRITICAL" /> : <StatusBadge status="GOOD" /> },
  ];

  const requestColumns = [
    { key: 'requestId', header: 'Request ID', render: (r: any) => <span className="font-mono font-medium">{r.requestId}</span> },
    { key: 'title', header: 'Title' },
    { key: 'status', header: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
    { key: 'requestedBy', header: 'Requested By', render: (r: any) => r.requestedBy ? `${r.requestedBy.firstName} ${r.requestedBy.lastName}` : '-' },
    { key: 'createdAt', header: 'Created', render: (r: any) => new Date(r.createdAt).toLocaleDateString() },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Inventory Management</h1>
            <p className="text-sm text-gray-500">Track spare parts and stock levels</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView('items')} className={`px-4 py-2 text-sm rounded-lg ${view === 'items' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 border'}`}>Items</button>
            <button onClick={() => setView('requests')} className={`px-4 py-2 text-sm rounded-lg ${view === 'requests' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 border'}`}>Requests</button>
          </div>
        </div>

        {(lowStock || []).length > 0 && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700 dark:text-red-300">{lowStock.length} items are below minimum stock level!</p>
          </div>
        )}

        {view === 'items' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="kpi-card"><Package className="h-8 w-8 text-blue-500 mb-2" /><p className="text-2xl font-bold">{(items || []).length}</p><p className="text-sm text-gray-500">Total Items</p></div>
              <div className="kpi-card"><AlertTriangle className="h-8 w-8 text-red-500 mb-2" /><p className="text-2xl font-bold">{(lowStock || []).length}</p><p className="text-sm text-gray-500">Low Stock Items</p></div>
              <div className="kpi-card"><p className="text-2xl font-bold">{(items || []).reduce((sum: number, i: InventoryItem) => sum + i.quantity, 0)}</p><p className="text-sm text-gray-500">Total Units</p></div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    {['Item', 'Qty', 'Unit', 'Min Stock', 'Location', 'Status'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {(items || []).map((item: InventoryItem) => (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3"><span className={item.quantity <= item.minQuantity ? 'text-red-600 font-bold' : ''}>{item.quantity}</span></td>
                      <td className="px-4 py-3">{item.unit}</td>
                      <td className="px-4 py-3">{item.minQuantity}</td>
                      <td className="px-4 py-3">{item.location || '-'}</td>
                      <td className="px-4 py-3"><StatusBadge status={item.quantity <= item.minQuantity ? 'CRITICAL' : 'GOOD'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <DataTable
            columns={requestColumns}
            data={requests?.data || []}
            meta={requests?.meta}
            onPageChange={setPage}
            loading={reqLoading}
          />
        )}
      </div>
    </AppShell>
  );
}
