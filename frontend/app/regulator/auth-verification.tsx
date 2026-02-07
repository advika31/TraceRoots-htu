import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "@/services/api";

export default function AuthVerification() {
  const [batchId, setBatchId] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const verifyBatch = async () => {
    if (!batchId) {
      Alert.alert("Batch ID is required");
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/regulator/verify/${batchId}`);
      setResult(res.data);
    } catch (e: any) {
      Alert.alert("Verification Failed", e?.response?.data?.detail || "Error verifying batch");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blockchain Authenticity Check</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Batch ID"
        value={batchId}
        onChangeText={setBatchId}
      />

      <TouchableOpacity style={styles.button} onPress={verifyBatch}>
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>

      {loading && <Text style={styles.loading}>Verifying...</Text>}

      {result && (
        <View style={styles.card}>
          <Text style={styles.status}>
            {result.on_chain_verified ? "VERIFIED" : "NOT VERIFIED"}
          </Text>
          <Text>Status: {result.status}</Text>
          <Text>TX: {result.blockchain_tx || "Not available"}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#15803d",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#15803d",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loading: {
    textAlign: "center",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  status: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
});
