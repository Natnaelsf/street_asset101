'use client';

import { useQuery } from '@tanstack/react-query';
import AppShell from '@/components/layout/AppShell';
import KpiCard from '@/components/ui/KpiCard';
import PoleMap from '@/components/maps/PoleMap';
import { dashboardApi, polesApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Lightbulb, Wrench, Phone, BarChart3, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDateTime } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#a855f7'];

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: overview } = useQuery({ queryKey: ['dashboard-overview'], queryFn: () => dashboardApi.overview().then(r => r.data) });
  const { data: regional } = useQuery({ queryKey: ['dashboard-regional'], queryFn: () => dashboardApi.regionalComparison().then(r => r.data) });
  const { data: maintenanceStats } = useQuery({ queryKey: ['dashboard-maintenance'], queryFn: () => dashboardApi.maintenanceStats().then(r => r.data) });
  const { data: activities } = useQuery({ queryKey: ['dashboard-activities'], queryFn: () => dashboardApi.recentActivities().then(r => r.data) });
  const { data: poles } = useQuery({ queryKey: ['poles-gis'], queryFn: () => polesApi.getGis().then(r => r.data) });

  const overviewData = overview || { totalPoles: 0, activePoles: 0, damagedPoles: 0, totalIncidents: 0, openIncidents: 0, totalWorkOrders: 0, pendingWorkOrders: 0, completedWorkOrders: 0, poleHealthRate: 0 };
  const regionalData = regional || [];
  const maintenanceData = maintenanceStats || [];

  const pieData = maintenanceData.map((s: any) => ({ name: s.status, value: s.count }));
  const barData = regionalData.map((r: any) => ({ name: r.name, poles: r.poleCount }));

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.firstName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Total Poles" value={overviewData.totalPoles} icon={Lightbulb} />
          <KpiCard title="Active Poles" value={overviewData.activePoles} icon={Activity} subtitle="Health rate: {overviewData.poleHealthRate}%" />
          <KpiCard title="Damaged Poles" value={overviewData.damagedPoles} icon={AlertTriangle} />
          <KpiCard title="Pole Health" value={`${overviewData.poleHealthRate}%`} icon={CheckCircle} />
          <KpiCard title="Open Incidents" value={overviewData.openIncidents} icon={Phone} />
          <KpiCard title="Pending Work Orders" value={overviewData.pendingWorkOrders} icon={Clock} />
          <KpiCard title="Completed Work Orders" value={overviewData.completedWorkOrders} icon={CheckCircle} />
          <KpiCard title="Total Work Orders" value={overviewData.totalWorkOrders} icon={Wrench} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-lg font-semibold mb-4">GIS Map Overview</h3>
            <PoleMap poles={poles || []} height="400px" />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-lg font-semibold mb-4">Maintenance Status</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label>
                    {pieData.map((_: any, idx: number) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-500">No data available</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-lg font-semibold mb-4">Regional Pole Distribution</h3>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="poles" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-500">No data available</p>}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
            <div className="space-y-3">
              {(activities || []).slice(0, 8).map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{log.user?.firstName} {log.user?.lastName} - {log.action}</p>
                    <p className="text-xs text-gray-500">{log.entity} • {formatDateTime(log.createdAt)}</p>
                  </div>
                </div>
              ))}
              {(!activities || activities.length === 0) && <p className="text-sm text-gray-500">No recent activities</p>}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
