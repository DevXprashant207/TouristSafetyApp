import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Vibration,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { usePanicButton } from '@/hooks/usePanicButton';
import { useLocation } from '@/hooks/useLocation';
import { useI18n } from '@/hooks/useI18n';
import { Button } from '@/components/Button';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function PanicScreen() {
  const { t } = useI18n();
  const { location } = useLocation();
  const { sendPanicAlert, sending } = usePanicButton();
  const [countdown, setCountdown] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const pulseAnim = useSharedValue(1);
  const shakeAnim = useSharedValue(0);

  const startPulseAnimation = () => {
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  };

  const startShakeAnimation = () => {
    shakeAnim.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      ),
      3,
      false
    );
  };

  const animatedPulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnim.value }],
    };
  });

  const animatedShakeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeAnim.value }],
    };
  });

  const handlePanicPress = () => {
    // Vibration pattern: 200ms on, 100ms off, 200ms on
    Vibration.vibrate([0, 200, 100, 200]);
    startShakeAnimation();
    setShowConfirmation(true);
  };

  const confirmPanic = async () => {
    setShowConfirmation(false);
    setCountdown(5);
    startPulseAnimation();

    // 5-second countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          sendEmergencyAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendEmergencyAlert = async () => {
    pulseAnim.value = 1; // Stop pulse animation
    
    try {
      await sendPanicAlert({
        location: location?.coords,
        severity: 'HIGH',
        message: t('emergencyAlertSent'),
      });

      Alert.alert(
        t('alertSent'),
        t('emergencyContactsNotified'),
        [{ text: t('ok'), style: 'default' }]
      );
    } catch (error) {
      Alert.alert(
        t('error'),
        t('failedToSendAlert'),
        [{ text: t('tryAgain'), style: 'default' }]
      );
    }
  };

  const cancelPanic = () => {
    setShowConfirmation(false);
    setCountdown(0);
    pulseAnim.value = 1;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('emergencyResponse')}</Text>
          <Text style={styles.subtitle}>
            {t('pressButtonInEmergency')}
          </Text>
        </View>

        <View style={styles.content}>
          {countdown > 0 ? (
            <Animated.View style={[styles.countdownContainer, animatedPulseStyle]}>
              <Text style={styles.countdownNumber}>{countdown}</Text>
              <Text style={styles.countdownText}>{t('sendingAlert')}</Text>
              <Button
                title={t('cancel')}
                onPress={cancelPanic}
                style={styles.cancelButton}
                textStyle={styles.cancelButtonText}
              />
            </Animated.View>
          ) : (
            <Animated.View style={[styles.panicButtonContainer, animatedShakeStyle]}>
              <Animated.View style={[styles.panicButton, animatedPulseStyle]}>
                <Button
                  title=""
                  onPress={handlePanicPress}
                  disabled={sending}
                  style={styles.panicButtonInner}
                >
                  <MaterialIcons name="warning" size={80} color="#ffffff" />
                  <Text style={styles.panicButtonText}>{t('sos')}</Text>
                </Button>
              </Animated.View>
              <Text style={styles.instructionText}>
                {t('tapToSendEmergencyAlert')}
              </Text>
            </Animated.View>
          )}
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <MaterialIcons name="info" size={24} color="#3b82f6" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>{t('whatHappensNext')}</Text>
              <Text style={styles.infoText}>
                • {t('locationSharedWithAuthorities')}{'\n'}
                • {t('emergencyContactsNotified')}{'\n'}
                • {t('responseTeamDispatched')}
              </Text>
            </View>
          </View>

          {location && (
            <View style={styles.locationCard}>
              <MaterialIcons name="location-on" size={20} color="#10b981" />
              <View style={styles.locationInfo}>
                <Text style={styles.locationTitle}>{t('currentLocation')}</Text>
                <Text style={styles.locationCoords}>
                  {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <View style={styles.overlay}>
            <View style={styles.confirmationModal}>
              <MaterialIcons name="warning" size={48} color="#ef4444" />
              <Text style={styles.confirmationTitle}>{t('confirmEmergency')}</Text>
              <Text style={styles.confirmationText}>
                {t('emergencyAlertWillBeSent')}
              </Text>
              <View style={styles.confirmationButtons}>
                <Button
                  title={t('cancel')}
                  onPress={() => setShowConfirmation(false)}
                  style={styles.cancelModalButton}
                  textStyle={styles.cancelModalButtonText}
                />
                <Button
                  title={t('sendAlert')}
                  onPress={confirmPanic}
                  style={styles.confirmButton}
                />
              </View>
            </View>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fecaca',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  panicButtonContainer: {
    alignItems: 'center',
  },
  panicButton: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: (width * 0.6) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  panicButtonInner: {
    width: '85%',
    height: '85%',
    borderRadius: (width * 0.6 * 0.85) / 2,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  panicButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
    marginTop: 8,
  },
  instructionText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
  countdownContainer: {
    alignItems: 'center',
  },
  countdownNumber: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  countdownText: {
    fontSize: 20,
    color: '#fecaca',
    marginBottom: 32,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#ffffff',
    borderWidth: 2,
    paddingHorizontal: 32,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  infoSection: {
    padding: 24,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  locationCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  locationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  confirmationModal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  confirmationText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelModalButton: {
    backgroundColor: '#f3f4f6',
    flex: 1,
  },
  cancelModalButtonText: {
    color: '#374151',
  },
  confirmButton: {
    backgroundColor: '#ef4444',
    flex: 1,
  },
});