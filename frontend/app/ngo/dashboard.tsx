import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SurplusAPI } from '../../services/api';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function NGODashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'OFFERS' | 'CLAIMED'>('OFFERS');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      let result;
      if (activeTab === 'OFFERS') {
        result = await SurplusAPI.getAvailable(); 
      } else {
        result = await SurplusAPI.getClaimed();   
      }
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (batchId: string) => {
    try {
      await SurplusAPI.claimBatch(batchId, 501); // Mock NGO ID
      Alert.alert("Thank You! 🌱", "You have accepted this donation. It has been moved to your Claimed History.");
      loadData(); 
    } catch (e) {
      Alert.alert("Error", "Could not accept donation.");
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <MaterialIcons name="restaurant" size={24} color="#fff" />
        </View>
        <View style={{flex: 1, marginLeft: 12}}>
          <Text style={styles.cropName}>{item.crop_name}</Text>
          <Text style={styles.batchId}>ID: {item.batch_id.substring(0, 8)}</Text>
        </View>
        <View style={styles.qtyBadge}>
          <Text style={styles.qtyText}>{item.quantity} kg</Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.detailText}>📍 Location: {item.region || "Processing Center"}</Text>
        <Text style={styles.detailText}>📅 Harvested: {new Date(item.harvest_date).toLocaleDateString()}</Text>
      </View>

      {activeTab === 'OFFERS' ? (
        <View style={styles.actionRow}>
          <Text style={styles.offerText}>Processor offered this batch.</Text>
          <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item.batch_id)}>
            <Text style={styles.btnText}>Accept Donation</Text>
            <Ionicons name="checkmark-circle" size={20} color="#fff" style={{marginLeft: 5}} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.claimedRow}>
          <Ionicons name="time" size={16} color="#2e7d32" />
          <Text style={styles.claimedText}>Claimed & Distributed</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>NGO Relief Center 🚚</Text>
        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Ionicons name="log-out-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'OFFERS' && styles.activeTab]} 
          onPress={() => setActiveTab('OFFERS')}
        >
          <Text style={[styles.tabText, activeTab === 'OFFERS' && styles.activeTabText]}>New Offers</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'CLAIMED' && styles.activeTab]} 
          onPress={() => setActiveTab('CLAIMED')}
        >
          <Text style={[styles.tabText, activeTab === 'CLAIMED' && styles.activeTabText]}>Claimed History</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.batch_id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="file-tray-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>
              {activeTab === 'OFFERS' ? "No new donations offered yet." : "No claimed history yet."}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa', paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1565c0' },
  
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 10 },
  tab: { marginRight: 15, paddingBottom: 10 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#1565c0' },
  tabText: { fontSize: 16, color: '#888', fontWeight: '600' },
  activeTabText: { color: '#1565c0' },

  card: { backgroundColor: '#fff', borderRadius: 16, padding: 15, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconBox: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#4caf50', justifyContent: 'center', alignItems: 'center' },
  cropName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  batchId: { fontSize: 12, color: '#888' },
  qtyBadge: { backgroundColor: '#e8f5e9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  qtyText: { color: '#2e7d32', fontWeight: 'bold' },
  
  details: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, marginBottom: 15 },
  detailText: { color: '#555', marginBottom: 4 },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  offerText: { fontSize: 12, color: '#ef6c00', fontStyle: 'italic' },
  acceptBtn: { backgroundColor: '#1565c0', flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 25, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },

  claimedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, backgroundColor: '#e8f5e9', borderRadius: 8 },
  claimedText: { color: '#2e7d32', fontWeight: 'bold', marginLeft: 5 },

  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#999', marginTop: 10, fontSize: 16 }
});