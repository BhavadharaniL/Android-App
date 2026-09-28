import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NewsArticle } from '../types';
import { formatTimeAgo } from '../utils/formatters';

interface NewsCardProps {
  item: NewsArticle;
}

export const NewsCard: React.FC<NewsCardProps> = ({ item }) => {
  const handleOpenArticle = () => {
    if (item.url) {
      Linking.openURL(item.url).catch(err => {
        console.warn('Failed to open news article:', err);
      });
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handleOpenArticle}
      style={styles.card}
    >
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="newspaper-outline" size={28} color="#6b7280" />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{item.category || 'Tech'}</Text>
          </View>
          <Text style={styles.timeText}>{formatTimeAgo(item.publishedAt)}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        {item.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.sourceTag}>
            <Ionicons name="globe-outline" size={12} color="#9ca3af" />
            <Text style={styles.sourceName} numberOfLines={1}>
              {item.sourceName || 'Tech Source'}
            </Text>
          </View>
          <View style={styles.readMore}>
            <Text style={styles.readMoreText}>Read Source</Text>
            <Ionicons name="arrow-forward" size={11} color="#818cf8" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    flexDirection: 'column'
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: '#1f2937'
  },
  imagePlaceholder: {
    width: '100%',
    height: 90,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    padding: 14
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  categoryChip: {
    backgroundColor: 'rgba(129, 140, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  categoryText: {
    color: '#a5b4fc',
    fontSize: 10,
    fontWeight: '700'
  },
  timeText: {
    color: '#6b7280',
    fontSize: 11
  },
  title: {
    color: '#f9fafb',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 6
  },
  description: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    paddingTop: 8,
    marginTop: 4
  },
  sourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  sourceName: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500'
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  readMoreText: {
    color: '#a5b4fc',
    fontSize: 11,
    fontWeight: '600'
  }
});
