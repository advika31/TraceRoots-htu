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
import { ProcessorAPI } from "@/services/api";

export default function UpdateBatchStatus() {
  const router = useRouter();
  const [batchId, setBatchId] = useState("");

  const updateStatus = async (status: string) => {
    if (!batchId) {
      Alert.alert("Batch ID is required");
      return;
    }
    try {
      await ProcessorAPI.updateStatus(batchId, status);
      Alert.alert("Success", `Batch status updated to ${status}`);
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.detail || "Failed to update status");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Batch Status</Text>

      <TextInput
        style={styles.input}
        placeholder="Batch ID"
        value={batchId}
        onChangeText={setBatchId}
      />

      <TouchableOpacity style={styles.button} onPress={() => updateStatus("AT_PROCESSOR")}>
        <Text style={styles.buttonText}>Mark as At Processor</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => updateStatus("IN_TRANSIT")}>
        <Text style={styles.buttonText}>Mark as In Transit</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => updateStatus("SOLD")}>
        <Text style={styles.buttonText}>Mark as Sold</Text>
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
    backgroundColor: "#15803d",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});