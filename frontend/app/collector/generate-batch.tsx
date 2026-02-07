import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg'; // Ensure you installed this
import { CollectorAPI } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function BatchQRList() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedQR, setSelectedQR] = useState<any>(null); // For fullscreen zoom

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert("Error", "User not logged in");
        return;
      }
      const data = await CollectorAPI.getHistory(Number(userId));
      // Sort by newest first
      const sorted = data.sort((a: any, b: any) => new Date(b.harvest_date).getTime() - new Date(a.harvest_date).getTime());
      setBatches(sorted);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not fetch batch history");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    // The data encoded in the QR. 
    // We send a JSON string so the Processor can extract batch_id easily.
    const qrData = JSON.stringify({
      batch_id: item.batch_id,
      crop_name: item.crop_name,
      farmer_id: item.farmer_id
    });

    return (
      <View style={styles.card}>
        <View style={styles.info}>
          <Text style={styles.cropName}>{item.crop_name}</Text>
          <Text style={styles.batchId}>ID: #{item.batch_id.substring(0, 8)}</Text>
          <Text style={styles.detail}>{item.quantity} kg • {new Date(item.harvest_date).toLocaleDateString()}</Text>
          
          <View style={[styles.badge, item.status === 'LAB_TESTED' ? styles.badgeGreen : styles.badgeGray]}>
            <Text style={styles.badgeText}>{item.status.replace('_', ' ')}</Text>
          </View>
        </View>

        {/* QR Code Section */}
        <TouchableOpacity style={styles.qrContainer} onPress={() => setSelectedQR({ ...item, qrData })}>
          <QRCode value={qrData} size={80} />
          <Text style={styles.zoomText}>Tap to Enlarge</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="#333" onPress={() => router.back()} />
        <Text style={styles.title}>My Batch QRs</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={batches}
          keyExtractor={(item) => item.batch_id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="qr-code-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No batches found. Create one first!</Text>
            </View>
          }
        />
      )}

      {/* Fullscreen QR Modal */}
      <Modal visible={!!selectedQR} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedQR?.crop_name}</Text>
            <Text style={styles.modalId}>Batch #{selectedQR?.batch_id.substring(0, 8)}</Text>
            
            {selectedQR && (
              <View style={styles.bigQR}>
                <QRCode value={selectedQR.qrData} size={200} />
              </View>
            )}
            
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedQR(null)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 30, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginLeft: 15, color: '#333' },
  
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 15, 
    marginBottom: 15, 
    flexDirection: 'row', 
    alignItems: 'center',
    elevation: 2 
  },
  info: { flex: 1, marginRight: 10 },
  cropName: { fontSize: 18, fontWeight: 'bold', color: '#1b5e20' },
  batchId: { fontSize: 14, color: '#555', marginTop: 2 },
  detail: { fontSize: 12, color: '#888', marginTop: 4 },
  
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, marginTop: 8 },
  badgeGreen: { backgroundColor: '#e8f5e9' },
  badgeGray: { backgroundColor: '#eee' },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#333' },

  qrContainer: { alignItems: 'center', justifyContent: 'center' },
  zoomText: { fontSize: 10, color: '#1565c0', marginTop: 5 },

  empty: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#999', marginTop: 10 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 30, borderRadius: 20, alignItems: 'center', width: '85%' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  modalId: { fontSize: 16, color: '#666', marginBottom: 20 },
  bigQR: { padding: 10, backgroundColor: '#fff' },
  closeBtn: { marginTop: 25, backgroundColor: '#2e7d32', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  closeText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});