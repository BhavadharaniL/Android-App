import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '../../utils/storage';

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [apiUrl, setApiUrl] = useState('');
  const [notifyDeadlines, setNotifyDeadlines] = useState(true);
  const [notifyInternships, setNotifyInternships] = useState(true);
  const [notifyGovt, setNotifyGovt] = useState(true);
  const [notifyScholarships, setNotifyScholarships] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      const storedUrl = await storage.getApiUrl();
      if (storedUrl) setApiUrl(storedUrl);
    };
    loadSettings();
  }, []);

  const handleSaveApiUrl = async () => {
    try {
      if (apiUrl.trim()) {
        await storage.setApiUrl(apiUrl.trim());
        Alert.alert('Configuration Saved', `Backend API URL updated to:\n${apiUrl.trim()}`);
      } else {
        await storage.setApiUrl('');
        Alert.alert('Reset to Default', 'Backend API URL reset to default emulator/localhost address.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleClearCache = async () => {
    Alert.alert('Clear Cache', 'Do you want to purge local cached opportunities and news feeds?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await storage.setCachedOpportunities([]);
          await storage.setCachedNews([]);
          Alert.alert('Cache Cleared', 'Offline feeds refreshed.');
        }
      }
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings & Connectivity</Text>
        <Text style={styles.subtitle}>Configure Wi-Fi device networking & notification preferences</Text>
      </View>

      {/* Android Device Wi-Fi Networking (Section 59) */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="wifi-outline" size={18} color="#818cf8" />
          <Text style={styles.cardTitle}>Android Physical Device IP Configuration</Text>
        </View>
        <Text style={styles.cardDesc}>
          When testing on a physical Android phone over Wi-Fi, enter your computer's local IP address (e.g., http://192.168.1.100:5000/api) instead of localhost.
        </Text>

        <Text style={styles.inputLabel}>Backend Base URL:</Text>
        <TextInput
          style={styles.input}
          placeholder="http://192.168.1.X:5000/api"
          placeholderTextColor="#6b7280"
          value={apiUrl}
          onChangeText={setApiUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveApiUrl}>
          <Text style={styles.saveBtnText}>Save API Endpoint</Text>
        </TouchableOpacity>
      </View>

      {/* Notification Categories (Section 35) */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="notifications-outline" size={18} color="#fbbf24" />
          <Text style={styles.cardTitle}>Notification Alerts</Text>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Job & Internship Deadlines</Text>
          <Switch
            value={notifyDeadlines}
            onValueChange={setNotifyDeadlines}
            trackColor={{ false: '#374151', true: '#4f46e5' }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>New Matching Internships</Text>
          <Switch
            value={notifyInternships}
            onValueChange={setNotifyInternships}
            trackColor={{ false: '#374151', true: '#4f46e5' }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Official Government Notifications (UPSC/SSC)</Text>
          <Switch
            value={notifyGovt}
            onValueChange={setNotifyGovt}
            trackColor={{ false: '#374151', true: '#4f46e5' }}
            thumbColor="#ffffff"
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Scholarship Application Windows</Text>
          <Switch
            value={notifyScholarships}
            onValueChange={setNotifyScholarships}
            trackColor={{ false: '#374151', true: '#4f46e5' }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* Data Freshness & Cache Management */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="trash-outline" size={18} color="#f87171" />
          <Text style={styles.cardTitle}>Offline Cache Management</Text>
        </View>
        <Text style={styles.cardDesc}>
          CareerVerse caches verified opportunities for offline viewing. Purge cache to force fresh synchronization with the backend.
        </Text>

        <TouchableOpacity style={styles.clearCacheBtn} onPress={handleClearCache}>
          <Text style={styles.clearCacheText}>Purge Offline Cache</Text>
        </TouchableOpacity>
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
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 16
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff'
  },
  cardDesc: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12
  },
  inputLabel: {
    color: '#d1d5db',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 12,
    height: 44,
    color: '#ffffff',
    fontSize: 13,
    marginBottom: 12
  },
  saveBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center'
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937'
  },
  switchLabel: {
    color: '#e2e8f0',
    fontSize: 12,
    flex: 1,
    marginRight: 12
  },
  clearCacheBtn: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  clearCacheText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '700'
  }
});
