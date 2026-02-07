// frontend/app/regulator/regulator_dashboard.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Navbar from "../components/Navbar";

export default function RegulatorDashboard() {
  const router = useRouter();

  const sections = [
    {
      title: "Digital Twin & Sustainability",
      actions: [
        {
          title: "Live Interactive Map",
          icon: "map",
          route: "/regulator/SustainabilityMap",
        },
        {
          title: "Zone Details",
          icon: "layers",
          route: "/regulator/zone-details",
        },
      ],
    },
    {
      title: "Alerts & Notifications",
      actions: [
        {
          title: "Real-Time Alerts",
          icon: "alert",
          route: "/regulator/alerts",
        },
        {
          title: "Over-Harvesting Block",
          icon: "block-helper",
          route: "/regulator/block-alerts",
          special: true,
        },
      ],
    },
    {
      title: "Traceability & Compliance",
      actions: [
        {
          title: "Batch Lookup",
          icon: "arrow-up",
          route: "/regulator/batch-lookup",
        },
        {
          title: "Authenticity Verification",
          icon: "check",
          route: "/regulator/auth-verification",
        },
      ],
    },
    {
      title: "Analytics & Reports",
      actions: [
        // { title: "Harvesting Analytics", icon: "rise", route: "/regulator/harvest-analytics" },
        // { title: "Compliance Dashboard", icon: "verified", route: "/regulator/compliance" },
        {
          title: "Export Data",
          icon: "download",
          route: "/regulator/export-data",
          special: true,
        },
      ],
    },
    {
      title: "Administrative Tools",
      actions: [
        {
          title: "Set/Adjust Thresholds",
          icon: "tune",
          route: "/regulator/set-thresholds",
          special: true,
        },
        {
          title: "Regulator Messaging",
          icon: "message-text",
          route: "/regulator/messaging",
        },
        {
          title: "Access Control",
          icon: "account-cog",
          route: "/regulator/access-control",
        },
      ],
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Navbar />
      <Text style={styles.title}>Welcome Regulator ID: REG12</Text>

      {sections.map((section, sIndex) => (
        <View key={sIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.cardContainer}>
            {section.actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.card, action.special && styles.specialCard]}
                onPress={() => router.push(action.route)}
              >
                <View style={styles.cardContent}>
                  <MaterialCommunityIcons
                    name={action.icon as any}
                    size={28}
                    color={action.special ? "#fff" : "#16a34a"}
                  />
                  <Text
                    style={[
                      styles.cardText,
                      action.special && styles.specialCardText,
                    ]}
                  >
                    {action.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f0fdf4",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#15803d",
    textAlign: "center",
    marginBottom: 25,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#065f46",
    marginBottom: 12,
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#dcfce7",
    width: "48%",
    marginBottom: 15,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  specialCard: {
    backgroundColor: "#16a34a",
    shadowOpacity: 0.2,
  },
  cardContent: {
    alignItems: "center",
  },
  cardText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "600",
    color: "#15803d",
    textAlign: "center",
  },
  specialCardText: {
    color: "#fff",
  },
});
