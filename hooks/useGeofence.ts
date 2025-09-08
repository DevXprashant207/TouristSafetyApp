import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocation } from './useLocation';
import { apiClient } from '@/services/apiClient';
import { calculateDistance } from '@/utils/geofence';
import type { Geofence, GeofenceAlert } from '@/types';

const GEOFENCES_KEY = 'user_geofences';
const GEOFENCE_ALERTS_KEY = 'geofence_alerts';

export function useGeofence() {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [alerts, setAlerts] = useState<GeofenceAlert[]>([]);
  const { location } = useLocation();

  // Load geofences from storage
  useEffect(() => {
    const loadGeofences = async () => {
      try {
        const stored = await AsyncStorage.getItem(GEOFENCES_KEY);
        if (stored) {
          setGeofences(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading geofences:', error);
      }
    };

    const loadAlerts = async () => {
      try {
        const stored = await AsyncStorage.getItem(GEOFENCE_ALERTS_KEY);
        if (stored) {
          setAlerts(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading geofence alerts:', error);
      }
    };

    loadGeofences();
    loadAlerts();
  }, []);

  // Save geofences to storage
  const saveGeofences = async (newGeofences: Geofence[]) => {
    try {
      await AsyncStorage.setItem(GEOFENCES_KEY, JSON.stringify(newGeofences));
    } catch (error) {
      console.error('Error saving geofences:', error);
    }
  };

  // Save alerts to storage
  const saveAlerts = async (newAlerts: GeofenceAlert[]) => {
    try {
      await AsyncStorage.setItem(GEOFENCE_ALERTS_KEY, JSON.stringify(newAlerts));
    } catch (error) {
      console.error('Error saving geofence alerts:', error);
    }
  };

  // Check geofences when location changes
  useEffect(() => {
    if (!location || geofences.length === 0) return;

    const currentLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    geofences.forEach(geofence => {
      const distance = calculateDistance(currentLocation, geofence);

      if (distance <= geofence.radius) {
        // User entered restricted area
        const alert: GeofenceAlert = {
          id: `geofence-${geofence.id}-${Date.now()}`,
          geofenceId: geofence.id,
          geofenceName: geofence.name,
          message: `Entered restricted area: ${geofence.name}`,
          timestamp: new Date().toISOString(),
          location: currentLocation,
        };

        setAlerts(prev => {
          const newAlerts = [alert, ...prev.slice(0, 49)]; // Keep last 50 alerts
          saveAlerts(newAlerts);
          return newAlerts;
        });

        // Send alert to backend
        apiClient.post('/alerts', {
          type: 'GEOFENCE_VIOLATION',
          severity: 'HIGH',
          message: alert.message,
          location: currentLocation,
          metadata: {
            geofenceId: geofence.id,
            geofenceName: geofence.name,
            distance: Math.round(distance),
          },
        }).catch(console.error);
      }
    });
  }, [location, geofences]);

  const addGeofence = async (geofenceData: Omit<Geofence, 'id'>) => {
    const newGeofence: Geofence = {
      ...geofenceData,
      id: `geofence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    const newGeofences = [...geofences, newGeofence];
    setGeofences(newGeofences);
    await saveGeofences(newGeofences);

    return newGeofence;
  };

  const removeGeofence = async (geofenceId: string) => {
    const newGeofences = geofences.filter(g => g.id !== geofenceId);
    setGeofences(newGeofences);
    await saveGeofences(newGeofences);
  };

  const clearAlerts = async () => {
    setAlerts([]);
    await AsyncStorage.removeItem(GEOFENCE_ALERTS_KEY);
  };

  return {
    geofences,
    alerts,
    addGeofence,
    removeGeofence,
    clearAlerts,
  };
}