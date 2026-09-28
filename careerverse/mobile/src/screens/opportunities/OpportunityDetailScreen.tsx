import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Share,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';
import { Opportunity } from '../../types';
import { SourceBadge } from '../../components/SourceBadge';
import { DeadlineBadge } from '../../components/DeadlineBadge';
import { formatTimeAgo } from '../../utils/formatters';

export const OpportunityDetailScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route
}) => {
  const { id } = route.params;
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [appliedStatus, setAppliedStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await apiClient.get(`/opportunities/${id}`);
        setOpportunity(res.data.opportunity);

        // Check if saved
        const savedRes = await apiClient.get('/applications/saved');
        const savedList = savedRes.data?.opportunities || [];
        if (savedList.some((item: any) => item._id === id)) {
          setIsSaved(true);
        }

        // Check application status
        const appRes = await apiClient.get('/applications');
        const userApps = appRes.data?.applications || [];
        const existingApp = userApps.find((a: any) => a.opportunityId?._id === id);
        if (existingApp) {
          setAppliedStatus(existingApp.status);
        }
      } catch (err) {
        console.warn('Error fetching opportunity detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleToggleSave = async () => {
    try {
      const res = await apiClient.post(`/applications/save/${id}`);
      setIsSaved(res.data?.saved);
    } catch (err) {
      console.warn('Save error:', err);
    }
  };

  const handleMarkApplied = async () => {
    try {
      await apiClient.post('/applications', {
        opportunityId: id,
        status: 'Applied'
      });
      setAppliedStatus('Applied');
      Alert.alert('Status Updated', 'This opportunity is now tracked in your Application Tracker.');
    } catch (err) {
      console.warn('Application status update failed:', err);
    }
  };

  const handleOpenOriginalUrl = () => {
    if (opportunity?.applicationUrl) {
      Linking.openURL(opportunity.applicationUrl).catch(() => {
        Alert.alert('Link Error', 'Unable to open application link.');
      });
    }
  };

  const handleShare = async () => {
    if (!opportunity) return;
    try {
      await Share.share({
        title: opportunity.title,
        message: `Check out this opportunity: ${opportunity.title} at ${opportunity.organization}.\nApply via official portal: ${opportunity.applicationUrl}`
      });
    } catch (err) {}
  };

  if (loading || !opportunity) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#818cf8" />
      </View>
    );
  }

  const isClosed = opportunity.status === 'CLOSED';

  return (
    <View style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          Opportunity Details
        </Text>
        <View style={styles.navRight}>
          <TouchableOpacity onPress={handleShare} style={styles.navBtn}>
            <Ionicons name="share-social-outline" size={18} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleToggleSave} style={styles.navBtn}>
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isSaved ? '#818cf8' : '#ffffff'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Source & Freshness Card */}
        <View style={styles.sourceBox}>
          <SourceBadge
            source={opportunity.source}
            sourceType={opportunity.sourceType}
            verificationStatus={opportunity.verificationStatus}
          />
          <Text style={styles.freshnessText}>
            Updated {formatTimeAgo(opportunity.lastFetchedAt || opportunity.publishedAt)}
          </Text>
        </View>

        {/* Title & Organization */}
        <Text style={styles.title}>{opportunity.title}</Text>
        <Text style={styles.organization}>{opportunity.organization}</Text>

        {/* Highlight Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Location</Text>
            <Text style={styles.statValue}>{opportunity.location || 'India'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Work Type</Text>
            <Text style={styles.statValue}>{opportunity.workType || 'On-site'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Deadline</Text>
            <DeadlineBadge deadline={opportunity.deadline} />
          </View>
          {opportunity.salaryOrStipend?.text ? (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Salary / Stipend</Text>
              <Text style={[styles.statValue, { color: '#34d399' }]}>
                {opportunity.salaryOrStipend.text}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Government Job Specific Details */}
        {opportunity.category === 'government_job' && (
          <View style={styles.detailSection}>
            <Text style={styles.sectionHeading}>Official Government Examination Specs</Text>
            {opportunity.vacancyCount ? (
              <View style={styles.specRow}>
                <Text style={styles.specKey}>Total Vacancies:</Text>
                <Text style={styles.specVal}>{opportunity.vacancyCount}</Text>
              </View>
            ) : null}
            {opportunity.ageLimit ? (
              <View style={styles.specRow}>
                <Text style={styles.specKey}>Age Limit:</Text>
                <Text style={styles.specVal}>{opportunity.ageLimit}</Text>
              </View>
            ) : null}
            {opportunity.selectionProcess ? (
              <View style={styles.specRow}>
                <Text style={styles.specKey}>Selection Process:</Text>
                <Text style={styles.specVal}>{opportunity.selectionProcess}</Text>
              </View>
            ) : null}
            {opportunity.examPattern ? (
              <View style={styles.specBlock}>
                <Text style={styles.specKey}>Exam Pattern:</Text>
                <Text style={styles.specValBlock}>{opportunity.examPattern}</Text>
              </View>
            ) : null}
            {opportunity.syllabus ? (
              <View style={styles.specBlock}>
                <Text style={styles.specKey}>Syllabus Overview:</Text>
                <Text style={styles.specValBlock}>{opportunity.syllabus}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Scholarship Specific Details */}
        {opportunity.category === 'scholarship' && (
          <View style={styles.detailSection}>
            <Text style={styles.sectionHeading}>Scholarship Eligibility & Documents</Text>
            {opportunity.scholarshipAmount ? (
              <View style={styles.specRow}>
                <Text style={styles.specKey}>Scholarship Amount:</Text>
                <Text style={[styles.specVal, { color: '#34d399' }]}>{opportunity.scholarshipAmount}</Text>
              </View>
            ) : null}
            {opportunity.incomeRequirement ? (
              <View style={styles.specRow}>
                <Text style={styles.specKey}>Family Income Ceiling:</Text>
                <Text style={styles.specVal}>{opportunity.incomeRequirement}</Text>
              </View>
            ) : null}
            {opportunity.requiredDocuments && (
              <View style={styles.specBlock}>
                <Text style={styles.specKey}>Required Official Documents:</Text>
                {opportunity.requiredDocuments.map((doc, idx) => (
                  <View key={idx} style={styles.docRow}>
                    <Ionicons name="document-text-outline" size={14} color="#818cf8" />
                    <Text style={styles.docText}>{doc}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Description */}
        <View style={styles.detailSection}>
          <Text style={styles.sectionHeading}>About the Opportunity</Text>
          <Text style={styles.bodyText}>
            {opportunity.description || 'Details published via official portal.'}
          </Text>
        </View>

        {/* Qualification */}
        <View style={styles.detailSection}>
          <Text style={styles.sectionHeading}>Eligibility & Qualification</Text>
          <Text style={styles.bodyText}>{opportunity.qualification}</Text>
        </View>

        {/* Skills */}
        {opportunity.skills && opportunity.skills.length > 0 && (
          <View style={styles.detailSection}>
            <Text style={styles.sectionHeading}>Relevant Skills</Text>
            <View style={styles.skillsRow}>
              {opportunity.skills.map((skill, index) => (
                <View key={index} style={styles.skillChip}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Action Bar (Section 11, 12, 18) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.markAppliedBtn, appliedStatus === 'Applied' && styles.markAppliedActive]}
          onPress={handleMarkApplied}
        >
          <Ionicons
            name={appliedStatus === 'Applied' ? 'checkmark-circle' : 'checkbox-outline'}
            size={16}
            color={appliedStatus === 'Applied' ? '#34d399' : '#ffffff'}
          />
          <Text style={styles.markAppliedText}>
            {appliedStatus === 'Applied' ? 'Applied' : 'Track Application'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.applyBtn, isClosed && styles.applyBtnDisabled]}
          onPress={handleOpenOriginalUrl}
          disabled={isClosed}
        >
          <Text style={styles.applyBtnText}>
            {isClosed ? 'Application Closed' : 'Apply on Official Portal'}
          </Text>
          <Ionicons name="open-outline" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19'
  },
  centerBox: {
    flex: 1,
    backgroundColor: '#0b0f19',
    alignItems: 'center',
    justifyContent: 'center'
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center'
  },
  navRight: {
    flexDirection: 'row',
    gap: 8
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    marginHorizontal: 12
  },
  content: {
    padding: 16,
    paddingBottom: 100
  },
  sourceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  freshnessText: {
    fontSize: 11,
    color: '#64748b'
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 26,
    marginBottom: 6
  },
  organization: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16
  },
  statsGrid: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20
  },
  statItem: {
    width: '46%'
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 3
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f3f4f6'
  },
  detailSection: {
    marginBottom: 20
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 8
  },
  bodyText: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 20
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937'
  },
  specKey: {
    fontSize: 12,
    color: '#9ca3af'
  },
  specVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f3f4f6'
  },
  specBlock: {
    marginTop: 8
  },
  specValBlock: {
    fontSize: 12,
    color: '#d1d5db',
    lineHeight: 18,
    marginTop: 4
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4
  },
  docText: {
    fontSize: 12,
    color: '#cbd5e1'
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  skillChip: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  skillText: {
    color: '#e2e8f0',
    fontSize: 12
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 10
  },
  markAppliedBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderWidth: 1,
    borderColor: '#334155'
  },
  markAppliedActive: {
    borderColor: '#34d399'
  },
  markAppliedText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  },
  applyBtn: {
    flex: 1.5,
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48
  },
  applyBtnDisabled: {
    backgroundColor: '#374151'
  },
  applyBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  }
});
