export enum IncidentStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  ESCALATED = 'ESCALATED',
  CLOSED = 'CLOSED'
}

export enum IncidentPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum IncidentCategory {
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  HEALTH = 'HEALTH',
  EDUCATION = 'EDUCATION',
  SECURITY = 'SECURITY',
  BANKING = 'BANKING',
  AGRICULTURE = 'AGRICULTURE',
  TRANSPORT = 'TRANSPORT',
  WATER_SUPPLY = 'WATER_SUPPLY',
  ELECTRICITY = 'ELECTRICITY',
  SANITATION = 'SANITATION',
  ENVIRONMENT = 'ENVIRONMENT',
  SOCIAL = 'SOCIAL',
  OTHER = 'OTHER'
}

export enum LocationType {
  SCHOOL = 'SCHOOL',
  HOSPITAL = 'HOSPITAL',
  GOVERNMENT_OFFICE = 'GOVERNMENT_OFFICE',
  COMMUNITY_CENTER = 'COMMUNITY_CENTER',
  MARKET = 'MARKET',
  RESIDENTIAL_AREA = 'RESIDENTIAL_AREA',
  INDUSTRIAL_AREA = 'INDUSTRIAL_AREA',
  PUBLIC_SPACE = 'PUBLIC_SPACE',
  OTHER = 'OTHER'
}

export interface Incident {
  id?: string;
  title: string;
  description: string;
  category: IncidentCategory;
  priority: IncidentPriority;
  status?: IncidentStatus;
  location: string;
  locationType: LocationType;
  reportedBy: string;
  contactInfo: string;
  urgencyReason?: string;
  assignedTo?: string;
  escalatedTo?: string;
  escalationLevel?: string;
  resolution?: string;
  requiresFollowUp?: boolean;
  estimatedResolutionTime?: string;
  actualResolutionTime?: string;
  createdAt?: string;
  updatedAt?: string;
  closedAt?: string;
}

export interface DashboardSummary {
  totalIncidents: number;
  openIncidents: number;
  inProgressIncidents: number;
  resolvedIncidents: number;
  escalatedIncidents: number;
  recentIncidents: Incident[];
  pendingIncidents: Incident[];
}

export interface IncidentFilters {
  status?: IncidentStatus;
  category?: IncidentCategory;
  priority?: IncidentPriority;
  location?: string;
  locationType?: LocationType;
  search?: string;
}
