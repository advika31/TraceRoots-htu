import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { RegulatorAPI } from "@/services/api";

type Message = {
  id: number;
  farmer_id: number;
  message: string;
  priority: string;
  timestamp: string;
};

export default function RegulatorMessaging() {
  const [newMessage, setNewMessage] = useState("");
  const [farmerId, setFarmerId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const load = async () => {
    const data = await RegulatorAPI.getMessages();
    setMessages(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSend = async () => {
    if (!newMessage.trim() || !farmerId.trim()) return;
    const id = Number(farmerId);
    if (Number.isNaN(id)) {
      Alert.alert("Invalid", "Enter a valid farmer ID");
      return;
    }
    await RegulatorAPI.sendMessage({ farmer_id: id, message: newMessage, priority: "Important" });
    setNewMessage("");
    setFarmerId("");
    Alert.alert("Message Sent", "Your warning has been delivered.");
    load();
  };

  return (
    <ScrollView style={styles.container}>
      <Navbar />

      <Text style={styles.title}>Regulator Messaging Center</Text>

      <View style={styles.composeCard}>
        <Text style={styles.sectionTitle}>Compose Message</Text>
        <TextInput
          value={farmerId}
          onChangeText={setFarmerId}
          placeholder="Farmer ID"
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Write instruction or warning..."
          multiline
          style={styles.textarea}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendText}>Send Message</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Sent Messages</Text>

      {messages.map((msg) => (
        <View key={msg.id} style={styles.messageCard}>
          <View style={styles.headerRow}>
            <Text style={styles.sender}>Farmer ID: {msg.farmer_id}</Text>
            <Text style={styles.priority}>{msg.priority}</Text>
          </View>
          <Text style={styles.content}>{msg.message}</Text>
          <Text style={styles.time}>{new Date(msg.timestamp).toLocaleString()}</Text>
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
  composeCard: {
    backgroundColor: "#ecfdf5",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#065f46",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d1fae5",
    padding: 10,
    marginBottom: 10,
  },
  textarea: {
    backgroundColor: "#fff",
    minHeight: 90,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d1fae5",
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  sendButton: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  sendText: {
    color: "#fff",
    fontWeight: "bold",
  },
  messageCard: {
    backgroundColor: "#f0fdfa",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ccfbf1",
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sender: {
    fontWeight: "bold",
    color: "#064e3b",
  },
  priority: {
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  content: {
    color: "#374151",
    marginBottom: 8,
  },
  time: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "right",
  },
});
