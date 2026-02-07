import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { RegulatorAPI } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function SetThresholds() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [limit, setLimit] = useState('');
  const [zones, setZones] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await RegulatorAPI.getThresholds();
      setLimit(data.max_harvest_limit);
      setZones(data.banned_regions);
    } catch (e) {
      Alert.alert("Error", "Could not fetch current settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await RegulatorAPI.setThresholds({
        max_harvest_limit: limit,
        banned_regions: zones
      });
      Alert.alert("Success", "Regulatory policies updated.");
      router.back();
    } catch (e) {
      Alert.alert("Error", "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#d32f2f" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="#333" onPress={() => router.back()} />
        <Text style={styles.title}>Policy & Thresholds</Text>
      </View>

      <Text style={styles.subtitle}>Define harvest limits and restricted zones for the current season.</Text>

      {/* Limit Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Max Harvest Limit (kg/district)</Text>
        <TextInput 
          style={styles.input} 
          value={limit} 
          onChangeText={setLimit}
          keyboardType="numeric"
          placeholder="e.g. 500"
        />
        <Text style={styles.helper}>Triggers a 'High Stress' alert if exceeded.</Text>
      </View>

      {/* Zones Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Banned / Restricted Zones</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          value={zones} 
          onChangeText={setZones}
          multiline
          numberOfLines={4}
          placeholder="e.g. Punjab-Zone-1, Haryana-South"
        />
        <Text style={styles.helper}>Enter zone names separated by commas.</Text>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Update Policies</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 40, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginLeft: 15, color: '#d32f2f' },
  subtitle: { color: '#666', marginBottom: 30 },
  
  inputGroup: { marginBottom: 25 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  textArea: { height: 100, textAlignVertical: 'top' },
  helper: { fontSize: 12, color: '#888', marginTop: 5 },

  saveBtn: { backgroundColor: '#d32f2f', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});