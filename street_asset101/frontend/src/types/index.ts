export enum UserRole {
  DIRECTOR_GENERAL = 'DIRECTOR_GENERAL',
  ENGINEERING_REGULATORY_DDG = 'ENGINEERING_REGULATORY_DDG',
  PROCUREMENT_DIRECTOR = 'PROCUREMENT_DIRECTOR',
  DESIGN_PROJECT_DIRECTOR = 'DESIGN_PROJECT_DIRECTOR',
  LICENSE_PERMIT_DDG = 'LICENSE_PERMIT_DDG',
  ICT_DIRECTOR = 'ICT_DIRECTOR',
  LICENSE_CUSTOMER_SERVICE_DIRECTOR = 'LICENSE_CUSTOMER_SERVICE_DIRECTOR',
  OPERATION_MAINTENANCE_DDG = 'OPERATION_MAINTENANCE_DDG',
  OPERATION_MAINTENANCE_DIRECTOR = 'OPERATION_MAINTENANCE_DIRECTOR',
  MAINTENANCE_CENTER_DIRECTOR = 'MAINTENANCE_CENTER_DIRECTOR',
  NORTH_REGION_DIRECTOR = 'NORTH_REGION_DIRECTOR',
  SOUTH_REGION_DIRECTOR = 'SOUTH_REGION_DIRECTOR',
  WEST_REGION_DIRECTOR = 'WEST_REGION_DIRECTOR',
  EAST_REGION_DIRECTOR = 'EAST_REGION_DIRECTOR',
  CALL_CENTER_AGENT = 'CALL_CENTER_AGENT',
  MAINTENANCE_ENGINEER = 'MAINTENANCE_ENGINEER',
  SUPERVISOR = 'SUPERVISOR',
}

export enum RegionName {
  NORTH = 'NORTH',
  SOUTH = 'SOUTH',
  WEST = 'WEST',
  EAST = 'EAST',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  region?: RegionName;
  subcity?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Pole {
  id: string;
  streetLightId: string;
  latitude: number;
  longitude: number;
  lampType?: string;
  poleMaterial?: string;
  poleCondition?: string;
  status: string;
  maintenanceStatus: string;
  regionId: string;
  subcityId?: string;
  installationDate?: string;
  photoUrl?: string;
  remarks?: string;
  region?: Region;
  subcity?: Subcity;
  createdBy?: { id: string; firstName: string; lastName: string };
  createdAt: string;
}

export interface Region {
  id: string;
  name: RegionName;
  code: string;
  subcities?: Subcity[];
  _count?: { poles: number };
}

export interface Subcity {
  id: string;
  name: string;
  regionId: string;
  region?: Region;
}

export interface Incident {
  id: string;
  ticketId: string;
  callerName: string;
  phoneNumber: string;
  incidentType: string;
  description: string;
  location?: string;
  priority: string;
  status: string;
  poleId?: string;
  reportedBy?: User;
  assignedTo?: User;
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  workOrderId: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  priority: string;
  incidentId?: string;
  poleId?: string;
  assignedTo?: User;
  assignedBy?: User;
  region?: Region;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  location?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unreadCount?: number;
  };
}

export interface DashboardOverview {
  totalPoles: number;
  activePoles: number;
  damagedPoles: number;
  totalIncidents: number;
  openIncidents: number;
  totalWorkOrders: number;
  pendingWorkOrders: number;
  completedWorkOrders: number;
  poleHealthRate: number;
}
