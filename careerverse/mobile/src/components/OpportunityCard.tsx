import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Opportunity } from '../types';
import { SourceBadge } from './SourceBadge';
import { DeadlineBadge } from './DeadlineBadge';
import { formatTimeAgo } from '../utils/formatters';

interface OpportunityCardProps {
  item: Opportunity;
  onPress: () => void;
  onSave?: (id: string) => void;
  isSaved?: boolean;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  item,
  onPress,
  onSave,
  isSaved = false
}) => {
  const handleOpenOriginalUrl = () => {
    if (item.applicationUrl) {
      Linking.openURL(item.applicationUrl).catch(err => {
        console.warn('Failed to open external URL:', err);
      });
    }
  };

  const isClosed = item.status === 'CLOSED';

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.card, isClosed && styles.cardClosed]}
    >
      {/* Top Header: Category & Deadline */}
      <View style={styles.headerRow}>
        <View style={styles.tagGroup}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {item.category.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          {item.workType && item.workType !== 'Not Specified' && (
            <View style={styles.workTypeBadge}>
              <Text style={styles.workTypeText}>{item.workType}</Text>
            </View>
          )}
        </View>

        <View style={styles.rightHeader}>
          <DeadlineBadge deadline={item.deadline} />
          {onSave && (
            <TouchableOpacity
              onPress={() => onSave(item._id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={isSaved ? '#818cf8' : '#9ca3af'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Title & Organization */}
      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.organization} numberOfLines={1}>
        {item.organization}
      </Text>

      {/* Location & Meta info */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="location-outline" size={13} color="#9ca3af" />
          <Text style={styles.metaText} numberOfLines={1}>
            {item.location || 'India'}
          </Text>
        </View>

        {item.salaryOrStipend?.text ? (
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={13} color="#34d399" />
            <Text style={[styles.metaText, { color: '#34d399', fontWeight: '600' }]} numberOfLines={1}>
              {item.salaryOrStipend.text}
            </Text>
          </View>
        ) : null}

        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={13} color="#9ca3af" />
          <Text style={styles.metaText}>
            {formatTimeAgo(item.publishedAt || item.lastFetchedAt)}
          </Text>
        </View>
      </View>

      {/* Recommendation Match Reason (Section 26) */}
      {item.matchReason ? (
        <View style={styles.matchReasonContainer}>
          <Ionicons name="sparkles" size={12} color="#a78bfa" />
          <Text style={styles.matchReasonText} numberOfLines={1}>
            {item.matchReason}
          </Text>
        </View>
      ) : null}

      {/* Skills Chips */}
      {item.skills && item.skills.length > 0 && (
        <View style={styles.skillsRow}>
          {item.skills.slice(0, 3).map((skill, index) => (
            <View key={index} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {item.skills.length > 3 && (
            <Text style={styles.moreSkillsText}>+{item.skills.length - 3}</Text>
          )}
        </View>
      )}

      {/* Footer: Source Attribution & View Original Safe Link (Section 18, 55) */}
      <View style={styles.footerRow}>
        <SourceBadge
          source={item.source}
          sourceType={item.sourceType}
          verificationStatus={item.verificationStatus}
        />

        <TouchableOpacity
          onPress={handleOpenOriginalUrl}
          style={styles.viewOriginalBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.viewOriginalText}>View Original</Text>
          <Ionicons name="open-outline" size={12} color="#818cf8" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3
  },
  cardClosed: {
    opacity: 0.65,
    borderColor: '#374151'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  tagGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  categoryBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)'
  },
  categoryText: {
    color: '#a5b4fc',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  workTypeBadge: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6
  },
  workTypeText: {
    color: '#9ca3af',
    fontSize: 9,
    fontWeight: '600'
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f9fafb',
    lineHeight: 22,
    marginBottom: 4
  },
  organization: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9ca3af',
    marginBottom: 10
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metaText: {
    fontSize: 11,
    color: '#9ca3af'
  },
  matchReasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)'
  },
  matchReasonText: {
    color: '#c4b5fd',
    fontSize: 11,
    fontWeight: '600',
    flex: 1
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
    marginBottom: 12
  },
  skillChip: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  skillText: {
    color: '#d1d5db',
    fontSize: 10,
    fontWeight: '500'
  },
  moreSkillsText: {
    color: '#6b7280',
    fontSize: 10,
    fontWeight: '600'
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    paddingTop: 10,
    marginTop: 2
  },
  viewOriginalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.1)'
  },
  viewOriginalText: {
    fontSize: 11,
    color: '#a5b4fc',
    fontWeight: '600'
  }
});
