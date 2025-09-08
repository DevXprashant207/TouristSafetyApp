import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGeofence } from '@/hooks/useGeofence';
import { useLocation } from '@/hooks/useLocation';
import { useI18n } from '@/hooks/useI18n';
import { Button } from '@/components/Button';
import { GeofenceCard } from '@/components/GeofenceCard';
import { AddGeofenceModal } from '@/components/AddGeofenceModal';
import { MaterialIcons } from '@expo/vector-icons';
import type { Geofence } from '@/types';

export default function GeofenceScreen() {
  const { t } = useI18n();
  const { location, hasPermission, requestPermission } = useLocation();
  const { geofences, addGeofence, removeGeofence, alerts } = useGeofence();
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const handleAddGeofence = async (geofence: Omit<Geofence, 'id'>) => {
    try {
      await addGeofence(geofence);
      setShowAddModal(false);
      Alert.alert(t('success'), t('geofenceAdded'));
    } catch (error) {
      Alert.alert(t('error'), t('failedToAddGeofence'));
    }
  };

  const handleRemoveGeofence = async (id: string) => {
    Alert.alert(
      t('confirmDelete'),
      t('deleteGeofenceConfirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => removeGeofence(id),
        },
      ]
    );
  };

  const renderGeofenceItem = ({ item }: { item: Geofence }) => (
    <GeofenceCard
      geofence={item}
      onRemove={() => handleRemoveGeofence(item.id)}
      currentLocation={location}
    />
  );

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <MaterialIcons name="location-off" size={64} color="#ef4444" />
          <Text style={styles.permissionTitle}>{t('locationPermissionRequired')}</Text>
          <Text style={styles.permissionText}>{t('locationPermissionDescription')}</Text>
          <Button
            title={t('grantPermission')}
            onPress={requestPermission}
            style={styles.permissionButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('geofenceManagement')}</Text>
        <Text style={styles.subtitle}>{t('manageRestrictedAreas')}</Text>
      </View>

      {/* Current Location */}
      <View style={styles.locationCard}>
        <MaterialIcons name="my-location" size={20} color="#3b82f6" />
        <View style={styles.locationInfo}>
          <Text style={styles.locationTitle}>{t('currentLocation')}</Text>
          {location ? (
            <Text style={styles.locationCoords}>
              {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
            </Text>
          ) : (
            <Text style={styles.locationCoords}>{t('fetchingLocation')}</Text>
          )}
        </View>
      </View>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>{t('recentAlerts')}</Text>
          {alerts.slice(0, 3).map((alert, index) => (
            <View key={index} style={styles.alertCard}>
              <MaterialIcons name="warning" size={20} color="#f59e0b" />
              <View style={styles.alertInfo}>
                <Text style={styles.alertText}>{alert.message}</Text>
                <Text style={styles.alertTime}>
                  {new Date(alert.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Geofences List */}
      <View style={styles.geofencesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('activeGeofences')} ({geofences.length})</Text>
          <Button
            title={t('addGeofence')}
            onPress={() => setShowAddModal(true)}
            style={styles.addButton}
          />
        </View>

        {geofences.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="location-on" size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>{t('noGeofences')}</Text>
            <Text style={styles.emptyDescription}>{t('addFirstGeofence')}</Text>
          </View>
        ) : (
          <FlatList
            data={geofences}
            renderItem={renderGeofenceItem}
            keyExtractor={(item) => item.id}
            style={styles.geofencesList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <AddGeofenceModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddGeofence}
        currentLocation={location}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  permissionButton: {
    minWidth: 200,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  locationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  locationCoords: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  alertsSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  alertInfo: {
    marginLeft: 12,
    flex: 1,
  },
  alertText: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 12,
    color: '#78716c',
  },
  geofencesSection: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  geofencesList: {
    flex: 1,
    padding: 16,
  },
});