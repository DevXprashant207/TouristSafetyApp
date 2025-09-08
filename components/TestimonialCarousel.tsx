import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { Testimonial } from '@/types';

const { width } = Dimensions.get('window');

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    text: 'This app made me feel so much safer during my solo trip to Barcelona. The real-time alerts and emergency features gave me peace of mind.',
    rating: 5,
    location: 'Barcelona, Spain',
  },
  {
    id: '2',
    name: 'Michael Chen',
    text: 'The geofencing feature warned me about unsafe areas before I even got close. Absolutely essential for any traveler.',
    rating: 5,
    location: 'Tokyo, Japan',
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    text: 'Quick emergency response when I needed help. The local authorities reached me in under 10 minutes. Incredible service!',
    rating: 5,
    location: 'Mexico City, Mexico',
  },
  {
    id: '4',
    name: 'David Thompson',
    text: 'Smart monitoring detected when I deviated from my planned route and suggested safer alternatives. Very impressed!',
    rating: 4,
    location: 'Cairo, Egypt',
  },
];

export function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % testimonials.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <MaterialIcons
        key={i}
        name="star"
        size={16}
        color={i < rating ? '#f59e0b' : '#d1d5db'}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const slideSize = width - 48;
          const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
          setActiveIndex(index);
        }}
      >
        {testimonials.map((testimonial) => (
          <View key={testimonial.id} style={styles.testimonialCard}>
            <Text style={styles.testimonialText}>"{testimonial.text}"</Text>
            
            <View style={styles.testimonialFooter}>
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{testimonial.name}</Text>
                <Text style={styles.authorLocation}>{testimonial.location}</Text>
              </View>
              
              <View style={styles.rating}>
                {renderStars(testimonial.rating)}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {testimonials.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === activeIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  testimonialCard: {
    width: width - 48,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    marginRight: 0,
  },
  testimonialText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  testimonialFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  authorLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  rating: {
    flexDirection: 'row',
    gap: 2,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  paginationDotActive: {
    backgroundColor: '#2563eb',
    width: 24,
  },
});