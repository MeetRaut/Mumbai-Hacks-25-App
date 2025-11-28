import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

export default function VerifyClaimScreen() {
  const { id } = useLocalSearchParams();

  const [claimData, setClaimData] = useState(null);
  const [verificationImage, setVerificationImage] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [geo, setGeo] = useState(null);

  const [loading, setLoading] = useState(true);

  // ------------------------
  // 1. Fetch claim briefing
  // ------------------------
  useEffect(() => {
    async function fetchClaim() {
      try {
        // Replace with your backend call
        // Example response:
        const mockData = {
          id,
          missionBriefing: "Verify reported Flood near Marine Drive, Mumbai.",
          bounty: 40,
          distance: "2.4 km from your current location",
        };

        setClaimData(mockData);
      } catch (e) {
        console.log(e);
      }
      setLoading(false);
    }

    fetchClaim();
  }, []);

  // --------------------------------
  // 2. Get User Location (Geotag)
  // --------------------------------
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location access denied.");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setGeo({
        lat: loc.coords.latitude,
        long: loc.coords.longitude,
      });
    })();
  }, []);

  // --------------------------------
  // 3. Pick an Image for Verification
  // --------------------------------
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Media library access needed.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.Image],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setVerificationImage(result.assets[0].uri);
    }
  };

  // --------------------------------
  // 4. Submit Verification
  // --------------------------------
  const handleSubmitVerification = async () => {
    if (!verificationImage || !verificationStatus || !shortDesc.trim()) {
      Alert.alert("Missing Information", "Complete all fields before submitting.");
      return;
    }

    const formData = new FormData();

    formData.append("claimId", id);
    formData.append("verdict", verificationStatus);
    formData.append("description", shortDesc);
    formData.append("timestamp", new Date().toISOString());

    if (geo) {
      formData.append("lat", geo.lat);
      formData.append("long", geo.long);
    }

    formData.append("image", {
      uri: verificationImage,
      name: "verification.jpg",
      type: "image/jpeg",
    });

    try {
      const res = await fetch("http://YOUR_BACKEND_URL/verify-claim", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await res.json();
      console.log("Verification submitted:", data);

      Alert.alert("Submitted", "Your verification has been recorded.");
    } catch (e) {
      console.log("Upload error:", e);
      Alert.alert("Error", "Could not submit verification.");
    }
  };

  if (loading || !claimData) {
    return (
      <View style={styles.center}>
        <Text>Loading claim details…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.header}>Verify Crisis Claim</Text>

      {/* Mission Info */}
      <View style={styles.card}>
        <Text style={styles.label}>Mission Briefing</Text>
        <Text style={styles.info}>{claimData.missionBriefing}</Text>

        <Text style={styles.label}>Bounty</Text>
        <Text style={styles.bounty}>{claimData.bounty} points</Text>

        <Text style={styles.label}>Distance</Text>
        <Text style={styles.info}>{claimData.distance}</Text>
      </View>

      {/* Select Verification Image */}
      <View style={styles.card}>
        <Text style={styles.label}>Upload Image for Verification</Text>

        <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
          <Ionicons name="image-outline" size={20} color="#fff" />
          <Text style={styles.imageBtnText}>Choose Image</Text>
        </TouchableOpacity>

        {verificationImage && (
          <Image source={{ uri: verificationImage }} style={styles.previewImage} />
        )}
      </View>

      {/* Verdict */}
      <View style={styles.card}>
        <Text style={styles.label}>Verification Result</Text>

        <View style={styles.verdictRow}>
          {["True", "False", "Partially True"].map((v) => (
            <TouchableOpacity
              key={v}
              style={[
                styles.verdictBtn,
                verificationStatus === v && styles.verdictBtnActive,
              ]}
              onPress={() => setVerificationStatus(v)}
            >
              <Text
                style={[
                  styles.verdictText,
                  verificationStatus === v && styles.verdictTextActive,
                ]}
              >
                {v}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Short Description */}
      <View style={styles.card}>
        <Text style={styles.label}>Short Notes</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe what you verified…"
          value={shortDesc}
          onChangeText={setShortDesc}
          multiline
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitVerification}>
        <Text style={styles.submitText}>Submit Verification</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ---------------------- STYLES ----------------------
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f4f6f9",
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  info: {
    color: "#444",
    marginBottom: 10,
  },
  bounty: {
    color: "#e63946",
    fontWeight: "900",
    fontSize: 18,
    marginBottom: 10,
  },
  imageBtn: {
    flexDirection: "row",
    backgroundColor: "#0077cc",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "50%",
    justifyContent: "center",
  },
  imageBtnText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },
  previewImage: {
    height: 200,
    borderRadius: 8,
    marginTop: 15,
  },
  verdictRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  verdictBtn: {
    borderWidth: 1,
    borderColor: "#aaa",
    paddingVertical: 10,
    borderRadius: 8,
    width: "32%",
    alignItems: "center",
  },
  verdictBtnActive: {
    backgroundColor: "#0077cc",
    borderColor: "#0077cc",
  },
  verdictText: {
    color: "#333",
  },
  verdictTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  textArea: {
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: "#2e8b57",
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});