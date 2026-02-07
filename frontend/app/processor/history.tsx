import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function ProcessorHistory() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get('/batches/all');
      const data = res.data || [];
      
      // Filter: Show only batches that have been PROCESSED (Lab Tested, Sold, etc.)
      // We exclude 'HARVESTED' because those are new/untouched.
      const processed = data.filter((b: any) => 
        b.status === 'LAB_TESTED' || b.status === 'SOLD' || b.status === 'IN_TRANSIT' || b.status === 'DONATION_READY'
      );
      
      // Sort by newest
      setHistory(processed.reverse());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.batchId}>#{item.batch_id.substring(0, 8)}</Text>
        <Text style={styles.date}>{new Date(item.harvest_date).toLocaleDateString()}</Text>
      </View>
      
      <Text style={styles.cropName}>{item.crop_name}</Text>
      <Text style={styles.details}>Quantity: {item.quantity} kg</Text>
      
      <View style={styles.statusRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.quality_grade ? `Grade ${item.quality_grade}` : "Ungraded"}</Text>
        </View>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {item.status.replace('_', ' ')}
        </Text>
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    if (status === 'LAB_TESTED') return '#2e7d32'; // Green
    if (status === 'DONATION_READY') return '#ef6c00'; // Orange
    return '#666';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="#333" onPress={() => router.back()} />
        <Text style={styles.title}>Processing Log</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2e7d32" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.batch_id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="file-tray-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No processing history found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 30, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginLeft: 15, color: '#333' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  batchId: { fontSize: 12, color: '#888', fontWeight: 'bold' },
  date: { fontSize: 12, color: '#888' },
  cropName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  details: { color: '#555', marginVertical: 5 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  badge: { backgroundColor: '#e3f2fd', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#1565c0', fontWeight: 'bold', fontSize: 12 },
  statusText: { fontWeight: 'bold', fontSize: 12 },
  empty: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#999', marginTop: 10 }
});