import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "@/services/api";

type User = {
  id: number;
  name: string;
  role: string;
  location: string;
};

export default function AccessControl() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await api.get("/regulator/users");
      setUsers(res.data || []);
    };
    load();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Navbar />

      <Text style={styles.title}>Access Control Management</Text>
      <Text style={styles.sectionTitle}>Registered Users</Text>

      {users.map((user) => (
        <View key={user.id} style={styles.userCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.designation}>{user.location}</Text>
          </View>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>{user.role}</Text>
          </View>
        </View>
      ))}
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
    textAlign: "center",
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#065f46",
    marginBottom: 10,
  },
  userCard: {
    backgroundColor: "#ecfdf5",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  name: {
    fontWeight: "bold",
    color: "#064e3b",
  },
  designation: {
    fontSize: 12,
    color: "#6b7280",
  },
  rolePill: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  roleText: {
    color: "#1e40af",
    fontSize: 12,
    fontWeight: "600",
  },
});
