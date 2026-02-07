import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CollectorAPI } from "@/services/api";

export default function CollectorHistory() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return;
        const list = await CollectorAPI.getHistory(Number(userId));
        setBatches(list || []);
      } catch (error) {
        console.log("Error fetching batches", error);
        setBatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading batches...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Batch History</Text>

      {batches.length === 0 ? (
        <Text style={styles.empty}>No batches found</Text>
      ) : (
        batches.map((batch) => (
          <View key={batch.batch_id} style={styles.card}>
            <Text style={styles.herb}>{batch.crop_name}</Text>
            <Text>Quantity: {batch.quantity} kg</Text>
            <Text>Status: {batch.status}</Text>
            <Text style={styles.id}>Batch ID: {batch.batch_id}</Text>
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
    paddingBottom: 100,
    marginTop: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#15803d",
    textAlign: "center",
    marginBottom: 20,
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
  herb: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#166534",
    marginBottom: 6,
  },
  id: {
    marginTop: 6,
    fontSize: 12,
    color: "#6b7280",
  },
  empty: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});