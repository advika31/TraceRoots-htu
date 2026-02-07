import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { AuthAPI, CollectorAPI } from "@/services/api";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [batchCount, setBatchCount] = useState(0);
  const [tokens, setTokens] = useState(0);

  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      const userId = await AsyncStorage.getItem("userId");
      const storedAvatar = await AsyncStorage.getItem("collector_avatar");
      if (!userId) return;

      const profile = await AuthAPI.getUser(Number(userId));
      setUser(profile);

      const stats = await CollectorAPI.getStats(Number(userId));
      setBatchCount(stats.batches || 0);
      setTokens(stats.tokens || 0);

      if (storedAvatar) setAvatar(storedAvatar);
    };

    loadProfile();
  }, []);

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Gallery access is needed");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setAvatar(uri);
      await AsyncStorage.setItem("collector_avatar", uri);
    }
  };

  const logout = async () => {
    await AsyncStorage.clear();
    router.replace("/login");
  };

  if (!user) return null;

  return (
    <View style={styles.page}>
      <Text style={styles.title}>My Profile</Text>

      <View style={styles.card}>
        <TouchableOpacity onPress={pickAvatar} activeOpacity={0.8}>
          <View style={styles.avatar}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {user.full_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <Text style={styles.changeText}>Tap to change photo</Text>

        <Text style={styles.name}>{user.full_name || user.username}</Text>
        <Text style={styles.role}>{user.role}</Text>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{user.location || "Not provided"}</Text>
        </View>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{batchCount}</Text>
          <Text style={styles.statLabel}>Batches</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{tokens}</Text>
          <Text style={styles.statLabel}>Tokens</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>Green</Text>
          <Text style={styles.statLabel}>Zone</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    padding: 20,
    paddingBottom: 100,
    marginTop: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#166534",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#15803d",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "bold",
  },
  changeText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  role: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 16,
  },
  infoRow: {
    width: "100%",
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
  statsCard: {
    backgroundColor: "#ecfdf5",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#166534",
  },
  statLabel: {
    fontSize: 12,
    color: "#374151",
    marginTop: 4,
  },
  logout: {
    backgroundColor: "#dc2626",
    padding: 16,
    borderRadius: 14,
  },
  logoutText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
