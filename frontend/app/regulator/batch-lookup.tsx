import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import api, { BlockchainAPI } from "@/services/api";

export default function RegulatorBatchLookup() {
  const [batchId, setBatchId] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [chainInfo, setChainInfo] = useState<any>(null);
  const [chainLoading, setChainLoading] = useState(false);
  const [registering, setRegistering] = useState(false);

  const fetchBatch = async () => {
    if (!batchId) {
      Alert.alert("Please enter Batch ID");
      return;
    }
    setChainInfo(null);
    setLoading(true);
    try {
      const res = await api.get(`/batches/${batchId}`);
      setData(res.data);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.detail || "Batch not found");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const verifyOnChain = async () => {
    if (!batchId) return;
    setChainLoading(true);
    setChainInfo(null);
    try {
      const res = await BlockchainAPI.verifyBatch(batchId);
      setChainInfo(res);
    } catch (e: any) {
      Alert.alert("Blockchain", e?.response?.data?.detail || "Could not verify on chain");
    } finally {
      setChainLoading(false);
    }
  };

  const registerOnChain = async () => {
    if (!batchId) return;
    setRegistering(true);
    try {
      const res = await BlockchainAPI.registerBatch(batchId);
      setChainInfo((prev: any) => ({ ...prev, ...res, on_chain: true }));
      if (data) setData({ ...data, blockchain_tx_hash: res.blockchain_tx_hash });
      Alert.alert("Success", res.message || "Registered on chain");
    } catch (e: any) {
      Alert.alert("Blockchain", e?.response?.data?.detail || "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Batch Lookup</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Batch ID"
        value={batchId}
        onChangeText={setBatchId}
      />

      <TouchableOpacity style={styles.button} onPress={fetchBatch}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>

      {loading && <Text style={styles.loading}>Loading...</Text>}

      {data && (
        <View style={styles.card}>
          <Text style={styles.section}>Batch Info</Text>
          <Text>Crop: {data.crop_name}</Text>
          <Text>Quantity: {data.quantity} kg</Text>
          <Text>Status: {data.status}</Text>

          <Text style={styles.section}>Lab Report</Text>
          {data.lab_report ? (
            <>
              <Text>Result: {data.lab_report.result_summary}</Text>
              <Text>Report URL: {data.lab_report.report_file_url}</Text>
            </>
          ) : (
            <Text>No lab report uploaded</Text>
          )}

          <Text style={styles.section}>Blockchain</Text>
          <Text>TX: {data.blockchain_tx_hash || "Not synced"}</Text>
          <View style={styles.chainRow}>
            <TouchableOpacity style={styles.chainButton} onPress={verifyOnChain} disabled={chainLoading}>
              {chainLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.chainButtonText}>Verify on chain</Text>}
            </TouchableOpacity>
            {chainInfo && !chainInfo.on_chain && (
              <TouchableOpacity style={[styles.chainButton, styles.registerButton]} onPress={registerOnChain} disabled={registering}>
                {registering ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.chainButtonText}>Register on chain</Text>}
              </TouchableOpacity>
            )}
          </View>
          {chainInfo && (
            <Text style={styles.chainStatus}>
              {chainInfo.on_chain ? "✓ Verified on TraceRoots contract" : "Not yet on chain"}
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chainRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  chainButton: {
    backgroundColor: "#1565c0",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  registerButton: {
    backgroundColor: "#2e7d32",
  },
  chainButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  chainStatus: {
    marginTop: 8,
    fontSize: 13,
    color: "#333",
    backgroundColor: "#f0fdf4",
    padding: 20,
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
    marginVertical: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginTop: 12,
    marginBottom: 4,
    fontWeight: "bold",
    color: "#166534",
  },
});
