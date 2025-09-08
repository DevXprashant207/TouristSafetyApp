import type { Geofence } from '@/types';

/**
 * Calculate distance between two geographic points using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1.latitude * Math.PI) / 180; // φ, λ in radians
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Check if a point is inside a geofence
 */
export function isInsideGeofence(
  point: { latitude: number; longitude: number },
  geofence: Geofence
): boolean {
  const distance = calculateDistance(point, geofence);
  return distance <= geofence.radius;
}

/**
 * Check if a point is inside any of the provided geofences
 */
export function checkGeofenceViolations(
  point: { latitude: number; longitude: number },
  geofences: Geofence[]
): Geofence[] {
  return geofences.filter(geofence => isInsideGeofence(point, geofence));
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
}

/**
 * Get geofence status based on current location
 */
export function getGeofenceStatus(
  currentLocation: { latitude: number; longitude: number } | null,
  geofence: Geofence
): { inside: boolean; distance: number; formatted: string } {
  if (!currentLocation) {
    return { inside: false, distance: 0, formatted: 'Unknown' };
  }

  const distance = calculateDistance(currentLocation, geofence);
  const inside = distance <= geofence.radius;
  const formatted = formatDistance(distance);

  return { inside, distance, formatted };
}