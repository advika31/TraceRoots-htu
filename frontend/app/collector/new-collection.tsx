import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { CollectorAPI } from '../../services/api';
import { queueUpload } from '../../services/offlineSync';

export default function NewCollection() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const [cropName, setCropName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [locationCoords, setLocationCoords] = useState('0.0,0.0');
  const [address, setAddress] = useState('Fetching location...');
  const [region, setRegion] = useState('');

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setAddress('Location permission denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocationCoords(`${location.coords.latitude},${location.coords.longitude}`);
        setAddress(`Lat: ${location.coords.latitude.toFixed(4)}, Lng: ${location.coords.longitude.toFixed(4)}`);

        const geo = await Location.reverseGeocodeAsync(location.coords);
        if (geo && geo.length > 0) {
          const place = geo[0];
          const regionStr = [place.city, place.region, place.country].filter(Boolean).join(", ");
          setRegion(regionStr || "Local Farm");
        }

      } catch (e) {
        setLocationCoords("28.6139,77.2090");
        setAddress("GPS Unavailable (Using Default)");
        setRegion("Local Farm");
      }
    })();
  }, []);

  const addPhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      if (images.includes(uri)) {
        Alert.alert("Duplicate Photo", "Please take a different angle.");
        return;
      }
      setImages((prev) => [...prev, uri]);
    }
  };

  const handleUpload = async () => {
    if (images.length < 2 || !cropName || !quantity) {
      Alert.alert("Missing Details", "Please add at least 2 photos and fill all fields.");
      return;
    }

    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error("User not logged in");

      const formData = new FormData();
      formData.append('farmer_id', userId);
      formData.append('crop_name', cropName);
      formData.append('quantity', quantity);
      formData.append('location', locationCoords);
      formData.append('region', region || "Local Farm");

      images.forEach((img, idx) => {
        const filename = img.split('/').pop() || `upload_${idx}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        // @ts-ignore
        formData.append('files', { uri: img, name: filename, type });
      });

      const result = await CollectorAPI.uploadBatch(formData);
      Alert.alert("Success", "Batch created successfully.");
      router.replace({
        pathname: "/collector/generate-batch",
        params: { batchId: result.batch_id, qrUrl: result.qr_code_url }
      });
    } catch (error) {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        await queueUpload({
          farmer_id: userId,
          crop_name: cropName,
          quantity,
          location: locationCoords,
          region,
          images
        });
        Alert.alert("Offline Saved", "No internet. Batch saved and will sync automatically.");
      } else {
        Alert.alert("Upload Failed", "Could not connect to server. Check internet.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>New Harvest Collection</Text>

      <TouchableOpacity style={styles.addPhotoBtn} onPress={addPhoto}>
        <Ionicons name="camera" size={20} color="#fff" />
        <Text style={styles.addPhotoText}>Add Photo</Text>
      </TouchableOpacity>

      <View style={styles.photoGrid}>
        {images.map((img, idx) => (
          <Image key={idx} source={{ uri: img }} style={styles.image} />
        ))}
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Crop Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Wheat, Tomato"
          value={cropName}
          onChangeText={setCropName}
        />

        <Text style={styles.label}>Quantity (kg)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 500"
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
        />

        <Text style={styles.label}>Location (Auto-detected)</Text>
        <View style={styles.locationBox}>
          <Ionicons name="location-sharp" size={20} color="#2e7d32" />
          <Text style={styles.locationText}>{address}</Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleUpload}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Generate Batch ID</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#1b5e20', marginBottom: 20, marginTop: 10 },
  addPhotoBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2e7d32', padding: 12, borderRadius: 10, marginBottom: 12, gap: 8 },
  addPhotoText: { color: '#fff', fontWeight: '600' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 },
  image: { width: '48%', height: 140, borderRadius: 10 },
  form: { gap: 15 },
  label: { fontSize: 16, fontWeight: '600', color: '#333' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
  locationBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f5e9', padding: 15, borderRadius: 10 },
  locationText: { marginLeft: 10, color: '#2e7d32', fontWeight: '500' },
  btn: { backgroundColor: '#2e7d32', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnDisabled: { backgroundColor: '#a5d6a7' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
