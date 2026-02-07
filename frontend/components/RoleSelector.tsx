//  frontend/components/RoleSelector.tsx
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";

const roles = ["Collector", "Processor", "Regulator", "Consumer"];

interface Props {
  selectedRole: string;
  onSelect: (role: string) => void;
}

export default function RoleSelector({ selectedRole, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Role</Text>
      <TouchableOpacity style={styles.selector} onPress={() => setOpen(!open)}>
        <Text style={styles.selectorText}>
          {selectedRole || "Choose your role"}
        </Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          {roles.map((role, index) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.option,
                index !== roles.length - 1 && styles.optionBorder,
              ]}
              onPress={() => {
                onSelect(role);
                setOpen(false);
              }}
            >
              <Text style={styles.optionText}>{role}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: "#374151",
    marginBottom: 6,
    fontWeight: "600",
  },
  selector: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  selectorText: {
    color: "#374151",
  },
  dropdown: {
    backgroundColor: "#fff",
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  option: {
    padding: 12,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  optionText: {
    color: "#374151",
  },
});
