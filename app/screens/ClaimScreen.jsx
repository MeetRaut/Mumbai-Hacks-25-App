// app/screens/ClaimScreen.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Platform,
} from "react-native";

import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
// REMOVED: import * as Location from "expo-location";

// --- Global Constants ---
const CRISIS_TYPES = [
  "Flood",
  "Earthquake",
  "Fire",
  "Medical Emergency",
  "Civil Unrest",
  "Infrastructure Failure",
  "Accident",
];
const CITIES = ["Mumbai", "Pune", "Surat", "Delhi", "Bangalore", "Chennai"];
const MAX_DESCRIPTION_LENGTH = 500;

// Hardcoded coordinates for NESCO Mumbai (19.1491° N, 72.8535° E)
const NESCO_COORDINATES = {
  lat: 19.1491,
  long: 72.8535,
};

// =======================================================================
// PART 1: Verification Content
// =======================================================================

const VerifyClaimContent = ({ claimId, onBack }) => {
  const id = claimId;
  const [claimData, setClaimData] = useState(null);
  const [verificationImage, setVerificationImage] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [geo, setGeo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch claim briefing
  useEffect(() => {
    async function fetchClaim() {
      try {
        const mockData = {
          id,
          missionBriefing: `Verify reported claim ID ${id} near NESCO Mumbai.`,
          bounty: 40,
          distance: "Simulated 0.1 km from your hardcoded location",
        };
        setClaimData(mockData);
      } catch (e) {
        console.log(e);
      }
      setLoading(false);
    }
    fetchClaim();
  }, [id]);

  // 2. Get User Location (Geotag) - HARDCODED FIX
  useEffect(() => {
    // Setting hardcoded location for NESCO, Mumbai
    setGeo(NESCO_COORDINATES);
  }, []);

  // 3. Pick an Image for Verification
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

  // 4. Submit Verification
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
      // Mock Submission: Replace with your actual fetch call
      console.log("Verification submitted for ID:", id, formData);

      Alert.alert("Submitted", "Your verification has been recorded.");
      onBack(); // Return to main screen

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
    <ScrollView style={styles.containerVerify} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Custom Back Button */}
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#333" />
        <Text style={styles.backButtonText}>Back to Claim Submission</Text>
      </TouchableOpacity>

      <Text style={styles.headerVerify}>Verify Crisis Claim</Text>

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

        <TouchableOpacity style={styles.imageBtnVerify} onPress={pickImage}>
          <Ionicons name="image-outline" size={20} color="#fff" />
          <Text style={styles.imageBtnTextVerify}>Choose Image</Text>
        </TouchableOpacity>

        {verificationImage && (
          <Image source={{ uri: verificationImage }} style={styles.previewImageVerify} />
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
          style={styles.textAreaVerify}
          placeholder="Describe what you verified…"
          value={shortDesc}
          onChangeText={setShortDesc}
          multiline
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitBtnVerify} onPress={handleSubmitVerification}>
        <Text style={styles.submitTextVerify}>Submit Verification</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};


// =======================================================================
// PART 2: Main ClaimsSubmissionScreen Component
// =======================================================================

const ClaimsSubmissionScreen = () => {
  const [description, setDescription] = useState("");
  const [crisisType, setCrisisType] = useState("");
  const [city, setCity] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [imageProof, setImageProof] = useState(null);

  // STATE FOR CONDITIONAL RENDERING
  const [claimIdToVerify, setClaimIdToVerify] = useState(null);

  const [notifications, setNotifications] = useState([
    { id: 1, title: "Flood reported in Mumbai" },
    { id: 2, title: "Fire reported in Pune" },
  ]);

  const notificationCount = notifications.length;
  const navigation = useNavigation();

  // RESET STATE WHEN THE TAB IS FOCUSED (ENSURES MAIN SCREEN LOADS)
  useFocusEffect(
    useCallback(() => {
      setClaimIdToVerify(null);
      setDropdownVisible(false); // Close dropdown on focus change
    }, [])
  );

  // TIME PICKER (Unchanged)
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);

  const handleConfirmTime = (date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  // IMAGE PICKER (Unchanged)
  const requestPermissions = async () => {
    const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
    const mediaPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraPerm.status !== "granted" || mediaPerm.status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera and storage permissions needed."
      );
      return false;
    }
    return true;
  };

  const pickImage = async (type) => {
    const allowed = await requestPermissions();
    if (!allowed) return;

    const options = {
      mediaTypes: [ImagePicker.MediaType.Image],
      quality: 0.7,
      allowsEditing: true,
    };

    try {
      const result =
        type === "camera"
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled) {
        setImageProof(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Image Picker Error:", error);
    }
  };

  // SUBMIT (Unchanged)
  const handleSubmitClaim = () => {
    if (!description.trim() || !crisisType || !city || !selectedDate) {
      Alert.alert("Missing Information", "Please complete all fields.");
      return;
    }

    const claimPayload = {
      description,
      crisisType,
      city,
      timestamp: selectedDate.toISOString(),
      imageProof,
    };

    console.log("Submitting Claim:", claimPayload);

    Alert.alert("Claim Submitted", "Your crisis report has been submitted.");

    // RESET UI
    setDescription("");
    setCrisisType("");
    setCity("");
    setImageProof(null);
    setSelectedDate(null);
  };

  // ----------------------------------------------------
  // CONDITIONAL RENDER: SWITCH TO VERIFY SCREEN
  // ----------------------------------------------------
  if (claimIdToVerify !== null) {
      // Render VerifyClaimContent component
      return (
          <VerifyClaimContent 
              claimId={claimIdToVerify} 
              onBack={() => setClaimIdToVerify(null)} // Function to return to the main form
          />
      );
  }

  // ----------------------------------------------------
  // DEFAULT RENDER: CLAIM SUBMISSION FORM
  // ----------------------------------------------------
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Crisis Claim</Text>

        <View style={{ position: "relative" }}>
          <TouchableOpacity
            onPress={() => setDropdownVisible(!dropdownVisible)}
          >
            <Ionicons name="notifications-outline" size={28} color="#333" />
          </TouchableOpacity>

          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {notificationCount > 9 ? "9+" : notificationCount}
              </Text>
            </View>
          )}
        </View>
      </View>
      {dropdownVisible && (
        <View style={styles.dropdown}>
          {notifications.length === 0 ? (
            <Text style={styles.dropdownEmpty}>No new claims</Text>
          ) : (
            notifications.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setDropdownVisible(false);
                  // FIX: Set local state to switch the rendered component
                  setClaimIdToVerify(item.id); 
                }}
              >
                <Text style={styles.dropdownItemText}>{item.title}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {/* DESCRIPTION */}
      <View style={styles.card}>
        <Text style={styles.label}>Describe the Crisis</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={7}
          placeholder="Describe the crisis in detail…"
          value={description}
          onChangeText={(t) =>
            setDescription(t.slice(0, MAX_DESCRIPTION_LENGTH))
          }
        />
        <Text style={styles.charCount}>
          {description.length}/{MAX_DESCRIPTION_LENGTH}
        </Text>
      </View>

      {/* CRISIS TYPE */}
      <View style={styles.card}>
        <Text style={styles.label}>Type of Crisis</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={crisisType}
            onValueChange={(v) => setCrisisType(v)}
          >
            <Picker.Item label="Select Crisis Type…" value="" />
            {CRISIS_TYPES.map((t) => (
              <Picker.Item key={t} label={t} value={t} />
            ))}
          </Picker>
        </View>
      </View>

      {/* LOCATION */}
      <View style={styles.card}>
        <Text style={styles.label}>Location (City)</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={city} onValueChange={(v) => setCity(v)}>
            <Picker.Item label="Select City…" value="" />
            {CITIES.map((c) => (
              <Picker.Item key={c} label={c} value={c} />
            ))}
          </Picker>
        </View>
      </View>

      {/* TIME SELECTION */}
      <View style={styles.card}>
        <Text style={styles.label}>
          When did the crisis happen approximately?
        </Text>

        <TouchableOpacity style={styles.timeButton} onPress={showDatePicker}>
          <Text style={styles.timeButtonText}>Select Date & Time</Text>
        </TouchableOpacity>

        <Text style={styles.selectedTime}>
          {selectedDate ? selectedDate.toLocaleString() : "No time selected"}
        </Text>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirmTime}
        onCancel={hideDatePicker}
      />

      {/* IMAGE INPUT */}
      <View style={styles.card}>
        <Text style={styles.label}>Image Proof</Text>

        <View style={styles.imageButtonsRow}>
          <TouchableOpacity
            style={styles.imageBtn}
            onPress={() => pickImage("gallery")}
          >
            <Text style={styles.imageBtnText}>📁 Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imageBtn}
            onPress={() => pickImage("camera")}
          >
            <Text style={styles.imageBtnText}>📸 Camera</Text>
          </TouchableOpacity>
        </View>

        {imageProof && (
          <Image source={{ uri: imageProof }} style={styles.previewImage} />
        )}
      </View>

      {/* SUBMIT */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitClaim}>
        <Text style={styles.submitText}>Submit Crisis Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ClaimsSubmissionScreen;

