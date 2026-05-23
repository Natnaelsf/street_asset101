'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppShell from '@/components/layout/AppShell';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { workOrdersApi, maintenanceApi } from '@/lib/api';
import { WorkOrder } from '@/types';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { Wrench, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MaintenancePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['work-orders', page, search],
    queryFn: () => workOrdersApi.list({ page, limit: 10, search }).then(r => r.data),
  });

  const { data: stats } = useQuery({
    queryKey: ['maintenance-stats'],
    queryFn: () => maintenanceApi.stats().then(r => r.data),
  });

  const reportMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => maintenanceApi.submitReport(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['work-orders'] }); toast.success('Report submitted'); setShowReportForm(false); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => maintenanceApi.reviewReport(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['work-orders'] }); toast.success('Review submitted'); },
  });

  const approveIssueMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => maintenanceApi.approveIssue(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['work-orders'] }); toast.success('Updated'); },
  });

  const columns = [
    { key: 'workOrderId', header: 'WO ID', render: (w: WorkOrder) => <span className="font-mono font-medium">{w.workOrderId}</span> },
    { key: 'title', header: 'Title' },
    { key: 'type', header: 'Type', render: (w: WorkOrder) => <StatusBadge status={w.type} /> },
    { key: 'priority', header: 'Priority', render: (w: WorkOrder) => <StatusBadge status={w.priority} /> },
    { key: 'status', header: 'Status', render: (w: WorkOrder) => <StatusBadge status={w.status} /> },
    { key: 'assignedTo', header: 'Assigned To', render: (w: WorkOrder) => w.assignedTo ? `${w.assignedTo.firstName} ${w.assignedTo.lastName}` : '-' },
    { key: 'dueDate', header: 'Due Date', render: (w: WorkOrder) => w.dueDate ? formatDate(w.dueDate) : '-' },
    {
      key: 'actions', header: 'Actions', render: (w: WorkOrder) => (
        <div className="flex gap-2">
          {(user?.role === 'MAINTENANCE_ENGINEER' && w.status === 'ASSIGNED') && (
            <button onClick={(e) => { e.stopPropagation(); setSelectedWO(w); setShowReportForm(true); }} className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">Submit Report</button>
          )}
          {(user?.role === 'OPERATION_MAINTENANCE_DIRECTOR' || user?.role === 'OPERATION_MAINTENANCE_DDG') && (
            <button onClick={(e) => { e.stopPropagation(); setSelectedWO(w); }} className="p-1 hover:text-blue-600"><CheckCircle className="h-4 w-4" /></button>
          )}
        </div>
      ),
    },
  ];

  const isEngineer = user?.role === 'MAINTENANCE_ENGINEER';
  const isDirectorOrDDG = user?.role === 'OPERATION_MAINTENANCE_DIRECTOR' || user?.role === 'OPERATION_MAINTENANCE_DDG';
  const isSupervisor = user?.role === 'SUPERVISOR';

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Maintenance Management</h1>
            <p className="text-sm text-gray-500">Workflow and work order management</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="kpi-card"><p className="text-sm text-gray-500">Total Issues</p><p className="text-2xl font-bold">{stats?.totalIssues || 0}</p></div>
          <div className="kpi-card"><p className="text-sm text-gray-500">Work Orders</p><p className="text-2xl font-bold">{stats?.totalWorkOrders || 0}</p></div>
          <div className="kpi-card"><p className="text-sm text-gray-500">Completed</p><p className="text-2xl font-bold text-green-600">{stats?.completedWorkOrders || 0}</p></div>
          <div className="kpi-card"><p className="text-sm text-gray-500">Completion Rate</p><p className="text-2xl font-bold">{stats?.completionRate || 0}%</p></div>
        </div>

        {isSupervisor && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Supervisor Actions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Create site survey issues to start the maintenance workflow</p>
          </div>
        )}

        <DataTable
          columns={columns}
          data={data?.data || []}
          meta={data?.meta}
          onPageChange={setPage}
          searchValue={search}
          onSearch={setSearch}
          loading={isLoading}
        />

        {showReportForm && selectedWO && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-lg w-full space-y-4">
              <h3 className="text-lg font-bold">Submit Report - {selectedWO.workOrderId}</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                reportMutation.mutate({ id: selectedWO.id, data: { description: formData.get('description'), inventoryUsed: formData.get('inventoryUsed') } });
              }}>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Work Description</label>
                    <textarea name="description" rows={3} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Inventory Used (JSON)</label>
                    <textarea name="inventoryUsed" rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900" placeholder='[{"name":"LED Bulb","quantity":2}]' />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Submit</button>
                    <button type="button" onClick={() => setShowReportForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
