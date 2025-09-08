import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from './Button';
import { getGeofenceStatus, formatDistance } from '@/utils/geofence';
import type { Geofence } from '@/types';
import type { LocationObject } from 'expo-location';

interface GeofenceCardProps {
  geofence: Geofence;
  onRemove: () => void;
  currentLocation: LocationObject | null;
}

export function GeofenceCard({ geofence, onRemove, currentLocation }: GeofenceCardProps) {
  const status = getGeofenceStatus(
    currentLocation ? {
      latitude: currentLocation.coords.latitude,
      longitude: currentLocation.coords.longitude,
    } : null,
    geofence
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialIcons
            name="location-on"
            size={20}
            color={status.inside ? '#ef4444' : '#10b981'}
          />
          <Text style={styles.name}>{geofence.name}</Text>
        </View>
        <Button
          title="Remove"
          onPress={onRemove}
          variant="outline"
          size="small"
          style={styles.removeButton}
          textStyle={styles.removeButtonText}
        />
      </View>

      <Text style={styles.description}>{geofence.description}</Text>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Location:</Text>
          <Text style={styles.detailValue}>
            {geofence.latitude.toFixed(6)}, {geofence.longitude.toFixed(6)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Radius:</Text>
          <Text style={styles.detailValue}>{formatDistance(geofence.radius)}</Text>
        </View>

        {currentLocation && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Distance:</Text>
            <Text style={[styles.detailValue, status.inside && styles.insideText]}>
              {status.formatted} {status.inside && '(INSIDE ZONE)'}
            </Text>
          </View>
        )}
      </View>

      {status.inside && (
        <View style={styles.warningBanner}>
          <MaterialIcons name="warning" size={16} color="#dc2626" />
          <Text style={styles.warningText}>You are currently inside this restricted area!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  removeButton: {
    borderColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 4,
    minHeight: 28,
  },
  removeButtonText: {
    color: '#ef4444',
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'monospace',
  },
  insideText: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
    marginLeft: 8,
  },
});