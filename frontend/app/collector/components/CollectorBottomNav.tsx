// /frontend/app/collector/components/CollectorBottomNav.tsx

import { View, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function CollectorBottomNav() {
  const router = useRouter();

  return (
    <View style={styles.nav}>
      <TouchableOpacity onPress={() => router.push("/collector/collector_dashboard")}>
        <MaterialIcons name="home" size={30} color="#15803d" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/collector/history")}>
        <MaterialIcons name="history" size={30} color="#15803d" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/collector/offline-sync")}>
        <MaterialIcons name="cloud-upload" size={30} color="#15803d" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/collector/profile")}>
        <MaterialIcons name="person" size={30} color="#15803d" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 24,
    backgroundColor: "#fff",
    borderRadius: 20,
    margin: 10,
    elevation: 10,
  },
});
