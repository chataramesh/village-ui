export enum SchoolType {
  SCHOOL = 'SCHOOL',
  COLLEGE = 'COLLEGE',
  UNIVERSITY = 'UNIVERSITY',
  INSTITUTE = 'INSTITUTE',
  ACADEMY = 'ACADEMY',
  TRAINING_CENTER = 'TRAINING_CENTER'
}

export interface Village {
  id?: string;
  name?: string;
}

export interface User {
  id?: string;
  name?: string;
}

export interface School {
  id?: string;
  name: string;
  description?: string;
  type: SchoolType;
  village: Village;
  owner: User;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  studentCapacity?: number;
  currentStudents?: number;
  principalName?: string;
  affiliation?: string;
  registrationNumber?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SchoolRequest {
  name: string;
  description?: string;
  type: SchoolType;
  villageId: string;
  ownerId: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  studentCapacity?: number;
  principalName?: string;
  affiliation?: string;
  registrationNumber?: string;
}

export interface SchoolResponse {
  id: string;
  name: string;
  description?: string;
  type: SchoolType;
  villageName: string;
  ownerName: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  studentCapacity?: number;
  currentStudents?: number;
  principalName?: string;
  affiliation?: string;
  registrationNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
