export enum EntityStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  TEMPORARILY_CLOSED = 'TEMPORARILY_CLOSED',
  PERMANENTLY_CLOSED = 'PERMANENTLY_CLOSED'
}

export enum EntityType {
  GOVT_HOSPITAL = 'GOVT_HOSPITAL',
  SHOP = 'SHOP',
  MRO_OFFICE = 'MRO_OFFICE',
  POLICE_STATION = 'POLICE_STATION',
  POST_OFFICE = 'POST_OFFICE',
  SCHOOL = 'SCHOOL',
  BANK = 'BANK',
  PHARMACY = 'PHARMACY',
  COMMUNITY_CENTER = 'COMMUNITY_CENTER'
}

export interface Entity {
  id?: string;
  name: string;
  description?: string;
  type: EntityType;
  status: EntityStatus;
  address?: string;
  contactNumber?: string;
  email?: string;
  openingTime?: string;
  closingTime?: string;
  capacity?: number;
  isActive: boolean;
  owner?: any; // User object or ID
  villageId?: string;
  villageName?: string;
  subscriptionCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
  village?: {
    id: string;
    name: string;
  };
}
