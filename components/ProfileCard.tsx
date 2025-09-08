import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { User } from '@/types';

interface ProfileCardProps {
  user: User;
}

export function ProfileCard({ user }: ProfileCardProps) {
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.name}>{user.name}</Text>
        
        <View style={styles.detail}>
          <MaterialIcons name="email" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{user.email}</Text>
        </View>
        
        <View style={styles.detail}>
          <MaterialIcons name="phone" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{user.phone}</Text>
        </View>
        
        <View style={styles.detail}>
          <MaterialIcons name="calendar-today" size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  initials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  info: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#6b7280',
  },
});