import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SourceBadgeProps {
  source: string;
  sourceType?: string;
  verificationStatus?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({
  source,
  sourceType,
  verificationStatus = 'VERIFIED'
}) => {
  const isGov = sourceType === 'OFFICIAL_GOVERNMENT' || source.includes('UPSC') || source.includes('SSC') || source.includes('NCS') || source.includes('Scholarship');

  return (
    <View style={[styles.badge, isGov ? styles.govBadge : styles.apiBadge]}>
      <Ionicons
        name={isGov ? 'shield-checkmark' : 'checkmark-circle'}
        size={11}
        color={isGov ? '#38bdf8' : '#34d399'}
      />
      <Text style={[styles.sourceText, isGov ? styles.govText : styles.apiText]} numberOfLines={1}>
        Source: {source}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start'
  },
  govBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: 'rgba(56, 189, 248, 0.25)'
  },
  apiBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderColor: 'rgba(52, 211, 153, 0.25)'
  },
  sourceText: {
    fontSize: 10,
    fontWeight: '600'
  },
  govText: {
    color: '#7dd3fc'
  },
  apiText: {
    color: '#6ee7b7'
  }
});
