import React, { useState, useEffect } from 'react';
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

export const InterviewPracticeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [topic, setTopic] = useState('Java');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const topics = ['Java', 'Technical', 'HR', 'SQL', 'Cloud'];

  const fetchQuestions = async (t = topic) => {
    setLoadingQuestions(true);
    setFeedback(null);
    setUserAnswer('');
    try {
      const res = await apiClient.get('/ai/interview/questions', {
        params: { topic: t, difficulty }
      });
      setQuestions(res.data.questions || []);
      setCurrentIdx(0);
    } catch (err: any) {
      console.warn('Fetch questions error:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleEvaluate = async () => {
    if (!userAnswer.trim() || !questions[currentIdx]) return;
    setEvaluating(true);
    try {
      const res = await apiClient.post('/ai/interview/evaluate', {
        question: questions[currentIdx].q,
        userAnswer: userAnswer.trim()
      });
      setFeedback(res.data.evaluation);
    } catch (err: any) {
      alert(err.message || 'Evaluation failed.');
    } finally {
      setEvaluating(false);
    }
  };

  const currentQ = questions[currentIdx];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>AI Mock Interview</Text>
        <Text style={styles.subtitle}>Practice technical & behavioral questions with real-time feedback</Text>
      </View>

      {/* Topic Switcher */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topicRow}>
        {topics.map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => {
              setTopic(t);
              fetchQuestions(t);
            }}
            style={[styles.topicChip, topic === t && styles.topicChipActive]}
          >
            <Text style={[styles.topicText, topic === t && styles.topicTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loadingQuestions ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color="#818cf8" size="large" />
          <Text style={styles.loadingText}>Generating interview challenge...</Text>
        </View>
      ) : currentQ ? (
        <View style={styles.questionCard}>
          <View style={styles.qHeader}>
            <Text style={styles.qNum}>Question {currentIdx + 1} of {questions.length}</Text>
            <View style={styles.diffBadge}>
              <Text style={styles.diffText}>{currentQ.difficulty || difficulty}</Text>
            </View>
          </View>

          <Text style={styles.questionText}>{currentQ.q}</Text>

          {/* Answer Box */}
          <Text style={styles.inputLabel}>Your Response:</Text>
          <TextInput
            style={styles.answerInput}
            multiline
            numberOfLines={5}
            placeholder="Type your explanation or response here..."
            placeholderTextColor="#6b7280"
            value={userAnswer}
            onChangeText={setUserAnswer}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.evalBtn, (!userAnswer.trim() || evaluating) && styles.evalBtnDisabled]}
            onPress={handleEvaluate}
            disabled={!userAnswer.trim() || evaluating}
          >
            {evaluating ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Ionicons name="sparkles" size={16} color="#ffffff" />
                <Text style={styles.evalBtnText}>Evaluate My Answer</Text>
              </>
            )}
          </TouchableOpacity>

          {/* AI Evaluation Result */}
          {feedback && (
            <View style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <Text style={styles.feedbackScore}>Score: {feedback.score}/100</Text>
              </View>
              <Text style={styles.feedbackText}>{feedback.feedback}</Text>

              {feedback.missingConcepts && feedback.missingConcepts.length > 0 && (
                <View style={styles.missingBox}>
                  <Text style={styles.missingTitle}>Concepts to Include:</Text>
                  {feedback.missingConcepts.map((c: string, idx: number) => (
                    <Text key={idx} style={styles.missingItem}>• {c}</Text>
                  ))}
                </View>
              )}

              {feedback.improvedSampleAnswer && (
                <View style={styles.sampleBox}>
                  <Text style={styles.sampleTitle}>Ideal Answer Structure:</Text>
                  <Text style={styles.sampleText}>{feedback.improvedSampleAnswer}</Text>
                </View>
              )}

              {currentIdx + 1 < questions.length && (
                <TouchableOpacity
                  style={styles.nextBtn}
                  onPress={() => {
                    setCurrentIdx(currentIdx + 1);
                    setUserAnswer('');
                    setFeedback(null);
                  }}
                >
                  <Text style={styles.nextBtnText}>Next Question</Text>
                  <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                </TouchableOpacity>
              )}
            </View>
          )}
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
  topicRow: {
    flexDirection: 'row',
    marginBottom: 16
  },
  topicChip: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 8
  },
  topicChipActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#6366f1'
  },
  topicText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600'
  },
  topicTextActive: {
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
  questionCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937'
  },
  qHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  qNum: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '700'
  },
  diffBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  diffText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '700'
  },
  questionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 16
  },
  inputLabel: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6
  },
  answerInput: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    color: '#ffffff',
    fontSize: 13,
    height: 110,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 12
  },
  evalBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  evalBtnDisabled: {
    backgroundColor: '#374151'
  },
  evalBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  },
  feedbackCard: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  feedbackScore: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '800'
  },
  feedbackText: {
    color: '#e2e8f0',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10
  },
  missingBox: {
    marginBottom: 10
  },
  missingTitle: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4
  },
  missingItem: {
    color: '#cbd5e1',
    fontSize: 12,
    marginLeft: 6
  },
  sampleBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    marginBottom: 12
  },
  sampleTitle: {
    color: '#a5b4fc',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2
  },
  sampleText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 17
  },
  nextBtn: {
    backgroundColor: '#1f2937',
    borderRadius: 10,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  nextBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600'
  }
});
