import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';
import { Opportunity } from '../../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  groundedRecords?: Opportunity[];
  timestamp: Date;
}

export const CareerAIScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am your CareerVerse AI Career Advisor. Ask me anything about engineering roles, roadmaps, exam patterns, or live verified opportunities currently in our database.",
      timestamp: new Date()
    }
  ]);

  const promptChips = [
    'Are there any Java internships available today?',
    'What government exams can I apply for right now?',
    'What skills should I learn for Cloud Engineering?',
    'How do I prepare for campus placement coding rounds?'
  ];

  const handleSend = async (questionToSend?: string) => {
    const q = (questionToSend || input).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: q,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post('/ai/ask', { question: q });
      const aiMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: res.data?.answer || 'I am ready to help you explore career opportunities.',
        groundedRecords: res.data?.groundedRecords || [],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: err.message || 'Unable to connect to AI engine. Please ensure your backend is running.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Top Banner */}
      <View style={styles.topHeader}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>CareerVerse AI</Text>
          <View style={styles.ragBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#34d399" />
            <Text style={styles.ragBadgeText}>Live Database Grounded (Anti-Hallucination)</Text>
          </View>
        </View>

        {/* Quick Tools Navigation */}
        <View style={styles.toolsRow}>
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => navigation.navigate('ResumeAnalyzer')}
          >
            <Ionicons name="document-text-outline" size={14} color="#818cf8" />
            <Text style={styles.toolBtnText}>Resume</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => navigation.navigate('SkillGap')}
          >
            <Ionicons name="analytics-outline" size={14} color="#818cf8" />
            <Text style={styles.toolBtnText}>Skill Gap</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => navigation.navigate('InterviewPractice')}
          >
            <Ionicons name="mic-outline" size={14} color="#818cf8" />
            <Text style={styles.toolBtnText}>Mock Prep</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Messages */}
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatList}
        renderItem={({ item }) => {
          const isUser = item.sender === 'user';
          return (
            <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAi]}>
              {!isUser && (
                <View style={styles.aiAvatar}>
                  <Ionicons name="sparkles" size={14} color="#ffffff" />
                </View>
              )}
              <View style={[styles.msgBubble, isUser ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.msgText, isUser ? styles.userText : styles.aiText]}>
                  {item.text}
                </Text>

                {/* Grounded Opportunity Cards embedded in AI responses */}
                {item.groundedRecords && item.groundedRecords.length > 0 && (
                  <View style={styles.groundedContainer}>
                    <Text style={styles.groundedHeader}>Verified Live Database Matches:</Text>
                    {item.groundedRecords.map((rec: any, idx: number) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.groundedCard}
                        onPress={() => {
                          if (rec.applicationUrl) Linking.openURL(rec.applicationUrl);
                        }}
                      >
                        <Text style={styles.groundedTitle}>{rec.title}</Text>
                        <Text style={styles.groundedOrg}>{rec.organization} • {rec.location || 'India'}</Text>
                        <View style={styles.groundedFooter}>
                          <Text style={styles.groundedSource}>Source: {rec.source}</Text>
                          <Text style={styles.groundedApply}>Apply ↗</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* Suggested Prompt Chips */}
      {messages.length <= 2 && (
        <View style={styles.chipsSection}>
          <Text style={styles.chipsLabel}>Suggested Questions:</Text>
          <View style={styles.chipsWrap}>
            {promptChips.map((chip, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.chip}
                onPress={() => handleSend(chip)}
              >
                <Text style={styles.chipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Input Field */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask Career AI about skills, jobs, roadmaps..."
          placeholderTextColor="#6b7280"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={() => handleSend()}
          disabled={!input.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons name="arrow-up" size={18} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19'
  },
  topHeader: {
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff'
  },
  ragBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  ragBadgeText: {
    color: '#6ee7b7',
    fontSize: 10,
    fontWeight: '700'
  },
  toolsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  toolBtnText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600'
  },
  chatList: {
    padding: 16,
    paddingBottom: 20
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-end',
    gap: 8
  },
  msgRowUser: {
    justifyContent: 'flex-end'
  },
  msgRowAi: {
    justifyContent: 'flex-start'
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4
  },
  msgBubble: {
    maxWidth: '82%',
    padding: 14,
    borderRadius: 16
  },
  userBubble: {
    backgroundColor: '#4f46e5',
    borderBottomRightRadius: 4
  },
  aiBubble: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderBottomLeftRadius: 4
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20
  },
  userText: {
    color: '#ffffff'
  },
  aiText: {
    color: '#e5e7eb'
  },
  groundedContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    paddingTop: 10
  },
  groundedHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#a78bfa',
    marginBottom: 6
  },
  groundedCard: {
    backgroundColor: '#1e293b',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#334155'
  },
  groundedTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  },
  groundedOrg: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2
  },
  groundedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6
  },
  groundedSource: {
    color: '#64748b',
    fontSize: 10
  },
  groundedApply: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '700'
  },
  chipsSection: {
    paddingHorizontal: 16,
    paddingBottom: 10
  },
  chipsLabel: {
    color: '#64748b',
    fontSize: 11,
    marginBottom: 6
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  chip: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  chipText: {
    color: '#9ca3af',
    fontSize: 11
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b'
  },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    color: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#334155'
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  },
  sendBtnDisabled: {
    backgroundColor: '#334155'
  }
});
