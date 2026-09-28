import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';
import { CareerRoadmap, RoadmapMilestone } from '../../types';

export const RoadmapScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('Software Engineer');

  const roleOptions = ['Software Engineer', 'Cloud Engineer', 'Full Stack Developer', 'Data Scientist'];

  const fetchRoadmap = async (role = selectedRole) => {
    setLoading(true);
    try {
      const res = await apiClient.get('/roadmaps', { params: { targetRole: role } });
      setRoadmap(res.data.roadmap);
    } catch (err: any) {
      console.warn('Roadmap error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleToggleMilestone = async (milestone: RoadmapMilestone) => {
    if (!roadmap) return;
    const nextStatus =
      milestone.status === 'Completed'
        ? 'Not Started'
        : milestone.status === 'In Progress'
        ? 'Completed'
        : 'In Progress';

    try {
      const res = await apiClient.put(`/roadmaps/${roadmap._id}/milestone/${milestone._id}`, {
        status: nextStatus
      });
      setRoadmap(res.data.roadmap);
    } catch (err: any) {
      console.warn('Update milestone error:', err);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Career Milestone Roadmap</Text>
        <Text style={styles.subtitle}>
          Step-by-step career path tailored to your graduation and industry goals
        </Text>
      </View>

      {/* Target Role Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleRow}>
        {roleOptions.map(r => (
          <TouchableOpacity
            key={r}
            onPress={() => {
              setSelectedRole(r);
              fetchRoadmap(r);
            }}
            style={[styles.roleChip, selectedRole === r && styles.roleChipActive]}
          >
            <Text style={[styles.roleText, selectedRole === r && styles.roleTextActive]}>
              {r}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color="#818cf8" size="large" />
          <Text style={styles.loadingText}>Generating roadmap milestones...</Text>
        </View>
      ) : roadmap ? (
        <View>
          {/* Overall Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressRole}>{roadmap.targetRole}</Text>
                <Text style={styles.progressSub}>Overall Curriculum Completion</Text>
              </View>
              <Text style={styles.progressPercentage}>{roadmap.progressPercentage}%</Text>
            </View>

            <View style={styles.progressBarBg}>
              <View
                style={[styles.progressBarFill, { width: `${roadmap.progressPercentage}%` }]}
              />
            </View>
          </View>

          {/* Milestones List */}
          <View style={styles.milestonesList}>
            {roadmap.milestones.map((m, idx) => {
              const isDone = m.status === 'Completed';
              const isInProg = m.status === 'In Progress';

              return (
                <View key={m._id || idx} style={styles.milestoneRow}>
                  {/* Timeline Line & Node */}
                  <View style={styles.timelineCol}>
                    <TouchableOpacity
                      onPress={() => handleToggleMilestone(m)}
                      style={[
                        styles.node,
                        isDone && styles.nodeDone,
                        isInProg && styles.nodeInProg
                      ]}
                    >
                      {isDone ? (
                        <Ionicons name="checkmark" size={14} color="#ffffff" />
                      ) : isInProg ? (
                        <Ionicons name="time" size={12} color="#ffffff" />
                      ) : (
                        <Text style={styles.nodeNum}>{idx + 1}</Text>
                      )}
                    </TouchableOpacity>
                    {idx < roadmap.milestones.length - 1 && <View style={styles.timelineLine} />}
                  </View>

                  {/* Milestone Card */}
                  <TouchableOpacity
                    style={[styles.mCard, isDone && styles.mCardDone]}
                    onPress={() => handleToggleMilestone(m)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.mCardTop}>
                      <Text style={[styles.mTitle, isDone && styles.mTitleDone]}>{m.title}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          isDone
                            ? styles.badgeDone
                            : isInProg
                            ? styles.badgeInProg
                            : styles.badgeNotStarted
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            isDone
                              ? styles.textDone
                              : isInProg
                              ? styles.textInProg
                              : styles.textNotStarted
                          ]}
                        >
                          {m.status}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.mDesc}>{m.description}</Text>

                    {m.resources && m.resources.length > 0 && (
                      <View style={styles.resourcesRow}>
                        <Ionicons name="book-outline" size={12} color="#818cf8" />
                        <Text style={styles.resourceText}>{m.resources.join(' • ')}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19'
  },
  content: {
    padding: 16,
    paddingTop: 50,
    paddingBottom: 40
  },
  header: {
    marginBottom: 16
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 12,
    color: '#9ca3af'
  },
  roleRow: {
    flexDirection: 'row',
    marginBottom: 16
  },
  roleChip: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 8
  },
  roleChipActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#6366f1'
  },
  roleText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600'
  },
  roleTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  centerBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 12
  },
  progressCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 20
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  progressRole: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  },
  progressSub: {
    color: '#9ca3af',
    fontSize: 11
  },
  progressPercentage: {
    color: '#818cf8',
    fontSize: 20,
    fontWeight: '800'
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#1f2937',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4f46e5',
    borderRadius: 4
  },
  milestonesList: {
    marginTop: 4
  },
  milestoneRow: {
    flexDirection: 'row',
    marginBottom: 14
  },
  timelineCol: {
    alignItems: 'center',
    width: 32,
    marginRight: 10
  },
  node: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    borderWidth: 2,
    borderColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center'
  },
  nodeDone: {
    backgroundColor: '#10b981',
    borderColor: '#10b981'
  },
  nodeInProg: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b'
  },
  nodeNum: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '700'
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#1f2937',
    marginTop: 4
  },
  mCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2937'
  },
  mCardDone: {
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  mCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  mTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 8
  },
  mTitleDone: {
    textDecorationLine: 'line-through',
    color: '#9ca3af'
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1
  },
  badgeDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  badgeInProg: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)'
  },
  badgeNotStarted: {
    backgroundColor: '#1f2937',
    borderColor: '#374151'
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700'
  },
  textDone: { color: '#34d399' },
  textInProg: { color: '#fbbf24' },
  textNotStarted: { color: '#9ca3af' },
  mDesc: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8
  },
  resourcesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  resourceText: {
    color: '#818cf8',
    fontSize: 11
  }
});
