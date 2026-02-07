import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Navbar from "../components/Navbar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CollectorAPI, NotificationsAPI } from "@/services/api";

export default function CollectorDashboard() {
  const router = useRouter();
  const [collectorName, setCollectorName] = useState("");
  const [batchCount, setBatchCount] = useState(0);
  const [tokens, setTokens] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const userId = await AsyncStorage.getItem("userId");
      const name = await AsyncStorage.getItem("username");
      if (name) setCollectorName(name);
      if (!userId) return;

      const stats = await CollectorAPI.getStats(Number(userId));
      setBatchCount(stats.batches || 0);
      setTokens(stats.tokens || 0);

      const notes = await NotificationsAPI.getForUser(Number(userId));
      setNotifications(Array.isArray(notes) ? notes.slice(0, 3) : []);
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Navbar />

      <Text style={styles.welcomeText}>Welcome {collectorName || "Collector"}!</Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Sync Status: Online</Text>
        <Text style={styles.statusText}>Total Batches: {batchCount}</Text>
        <Text style={styles.statusText}>Tokens Earned: {tokens}</Text>
        <Text style={styles.statusText}>Zone: Sustainable (Green)</Text>
      </View>

      <Text style={styles.sectionTitle}>Recent Alerts</Text>
      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>No notifications</Text>
      ) : (
        notifications.map((n) => (
          <View key={n.id} style={styles.noteCard}>
            <Text style={styles.noteText}>{n.message}</Text>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>Collector Tools</Text>
      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/collector/new-collection")}
        >
          <MaterialIcons name="note-add" size={30} color="#15803d" />
          <Text style={styles.cardText}>New Collection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/collector/herb-fingerprint")}
        >
          <MaterialIcons name="camera-alt" size={30} color="#15803d" />
          <Text style={styles.cardText}>Herb Fingerprint</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/collector/generate-batch")}
        >
          <MaterialIcons name="qr-code-2" size={30} color="#15803d" />
          <Text style={styles.cardText}>Batch and QR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/regulator/SustainabilityMap")}
        >
          <MaterialIcons name="map" size={30} color="#15803d" />
          <Text style={styles.cardText}>Sustainability Map</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f0fdf4",
    padding: 20,
    paddingBottom: 100,
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: "600",
    color: "#166534",
    marginBottom: 20,
    textAlign: "center",
  },
  statusCard: {
    backgroundColor: "#166534",
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#f6f9f9ff",
  },
  statusText: {
    fontSize: 15,
    color: "#ffffffff",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#166534",
    marginBottom: 10,
  },
  emptyText: {
    color: "#6b7280",
    marginBottom: 16,
  },
  noteCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  noteText: {
    color: "#374151",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 25,
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardText: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
    color: "#374151",
  },
});
