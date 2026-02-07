//  frontend/components/Button.tsx
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface Props {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
}

export default function Button({ title, onPress, variant = "primary" }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.base,
        variant === "primary" ? styles.primary : styles.secondary,
      ]}
    >
      <Text
        style={[
          styles.textBase,
          variant === "primary" ? styles.textPrimary : styles.textSecondary,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    alignItems: "center",
    marginVertical: 6,
  },
  primary: {
    backgroundColor: "#16a34a", // green-600
  },
  secondary: {
    backgroundColor: "#e5e7eb", // gray-200
  },
  textBase: {
    fontWeight: "bold",
    fontSize: 16,
  },
  textPrimary: {
    color: "#fff",
  },
  textSecondary: {
    color: "#374151", // gray-700
  },
});
