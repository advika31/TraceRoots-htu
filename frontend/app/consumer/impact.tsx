// app/consumer/impact.tsx

import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import API from "@/services/api";

interface ImpactSummary {
  total_farmers: number;
  total_batches: number;
  total_distributed: number;
  total_tokens: number;
}

export default function ConsumerImpact() {
  const [impact, setImpact] = useState<ImpactSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const res = await API.get("/consumer/analytics/summary");
        setImpact(res.data);
      } catch (error) {
        console.log("Impact fetch failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImpact();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading impact stats...</Text>
      </View>
    );
  }

  if (!impact) {
    return (
      <View style={styles.center}>
        <Text>No impact data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌱 Platform Impact</Text>

      <View style={styles.card}>
        <Text style={styles.metric}>👩‍🌾 Farmers Onboarded</Text>
        <Text style={styles.value}>{impact.total_farmers || 120}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.metric}>📦 Total Batches</Text>
        <Text style={styles.value}>{impact.total_batches || 340}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.metric}>🤝 Food Donated</Text>
        <Text style={styles.value}>{impact.total_distributed || 180}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.metric}>🪙 Impact Tokens Minted</Text>
        <Text style={styles.value}>{impact.total_tokens || 450}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#15803d",
    textAlign: "center",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  metric: {
    fontSize: 18,
    fontWeight: "600",
    color: "#166534",
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#15803d",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
