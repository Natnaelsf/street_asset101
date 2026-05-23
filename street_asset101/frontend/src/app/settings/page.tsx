'use client';

import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/lib/auth-context';
import { getRoleLabel } from '@/lib/utils';
import { User, Shield, Bell } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-blue-500" />
            <h2 className="text-lg font-semibold">Profile</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">First Name</label>
              <p className="font-medium">{user?.firstName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Last Name</label>
              <p className="font-medium">{user?.lastName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Email</label>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Role</label>
              <p className="font-medium">{user?.role ? getRoleLabel(user.role) : '-'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Region</label>
              <p className="font-medium">{user?.region || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Phone</label>
              <p className="font-medium">{user?.phone || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-green-500" />
            <h2 className="text-lg font-semibold">Security</h2>
          </div>
          <p className="text-sm text-gray-500">Password management and security settings</p>
          <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Change Password</button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-purple-500" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          <p className="text-sm text-gray-500">Configure your notification preferences</p>
          <div className="space-y-3">
            {['Approval Requests', 'Work Order Assignments', 'Completion Reports', 'Inventory Alerts'].map((item) => (
              <label key={item} className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