// ------------------- STYLES (Merged and Adapted) --------------------
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f4f6f9",
    padding: 16,
  },
  // Style for the verification screen's outer container (optional, but good practice)
  containerVerify: {
    backgroundColor: "#f4f6f9",
    padding: 16,
  },
  
  // Header for main claim form
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  // Header for verify screen
  headerVerify: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  
  // Back Button for Verification View
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#333',
  },
  
  badge: {
    position: "absolute",
    right: -4,
    top: -4,
    backgroundColor: "red",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  dropdown: {
    position: "absolute",
    top: 80,
    right: 20,
    width: 260,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 100,
  },
  dropdownItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownItemText: {
    fontSize: 15,
    color: "#333",
  },
  dropdownEmpty: {
    textAlign: "center",
    paddingVertical: 10,
    color: "#555",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 20,
    color: "#222",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: "#333",
  },
  textArea: {
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    textAlignVertical: "top",
    minHeight: 120,
  },
  // New style for verification screen's notes
  textAreaVerify: {
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
  },
  
  charCount: {
    textAlign: "right",
    color: "#777",
    marginTop: 5,
  },
  pickerWrapper: {
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  timeButton: {
    backgroundColor: "#0077cc",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  timeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  selectedTime: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
    color: "#333",
    fontStyle: "italic",
  },
  imageButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  imageBtn: {
    backgroundColor: "#2e8b57",
    padding: 12,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  imageBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  previewImage: {
    height: 200,
    borderRadius: 8,
    marginTop: 15,
    width: "100%",
  },
  submitBtn: {
    backgroundColor: "#d12b2b",
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },

  // --- VERIFICATION SPECIFIC STYLES (FROM VERIFY/[ID].JSX) ---
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
  imageBtnVerify: { // Renamed from imageBtn
    flexDirection: "row",
    backgroundColor: "#0077cc",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "50%",
    justifyContent: "center",
  },
  imageBtnTextVerify: { // Renamed from imageBtnText
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },
  previewImageVerify: { // Renamed from previewImage
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
  submitBtnVerify: { // Renamed from submitBtn
    backgroundColor: "#2e8b57",
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  submitTextVerify: { // Renamed from submitText
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