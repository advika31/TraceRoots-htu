import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import Navbar from "../components/Navbar";
import * as Linking from "expo-linking";
import { RegulatorAPI } from "@/services/api";

export default function ExportData() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const url = await RegulatorAPI.exportData();
      await Linking.openURL(url);
    } catch {
      Alert.alert("Export Failed", "Could not open export link.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Navbar />
      <Text style={styles.title}>Export Sustainability Data</Text>
      <Text style={styles.desc}>
        Download the latest traceability report as CSV.
      </Text>

      <TouchableOpacity style={styles.exportButton} onPress={handleExport} disabled={exporting}>
        <Text style={styles.exportButtonText}>{exporting ? "Preparing..." : "Download CSV"}</Text>
      </TouchableOpacity>
    </View>
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
    color: "#14532d",
    textAlign: "center",
    marginVertical: 16,
  },
  desc: {
    textAlign: "center",
    color: "#374151",
    marginBottom: 20,
  },
  exportButton: {
    backgroundColor: "#16a34a",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  exportButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
