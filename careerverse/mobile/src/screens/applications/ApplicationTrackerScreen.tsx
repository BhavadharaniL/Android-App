import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';
import { ApplicationItem } from '../../types';

export const ApplicationTrackerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Applied' | 'Interview' | 'Selected' | 'Saved'>('All');
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [savedOpportunities, setSavedOpportunities] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, applied: 0, interview: 0, selected: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrackerData = async () => {
    try {
      // 1. Fetch applications
      const appRes = await apiClient.get('/applications');
      if (appRes.data) {
        setApplications(appRes.data.applications || []);
        if (appRes.data.stats) setStats(appRes.data.stats);
      }

      // 2. Fetch saved opportunities
      const savedRes = await apiClient.get('/applications/saved');
      if (savedRes.data?.opportunities) {
        setSavedOpportunities(savedRes.data.opportunities);
      }
    } catch (err) {
      console.warn('Error fetching application tracker:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrackerData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrackerData();
  };

  const tabs = ['All', 'Applied', 'Interview', 'Selected', 'Saved'] as const;

  const filteredItems = () => {
    if (activeTab === 'Saved') {
      return savedOpportunities.map(opp => ({
        _id: opp._id,
        opportunityId: opp,
        status: 'Saved' as const,
        appliedAt: opp.createdAt
      }));
    }
    if (activeTab === 'All') return applications;
    return applications.filter(a => a.status === activeTab);
  };

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'Selected': return '#34d399';
      case 'Interview': return '#fbbf24';
      case 'Applied': return '#818cf8';
      case 'Saved': return '#a78bfa';
      default: return '#9ca3af';
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.title}>Application Tracker</Text>
        </View>
        <Text style={styles.subtitle}>Track your placement drives, interviews & official applications</Text>

        {/* KPI Mini Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#818cf8' }]}>{stats.applied}</Text>
            <Text style={styles.statLabel}>Applied</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#fbbf24' }]}>{stats.interview}</Text>
            <Text style={styles.statLabel}>Interview</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#34d399' }]}>{stats.selected}</Text>
            <Text style={styles.statLabel}>Offers</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#818cf8" />
        </View>
      ) : filteredItems().length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="briefcase-outline" size={48} color="#4b5563" />
          <Text style={styles.emptyTitle}>No Applications Under "{activeTab}"</Text>
          <Text style={styles.emptySubtitle}>
            Browse opportunities and click "Track Application" or bookmark them to see them here.
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            onPress={() => navigation.navigate('OpportunitiesTab')}
          >
            <Text style={styles.browseBtnText}>Browse Live Opportunities</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredItems()}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#818cf8" />
          }
          renderItem={({ item }) => {
            const opp = item.opportunityId;
            if (!opp) return null;
            const statusColor = getStatusColor(item.status);

            return (
              <View style={styles.appCard}>
                <View style={styles.cardHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20`, borderColor: `${statusColor}50` }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
                  </View>
                  <Text style={styles.dateText}>
                    {new Date(item.appliedAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>

                <Text style={styles.appTitle} numberOfLines={2}>{opp.title}</Text>
                <Text style={styles.appOrg}>{opp.organization} • {opp.location || 'India'}</Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.sourceText}>Source: {opp.source}</Text>
                  {opp.applicationUrl && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(opp.applicationUrl)}
                      style={styles.openLinkBtn}
                    >
                      <Text style={styles.openLinkText}>Portal ↗</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19'
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff'
  },
  subtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 14
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1f2937'
  },
  statBox: {
    alignItems: 'center',
    flex: 1
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff'
  },
  statLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 3
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8
  },
  tabBtnActive: {
    backgroundColor: '#4f46e5'
  },
  tabText: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600'
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  listContent: {
    padding: 16
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30
  },
  emptyTitle: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12
  },
  emptySubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16
  },
  browseBtn: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10
  },
  browseBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600'
  },
  appCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1f2937'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700'
  },
  dateText: {
    fontSize: 11,
    color: '#6b7280'
  },
  appTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4
  },
  appOrg: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 10
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    paddingTop: 8
  },
  sourceText: {
    color: '#6b7280',
    fontSize: 11
  },
  openLinkBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 6
  },
  openLinkText: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '600'
  }
});
