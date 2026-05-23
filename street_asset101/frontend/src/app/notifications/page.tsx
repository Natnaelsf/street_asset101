'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppShell from '@/components/layout/AppShell';
import { notificationsApi } from '@/lib/api';
import { Notification } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { Bell, CheckCheck, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list().then(r => r.data),
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notifications'] }); toast.success('All marked as read'); },
  });

  const typeIcons: Record<string, string> = {
    APPROVAL: '✅', REJECTION: '❌', ASSIGNMENT: '📋', COMPLETION: '✅', ALERT: '⚠️', ESCALATION: '🔺',
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-gray-500">
              {data?.meta?.unreadCount || 0} unread notifications
            </p>
          </div>
          {(data?.meta?.unreadCount || 0) > 0 && (
            <button onClick={() => markAllReadMutation.mutate()} className="flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-gray-900 border rounded-lg hover:bg-gray-50">
              <CheckCheck className="h-4 w-4" /> Mark All Read
            </button>
          )}
        </div>

        <div className="space-y-2">
          {(data?.data || []).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (data?.data || []).map((notification: Notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 p-4 rounded-xl border ${notification.isRead ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'}`}
              onClick={() => { if (!notification.isRead) markReadMutation.mutate(notification.id); }}
            >
              <span className="text-xl">{typeIcons[notification.type] || '🔔'}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm">{notification.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDateTime(notification.createdAt)}</p>
              </div>
              {!notification.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
