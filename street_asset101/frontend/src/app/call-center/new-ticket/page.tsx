'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { incidentsApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function NewTicketPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    callerName: '', phoneNumber: '', incidentType: 'POLE_MAINTENANCE', description: '', location: '', priority: 'MEDIUM', poleId: '',
  });

  const mutation = useMutation({
    mutationFn: (data: any) => incidentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Ticket created successfully');
      router.push('/call-center');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create ticket'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  const updateField = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">New Incident Ticket</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Caller Name</label>
              <input required value={form.callerName} onChange={(e) => updateField('callerName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input required value={form.phoneNumber} onChange={(e) => updateField('phoneNumber', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Incident Type</label>
              <select value={form.incidentType} onChange={(e) => updateField('incidentType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                <option value="POLE_MAINTENANCE">Pole Maintenance</option>
                <option value="CUSTOMER_COMPLAINT">Customer Complaint</option>
                <option value="SERVICE_FEEDBACK">Service Feedback</option>
                <option value="OFFICE_INQUIRY">Office Inquiry</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select value={form.priority} onChange={(e) => updateField('priority', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea rows={4} required value={form.description} onChange={(e) => updateField('description', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input value={form.location} onChange={(e) => updateField('location', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pole ID (optional)</label>
              <input value={form.poleId} onChange={(e) => updateField('poleId', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={mutation.isPending} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {mutation.isPending ? 'Creating...' : 'Create Ticket'}
            </button>
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
