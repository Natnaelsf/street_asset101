import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    DAMAGED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    UNDER_MAINTENANCE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    DECOMMISSIONED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    OPEN: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    ASSIGNED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    REVISION_REQUESTED: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800',
    GOOD: 'bg-green-100 text-green-800',
    FAIR: 'bg-blue-100 text-blue-800',
    POOR: 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    DIRECTOR_GENERAL: 'Director General',
    ENGINEERING_REGULATORY_DDG: 'Engineering Regulatory DDG',
    PROCUREMENT_DIRECTOR: 'Procurement Director',
    DESIGN_PROJECT_DIRECTOR: 'Design & Project Director',
    LICENSE_PERMIT_DDG: 'License & Permit DDG',
    ICT_DIRECTOR: 'ICT Director',
    LICENSE_CUSTOMER_SERVICE_DIRECTOR: 'License & Customer Service Director',
    OPERATION_MAINTENANCE_DDG: 'Operation & Maintenance DDG',
    OPERATION_MAINTENANCE_DIRECTOR: 'Operation & Maintenance Director',
    MAINTENANCE_CENTER_DIRECTOR: 'Maintenance Center Director',
    NORTH_REGION_DIRECTOR: 'North Region Director',
    SOUTH_REGION_DIRECTOR: 'South Region Director',
    WEST_REGION_DIRECTOR: 'West Region Director',
    EAST_REGION_DIRECTOR: 'East Region Director',
    CALL_CENTER_AGENT: 'Call Center Agent',
    MAINTENANCE_ENGINEER: 'Maintenance Engineer',
    SUPERVISOR: 'Supervisor',
  };
  return labels[role] || role;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
