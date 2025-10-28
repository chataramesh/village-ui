export interface Event {
  id?: string;
  name: string;
  description?: string;
  startTime: string; // ISO date string format
  endTime: string;   // ISO date string format
  place: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  village: any;
}

export interface EventStats {
  totalEvents: number;
  activeEvents: number;
  upcomingEvents: number;
  pastEvents: number;
}
