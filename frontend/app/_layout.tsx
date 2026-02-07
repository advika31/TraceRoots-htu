// frontend/app/_layout.tsx
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { startBackgroundSync } from "../services/offlineSync";

export default function RootLayout() {
  useEffect(() => {
    startBackgroundSync();
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </LanguageProvider>
    </AuthProvider>
  );
}

