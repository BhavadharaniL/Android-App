import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';

export const CareerQuizScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recommendations, setRecommendations] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await apiClient.get('/quiz/questions');
        setQuestions(res.data.questions || []);
      } catch (err) {
        console.warn('Quiz questions error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleSelectOption = (opt: any) => {
    const currentQ = questions[currentIdx];
    const newAnswers = [
      ...selectedAnswers.filter(a => a.questionId !== currentQ.id),
      {
        questionId: currentQ.id,
        selectedOption: opt.text,
        selectedRole: opt.role,
        weight: opt.weight
      }
    ];
    setSelectedAnswers(newAnswers);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (answers: any[]) => {
    setSubmitting(true);
    try {
      const res = await apiClient.post('/quiz/submit', { answers });
      setRecommendations(res.data.allRecommendations || []);
    } catch (err: any) {
      alert(err.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentIdx];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Career Direction Quiz</Text>
        <Text style={styles.subtitle}>
          Discover engineering career paths that naturally align with your problem-solving style
        </Text>
      </View>

      {loading || submitting ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color="#818cf8" size="large" />
          <Text style={styles.loadingText}>
            {submitting ? 'Analyzing preferences...' : 'Loading assessment...'}
          </Text>
        </View>
      ) : recommendations ? (
        /* Results View */
        <View style={styles.resultContainer}>
          <View style={styles.resultBanner}>
            <Ionicons name="trophy-outline" size={32} color="#fbbf24" />
            <Text style={styles.resultTitle}>Top Career Matches</Text>
            <Text style={styles.disclaimer}>
              * Recommendations are based on your stated preferences to guide study focus, not a formal diagnosis.
            </Text>
          </View>

          {recommendations.map((rec, idx) => (
            <View key={idx} style={styles.recCard}>
              <View style={styles.recHeader}>
                <Text style={styles.recTitle}>{rec.title}</Text>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>{rec.matchPercentage}% Match</Text>
                </View>
              </View>
              <Text style={styles.recRationale}>{rec.rationale}</Text>
            </View>
          ))}

          <TouchableOpacity
            style={styles.retakeBtn}
            onPress={() => {
              setRecommendations(null);
              setCurrentIdx(0);
              setSelectedAnswers([]);
            }}
          >
            <Text style={styles.retakeBtnText}>Retake Assessment</Text>
          </TouchableOpacity>
        </View>
      ) : currentQ ? (
        /* Active Question View */
        <View style={styles.questionCard}>
          <Text style={styles.qNum}>Question {currentIdx + 1} of {questions.length}</Text>
          <Text style={styles.qText}>{currentQ.question}</Text>

          <View style={styles.optionsList}>
            {currentQ.options.map((opt: any, idx: number) => (
              <TouchableOpacity
                key={idx}
                style={styles.optionBtn}
                onPress={() => handleSelectOption(opt)}
                activeOpacity={0.8}
              >
                <View style={styles.radioCircle}>
                  <Text style={styles.radioLetter}>{String.fromCharCode(65 + idx)}</Text>
                </View>
                <Text style={styles.optionText}>{opt.text}</Text>
              </TouchableOpacity>
            ))}
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
  centerBox: {
    paddingVertical: 50,
    alignItems: 'center',
    gap: 10
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 12
  },
  questionCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1f2937'
  },
  qNum: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8
  },
  qText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 20
  },
  optionsList: {
    gap: 12
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  radioLetter: {
    color: '#a5b4fc',
    fontSize: 11,
    fontWeight: '700'
  },
  optionText: {
    flex: 1,
    color: '#e2e8f0',
    fontSize: 13,
    lineHeight: 18
  },
  resultContainer: {
    gap: 14
  },
  resultBanner: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f2937'
  },
  resultTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 6
  },
  disclaimer: {
    color: '#6b7280',
    fontSize: 10,
    textAlign: 'center',
    paddingHorizontal: 12
  },
  recCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937'
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  recTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700'
  },
  matchBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  matchText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700'
  },
  recRationale: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 17
  },
  retakeBtn: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  retakeBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600'
  }
});
