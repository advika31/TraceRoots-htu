import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { RegulatorAPI } from "@/services/api";

type AlertItem = {
  farmer_id: number;
  farmer_name: string;
  total_harvested_kg: number;
  threshold_kg: number;
  severity: string;
};

type NoteItem = {
  id: number;
  message: string;
  priority: string;
  timestamp: string;
};

export default function RegulatorAlerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await RegulatorAPI.getAlerts();
        setAlerts(res.alerts || []);
        setNotes(res.notifications || []);
      } catch (e) {
        console.log("Failed to fetch alerts", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading alerts...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Sustainability Alerts</Text>

      {alerts.length === 0 ? (
        <Text style={styles.empty}>No violations detected</Text>
      ) : (
        alerts.map((alert) => (
          <View key={alert.farmer_id} style={styles.card}>
            <Text style={styles.name}>{alert.farmer_name}</Text>
            <Text>Severity: {alert.severity}</Text>
            <Text>Harvested: {alert.total_harvested_kg} kg</Text>
            <Text>Limit: {alert.threshold_kg} kg</Text>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>System Notifications</Text>
      {notes.length === 0 ? (
        <Text style={styles.empty}>No new notifications</Text>
      ) : (
        notes.map((n) => (
          <View key={n.id} style={styles.noteCard}>
            <Text style={styles.noteText}>{n.message}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#b91c1c",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#14532d",
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#7f1d1d",
    marginBottom: 6,
  },
  empty: {
    textAlign: "center",
    color: "#065f46",
    fontSize: 16,
    marginTop: 10,
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
