import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import { storage } from '../../utils/storage';
import { Opportunity, NewsArticle } from '../../types';
import { OpportunityCard } from '../../components/OpportunityCard';
import { NewsCard } from '../../components/NewsCard';
import { formatDeadline } from '../../utils/formatters';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Opportunity[]>([]);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      // 1. Fetch live recommendations from backend
      try {
        const recRes = await apiClient.get('/opportunities/recommendations?limit=5');
        if (recRes.data?.recommendations) {
          setRecommendations(recRes.data.recommendations);
          await storage.setCachedOpportunities(recRes.data.recommendations);
        }
      } catch (recErr) {
        // Fallback to cached opportunities if offline
        const cached = await storage.getCachedOpportunities();
        if (cached && cached.length > 0) setRecommendations(cached);
      }

      // 2. Fetch upcoming deadlines
      try {
        const deadRes = await apiClient.get('/opportunities/deadlines');
        if (deadRes.data?.deadlines) {
          setDeadlines(deadRes.data.deadlines);
        }
      } catch (deadErr) {
        console.warn('Deadlines fetch:', deadErr);
      }

      // 3. Fetch latest live technology news
      try {
        const newsRes = await apiClient.get('/news?limit=4');
        if (newsRes.data?.news) {
          setLatestNews(newsRes.data.news);
          await storage.setCachedNews(newsRes.data.news);
        }
      } catch (newsErr) {
        const cachedNews = await storage.getCachedNews();
        if (cachedNews && cachedNews.length > 0) setLatestNews(cachedNews);
      }

      // 4. Fetch saved opportunity IDs
      try {
        const savedRes = await apiClient.get('/applications/saved');
        if (savedRes.data?.opportunities) {
          setSavedIds(savedRes.data.opportunities.map((o: any) => o._id));
        }
      } catch (sErr) {}
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
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
      console.warn('Toggle save failed:', err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const primaryGoal = user?.careerGoals?.[0] || 'Software Engineering';

  const quickActions = [
    { title: 'Find Jobs', icon: 'briefcase', category: 'job', color: '#6366f1' },
    { title: 'Internships', icon: 'school', category: 'internship', color: '#06b6d4' },
    { title: 'Govt Jobs', icon: 'shield-checkmark', category: 'government_job', color: '#f59e0b' },
    { title: 'Scholarships', icon: 'cash', category: 'scholarship', color: '#10b981' },
    { title: 'Career AI', icon: 'chatbubbles', screen: 'CareerAI', color: '#8b5cf6' },
    { title: 'Roadmap', icon: 'map', screen: 'Roadmap', color: '#ec4899' },
    { title: 'Skill Gap', icon: 'analytics', screen: 'SkillGap', color: '#3b82f6' },
    { title: 'Resume', icon: 'document-text', screen: 'ResumeAnalyzer', color: '#14b8a6' },
    { title: 'Interview', icon: 'mic', screen: 'InterviewPractice', color: '#f97316' }
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#818cf8" />
      }
    >
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </Text>
          <View style={styles.goalRow}>
            <Text style={styles.goalLabel}>Focus: </Text>
            <View style={styles.goalBadge}>
              <Text style={styles.goalText}>{primaryGoal}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('CareerQuiz')}
          style={styles.quizBtn}
        >
          <Ionicons name="sparkles" size={16} color="#fbbf24" />
          <Text style={styles.quizBtnText}>Career Quiz</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Action Grid (Section 8) */}
      <View style={styles.section}>
        <Text style={styles.sectionHeaderTitle}>Quick Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionRow}>
          {quickActions.map((action, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.actionCard}
              onPress={() => {
                if (action.category) {
                  navigation.navigate('OpportunitiesTab', {
                    screen: 'OpportunitiesList',
                    params: { initialCategory: action.category }
                  });
                } else if (action.screen) {
                  navigation.navigate(action.screen);
                }
              }}
              activeOpacity={0.75}
            >
              <View style={[styles.actionIconCircle, { backgroundColor: `${action.color}22` }]}>
                <Ionicons name={action.icon as any} size={20} color={action.color} />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Upcoming Deadlines Horizontal Bar (Section 8) */}
      {deadlines.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Upcoming Deadlines</Text>
            <Text style={styles.sectionSubtitle}>Verified portal closing dates</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deadlineScroll}>
            {deadlines.map((dl, idx) => {
              const info = formatDeadline(dl.deadline);
              return (
                <View key={idx} style={styles.deadlineCard}>
                  <View style={styles.deadlineTop}>
                    <Text style={styles.deadlineOrg} numberOfLines={1}>{dl.organization}</Text>
                    <Text style={[styles.deadlineUrgency, info.isUrgent && { color: '#f87171' }]}>
                      {info.text}
                    </Text>
                  </View>
                  <Text style={styles.deadlineTitle} numberOfLines={1}>{dl.title}</Text>
                  <Text style={styles.deadlineSource}>Via {dl.source}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Recommended for You (Section 8, 15, 26) */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>Recommended for You</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('OpportunitiesTab')}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSubtitle}>
          Grounded on your {user?.technicalSkills?.slice(0, 3).join(', ') || 'CSE'} skills & goals
        </Text>

        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator color="#818cf8" />
            <Text style={styles.loadingText}>Fetching live synchronized opportunities...</Text>
          </View>
        ) : recommendations.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="search-outline" size={28} color="#6b7280" />
            <Text style={styles.emptyTitle}>Synchronizing Live Opportunities</Text>
            <Text style={styles.emptySubtitle}>Pull down to refresh or browse the Opportunities tab.</Text>
          </View>
        ) : (
          recommendations.map(opp => (
            <OpportunityCard
              key={opp._id}
              item={opp}
              onPress={() => navigation.navigate('OpportunityDetail', { id: opp._id })}
              onSave={handleToggleSave}
              isSaved={savedIds.includes(opp._id)}
            />
          ))
        )}
      </View>

      {/* Latest Technology & Career News Teaser (Section 8, 19) */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>Latest Technology News</Text>
          <TouchableOpacity onPress={() => navigation.navigate('NewsTab')}>
            <Text style={styles.viewAllText}>More News</Text>
          </TouchableOpacity>
        </View>

        {latestNews.slice(0, 2).map(news => (
          <NewsCard key={news._id} item={news} />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19'
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  goalLabel: {
    fontSize: 12,
    color: '#9ca3af'
  },
  goalBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  goalText: {
    color: '#a5b4fc',
    fontSize: 11,
    fontWeight: '700'
  },
  quizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10
  },
  quizBtnText: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '700'
  },
  section: {
    marginBottom: 24
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f9fafb'
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 12
  },
  viewAllText: {
    fontSize: 12,
    color: '#818cf8',
    fontWeight: '600'
  },
  actionRow: {
    marginTop: 10,
    flexDirection: 'row'
  },
  actionCard: {
    alignItems: 'center',
    marginRight: 14,
    width: 68
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  actionTitle: {
    color: '#d1d5db',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center'
  },
  deadlineScroll: {
    flexDirection: 'row',
    marginTop: 4
  },
  deadlineCard: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    width: 200
  },
  deadlineTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  deadlineOrg: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '600',
    flex: 1
  },
  deadlineUrgency: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '700'
  },
  deadlineTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4
  },
  deadlineSource: {
    color: '#6b7280',
    fontSize: 9
  },
  centerLoading: {
    paddingVertical: 30,
    alignItems: 'center',
    gap: 8
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 12
  },
  emptyCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937'
  },
  emptyTitle: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8
  },
  emptySubtitle: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4
  }
});
