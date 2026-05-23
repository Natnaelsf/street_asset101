'use client';

import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { reportsApi } from '@/lib/api';
import { downloadBlob } from '@/lib/utils';
import { FileText, Download, BarChart3, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

const reportTypes = [
  { id: 'pole-inventory', label: 'Pole Inventory Report', icon: FileText, description: 'Complete list of all registered street light poles' },
  { id: 'maintenance', label: 'Maintenance Report', icon: BarChart3, description: 'Work orders and maintenance activities' },
  { id: 'incidents', label: 'Incident Report', icon: FileSpreadsheet, description: 'Call center tickets and incident logs' },
];

export default function ReportsPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (report: string, format: 'pdf' | 'excel' | 'csv') => {
    setLoading(`${report}-${format}`);
    try {
      let res;
      switch (report) {
        case 'pole-inventory':
          res = await reportsApi.poleInventory({ format });
          break;
        case 'maintenance':
          res = await reportsApi.maintenance({ format });
          break;
        case 'incidents':
          res = await reportsApi.incidents({ format });
          break;
      }
      if (res) {
        const ext = format === 'excel' ? 'xlsx' : format;
        downloadBlob(res.data, `${report}-report.${ext}`);
        toast.success(`${format.toUpperCase()} report downloaded`);
      }
    } catch { toast.error('Failed to generate report'); }
    finally { setLoading(null); }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-gray-500">Generate and download reports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reportTypes.map((report) => (
            <div key={report.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
              <report.icon className="h-10 w-10 text-blue-500" />
              <div>
                <h3 className="font-semibold">{report.label}</h3>
                <p className="text-sm text-gray-500">{report.description}</p>
              </div>
              <div className="flex gap-2">
                {(['pdf', 'excel', 'csv'] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() => handleExport(report.id, format)}
                    disabled={loading === `${report.id}-${format}`}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                  >
                    <Download className="h-3 w-3" />
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="font-semibold mb-4">Regional Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['NORTH', 'SOUTH', 'WEST', 'EAST'].map((region) => (
              <div key={region} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-medium">{region} Region</p>
                <p className="text-xs text-gray-500 mt-1">Performance data available in exported reports</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
