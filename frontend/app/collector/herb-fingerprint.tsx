import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import api from "@/services/api";

export default function HerbFingerprint() {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Camera access is needed");
      return;
    }

    const res = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!res.canceled) {
      setImage(res.assets[0].uri);
      setResult(null);
    }
  };

  const submitForAnalysis = async () => {
    if (!image) return;
    setAnalyzing(true);
    try {
      const formData = new FormData();
      const filename = image.split("/").pop() || "herb.jpg";
      formData.append("file", { uri: image, name: filename, type: "image/jpeg" } as any);
      const res = await api.post("/ai/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (e) {
      Alert.alert("Analysis failed", "Could not reach server.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Herb Fingerprint</Text>

      <View style={styles.card}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.placeholder}>No image captured</Text>
        )}

        <TouchableOpacity style={styles.primaryBtn} onPress={takePhoto}>
          <Text style={styles.btnText}>Capture Herb Image</Text>
        </TouchableOpacity>

        {image && (
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={submitForAnalysis}
            disabled={analyzing}
          >
            {analyzing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Submit for Analysis</Text>
            )}
          </TouchableOpacity>
        )}

        {result && (
          <View style={styles.resultBox}>
            <Text>Quality Score: {result.quality_score}</Text>
            <Text>Status: {result.label}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    padding: 20,
    paddingBottom: 100,
    backgroundColor: "#f0fdf4",
    flexGrow: 1,
    marginTop: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#166534",
    textAlign: "center",
    marginBottom: 20,
  },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16 },
  image: { width: "100%", height: 250, borderRadius: 12, marginBottom: 15 },
  placeholder: { textAlign: "center", color: "#6b7280", marginVertical: 40 },
  primaryBtn: {
    backgroundColor: "#15803d",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  secondaryBtn: { backgroundColor: "#065f46", padding: 14, borderRadius: 12 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  resultBox: { marginTop: 15, backgroundColor: "#ecfdf5", padding: 12, borderRadius: 10 },
});
