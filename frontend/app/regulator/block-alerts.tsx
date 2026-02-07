import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { RegulatorAPI } from "@/services/api";

export default function BlockAlerts() {
  const [banned, setBanned] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await RegulatorAPI.getThresholds();
      const list = String(data.banned_regions || "")
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
      setBanned(list);
    };
    load();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Navbar />

      <Text style={styles.title}>Blocked Zones</Text>

      {banned.length === 0 ? (
        <Text style={styles.noResult}>No blocked zones configured</Text>
      ) : (
        banned.map((zone, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.area}>{zone}</Text>
            <Text style={styles.reason}>Reason: Over-harvesting risk</Text>
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
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#7f1d1d",
    marginVertical: 16,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff1f2",
    padding: 16,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fecaca",
    elevation: 2,
  },
  area: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#7f1d1d",
  },
  reason: {
    color: "#374151",
    marginTop: 6,
  },
  noResult: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 30,
  },
});
