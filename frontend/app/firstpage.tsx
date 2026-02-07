// app/firstpage.tsx
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { height } = Dimensions.get("window");

export default function FirstPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Top Image covering 60% of screen */}
      <Image
        source={require("../assets/farmer.jpg")}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Small Logo */}
        <Image
          source={require("../assets/logo.jpg")}
          style={styles.logo}
          resizeMode="cover"
        />

        {/* Content Wrapper */}
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>TraceRoots</Text>
          <Text style={styles.tagline}>Authenticity. Sustainability. Traceability.</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/login")} // Navigate to login page
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  image: {
    width: "100%",
    height: height * 0.6,
    overflow: "hidden",
  },
  bottomSection: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#01280dff", // dark green
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 20,
    marginTop: -30, // slightly lift logo
  },
  contentWrapper: {
    alignItems: "center",
    marginTop: 50, // move content down under logo
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 3, // gap between title and tagline
  },
  tagline: {
    fontSize: 16,
    fontWeight: "400",
    color: "#ffffffcc",
    textAlign: "center",
    marginBottom: 30, // space to button
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 18,
    paddingHorizontal: 100,
    borderRadius: 40,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
