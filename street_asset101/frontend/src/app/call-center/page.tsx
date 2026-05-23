'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppShell from '@/components/layout/AppShell';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { incidentsApi } from '@/lib/api';
import { Incident } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { Phone, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CallCenterPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['incidents', page, search],
    queryFn: () => incidentsApi.list({ page, limit: 10, search }).then(r => r.data),
  });

  const { data: slaStats } = useQuery({
    queryKey: ['sla-stats'],
    queryFn: () => incidentsApi.slaStats().then(r => r.data),
  });

  const columns = [
    { key: 'ticketId', header: 'Ticket ID', render: (i: Incident) => <span className="font-mono font-medium">{i.ticketId}</span> },
    { key: 'callerName', header: 'Caller' },
    { key: 'phoneNumber', header: 'Phone' },
    { key: 'incidentType', header: 'Type', render: (i: Incident) => <StatusBadge status={i.incidentType} /> },
    { key: 'priority', header: 'Priority', render: (i: Incident) => <StatusBadge status={i.priority} /> },
    { key: 'status', header: 'Status', render: (i: Incident) => <StatusBadge status={i.status} /> },
    { key: 'createdAt', header: 'Created', render: (i: Incident) => formatDateTime(i.createdAt) },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Call Center</h1>
            <p className="text-sm text-gray-500">Incident and complaint management</p>
          </div>
          <Link href="/call-center/new-ticket" className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Ticket
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="kpi-card">
            <div className="flex items-center gap-3">
              <Phone className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">SLA Compliance</p>
                <p className="text-2xl font-bold">{slaStats?.complianceRate || 0}%</p>
              </div>
            </div>
          </div>
          <div className="kpi-card">
            <p className="text-sm text-gray-500">SLA Met</p>
            <p className="text-2xl font-bold text-green-600">{slaStats?.met || 0}</p>
          </div>
          <div className="kpi-card">
            <p className="text-sm text-gray-500">SLA Breached</p>
            <p className="text-2xl font-bold text-red-600">{slaStats?.breached || 0}</p>
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
