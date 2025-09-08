import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/hooks/useI18n';
import { useDashboard } from '@/hooks/useDashboard';
import { DashboardTile } from '@/components/DashboardTile';
import { TestimonialCarousel } from '@/components/TestimonialCarousel';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const { dashboardData, loading, refreshData } = useDashboard();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: dashboardData?.activeTouristsChart || [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {t('welcomeBack')}, {user?.name?.split(' ')[0] || t('tourist')}!
          </Text>
          <Text style={styles.subtitle}>{t('dashboardSubtitle')}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <DashboardTile
            title={t('activeTourists')}
            value={dashboardData?.activeTourists || 0}
            icon="people"
            color="#10b981"
            trend={+12}
          />
          <DashboardTile
            title={t('alertsToday')}
            value={dashboardData?.alertsToday || 0}
            icon="warning"
            color="#f59e0b"
            subtitle={`${dashboardData?.highAlerts || 0}H ${dashboardData?.mediumAlerts || 0}M ${dashboardData?.lowAlerts || 0}L`}
          />
          <DashboardTile
            title={t('pendingIncidents')}
            value={dashboardData?.pendingIncidents || 0}
            icon="report-problem"
            color="#ef4444"
          />
          <DashboardTile
            title={t('resolvedIncidents')}
            value={dashboardData?.resolvedIncidents || 0}
            icon="check-circle"
            color="#10b981"
          />
          <DashboardTile
            title={t('safetyScore')}
            value={`${dashboardData?.safetyScore || 0}%`}
            icon="security"
            color="#3b82f6"
            subtitle={t('average') + `: ${dashboardData?.avgSafetyScore || 0}%`}
          />
          <DashboardTile
            title={t('responseTime')}
            value={`${dashboardData?.avgResponseTime || 0}min`}
            icon="timer"
            color="#8b5cf6"
          />
        </View>

        {/* Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>{t('activeTouristsOverTime')}</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={screenWidth - 48}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        {/* Most Visited Region */}
        <View style={styles.regionSection}>
          <DashboardTile
            title={t('mostVisitedRegion')}
            value={dashboardData?.mostVisitedRegion || t('cityCenter')}
            icon="location-on"
            color="#06b6d4"
            style={styles.fullWidthTile}
          />
        </View>

        {/* Testimonials */}
        <View style={styles.testimonialsSection}>
          <Text style={styles.sectionTitle}>{t('whatTouristsSay')}</Text>
          <TestimonialCarousel />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  chartSection: {
    padding: 24,
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
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  regionSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  fullWidthTile: {
    width: '100%',
  },
  testimonialsSection: {
    padding: 24,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 24,
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
});