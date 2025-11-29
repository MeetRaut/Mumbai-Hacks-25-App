import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Hardcoded Project Data ---
const CROWDFUND_PROJECTS = [
  {
    id: "14",
    name: "Kerala Flood Disaster Relief: Rebuilding Homes",
    goal: 900000, // Roughly ₹90 Lakhs
    current: 750500,
    description:
      "Providing materials and labor assistance for rebuilding homes destroyed by monsoon flooding in coastal Kerala districts.",
    backerCount: 1540,
  },
  {
    id: "15",
    name: "Maharashtra Drought Relief: Water Tanker Access",
    goal: 450000, // Roughly ₹45 Lakhs
    current: 120800,
    description:
      "Funding the consistent supply and distribution of water tankers to drought-hit villages in the Marathwada and Vidarbha regions.",
    backerCount: 380,
  },
  {
    id: "16",
    name: "North-East Earthquake Response: Temporary Shelters",
    goal: 550000, // Roughly ₹55 Lakhs
    current: 495000,
    description:
      "Erecting high-quality, weather-proof temporary shelters and blankets for families displaced by seismic activity in the Himalayan foothills.",
    backerCount: 910,
  },
  {
    id: "17",
    name: "Urban Slum Fire Recovery Fund (Mumbai)",
    goal: 250000, // Roughly ₹25 Lakhs
    current: 180300,
    description:
      "Immediate financial aid and supply distribution to families who lost all possessions in recent major urban slum fires.",
    backerCount: 775,
  },
  {
    id: "18",
    name: "Odisha Cyclone Preparedness and Evacuation",
    goal: 300000, // Roughly ₹30 Lakhs
    current: 285500,
    description:
      "Funding early warning system maintenance, community training, and safe evacuation transportation for high-risk coastal communities.",
    backerCount: 620,
  },
  {
    id: "19",
    name: "Medical Aid for Respiratory Illness (Delhi Smog)",
    goal: 700000, // Roughly ₹70 Lakhs
    current: 310500,
    description:
      "Supplying air purifiers and medical oxygen cylinders to community health centers treating vulnerable patients affected by severe air pollution.",
    backerCount: 415,
  },
  {
    id: "20",
    name: "Bihar Heatwave Victim Support & Cooling Centers",
    goal: 150000, // Roughly ₹15 Lakhs
    current: 85000,
    description:
      "Establishing temporary cooling centers with water and first aid, targeting the elderly and laborers during peak summer heatwaves.",
    backerCount: 290,
  },
  {
    id: "21",
    name: "Essential Supplies for Border Region Conflicts",
    goal: 400000, // Roughly ₹40 Lakhs
    current: 350000,
    description:
      "Providing non-military humanitarian aid, including food rations and hygiene kits, to families displaced by instability in border areas.",
    backerCount: 1050,
  },
  {
    id: "22",
    name: "Restoration of Heritage Sites Post-Disaster",
    goal: 1000000, // Roughly ₹1 Crore
    current: 550000,
    description:
      "Specialized conservation funding for critical repairs to historical temples and structures damaged by natural disasters like earthquakes or floods.",
    backerCount: 500,
  },
  {
    id: "23",
    name: "COVID-19 Oxygen and Critical Care Support",
    goal: 600000, // Roughly ₹60 Lakhs
    current: 600000, // This project is fully funded!
    description:
      "Procurement and distribution of oxygen concentrators and other critical medical equipment to hospitals in underserved Tier 2 and Tier 3 cities.",
    backerCount: 2500,
  },
];

const QUICK_AMOUNTS = [100, 500, 1000];

// --- Helper Component: Progress Bar ---
const ProjectProgress = ({ current, goal }) => {
  const percentage = (current / goal) * 100;
  return (
    <View style={progressStyles.container}>
      <View style={progressStyles.barContainer}>
        <View
          style={[
            progressStyles.barFill,
            { width: `${percentage > 100 ? 100 : percentage}%` },
          ]}
        />
      </View>
      <Text style={progressStyles.text}>
        ₹ {current.toLocaleString()} of ₹ {goal.toLocaleString()}
      </Text>
    </View>
  );
};

