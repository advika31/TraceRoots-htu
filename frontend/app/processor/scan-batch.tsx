import { useEffect, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import Navbar from "../components/Navbar";
import { ProcessorAPI } from "../../services/api";
import { useRouter } from "expo-router";

export default function ScanBatch() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  useEffect(() => {
    requestPermission();
  }, []);

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Navbar />
        <Text>Camera permission required</Text>
      </View>
    );
  }

  const handleBarCodeScanned = async (result: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    try {
      const batchId = result.data;
      const data = await ProcessorAPI.getBatch(batchId);
      if (data) {
        router.push({ pathname: "/processor/upload-lab-test", params: { batchId } });
      } else {
        Alert.alert("Not Found", "Batch not found in system.");
      }
    } catch {
      Alert.alert("Network Error", "Could not reach server.");
    }
  };

  return (
    <View style={styles.container}>
      <Navbar />
      <Text style={styles.title}>Scan Batch QR</Text>

      <CameraView
        style={styles.camera}
        onBarcodeScanned={handleBarCodeScanned}
      />

      <TouchableOpacity style={styles.scanButton} onPress={() => setScanned(false)}>
        <Text style={styles.scanText}>
          {scanned ? "Tap to Scan Again" : "Waiting for QR"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0fdf4" },
  title: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#15803d",
  },
  camera: {
    flex: 1,
    margin: 15,
    borderRadius: 20,
    overflow: "hidden",
  },
  scanButton: {
    backgroundColor: "#16a34a",
    padding: 15,
    borderRadius: 30,
    margin: 20,
    alignItems: "center",
  },
  scanText: { color: "#fff", fontWeight: "600" },
});
