export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface SignUpData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Alert {
  id: string;
  type: 'PANIC_BUTTON' | 'GEOFENCE_VIOLATION' | 'AI_MONITORING';
  severity: AlertSeverity;
  message: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DashboardData {
  activeTourists: number;
  alertsToday: number;
  highAlerts: number;
  mediumAlerts: number;
  lowAlerts: number;
  pendingIncidents: number;
  resolvedIncidents: number;
  safetyScore: number;
  avgSafetyScore: number;
  avgResponseTime: number;
  mostVisitedRegion: string;
  activeTouristsChart: number[];
}

export interface Geofence {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  createdAt: string;
}

export interface GeofenceAlert {
  id: string;
  geofenceId: string;
  geofenceName: string;
  message: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  location: string;
}