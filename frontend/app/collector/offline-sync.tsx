import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useState } from "react";
import { syncPendingUploads } from "../../services/offlineSync";

export default function OfflineSync() {
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<string>("");

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await syncPendingUploads();
      setLastResult(`Synced ${res.synced}, Remaining ${res.remaining}`);
      Alert.alert("Sync Complete", `Synced ${res.synced} items. Remaining ${res.remaining}.`);
    } catch {
      Alert.alert("Sync Failed", "Please check your internet connection.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <View style={styles.page}>
      <Text style={styles.title}>Offline Sync</Text>

      <View style={styles.card}>
        <Text style={styles.text}>
          Collections captured offline will sync automatically once connected.
        </Text>
        {!!lastResult && <Text style={styles.result}>{lastResult}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleSync} disabled={syncing}>
          {syncing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Sync Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f0fdf4", padding: 20, marginTop: 40 },
  title: { fontSize: 30, fontWeight: "bold", color: "#166534", textAlign: "center", marginBottom: 20 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 20, flex: 1 },
  text: { fontSize: 16, textAlign: "center", marginBottom: 10, color: "#374151" },
  result: { textAlign: "center", color: "#065f46", marginBottom: 20 },
  button: { backgroundColor: "#15803d", padding: 16, borderRadius: 12 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
