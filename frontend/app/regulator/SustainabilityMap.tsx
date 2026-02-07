// frontend/app/regulator/SustainabilityMap.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { RegulatorAPI } from '../../services/api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SustainabilityMap() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState<any[]>([]);

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      const data = await RegulatorAPI.getMapData();
      setZones(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert("Error", "Could not fetch map data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Overlay */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={28} color="#333" onPress={() => router.back()} />
        <Text style={styles.title}>Sustainability Monitor 🌍</Text>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text>Analyzing Satellite Data...</Text>
        </View>
      ) : (
        <MapView 
          style={styles.map}
          initialRegion={{
            latitude: 30.7333, // Default to Punjab/Chandigarh
            longitude: 76.7794,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }}
        >
          {zones.map((zone, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: zone.lat, longitude: zone.lng }}
              pinColor={zone.zone_status === 'RED' ? 'red' : 'green'}
            >
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{zone.crop}</Text>
                  <Text>Farmer: {zone.farmer}</Text>
                  <Text style={{ fontWeight: 'bold', color: zone.zone_status === 'RED' ? 'red' : 'green' }}>
                    Status: {zone.zone_status}
                  </Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: 'green' }]} />
          <Text>Safe Harvest</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: 'red' }]} />
          <Text>Over-Farming Detected</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  header: { 
    position: 'absolute', top: 50, left: 20, right: 20, 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.9)', padding: 15, borderRadius: 10, zIndex: 10, elevation: 5 
  },
  title: { fontSize: 18, fontWeight: 'bold', marginLeft: 10, color: '#2e7d32' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  callout: { padding: 5, width: 150 },
  calloutTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  legend: {
    position: 'absolute', bottom: 30, left: 20, 
    backgroundColor: 'white', padding: 15, borderRadius: 10, elevation: 5
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 }
});