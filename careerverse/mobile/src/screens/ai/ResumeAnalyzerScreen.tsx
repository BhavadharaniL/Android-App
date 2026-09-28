import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';

export const ResumeAnalyzerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const sampleResume = `Bhavadharani
Degree: B.Tech Computer Science and Engineering
Technical Skills: Java, Python, SQL, React, Node.js, AWS, Docker, Data Structures, Git
Projects:
1. CareerVerse: Built real-time opportunity discovery engine with Express, MongoDB, and React Native.
2. Cloud Storage Manager: Engineered microservices deploying on AWS with CI/CD GitHub Actions.
Education: Anna University (CGPA: 8.8)`;

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    try {
      const res = await apiClient.post('/ai/resume-analyzer', {
        resumeText: resumeText.trim(),
        targetRole
      });
      setAnalysis(res.data.analysis);
    } catch (err: any) {
      alert(err.message || 'Analysis failed. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>AI Resume Analyzer</Text>
        <Text style={styles.subtitle}>
          Actionable breakdown of technical keywords, strengths & improvement areas
        </Text>
      </View>

      {/* Target Role Selector */}
      <View style={styles.targetRoleContainer}>
        <Text style={styles.label}>Target Engineering Role:</Text>
        <TextInput
          style={styles.roleInput}
          value={targetRole}
          onChangeText={setTargetRole}
          placeholder="e.g. Software Engineer / Cloud Engineer"
          placeholderTextColor="#6b7280"
        />
      </View>

      {/* Resume Input Area */}
      <View style={styles.inputCard}>
        <View style={styles.inputHeader}>
          <Text style={styles.label}>Paste Resume Text / Summary:</Text>
          <TouchableOpacity onPress={() => setResumeText(sampleResume)}>
            <Text style={styles.sampleLink}>Paste Sample Resume</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={8}
          placeholder="Paste your education, skills, project bullet points, and experience..."
          placeholderTextColor="#6b7280"
          value={resumeText}
          onChangeText={setResumeText}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.analyzeBtn, (!resumeText.trim() || loading) && styles.btnDisabled]}
          onPress={handleAnalyze}
          disabled={!resumeText.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Ionicons name="sparkles" size={16} color="#ffffff" />
              <Text style={styles.analyzeBtnText}>Analyze Resume</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Analysis Results View */}
      {analysis && (
        <View style={styles.resultContainer}>
          {/* Score Card */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreNumber}>{analysis.score}</Text>
              <Text style={styles.scoreTotal}>/100</Text>
            </View>
            <View style={styles.scoreDetails}>
              <Text style={styles.scoreTitle}>Readiness Metric</Text>
              <Text style={styles.scoreSubtitle}>
                Based on industry keyword density & structured technical achievements
              </Text>
            </View>
          </View>

          {/* Detected Keywords */}
          {analysis.extractedSkills && analysis.extractedSkills.length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>High-Impact Skills Detected</Text>
              <View style={styles.tagsRow}>
                {analysis.extractedSkills.map((sk: string, idx: number) => (
                  <View key={idx} style={styles.skillTag}>
                    <Ionicons name="checkmark-circle" size={12} color="#34d399" />
                    <Text style={styles.skillTagText}>{sk}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Strengths */}
          <View style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: '#34d399' }]}>Key Strengths</Text>
            {analysis.strengths.map((st: string, idx: number) => (
              <View key={idx} style={styles.bulletRow}>
                <Ionicons name="thumbs-up-outline" size={14} color="#34d399" style={{ marginTop: 2 }} />
                <Text style={styles.bulletText}>{st}</Text>
              </View>
            ))}
          </View>

          {/* Weaknesses */}
          <View style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: '#f87171' }]}>Areas to Improve</Text>
            {analysis.weaknesses.map((w: string, idx: number) => (
              <View key={idx} style={styles.bulletRow}>
                <Ionicons name="alert-circle-outline" size={14} color="#f87171" style={{ marginTop: 2 }} />
                <Text style={styles.bulletText}>{w}</Text>
              </View>
            ))}
          </View>

          {/* Recommendations */}
          <View style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: '#818cf8' }]}>Actionable Steps</Text>
            {analysis.recommendations.map((rec: string, idx: number) => (
              <View key={idx} style={styles.bulletRow}>
                <Ionicons name="arrow-forward-circle" size={14} color="#818cf8" style={{ marginTop: 2 }} />
                <Text style={styles.bulletText}>{rec}</Text>
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
  targetRoleContainer: {
    marginBottom: 16
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: 6
  },
  roleInput: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    color: '#ffffff',
    fontSize: 13
  },
  inputCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 20
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  sampleLink: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '600'
  },
  textArea: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    color: '#ffffff',
    fontSize: 12,
    height: 120,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  analyzeBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12
  },
  btnDisabled: {
    backgroundColor: '#374151'
  },
  analyzeBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  },
  resultContainer: {
    gap: 14
  },
  scoreCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  scoreCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 2,
    borderColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scoreNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff'
  },
  scoreTotal: {
    fontSize: 10,
    color: '#9ca3af'
  },
  scoreDetails: {
    flex: 1
  },
  scoreTitle: {
    color: '#f9fafb',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2
  },
  scoreSubtitle: {
    color: '#9ca3af',
    fontSize: 11,
    lineHeight: 16
  },
  sectionCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2937'
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 10
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  skillTagText: {
    color: '#6ee7b7',
    fontSize: 11,
    fontWeight: '600'
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8
  },
  bulletText: {
    flex: 1,
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18
  }
});
