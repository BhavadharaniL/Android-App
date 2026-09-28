import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export const OnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { updateOnboarding } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Selections
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['Campus Placement', 'Internships']);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['Java', 'Python']);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Data Structures', 'SQL', 'React']);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(['Chennai', 'Bangalore']);
  const [remotePreference, setRemotePreference] = useState<string>('Hybrid');

  const careerGoalOptions = [
    { title: 'Campus Placement', icon: 'ribbon-outline' },
    { title: 'Private Jobs', icon: 'business-outline' },
    { title: 'Higher Studies', icon: 'school-outline' },
    { title: 'Government Jobs', icon: 'shield-outline' },
    { title: 'Internships', icon: 'briefcase-outline' },
    { title: 'Entrepreneurship', icon: 'rocket-outline' },
    { title: 'Skill Development', icon: 'code-slash-outline' }
  ];

  const languageOptions = ['Java', 'Python', 'C++', 'JavaScript', 'TypeScript', 'SQL', 'Go', 'Kotlin'];
  const skillOptions = ['Data Structures', 'Algorithms', 'SQL', 'React', 'Node.js', 'Spring Boot', 'AWS', 'Docker', 'Machine Learning'];
  const locationOptions = ['Chennai', 'Bangalore', 'Hyderabad', 'Pune', 'Delhi NCR', 'Remote'];
  const remoteOptions = ['Remote', 'Hybrid', 'On-site', 'Any'];

  const toggleItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleFinishOnboarding = async () => {
    setSubmitting(true);
    try {
      await updateOnboarding({
        careerGoals: selectedGoals,
        programmingLanguages: selectedLangs,
        technicalSkills: selectedSkills,
        preferredLocations: selectedLocations,
        remotePreference,
        preferredRoles: selectedGoals.includes('Government Jobs') ? ['Government Technical Officer', 'Software Engineer'] : ['Software Engineer', 'Java Developer Intern']
      });
      navigation.replace('MainTabs');
    } catch (err) {
      console.warn('Onboarding update failed:', err);
      // Fallback navigation so user isn't stuck
      navigation.replace('MainTabs');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Personalization Setup</Text>
        </View>
        <Text style={styles.title}>What is your primary career goal?</Text>
        <Text style={styles.subtitle}>Select all pathways you are actively preparing for</Text>
      </View>

      {/* Goals Grid */}
      <View style={styles.section}>
        <View style={styles.goalGrid}>
          {careerGoalOptions.map(g => {
            const isSelected = selectedGoals.includes(g.title);
            return (
              <TouchableOpacity
                key={g.title}
                onPress={() => toggleItem(selectedGoals, setSelectedGoals, g.title)}
                style={[styles.goalCard, isSelected && styles.goalCardActive]}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={g.icon as any}
                  size={20}
                  color={isSelected ? '#818cf8' : '#9ca3af'}
                />
                <Text style={[styles.goalText, isSelected && styles.goalTextActive]}>
                  {g.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Programming Languages */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Programming Languages You Know</Text>
        <View style={styles.chipsRow}>
          {languageOptions.map(lang => {
            const isSelected = selectedLangs.includes(lang);
            return (
              <TouchableOpacity
                key={lang}
                onPress={() => toggleItem(selectedLangs, setSelectedLangs, lang)}
                style={[styles.chip, isSelected && styles.chipActive]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {lang}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Technical Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Technical Skills & Tools</Text>
        <View style={styles.chipsRow}>
          {skillOptions.map(sk => {
            const isSelected = selectedSkills.includes(sk);
            return (
              <TouchableOpacity
                key={sk}
                onPress={() => toggleItem(selectedSkills, setSelectedSkills, sk)}
                style={[styles.chip, isSelected && styles.chipActive]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {sk}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Preferred Locations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferred Locations</Text>
        <View style={styles.chipsRow}>
          {locationOptions.map(loc => {
            const isSelected = selectedLocations.includes(loc);
            return (
              <TouchableOpacity
                key={loc}
                onPress={() => toggleItem(selectedLocations, setSelectedLocations, loc)}
                style={[styles.chip, isSelected && styles.chipActive]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {loc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Remote Preference */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Work Preference</Text>
        <View style={styles.chipsRow}>
          {remoteOptions.map(r => (
            <TouchableOpacity
              key={r}
              onPress={() => setRemotePreference(r)}
              style={[styles.chip, remotePreference === r && styles.chipActive]}
            >
              <Text style={[styles.chipText, remotePreference === r && styles.chipTextActive]}>
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Finish Button */}
      <TouchableOpacity
        style={styles.finishBtn}
        onPress={handleFinishOnboarding}
        disabled={submitting}
        activeOpacity={0.8}
      >
        {submitting ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.finishBtnText}>Launch Personalized Experience</Text>
        )}
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40
  },
  header: {
    marginBottom: 24
  },
  stepIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10
  },
  stepText: {
    color: '#a5b4fc',
    fontSize: 11,
    fontWeight: '700'
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6
  },
  subtitle: {
    fontSize: 13,
    color: '#9ca3af'
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: 10
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  goalCard: {
    width: '48%',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  goalCardActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: '#6366f1'
  },
  goalText: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: '600'
  },
  goalTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10
  },
  chipActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: '#6366f1'
  },
  chipText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500'
  },
  chipTextActive: {
    color: '#a5b4fc',
    fontWeight: '700'
  },
  finishBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5
  },
  finishBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700'
  }
});
