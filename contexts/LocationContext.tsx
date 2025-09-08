import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import type { LocationObject } from 'expo-location';

const LOCATION_TASK_NAME = 'background-location-task';

interface LocationState {
  location: LocationObject | null;
  hasPermission: boolean;
  isTracking: boolean;
  error: string | null;
}

interface LocationContextValue extends LocationState {
  requestPermission: () => Promise<void>;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

type LocationAction =
  | { type: 'SET_LOCATION'; payload: LocationObject | null }
  | { type: 'SET_PERMISSION'; payload: boolean }
  | { type: 'SET_TRACKING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const locationReducer = (state: LocationState, action: LocationAction): LocationState => {
  switch (action.type) {
    case 'SET_LOCATION':
      return { ...state, location: action.payload };
    case 'SET_PERMISSION':
      return { ...state, hasPermission: action.payload };
    case 'SET_TRACKING':
      return { ...state, isTracking: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// Define the background location task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }
  
  if (data) {
    const { locations } = data as { locations: LocationObject[] };
    // Handle location updates in background
    // This is where you would process geofence checks, etc.
    console.log('Background location update:', locations);
  }
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(locationReducer, {
    location: null,
    hasPermission: false,
    isTracking: false,
    error: null,
  });

  // Check permission status on mount
  useEffect(() => {
    checkPermission();
  }, []);

  // Get current location when permission is granted
  useEffect(() => {
    if (state.hasPermission && !state.location) {
      getCurrentLocation();
    }
  }, [state.hasPermission]);

  const checkPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      dispatch({ type: 'SET_PERMISSION', payload: status === 'granted' });
    } catch (error) {
      console.error('Error checking location permission:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to check location permission' });
    }
  };

  const requestPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const hasPermission = status === 'granted';
      
      dispatch({ type: 'SET_PERMISSION', payload: hasPermission });
      
      if (hasPermission) {
        // Also request background permission for geofencing
        const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus.status !== 'granted') {
          console.warn('Background location permission denied');
        }
      }
      
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error requesting location permission:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to request location permission' });
      throw error;
    }
  };

  const getCurrentLocation = async () => {
    try {
      if (!state.hasPermission) {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      dispatch({ type: 'SET_LOCATION', payload: location });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error getting current location:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to get current location' });
    }
  };

  const startTracking = async () => {
    try {
      if (!state.hasPermission) {
        throw new Error('Location permission not granted');
      }

      // Start foreground location tracking
      const { status } = await Location.requestBackgroundPermissionsAsync();
      
      if (status === 'granted') {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.High,
          timeInterval: 30000, // 30 seconds
          distanceInterval: 10, // 10 meters
        });
        
        dispatch({ type: 'SET_TRACKING', payload: true });
      }
      
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error starting location tracking:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start location tracking' });
      throw error;
    }
  };

  const stopTracking = async () => {
    try {
      const hasStarted = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
      dispatch({ type: 'SET_TRACKING', payload: false });
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error stopping location tracking:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to stop location tracking' });
    }
  };

  return (
    <LocationContext.Provider
      value={{
        ...state,
        requestPermission,
        startTracking,
        stopTracking,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

export { LocationContext }