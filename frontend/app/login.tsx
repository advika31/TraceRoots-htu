import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { AuthAPI } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLanguage } from "../context/LanguageContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Missing Details", "Please enter username and password.");
      return;
    }
    setLoading(true);
    try {
      const data = await AuthAPI.login({ username, password });
      await AsyncStorage.setItem("userToken", data.access_token);
      await AsyncStorage.setItem("userId", data.user_id.toString());
      await AsyncStorage.setItem("userRole", data.role);
      await AsyncStorage.setItem("username", username);

      if (data.role === "PROCESSOR") router.replace("/processor/processor_dashboard");
      else if (data.role === "REGULATOR") router.replace("/regulator/regulator_dashboard");
      else if (data.role === "CONSUMER") router.replace("/consumer/consumer_dashboard");
      else if (data.role === "NGO") router.replace("/ngo/dashboard");
      else router.replace("/collector/collector_dashboard");
    } catch (error: any) {
      Alert.alert("Login Failed", error?.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("login_title")}</Text>

      <Text style={styles.label}>{t("login_username")}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        value={username}
        autoCapitalize="none"
        onChangeText={setUsername}
      />

      <Text style={styles.label}>{t("login_password")}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t("login_button")}</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text style={styles.linkText}>Do not have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#15803d",
    textAlign: "center",
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "#374151",
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#15803d",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkText: {
    color: "#15803d",
    marginTop: 15,
    textAlign: "center",
  },
});
