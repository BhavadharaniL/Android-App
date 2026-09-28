import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';
import { Opportunity } from '../../types';
import { OpportunityCard } from '../../components/OpportunityCard';

export const OpportunitiesScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route
}) => {
  const initialCategory = route?.params?.initialCategory || 'all';

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [activeStatus, setActiveStatus] = useState<string>('Open');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'job', label: 'Private Jobs' },
    { key: 'internship', label: 'Internships' },
    { key: 'government_job', label: 'Govt Jobs' },
    { key: 'scholarship', label: 'Scholarships' },
    { key: 'certification', label: 'Certifications' },
    { key: 'course', label: 'Courses' },
    { key: 'hackathon', label: 'Hackathons' },
    { key: 'higher_study', label: 'Higher Studies' }
  ];

  const statusOptions = ['Open', 'Closing Soon', 'Closed', 'All'];

  const fetchOpportunities = useCallback(
    async (pageNumber = 1, shouldAppend = false) => {
      try {
        if (pageNumber === 1 && !shouldAppend) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const params: any = {
          page: pageNumber,
          limit: 10,
          status: activeStatus
        };

        if (activeCategory !== 'all') {
          params.category = activeCategory;
        }

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        const res = await apiClient.get('/opportunities', { params });
        const list: Opportunity[] = res.data?.opportunities || [];

        if (shouldAppend) {
          setOpportunities(prev => [...prev, ...list]);
        } else {
          setOpportunities(list);
        }

        setPage(pageNumber);
        setTotalPages(res.data?.totalPages || 1);
      } catch (err) {
        console.warn('Opportunities fetch error:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [activeCategory, activeStatus, searchQuery]
  );

  // Fetch saved IDs
  const fetchSaved = async () => {
    try {
      const res = await apiClient.get('/applications/saved');
      if (res.data?.opportunities) {
        setSavedIds(res.data.opportunities.map((o: any) => o._id));
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchOpportunities(1, false);
    fetchSaved();
  }, [fetchOpportunities]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOpportunities(1, false);
    fetchSaved();
  };

  const handleLoadMore = () => {
    if (!loadingMore && page < totalPages) {
      fetchOpportunities(page + 1, true);
    }
  };

  const handleToggleSave = async (id: string) => {
    try {
      const res = await apiClient.post(`/applications/save/${id}`);
      if (res.data?.saved) {
        setSavedIds([...savedIds, id]);
      } else {
        setSavedIds(savedIds.filter(savedId => savedId !== id));
      }
    } catch (err) {
      console.warn('Save failed:', err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header & Search */}
      <View style={styles.topHeader}>
        <Text style={styles.screenTitle}>Live Opportunities</Text>
        <Text style={styles.screenSubtitle}>
          Continuously refreshed from NCS, Adzuna, UPSC, SSC & NSP
        </Text>

        {/* Search Bar (Section 25) */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search role, skills (Java, Cloud) or location..."
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => fetchOpportunities(1, false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories Tab Scroll */}
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.key}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
          renderItem={({ item }) => {
            const isActive = activeCategory === item.key;
            return (
              <TouchableOpacity
                onPress={() => setActiveCategory(item.key)}
                style={[styles.categoryTab, isActive && styles.categoryTabActive]}
              >
                <Text style={[styles.categoryTabText, isActive && styles.categoryTabTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* Status Filter Row (Section 13, 24) */}
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status:</Text>
          {statusOptions.map(st => (
            <TouchableOpacity
              key={st}
              onPress={() => setActiveStatus(st)}
              style={[styles.statusChip, activeStatus === st && styles.statusChipActive]}
            >
              <Text style={[styles.statusChipText, activeStatus === st && styles.statusChipTextActive]}>
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#818cf8" />
          <Text style={styles.loadingText}>Retrieving live opportunity feed...</Text>
        </View>
      ) : opportunities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="filter-outline" size={48} color="#4b5563" />
          <Text style={styles.emptyTitle}>No Opportunities Found</Text>
          <Text style={styles.emptySubtitle}>
            Try changing the status filter or searching for another skill.
          </Text>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => {
              setActiveCategory('all');
              setActiveStatus('Open');
              setSearchQuery('');
            }}
          >
            <Text style={styles.resetBtnText}>Reset All Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={opportunities}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#818cf8" />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator style={{ paddingVertical: 16 }} color="#818cf8" />
            ) : null
          }
          renderItem={({ item }) => (
            <OpportunityCard
              item={item}
              onPress={() => navigation.navigate('OpportunityDetail', { id: item._id })}
              onSave={handleToggleSave}
              isSaved={savedIds.includes(item._id)}
            />
          )}
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
  topHeader: {
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 10,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff'
  },
  screenSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 12
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#ffffff',
    fontSize: 13
  },
  categoryScroll: {
    marginBottom: 8
  },
  categoryContainer: {
    gap: 8,
    paddingVertical: 2
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155'
  },
  categoryTabActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#6366f1'
  },
  categoryTabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600'
  },
  categoryTabTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4
  },
  statusLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600'
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'transparent'
  },
  statusChipActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)'
  },
  statusChipText: {
    color: '#94a3b8',
    fontSize: 11
  },
  statusChipTextActive: {
    color: '#a5b4fc',
    fontWeight: '700'
  },
  listContent: {
    padding: 16
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 13
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30
  },
  emptyTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12
  },
  emptySubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6
  },
  resetBtn: {
    marginTop: 16,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10
  },
  resetBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600'
  }
});
