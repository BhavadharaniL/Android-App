import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of CareerVerse?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.replace('Login');
        }
      }
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'CareerVerse Student'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'student@careerverse.internal'}</Text>
        <View style={styles.collegeBadge}>
          <Text style={styles.collegeText}>
            {user?.degree || 'B.Tech'} • {user?.branch || 'Computer Science'} ({user?.currentYear || '3rd Year'})
          </Text>
        </View>
        <Text style={styles.institutionName}>{user?.college || 'Engineering Institute'}</Text>
      </View>

      {/* Quick Nav Shortcuts */}
      <View style={styles.shortcutsGrid}>
        <TouchableOpacity
          style={styles.shortcutCard}
          onPress={() => navigation.navigate('ApplicationTracker')}
        >
          <Ionicons name="paper-plane-outline" size={20} color="#818cf8" />
          <Text style={styles.shortcutTitle}>Applications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shortcutCard}
          onPress={() => navigation.navigate('Roadmap')}
        >
          <Ionicons name="map-outline" size={20} color="#34d399" />
          <Text style={styles.shortcutTitle}>Roadmap</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shortcutCard}
          onPress={() => navigation.navigate('ResumeAnalyzer')}
        >
          <Ionicons name="document-text-outline" size={20} color="#fbbf24" />
          <Text style={styles.shortcutTitle}>Resume</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shortcutCard}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={20} color="#f87171" />
          <Text style={styles.shortcutTitle}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Career Goals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Target Career Pathways</Text>
        <View style={styles.tagsWrap}>
          {(user?.careerGoals || ['Campus Placement', 'Private Jobs']).map((goal, idx) => (
            <View key={idx} style={styles.goalTag}>
              <Ionicons name="checkmark-circle" size={12} color="#818cf8" />
              <Text style={styles.goalText}>{goal}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Technical Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Registered Skills</Text>
        <View style={styles.tagsWrap}>
          {[
            ...(user?.programmingLanguages || []),
            ...(user?.technicalSkills || ['Java', 'SQL', 'Python', 'React'])
          ].map((skill, idx) => (
            <View key={idx} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Preferred Locations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferred Locations & Work Style</Text>
        <View style={styles.tagsWrap}>
          {(user?.preferredLocations || ['Chennai', 'Bangalore']).map((loc, idx) => (
            <View key={idx} style={styles.locationTag}>
              <Ionicons name="location-outline" size={12} color="#9ca3af" />
              <Text style={styles.locationText}>{loc}</Text>
            </View>
          ))}
          <View style={styles.locationTag}>
            <Ionicons name="briefcase-outline" size={12} color="#9ca3af" />
            <Text style={styles.locationText}>{user?.remotePreference || 'Hybrid'}</Text>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color="#f87171" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 24
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#6366f1'
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800'
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2
  },
  userEmail: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 10
  },
  collegeBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    marginBottom: 4
  },
  collegeText: {
    color: '#a5b4fc',
    fontSize: 11,
    fontWeight: '700'
  },
  institutionName: {
    color: '#6b7280',
    fontSize: 11
  },
  shortcutsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  shortcutCard: {
    width: '23%',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6
  },
  shortcutTitle: {
    color: '#d1d5db',
    fontSize: 10,
    fontWeight: '600'
  },
  section: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  goalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  goalText: {
    color: '#c7d2fe',
    fontSize: 11,
    fontWeight: '600'
  },
  skillTag: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  skillText: {
    color: '#e2e8f0',
    fontSize: 11
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1f2937',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  locationText: {
    color: '#cbd5e1',
    fontSize: 11
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 12,
    height: 46,
    marginTop: 10
  },
  logoutText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '700'
  }
});
