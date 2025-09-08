import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from './Button';
import { useI18n } from '@/hooks/useI18n';
import type { Geofence } from '@/types';
import type { LocationObject } from 'expo-location';

interface AddGeofenceModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (geofence: Omit<Geofence, 'id'>) => void;
  currentLocation: LocationObject | null;
}

export function AddGeofenceModal({ visible, onClose, onAdd, currentLocation }: AddGeofenceModalProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    latitude: currentLocation?.coords.latitude?.toString() || '',
    longitude: currentLocation?.coords.longitude?.toString() || '',
    radius: '100',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      latitude: currentLocation?.coords.latitude?.toString() || '',
      longitude: currentLocation?.coords.longitude?.toString() || '',
      radius: '100',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const { name, description, latitude, longitude, radius } = formData;

    // Validation
    if (!name.trim()) {
      Alert.alert(t('error'), t('geofenceNameRequired'));
      return;
    }

    if (!latitude.trim() || !longitude.trim()) {
      Alert.alert(t('error'), t('locationRequired'));
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusNum = parseFloat(radius);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      Alert.alert(t('error'), t('invalidLatitude'));
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      Alert.alert(t('error'), t('invalidLongitude'));
      return;
    }

    if (isNaN(radiusNum) || radiusNum <= 0) {
      Alert.alert(t('error'), t('invalidRadius'));
      return;
    }

    const geofence: Omit<Geofence, 'id'> = {
      name: name.trim(),
      description: description.trim(),
      latitude: lat,
      longitude: lng,
      radius: radiusNum,
      createdAt: new Date().toISOString(),
    };

    onAdd(geofence);
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const useCurrentLocation = () => {
    if (currentLocation) {
      setFormData(prev => ({
        ...prev,
        latitude: currentLocation.coords.latitude.toString(),
        longitude: currentLocation.coords.longitude.toString(),
      }));
    } else {
      Alert.alert(t('error'), t('locationNotAvailable'));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('addGeofence')}</Text>
          <Button
            title=""
            onPress={handleClose}
            variant="outline"
            size="small"
            style={styles.closeButton}
            icon="close"
          />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('name')} *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                placeholder={t('enterGeofenceName')}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('description')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => updateField('description', value)}
                placeholder={t('enterDescription')}
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.locationSection}>
              <View style={styles.locationHeader}>
                <Text style={styles.sectionTitle}>{t('location')}</Text>
                {currentLocation && (
                  <Button
                    title={t('useCurrentLocation')}
                    onPress={useCurrentLocation}
                    variant="outline"
                    size="small"
                    style={styles.locationButton}
                    icon="my-location"
                  />
                )}
              </View>

              <View style={styles.coordinateRow}>
                <View style={styles.coordinateInput}>
                  <Text style={styles.label}>{t('latitude')} *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.latitude}
                    onChangeText={(value) => updateField('latitude', value)}
                    placeholder="0.000000"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.coordinateInput}>
                  <Text style={styles.label}>{t('longitude')} *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.longitude}
                    onChangeText={(value) => updateField('longitude', value)}
                    placeholder="0.000000"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('radius')} (meters) *</Text>
              <TextInput
                style={styles.input}
                value={formData.radius}
                onChangeText={(value) => updateField('radius', value)}
                placeholder="100"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.infoBox}>
              <MaterialIcons name="info" size={20} color="#3b82f6" />
              <Text style={styles.infoText}>
                {t('geofenceInfo')}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <Button
            title={t('cancel')}
            onPress={handleClose}
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title={t('addGeofence')}
            onPress={handleSubmit}
            style={styles.actionButton}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    padding: 0,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  locationSection: {
    gap: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  locationButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
  coordinateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  coordinateInput: {
    flex: 1,
    gap: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    flex: 1,
  },
});