import { View, Text, StyleSheet, ScrollView, TextInput } from "react-native";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { RegulatorAPI } from "@/services/api";

type Zone = {
  area: string;
  batches: number;
  status: "Safe" | "Warning" | "Overexploited";
};

export default function ZoneDetails() {
  const [search, setSearch] = useState("");
  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await RegulatorAPI.getMapData();
      const counts: Record<string, number> = {};
      data.forEach((d: any) => {
        const region = d.zone_status && d.crop ? (d.region || "Unknown") : (d.region || "Unknown");
        counts[region] = (counts[region] || 0) + 1;
      });
      const list: Zone[] = Object.keys(counts).map((k) => {
        const count = counts[k];
        const status = count > 10 ? "Overexploited" : count > 5 ? "Warning" : "Safe";
        return { area: k, batches: count, status };
      });
      setZones(list);
    };
    load();
  }, []);

  const filteredZones = zones.filter((zone) =>
    zone.area.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      <Navbar />

      <Text style={styles.title}>Zone Details and Sustainability Status</Text>

      <TextInput
        placeholder="Search by area..."
        placeholderTextColor="#6b7280"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {filteredZones.map((zone, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.area}>{zone.area}</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Batches Produced:</Text>
            <Text style={styles.value}>{zone.batches}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text
              style={[
                styles.status,
                zone.status === "Safe" && styles.safe,
                zone.status === "Warning" && styles.warning,
                zone.status === "Overexploited" && styles.danger,
              ]}
            >
              {zone.status}
            </Text>
          </View>
        </View>
      ))}

      {filteredZones.length === 0 && (
        <Text style={styles.noResult}>No matching area found</Text>
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
    color: "#14532d",
    marginVertical: 16,
    textAlign: "center",
  },
  search: {
    backgroundColor: "#dcfce7",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    marginBottom: 20,
    fontSize: 15,
  },
  card: {
    backgroundColor: "#ecfdf5",
    padding: 16,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    elevation: 2,
  },
  area: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#065f46",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  label: {
    fontWeight: "600",
    color: "#047857",
    marginRight: 6,
  },
  value: {
    color: "#374151",
  },
  status: {
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: "hidden",
  },
  safe: {
    backgroundColor: "#bbf7d0",
    color: "#166534",
  },
  warning: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  danger: {
    backgroundColor: "#fecaca",
    color: "#7f1d1d",
  },
  noResult: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 30,
  },
});
