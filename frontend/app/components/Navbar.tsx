import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLanguage } from "../../context/LanguageContext";

export default function Navbar() {
  const { language, setLanguage } = useLanguage();
  return (
    <View style={styles.navbar}>
      <Image
        source={require("../../assets/logo_2.png")}
        style={styles.logo}
      />
      <Text style={styles.title}>TraceRoots</Text>
      <View style={styles.langRow}>
        {["EN", "HI", "PA"].map((l) => (
          <TouchableOpacity
            key={l}
            onPress={() => setLanguage(l)}
            style={[styles.langPill, language === l && styles.langPillActive]}
          >
            <Text style={[styles.langText, language === l && styles.langTextActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c8f7daff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#166534",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  logo: {
    width: 70,
    height: 50,
    marginRight: 5,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#166534",
  },
  langRow: {
    marginLeft: "auto",
    flexDirection: "row",
    gap: 6,
  },
  langPill: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  langPillActive: {
    backgroundColor: "#166534",
  },
  langText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#374151",
  },
  langTextActive: {
    color: "#fff",
  },
});
