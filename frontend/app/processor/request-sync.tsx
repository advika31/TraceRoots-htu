// frontend/app/processor/request-sync.tsx
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import API from "@/services/api";

export default function RequestSyncBlockchain() {
  const router = useRouter();
  const [batchId, setBatchId] = useState("");

  const syncBatch = async () => {
    if (!batchId) {
      Alert.alert("Batch ID is required");
      return;
    }

    try {
      const res = await API.post(`/processor/sync-blockchain/${batchId}`);

      Alert.alert(
        "Success",
        res.data.message + "\n\nTX:\n" + res.data.blockchain_tx
      );
      router.back();
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.detail || "Failed to sync batch"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sync Batch to Blockchain</Text>

      <TextInput
        style={styles.input}
        placeholder="Batch ID"
        keyboardType="numeric"
        value={batchId}
        onChangeText={setBatchId}
      />

      <TouchableOpacity style={styles.button} onPress={syncBatch}>
        <Text style={styles.buttonText}>Request Sync</Text>
      </TouchableOpacity>
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
    marginBottom: 25,
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 14,
  },
  button: {
    backgroundColor: "#16a34a",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
