import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthAPI } from '../services/api';
import { useLanguage } from "../context/LanguageContext";

export default function Signup() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    location: '',
    role: 'COLLECTOR'
  });

  const handleSignup = async () => {
    if (!form.username || !form.password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const data = await AuthAPI.signup(form);

      await AsyncStorage.setItem('userToken', data.access_token);
      await AsyncStorage.setItem('userId', data.user_id.toString());
      await AsyncStorage.setItem('userRole', data.role);
      await AsyncStorage.setItem('username', form.username);

      Alert.alert("Success", "Account Created!");
      if (data.role === "PROCESSOR") router.replace('/processor/processor_dashboard');
      else if (data.role === "REGULATOR") router.replace('/regulator/regulator_dashboard');
      else if (data.role === "CONSUMER") router.replace('/consumer/consumer_dashboard');
      else if (data.role === "NGO") router.replace('/ngo/dashboard');
      else router.replace('/collector/collector_dashboard');

    } catch (error: any) {
      const msg = error.response?.data?.detail || "Signup failed. Check internet.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("signup_title")}</Text>
      <Text style={styles.subtitle}>{t("signup_subtitle")}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Full Name"
          style={styles.input}
          onChangeText={(t) => setForm({ ...form, full_name: t })}
        />
        <TextInput
          placeholder="Username"
          style={styles.input}
          autoCapitalize="none"
          onChangeText={(t) => setForm({ ...form, username: t })}
        />
        <TextInput
          placeholder="Email"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(t) => setForm({ ...form, email: t })}
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          onChangeText={(t) => setForm({ ...form, password: t })}
        />
        <TextInput
          placeholder="Location (e.g., Punjab)"
          style={styles.input}
          onChangeText={(t) => setForm({ ...form, location: t })}
        />
        <Text style={styles.roleLabel}>Select Role</Text>
        <View style={styles.roleRow}>
          {["COLLECTOR", "PROCESSOR", "REGULATOR", "CONSUMER", "NGO"].map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.rolePill, form.role === r && styles.rolePillActive]}
              onPress={() => setForm({ ...form, role: r })}
            >
              <Text style={[styles.roleText, form.role === r && styles.roleTextActive]}>
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleSignup} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f8f9fa' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2e7d32', marginBottom: 5, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30, textAlign: 'center' },
  inputContainer: { gap: 15, marginBottom: 25 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#ddd' },
  roleLabel: { marginTop: 5, fontWeight: '600', color: '#2e7d32' },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rolePill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#e5e7eb' },
  rolePillActive: { backgroundColor: '#2e7d32' },
  roleText: { color: '#374151', fontWeight: '600', fontSize: 12 },
  roleTextActive: { color: '#fff' },
  btn: { backgroundColor: '#2e7d32', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { marginTop: 20, textAlign: 'center', color: '#2e7d32', fontWeight: '600' }
});
