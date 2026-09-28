import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

export const SkillGapScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState('Software Engineer');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const roles = ['Software Engineer', 'Cloud Engineer', 'Data Scientist', 'Full Stack Developer'];

  const handleAnalyze = async (role = selectedRole) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/ai/skill-gap', {
        targetRole: role,
        userSkills: [
          ...(user?.programmingLanguages || []),
          ...(user?.technicalSkills || [])
        ]
      });
      setResult(res.data.result);
    } catch (err: any) {
      alert(err.message || 'Skill gap evaluation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Skill Gap Analyzer</Text>
        <Text style={styles.subtitle}>
          Compare your profile against target industry roles and unlock custom learning plans
        </Text>
      </View>

      {/* Role Selector Tabs */}
      <View style={styles.roleTabs}>
        {roles.map(r => {
          const isActive = selectedRole === r;
          return (
            <TouchableOpacity
              key={r}
              onPress={() => {
                setSelectedRole(r);
                handleAnalyze(r);
              }}
              style={[styles.roleTab, isActive && styles.roleTabActive]}
            >
              <Text style={[styles.roleTabText, isActive && styles.roleTabTextActive]}>
                {r}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Analyze Trigger */}
      {!result && !loading && (
        <TouchableOpacity style={styles.analyzeBtn} onPress={() => handleAnalyze()}>
          <Ionicons name="sparkles" size={16} color="#ffffff" />
          <Text style={styles.analyzeBtnText}>Run Skill Gap Analysis</Text>
        </TouchableOpacity>
      )}

      {loading && (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#818cf8" />
          <Text style={styles.loadingText}>Analyzing skill requirements against your profile...</Text>
        </View>
      )}

      {/* Results View */}
      {result && !loading && (
        <View style={styles.resultContainer}>
          {/* Readiness Score Bar */}
          <View style={styles.card}>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Role Readiness Score</Text>
              <Text style={styles.scoreValue}>{result.readinessScore}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${result.readinessScore}%` }]} />
            </View>
            <Text style={styles.scoreCaption}>
              {result.strongSkills.length} of {result.requiredSkillsCount} core skills already matched in your profile.
            </Text>
          </View>

          {/* Strong Skills */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="checkmark-circle" size={16} color="#34d399" />
              <Text style={[styles.cardTitle, { color: '#34d399' }]}>Strong Skills (Matched)</Text>
            </View>
            <View style={styles.chipsRow}>
              {result.strongSkills.map((sk: string, idx: number) => (
                <View key={idx} style={[styles.chip, styles.chipStrong]}>
                  <Text style={styles.chipStrongText}>{sk}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Missing Skills */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="alert-circle" size={16} color="#f87171" />
              <Text style={[styles.cardTitle, { color: '#f87171' }]}>High-Priority Missing Skills</Text>
            </View>
            <View style={styles.chipsRow}>
              {result.missingSkills.map((sk: string, idx: number) => (
                <View key={idx} style={[styles.chip, styles.chipMissing]}>
                  <Text style={styles.chipMissingText}>{sk}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Personalized Learning Plan */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="map-outline" size={16} color="#818cf8" />
              <Text style={[styles.cardTitle, { color: '#818cf8' }]}>Personalized Learning Actions</Text>
            </View>
            {result.recommendedLearningPlan.map((plan: string, idx: number) => (
              <View key={idx} style={styles.planRow}>
                <Text style={styles.stepNum}>{idx + 1}</Text>
                <Text style={styles.planText}>{plan}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
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
    marginBottom: 20
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
  roleTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20
  },
  roleTab: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10
  },
  roleTabActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#6366f1'
  },
  roleTabText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600'
  },
  roleTabTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  analyzeBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  analyzeBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  },
  centerBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 10
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 12
  },
  resultContainer: {
    gap: 14
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937'
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  scoreLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  },
  scoreValue: {
    color: '#818cf8',
    fontSize: 18,
    fontWeight: '800'
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#1f2937',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4f46e5',
    borderRadius: 4
  },
  scoreCaption: {
    color: '#9ca3af',
    fontSize: 11
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700'
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1
  },
  chipStrong: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderColor: 'rgba(52, 211, 153, 0.25)'
  },
  chipStrongText: {
    color: '#6ee7b7',
    fontSize: 11,
    fontWeight: '600'
  },
  chipMissing: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.25)'
  },
  chipMissingText: {
    color: '#fca5a5',
    fontSize: 11,
    fontWeight: '600'
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10
  },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(129, 140, 248, 0.2)',
    color: '#a5b4fc',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20
  },
  planText: {
    flex: 1,
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18
  }
});
