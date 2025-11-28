import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome!</Text>
      <Text style={styles.sub}>Your features will appear here</Text>

      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardText}>Feature 1</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardText}>Feature 2</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardText}>Feature 3</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 70, paddingHorizontal: 20 },
  header: { fontSize: 28, fontWeight: "700" },
  sub: { color: "#555", marginTop: 6, marginBottom: 20 },
  cardContainer: { marginTop: 20 },
  card: {
    backgroundColor: "#eee",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  cardText: { fontSize: 18 },
});
