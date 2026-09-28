import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { register, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [branch, setBranch] = useState('Computer Science');
  const [currentYear, setCurrentYear] = useState('3rd Year');
  const [errorMessage, setErrorMessage] = useState('');

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'];

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Please fill in Name, Email, and Password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setErrorMessage('');
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        college: college.trim(),
        degree: degree.trim(),
        branch: branch.trim(),
        currentYear
      });
      // Move directly to Onboarding goal selection
      navigation.replace('Onboarding');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Student Account</Text>
          <Text style={styles.subtitle}>Unlock personalized job feeds, government notifications & AI advice</Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#f87171" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Bhavadharani S"
                placeholderTextColor="#6b7280"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>College or Personal Email *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="student@example.edu"
                placeholderTextColor="#6b7280"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password (min. 6 characters) *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Choose a secure password"
                placeholderTextColor="#6b7280"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>College / University</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="business-outline" size={18} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Anna University"
                placeholderTextColor="#6b7280"
                value={college}
                onChangeText={setCollege}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Degree</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="B.Tech / B.E."
                  placeholderTextColor="#6b7280"
                  value={degree}
                  onChangeText={setDegree}
                />
              </View>
            </View>
            <View style={[styles.inputGroup, { flex: 1.2 }]}>
              <Text style={styles.label}>Branch / Major</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="CSE / IT / ECE"
                  placeholderTextColor="#6b7280"
                  value={branch}
                  onChangeText={setBranch}
                />
              </View>
            </View>
          </View>

          {/* Current Year Selection Chips */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Academic Year</Text>
            <View style={styles.yearChips}>
              {years.map(y => (
                <TouchableOpacity
                  key={y}
                  onPress={() => setCurrentYear(y)}
                  style={[
                    styles.chip,
                    currentYear === y && styles.chipActive
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      currentYear === y && styles.chipTextActive
                    ]}
                  >
                    {y}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.registerBtn}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.registerBtnText}>Continue to Career Goals</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19'
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 40
  },
  header: {
    marginBottom: 24
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 13,
    color: '#9ca3af'
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
    flex: 1
  },
  form: {
    gap: 14
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  inputGroup: {
    gap: 6
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d1d5db'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48
  },
  inputIcon: {
    marginRight: 8
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14
  },
  yearChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8
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
  registerBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12
  },
  registerBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24
  },
  footerText: {
    color: '#9ca3af',
    fontSize: 13
  },
  loginLink: {
    color: '#818cf8',
    fontSize: 13,
    fontWeight: '700'
  }
});
