// /frontend/app/collector/_layout.tsx

import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import CollectorBottomNav from "./components/CollectorBottomNav";

export default function CollectorLayout() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>

      <CollectorBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },
  content: {
    flex: 1,
  },
});
