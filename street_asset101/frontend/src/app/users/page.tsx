'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppShell from '@/components/layout/AppShell';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { usersApi } from '@/lib/api';
import { User } from '@/types';
import { getRoleLabel, formatDateTime } from '@/lib/utils';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => usersApi.list({ page, limit: 10, search }).then(r => r.data),
  });

  const { data: permissions } = useQuery({
    queryKey: ['user-permissions'],
    queryFn: () => usersApi.permissions().then(r => r.data),
  });

  const columns = [
    { key: 'name', header: 'Name', render: (u: User) => <span className="font-medium">{u.firstName} {u.lastName}</span> },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone', render: (u: User) => u.phone || '-' },
    { key: 'role', header: 'Role', render: (u: User) => <StatusBadge status={u.role} /> },
    { key: 'region', header: 'Region', render: (u: User) => u.region || '-' },
    { key: 'isActive', header: 'Status', render: (u: User) => u.isActive ? <StatusBadge status="ACTIVE" /> : <StatusBadge status="INACTIVE" /> },
    { key: 'lastLogin', header: 'Last Login', render: (u: User) => u.lastLogin ? formatDateTime(u.lastLogin) : 'Never' },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-gray-500">Manage system users and roles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="kpi-card"><p className="text-2xl font-bold">{data?.meta?.total || 0}</p><p className="text-sm text-gray-500">Total Users</p></div>
          <div className="kpi-card"><p className="text-2xl font-bold">{Object.keys(permissions || {}).length}</p><p className="text-sm text-gray-500">Roles</p></div>
          <div className="kpi-card"><p className="text-2xl font-bold">{(permissions as any)?.DIRECTOR_GENERAL?.permissions?.length || 0}</p><p className="text-sm text-gray-500">Max Permissions</p></div>
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
