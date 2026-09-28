import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDeadline } from '../utils/formatters';

interface DeadlineBadgeProps {
  deadline: string | undefined;
}

export const DeadlineBadge: React.FC<DeadlineBadgeProps> = ({ deadline }) => {
  const { text, isUrgent, isExpired } = formatDeadline(deadline);

  return (
    <View
      style={[
        styles.badge,
        isExpired
          ? styles.expiredBadge
          : isUrgent
          ? styles.urgentBadge
          : styles.normalBadge
      ]}
    >
      <Ionicons
        name={isExpired ? 'close-circle' : isUrgent ? 'time' : 'calendar-outline'}
        size={11}
        color={isExpired ? '#9ca3af' : isUrgent ? '#f87171' : '#fbbf24'}
      />
      <Text
        style={[
          styles.text,
          isExpired
            ? styles.expiredText
            : isUrgent
            ? styles.urgentText
            : styles.normalText
        ]}
      >
        {text}
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
    borderWidth: 1
  },
  urgentBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)'
  },
  expiredBadge: {
    backgroundColor: 'rgba(107, 114, 128, 0.15)',
    borderColor: 'rgba(107, 114, 128, 0.3)'
  },
  normalBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.25)'
  },
  text: {
    fontSize: 10,
    fontWeight: '700'
  },
  urgentText: {
    color: '#f87171'
  },
  expiredText: {
    color: '#9ca3af'
  },
  normalText: {
    color: '#fbbf24'
  }
});
