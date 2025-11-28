import React, { useState } from "react";
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

import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";

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

const ClaimsSubmissionScreen = () => {
  const [description, setDescription] = useState("");
  const [crisisType, setCrisisType] = useState("");
  const [city, setCity] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [imageProof, setImageProof] = useState(null);

  const [notifications, setNotifications] = useState([
    { id: 1, title: "Flood reported in Mumbai" },
    { id: 2, title: "Fire reported in Pune" },
  ]);

  const notificationCount = notifications.length;

  // TIME PICKER
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);

  const handleConfirmTime = (date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  // IMAGE PICKER
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
      mediaTypes: [ImagePicker.MediaType.Image], // <-- FIXED
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

  // SUBMIT
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
                  router.push(`/verify/${item.id}`);
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

// ------------------- STYLES --------------------
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f4f6f9",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
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
});
