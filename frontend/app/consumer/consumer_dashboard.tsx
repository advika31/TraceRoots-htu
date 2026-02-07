// frontend/app/consumer/consumer_dashboard.tsx

import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Navbar from "../components/Navbar";

export default function ConsumerDashboard() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Navbar */}
      <Navbar />

      {/* Welcome Section */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, Consumer 🌿</Text>
        <Text style={styles.subtitle}>
          Verify authenticity, track your product journey, and explore details.
        </Text>
      </View>

      {/* QR Scan Button */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => router.push("/consumer/product_info?batchId=1")}
      >
        <MaterialIcons name="qr-code-scanner" size={28} color="#fff" />
        <Text style={styles.scanButtonText}>Scan QR Code</Text>
      </TouchableOpacity>

      {/* Feature Cards */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Key Features</Text>

        <TouchableOpacity
  style={styles.featureCard}
  onPress={() => router.push("/consumer/impact")}
>
  <MaterialIcons name="eco" size={24} color="#15803d" />
  <Text style={styles.featureText}>View Impact Stats</Text>
</TouchableOpacity>


        <View style={styles.featureCard}>
          <MaterialIcons name="timeline" size={24} color="#15803d" />
          <Text style={styles.featureText}>Track Product Journey</Text>
        </View>

        <View style={styles.featureCard}>
          <MaterialIcons name="place" size={24} color="#15803d" />
          <Text style={styles.featureText}>Check Product Origin</Text>
        </View>

        <View style={styles.featureCard}>
          <MaterialIcons name="science" size={24} color="#15803d" />
          <Text style={styles.featureText}>View Lab Results</Text>
        </View>

        <View style={styles.featureCard}>
          <MaterialIcons name="verified" size={24} color="#15803d" />
          <Text style={styles.featureText}>Blockchain Authenticity</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f0fdf4", // light green background (theme)
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 10,
    marginTop: 15, // spacing after navbar
  },
  greeting: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#166534", // dark green
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#4b5563", // gray
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#15803d", // primary green
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    marginBottom: 40,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
  },
  featuresContainer: {
    width: "100%",
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#166534",
    marginBottom: 20,
    textAlign: "left",
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 15,
    color: "#374151", // slate gray
    fontWeight: "600",
  },
});