// --- Main Screen Component ---
const CrowdfundMainScreen = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");

  // --- Handlers ---

  // 1. Handles selecting a project from the list
  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setDonationAmount(""); // Reset input when a new project is selected
  };

  // 2. Handles going back to the project list
  const handleBack = () => {
    setSelectedProject(null);
  };

  // 3. Handles quick amount selection
  const setQuickAmount = (amount) => {
    setDonationAmount(amount.toString());
  };

  // 4. Handles the final donation submission
  const handleDonate = () => {
    const amount = parseFloat(donationAmount);
    if (!selectedProject || isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid donation amount.");
      return;
    }

    Alert.alert(
      "Donation Successful!",
      `Thank you for your generous ₹${amount.toFixed(2)} donation to the "${
        selectedProject.name
      }" project!`,
      [
        // Option to stay on the detail screen or go back to the list
        { text: "OK", onPress: () => setDonationAmount("") },
        { text: "Go to List", onPress: handleBack, style: "cancel" },
      ]
    );
  };

  // --- Render Functions ---

  // Renders the list of projects
  const renderProjectList = () => (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Fundraising Campaigns</Text>
      {CROWDFUND_PROJECTS.map((project) => (
        <TouchableOpacity
          key={project.id}
          style={styles.projectCard}
          onPress={() => handleProjectSelect(project)}
        >
          <Text style={styles.cardProjectTitle}>{project.name}</Text>
          <Text style={styles.projectDescription} numberOfLines={2}>
            {project.description}
          </Text>
          <ProjectProgress current={project.current} goal={project.goal} />
          <Text style={styles.backerText}>{project.backerCount} Backers</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Renders the detail and funding interface for the selected project
  const renderProjectDetail = () => {
    if (!selectedProject) return null; // Should not happen if logic is correct

    const PROGRESS_PERCENT =
      (selectedProject.current / selectedProject.goal) * 100;

    return (
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back Button */}
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>{"< Back to Projects"}</Text>
        </TouchableOpacity>

        <Text style={styles.detailTitle}>{selectedProject.name}</Text>
        <Text style={styles.detailDescription}>
          {selectedProject.description}
        </Text>

        <View style={styles.separator} />

        {/* Funding Goal & Progress Bar */}
        <View style={styles.progressSection}>
          <Text style={styles.fundingText}>
            ₹{selectedProject.current.toLocaleString()} raised of ₹
            {selectedProject.goal.toLocaleString()} goal
          </Text>
          <ProjectProgress
            current={selectedProject.current}
            goal={selectedProject.goal}
          />
          <View style={styles.progressStats}>
            <Text style={styles.percentageText}>
              {Math.round(PROGRESS_PERCENT)}% Funded
            </Text>
            <Text style={styles.backerCount}>
              {selectedProject.backerCount} Backers
            </Text>
          </View>
        </View>

        <View style={styles.separator} />

        {/* Donation Input Section */}
        <Text style={styles.sectionTitle}>
          How much would you like to donate?
        </Text>
        <View style={styles.inputContainer}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            keyboardType="numeric"
            value={donationAmount}
            onChangeText={setDonationAmount}
            placeholderTextColor="#999"
          />
        </View>

        {/* Quick Amount Buttons */}
        <Text style={styles.sectionSubtitle}>Quick Options:</Text>
        <View style={styles.quickAmountContainer}>
          {QUICK_AMOUNTS.map((amount) => (
            <TouchableOpacity
              key={amount}
              style={styles.quickAmountButton}
              onPress={() => setQuickAmount(amount)}
            >
              <Text style={styles.quickAmountText}>₹{amount}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Donate Button */}
        <TouchableOpacity
          style={[
            styles.donateButton,
            !parseFloat(donationAmount) > 0 && styles.donateButtonDisabled,
          ]}
          onPress={handleDonate}
          disabled={!parseFloat(donationAmount) > 0}
        >
          <Text style={styles.donateButtonText}>
            Donate ₹{parseFloat(donationAmount) > 0 ? donationAmount : "0.00"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.noteText}>
          Your contribution helps make this project a reality.
          {"\n"}
          {"\n"}
          Please note:
          <Text style={{ fontWeight: "bold" }}>3% of your donation</Text> will
          be retained for platform operational costs, payment processing, and
          ongoing service improvements.
        </Text>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Conditional Rendering: Show detail screen if project is selected, otherwise show the list */}
      {selectedProject ? renderProjectDetail() : renderProjectList()}
    </SafeAreaView>
  );
};

// --- Styles for Progress Helper (Nested) ---
const progressStyles = StyleSheet.create({
  container: { marginTop: 5 },
  barContainer: {
    height: 8,
    width: "100%",
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  barFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  text: {
    fontSize: 13,
    color: "#555",
  },
});

// --- Main Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9f9f9" },
  container: { padding: 20, paddingBottom: 50 },

  // --- List View Styles ---
  header: {
    fontSize: 26,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  projectCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardProjectTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  backerText: {
    fontSize: 14,
    color: "#4CAF50",
    marginTop: 10,
    fontWeight: "500",
  },

  // --- Detail View Styles ---
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 15,
  },
  backButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
  detailTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  detailDescription: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
  separator: {
    height: 1,
    width: "100%",
    backgroundColor: "#eee",
    marginVertical: 20,
  },
  progressSection: {
    width: "100%",
    marginBottom: 10,
  },
  fundingText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  percentageText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },

  // --- Funding Form Styles ---
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#f9fff9",
    height: 60,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 24,
    color: "#333",
    fontWeight: "bold",
  },
  quickAmountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 30,
  },
  quickAmountButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    width: "31%",
    alignItems: "center",
  },
  quickAmountText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  donateButton: {
    width: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  donateButtonDisabled: {
    backgroundColor: "#a5d6a7",
  },
  donateButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  noteText: {
    marginTop: 20,
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
  },
});

export default CrowdfundMainScreen;
