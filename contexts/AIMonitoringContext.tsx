import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useLocation } from './LocationContext';
import { apiClient } from '@/services/apiClient';
import type { LocationObject } from 'expo-location';
import type { AlertSeverity } from '@/types';

interface AIAlert {
  id: string;
  type: 'INACTIVITY' | 'ROUTE_DEVIATION' | 'ANOMALY';
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface AIMonitoringState {
  isMonitoring: boolean;
  alerts: AIAlert[];
  lastActivity: Date | null;
  expectedRoute: { latitude: number; longitude: number }[] | null;
}

interface AIMonitoringContextValue extends AIMonitoringState {
  startMonitoring: () => void;
  stopMonitoring: () => void;
  setExpectedRoute: (route: { latitude: number; longitude: number }[]) => void;
  clearAlerts: () => void;
}

const AIMonitoringContext = createContext<AIMonitoringContextValue | undefined>(undefined);

type AIMonitoringAction =
  | { type: 'SET_MONITORING'; payload: boolean }
  | { type: 'ADD_ALERT'; payload: AIAlert }
  | { type: 'CLEAR_ALERTS' }
  | { type: 'UPDATE_ACTIVITY'; payload: Date }
  | { type: 'SET_EXPECTED_ROUTE'; payload: { latitude: number; longitude: number }[] | null };

const aiMonitoringReducer = (state: AIMonitoringState, action: AIMonitoringAction): AIMonitoringState => {
  switch (action.type) {
    case 'SET_MONITORING':
      return { ...state, isMonitoring: action.payload };
    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts.slice(0, 9)] }; // Keep last 10 alerts
    case 'CLEAR_ALERTS':
      return { ...state, alerts: [] };
    case 'UPDATE_ACTIVITY':
      return { ...state, lastActivity: action.payload };
    case 'SET_EXPECTED_ROUTE':
      return { ...state, expectedRoute: action.payload };
    default:
      return state;
  }
};

const INACTIVITY_THRESHOLD = 15 * 60 * 1000; // 15 minutes
const ROUTE_DEVIATION_THRESHOLD = 500; // 500 meters

export function AIMonitoringProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(aiMonitoringReducer, {
    isMonitoring: false,
    alerts: [],
    lastActivity: null,
    expectedRoute: null,
  });

  const { location } = useLocation();

  // Monitor for inactivity
  useEffect(() => {
    if (!state.isMonitoring) return;

    const interval = setInterval(() => {
      if (state.lastActivity) {
        const timeSinceLastActivity = Date.now() - state.lastActivity.getTime();
        
        if (timeSinceLastActivity > INACTIVITY_THRESHOLD) {
          const alert: AIAlert = {
            id: `inactivity-${Date.now()}`,
            type: 'INACTIVITY',
            severity: 'MEDIUM',
            message: `No activity detected for ${Math.round(timeSinceLastActivity / (1000 * 60))} minutes`,
            timestamp: new Date().toISOString(),
            location: location ? {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            } : undefined,
          };

          dispatch({ type: 'ADD_ALERT', payload: alert });
          
          // Send alert to backend
          apiClient.post('/alerts', {
            type: 'AI_MONITORING',
            severity: alert.severity,
            message: alert.message,
            location: alert.location,
            metadata: { alertType: 'INACTIVITY', duration: timeSinceLastActivity },
          }).catch(console.error);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [state.isMonitoring, state.lastActivity, location]);

  // Monitor for route deviation
  useEffect(() => {
    if (!state.isMonitoring || !state.expectedRoute || !location) return;

    const checkRouteDeviation = () => {
      const currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Find the closest point on the expected route
      let minDistance = Infinity;
      for (const routePoint of state.expectedRoute!) {
        const distance = calculateDistance(currentLocation, routePoint);
        if (distance < minDistance) {
          minDistance = distance;
        }
      }

      // If deviation is significant, create alert
      if (minDistance > ROUTE_DEVIATION_THRESHOLD) {
        const alert: AIAlert = {
          id: `route-deviation-${Date.now()}`,
          type: 'ROUTE_DEVIATION',
          severity: 'HIGH',
          message: `Route deviation detected: ${Math.round(minDistance)}m from expected path`,
          timestamp: new Date().toISOString(),
          location: currentLocation,
        };

        dispatch({ type: 'ADD_ALERT', payload: alert });
        
        // Send alert to backend
        apiClient.post('/alerts', {
          type: 'AI_MONITORING',
          severity: alert.severity,
          message: alert.message,
          location: alert.location,
          metadata: { alertType: 'ROUTE_DEVIATION', deviation: minDistance },
        }).catch(console.error);
      }
    };

    checkRouteDeviation();
  }, [location, state.isMonitoring, state.expectedRoute]);

  // Update last activity when location changes
  useEffect(() => {
    if (location && state.isMonitoring) {
      dispatch({ type: 'UPDATE_ACTIVITY', payload: new Date() });
    }
  }, [location, state.isMonitoring]);

  const startMonitoring = () => {
    dispatch({ type: 'SET_MONITORING', payload: true });
    dispatch({ type: 'UPDATE_ACTIVITY', payload: new Date() });
    
    // Simulate AI anomaly detection (random alerts for demo)
    const anomalyInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 2 minutes
        const anomalyTypes = ['Unusual crowd gathering', 'Suspicious activity detected', 'Weather alert'];
        const randomType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
        
        const alert: AIAlert = {
          id: `anomaly-${Date.now()}`,
          type: 'ANOMALY',
          severity: Math.random() < 0.3 ? 'HIGH' : 'LOW', // 30% high severity
          message: randomType,
          timestamp: new Date().toISOString(),
          location: location ? {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          } : undefined,
        };

        dispatch({ type: 'ADD_ALERT', payload: alert });
      }
    }, 120000); // Every 2 minutes

    // Store interval for cleanup
    (global as any).anomalyInterval = anomalyInterval;
  };

  const stopMonitoring = () => {
    dispatch({ type: 'SET_MONITORING', payload: false });
    
    // Clear anomaly detection interval
    if ((global as any).anomalyInterval) {
      clearInterval((global as any).anomalyInterval);
      (global as any).anomalyInterval = null;
    }
  };

  const setExpectedRoute = (route: { latitude: number; longitude: number }[] | null) => {
    dispatch({ type: 'SET_EXPECTED_ROUTE', payload: route });
  };

  const clearAlerts = () => {
    dispatch({ type: 'CLEAR_ALERTS' });
  };

  return (
    <AIMonitoringContext.Provider
      value={{
        ...state,
        startMonitoring,
        stopMonitoring,
        setExpectedRoute,
        clearAlerts,
      }}
    >
      {children}
    </AIMonitoringContext.Provider>
  );
}

export function useAIMonitoring() {
  const context = useContext(AIMonitoringContext);
  if (context === undefined) {
    throw new Error('useAIMonitoring must be used within an AIMonitoringProvider');
  }
  return context;
}

// Utility function to calculate distance between two coordinates
function calculateDistance(
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}