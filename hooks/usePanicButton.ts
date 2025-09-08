import { useState } from 'react';
import { apiClient } from '@/services/apiClient';
import type { AlertSeverity } from '@/types';

interface PanicAlertData {
  location?: {
    latitude: number;
    longitude: number;
  };
  severity: AlertSeverity;
  message: string;
}

export function usePanicButton() {
  const [sending, setSending] = useState(false);

  const sendPanicAlert = async (data: PanicAlertData) => {
    setSending(true);
    try {
      await apiClient.post('/alerts', {
        type: 'PANIC_BUTTON',
        severity: data.severity,
        message: data.message,
        location: data.location,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'mobile_app',
        },
      });
    } catch (error) {
      console.error('Failed to send panic alert:', error);
      throw error;
    } finally {
      setSending(false);
    }
  };

  return {
    sending,
    sendPanicAlert,
  };
}