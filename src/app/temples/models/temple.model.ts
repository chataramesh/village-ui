export enum TempleType {
  HINDU = 'HINDU',
  MUSLIM = 'MUSLIM',
  CHRISTIAN = 'CHRISTIAN',
  SIKH = 'SIKH',
  BUDDHIST = 'BUDDHIST',
  JAIN = 'JAIN',
  OTHER = 'OTHER'
}

export interface Village {
  id?: string;
  name?: string;
}

export interface User {
  id?: string;
  name?: string;
}

export interface Temple {
  id?: string;
  name: string;
  description?: string;
  type: TempleType;
  village: Village;
  owner: User;
  address?: string;
  phone?: string;
  email?: string;
  priestName?: string;
  caretakerName?: string;
  deity?: string;
  establishedYear?: string;
  registrationNumber?: string;
  timings?: string;
  specialDays?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TempleRequest {
  name: string;
  description?: string;
  type: TempleType;
  villageId: string;
  ownerId: string;
  address?: string;
  phone?: string;
  email?: string;
  priestName?: string;
  caretakerName?: string;
  deity?: string;
  establishedYear?: string;
  registrationNumber?: string;
  timings?: string;
  specialDays?: string;
}

export interface TempleResponse {
  id: string;
  name: string;
  description?: string;
  type: TempleType;
  villageName: string;
  ownerName: string;
  address?: string;
  phone?: string;
  email?: string;
  priestName?: string;
  caretakerName?: string;
  deity?: string;
  establishedYear?: string;
  registrationNumber?: string;
  timings?: string;
  specialDays?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
