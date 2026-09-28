import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';
import { storage } from '../../utils/storage';
import { NewsArticle } from '../../types';
import { NewsCard } from '../../components/NewsCard';

export const NewsScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const categories = [
    'All',
    'AI',
    'Cloud Computing',
    'Cybersecurity',
    'Software Engineering',
    'Data Science',
    'Internships',
    'Jobs',
    'Startups'
  ];

  const fetchNews = useCallback(async () => {
    try {
      const params: any = { limit: 20 };
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }

      const res = await apiClient.get('/news', { params });
      if (res.data?.news) {
        setArticles(res.data.news);
        if (selectedCategory === 'All') {
          await storage.setCachedNews(res.data.news);
        }
      }
    } catch (err) {
      console.warn('News fetch error:', err);
      // Fallback offline cache
      const cached = await storage.getCachedNews();
      if (cached && cached.length > 0) setArticles(cached);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    setLoading(true);
    fetchNews();
  }, [fetchNews]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await apiClient.post('/news/refresh');
    } catch (e) {}
    fetchNews();
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Technology & Hiring News</Text>
          <View style={styles.liveBadge}>
            <View style={styles.dot} />
            <Text style={styles.liveText}>LIVE FEEDS</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          Real-time updates from verified technology publications & developer communities
        </Text>

        {/* Category Filter Pills */}
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          contentContainerStyle={styles.categoryPills}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item)}
                style={[styles.pill, isActive && styles.pillActive]}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Main News List */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#818cf8" />
          <Text style={styles.loadingText}>Retrieving live industry articles...</Text>
        </View>
      ) : articles.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="newspaper-outline" size={48} color="#4b5563" />
          <Text style={styles.emptyTitle}>No Articles in this Category</Text>
          <Text style={styles.emptySubtitle}>Pull down to trigger an immediate live sync.</Text>
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#818cf8" />
          }
          renderItem={({ item }) => <NewsCard item={item} />}
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
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff'
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399'
  },
  liveText: {
    color: '#34d399',
    fontSize: 9,
    fontWeight: '800'
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 12
  },
  categoryPills: {
    gap: 8,
    paddingVertical: 2
  },
  pill: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  pillActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#6366f1'
  },
  pillText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600'
  },
  pillTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  listContent: {
    padding: 16
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 12
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
    marginTop: 4
  }
});
