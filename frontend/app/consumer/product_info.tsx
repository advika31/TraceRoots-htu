// frontend/app/consumer/product_info.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ConsumerAPI } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export default function ProductInfo() {
  const { batchId } = useLocalSearchParams(); 
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (batchId) fetchStory();
  }, [batchId]);

  const fetchStory = async () => {
    try {
      const storyData = await ConsumerAPI.getStory(batchId as string);
      setData(storyData);
    } catch (e) {
      alert("Product not found!");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#2e7d32" /></View>;
  if (!data) return <View style={styles.center}><Text>Product Not Found</Text></View>;

  return (
    <ScrollView style={styles.container}>
      {/* Hero Image */}
      <Image source={{ uri: `${API_URL}${data.batch_details.image}` }} style={styles.heroImage} />
      
      <View style={styles.content}>
        {/* Title & Verification */}
        <View style={styles.header}>
          <Text style={styles.title}>{data.batch_details.crop_name}</Text>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={16} color="#fff" />
            <Text style={styles.badgeText}>Verified</Text>
          </View>
        </View>

        {/* The AI Story */}
        <Text style={styles.sectionTitle}>The Journey</Text>
        <Text style={styles.storyText}>{data.story_narrative}</Text>

        {/* Timeline */}
        <View style={styles.timeline}>
          {data.timeline.map((item: any, index: number) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineIcon}>
                <Ionicons name={item.icon as any} size={20} color="#fff" />
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineDate}>{item.date}</Text>
                <Text style={styles.timelineEvent}>{item.event}</Text>
                <Text style={styles.timelineDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Blockchain Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Blockchain ID: {data.verification.blockchain_hash}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroImage: { width: '100%', height: 250 },
  content: { padding: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  badge: { flexDirection: 'row', backgroundColor: '#2e7d32', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignItems: 'center' },
  badgeText: { color: '#fff', marginLeft: 5, fontWeight: 'bold' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#1b5e20' },
  storyText: { fontSize: 16, lineHeight: 24, color: '#555', marginBottom: 30 },
  timeline: { borderLeftWidth: 2, borderLeftColor: '#e0e0e0', marginLeft: 10 },
  timelineItem: { flexDirection: 'row', marginBottom: 25, marginLeft: -16, alignItems: 'center' },
  timelineIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2e7d32', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  timelineContent: { flex: 1, backgroundColor: '#f5f5f5', padding: 15, borderRadius: 10 },
  timelineDate: { fontSize: 12, color: '#888' },
  timelineEvent: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  timelineDesc: { fontSize: 14, color: '#666', marginTop: 2 },
  footer: { marginTop: 20, padding: 15, backgroundColor: '#e3f2fd', borderRadius: 10 },
  footerText: { fontSize: 12, color: '#1565c0', textAlign: 'center' }
});