import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- Anti-Rumour Feed Data (Sorted by Distance from NESCO, Mumbai) ---
// The distance property is calculated using the Haversine formula based on
// NESCO, Mumbai (19.15° N, 72.85° E) as the user's current location.
const CRISES_DATA = [
  {
    "id": "1",
    "location": "Mumbai, India",
    "header": "Claims of Terror Threat at Train Station",
    "timestamp": "2025-11-29T14:45:00",
    "status": "Rumour",
    "summary": "WhatsApp messages warning of an imminent attack at CST station are being shared. Police have clarified this is a hoax recycled from 2023.",
    "distance": 0.0,
    "level": "Caution"
  },
  {
    "id": "2",
    "location": "Adai Mountains, Panvel, India",
    "header": "Wildfire Reported Near Hiking Trail",
    "timestamp": "2025-11-29T16:42:00",
    "status": "True",
    "summary": "Visual evidence confirms a significant smoke plume rising from the canyon northeast of Trippet Ranch. Local fire services notified.",
    "distance": 32.7,
    "level": "Verified"
  },
  {
    "id": "3",
    "location": "Colombo, Sri Lanka",
    "header": "Cyclone Ditwah Landfall Imminent",
    "timestamp": "2025-11-28T17:30:00",
    "status": "True",
    "summary": "Cyclone Ditwah is moving north-northwestward and is expected to hit the Andhra Pradesh coast by November 30. Heavy rainfall warning issued.",
    "distance": 1555.8,
    "level": "Verified"
  },
  {
    "id": "4",
    "location": "Dhaka, Bangladesh",
    "header": "Protests Over Upcoming 2026 Election Reforms",
    "timestamp": "2025-11-28T15:20:00",
    "status": "Unverified",
    "summary": "Reports of gathering crowds near the university district demanding immediate implementation of the 'July Charter' reforms.",
    "distance": 1888.5,
    "level": "Caution"
  },
  {
    "id": "5",
    "location": "Tehran, Iran",
    "header": "Unconfirmed Reports of Cyberattack on Banking Sector",
    "timestamp": "2025-11-28T22:15:00",
    "status": "Unverified",
    "summary": "Users reporting widespread ATM failures. Government officials have not yet issued a statement regarding a potential cyber incident.",
    "distance": 2799.4,
    "level": "Caution"
  },
  {
    "id": "6",
    "location": "Hat Yai, Thailand",
    "header": "Catastrophic Flooding Cuts Power and Communications",
    "timestamp": "2025-11-26T09:15:00",
    "status": "True",
    "summary": "Record rainfall has severed power and phone lines in the southern province. Military airlifts are evacuating critical patients.",
    "distance": 3274.6,
    "level": "Verified"
  },
  {
    "id": "7",
    "location": "Sumatra, Indonesia",
    "header": "Flash Floods and Magnitude 6.6 Earthquake",
    "timestamp": "2025-11-27T14:00:00",
    "status": "True",
    "summary": "A dual disaster struck North Sumatra with deadly flash floods killing 49 people, compounded by a simultaneous offshore earthquake.",
    "distance": 3805.6,
    "level": "Verified"
  },
  {
    "id": "8",
    "location": "Central Vietnam",
    "header": "Catastrophic Agricultural Damage from Floods",
    "timestamp": "2025-11-23T16:00:00",
    "status": "True",
    "summary": "Torrential downpours have inundated over 200,000 homes and destroyed coffee harvests, threatening the regional economy.",
    "distance": 3811.9,
    "level": "Verified"
  },
  {
    "id": "9",
    "location": "Khartoum, Sudan",
    "header": "Escalation of Civil Conflict in Capital",
    "timestamp": "2025-11-25T08:00:00",
    "status": "True",
    "summary": "Renewed fighting between SAF and RSF forces has led to a breakdown in local ceasefires, exacerbating the humanitarian crisis.",
    "distance": 4287.3,
    "level": "Verified"
  },
  {
    "id": "10",
    "location": "Kyiv, Ukraine",
    "header": "New Wave of Infrastructure Drone Strikes",
    "timestamp": "2025-11-27T03:45:00",
    "status": "True",
    "summary": "Multiple energy facilities targeted overnight. Emergency power outages are in effect across three oblasts.",
    "distance": 5088.6,
    "level": "Verified"
  },
  {
    "id": "11",
    "location": "North Kivu, DR Congo",
    "header": "Displacement Crisis Hits 7 Million Mark",
    "timestamp": "2025-11-20T12:00:00",
    "status": "True",
    "summary": "Humanitarian agencies report that conflict has forced a record number of civilians to flee, overwhelming local IDP camps.",
    "distance": 5267.6,
    "level": "Verified"
  },
  {
    "id": "12",
    "location": "Seoul, South Korea",
    "header": "Political Unrest Following Impeachment Vote",
    "timestamp": "2025-11-29T09:00:00",
    "status": "True",
    "summary": "Mass demonstrations are occurring in Gwanghwamun Square following the parliamentary vote to impeach President Yoon Suk-yeol.",
    "distance": 5593.3,
    "level": "Verified"
  },
  {
    "id": "13",
    "location": "Paris, France",
    "header": "Transport Strike Affecting Metro Lines",
    "timestamp": "2025-11-29T07:00:00",
    "status": "True",
    "summary": "Unannounced walkout by transport union workers has severely reduced service on Metro Lines 1, 4, and 14.",
    "distance": 7001.6,
    "level": "Verified"
  },
  {
    "id": "14",
    "location": "Toulouse, France",
    "header": "Airbus A320 Fleet Grounding Due to Solar Radiation",
    "timestamp": "2025-11-28T13:30:00",
    "status": "True",
    "summary": "Airbus has issued an immediate precautionary action for A320 Family aircraft after finding that intense solar radiation may corrupt flight control data.",
    "distance": 7074.3,
    "level": "Verified"
  },
  {
    "id": "15",
    "location": "London, UK",
    "header": "Water Contamination Scare in East London",
    "timestamp": "2025-11-29T08:30:00",
    "status": "Resolved",
    "summary": "Earlier reports of chemical taste in tap water were investigated. Utility company confirms safe water parameters; verify odor was from harmless pipe maintenance.",
    "distance": 7183.7,
    "level": "Resolved"
  },
  {
    "id": "16",
    "location": "Lagos, Nigeria",
    "header": "Fuel Shortage Riots Reported in Mainland",
    "timestamp": "2025-11-28T19:00:00",
    "status": "Resolved",
    "summary": "Minor scuffles broke out at gas stations earlier today due to supply chain rumors. Police have restored order and fuel tankers are arriving.",
    "distance": 7616.6,
    "level": "Resolved"
  },
  {
    "id": "17",
    "location": "Sydney, Australia",
    "header": "Shark Attack Rumors at Bondi Beach",
    "timestamp": "2025-11-29T13:15:00",
    "status": "Rumour",
    "summary": "Viral TikTok claims a massive shark attack occurred this morning. Surf Life Saving Australia confirms no incidents reported today.",
    "distance": 10164.1,
    "level": "Caution"
  },
  {
    "id": "18",
    "location": "Washington D.C., USA",
    "header": "Rumors of Election Integrity Breach in 2026 Primaries",
    "timestamp": "2025-11-28T10:00:00",
    "status": "Rumour",
    "summary": "Social media accounts are circulating debunked claims about early voting machine malfunctions. No official reports confirm these allegations.",
    "distance": 12838.3,
    "level": "Caution"
  },
  {
    "id": "19",
    "location": "San Francisco, USA",
    "header": "AI-Generated Video of Bridge Collapse Viral",
    "timestamp": "2025-11-29T11:00:00",
    "status": "Rumour",
    "summary": "A realistic video depicting the collapse of the Golden Gate Bridge is circulating. Authorities confirm the bridge is structurally sound and open.",
    "distance": 13487.4,
    "level": "Caution"
  },
  {
    "id": "20",
    "location": "Mexico City, Mexico",
    "header": "Volcanic Ash Advisory for Popocatépetl",
    "timestamp": "2025-11-29T06:30:00",
    "status": "True",
    "summary": "Increased volcanic activity has led to ashfall in southern districts. Flights at Benito Juárez International Airport may be delayed.",
    "distance": 15636.9,
    "level": "Verified"
  }
];

// Data is already sorted by distance (closest first)
const sortDataByLocation = (data) => data;

// Get the screen width for responsive layout
const { width } = Dimensions.get('window');

// --- Part 1: Crisis Summary Card Component ---
const CrisisCard = React.memo(({ item, onPress }) => {
  // Truncate the summary to a limited number of words
  const MAX_WORDS = 25;
  const words = item.summary.split(' ');
  const displaySummary =
    words.length > MAX_WORDS
      ? words.slice(0, MAX_WORDS).join(' ') + '...'
      : item.summary;

  const levelColor =
    item.level === 'Verified'
      ? '#FF4500' // Orange-Red for True/Verified
      : item.level === 'Caution'
      ? '#FFD700' // Gold for Rumour/Unverified
      : '#3CB371'; // Medium Sea Green for Resolved

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardHeaderTitle}>{item.header}</Text>
        {/* Displaying the original status (TRUE/RUMOUR/UNVERIFIED/RESOLVED) */}
        <Text style={[styles.cardLevel, { backgroundColor: levelColor }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardSummary}>{displaySummary}</Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardLocation}>
          <Ionicons name="location-sharp" size={12} color="#888" /> {item.location} ({item.distance} km)
        </Text>
        <Text style={styles.cardTimestamp}>
          {/* Formats the ISO string to a more readable local format */}
          <Ionicons name="time-outline" size={12} color="#888" /> {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

// --- Part 2: Crisis Detail View Component ---
const CrisisDetail = ({ crisis, onBack }) => {
  const levelColor =
    crisis.level === 'Verified'
      ? '#FF4500'
      : crisis.level === 'Caution'
      ? '#FFD700'
      : '#3CB371';

  return (
    <View style={styles.detailContainer}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#007AFF" />
        <Text style={styles.backButtonText}>Back to Feed</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.detailScrollViewContent}>
        <Text style={styles.detailHeader}>{crisis.header}</Text>
        <View style={styles.detailMetaContainer}>
          <Text style={styles.detailMetaText}>
            <Ionicons name="location-sharp" size={16} color="#444" /> Location: {crisis.location}
          </Text>
          <Text style={styles.detailMetaText}>
            <Ionicons name="time-outline" size={16} color="#444" /> Reported: {new Date(crisis.timestamp).toLocaleString()}
          </Text>
          {/* Displaying the original status and using the mapped color */}
          <Text style={[styles.detailMetaText, { color: levelColor, fontWeight: 'bold' }]}>
            <Ionicons name="alert-circle" size={16} color={levelColor} /> Status: {crisis.status} ({crisis.level})
          </Text>
        </View>

        <View style={styles.detailSummaryBox}>
          <Text style={styles.detailSummaryTitle}>Full Crisis Summary:</Text>
          <Text style={styles.detailFullSummary}>{crisis.summary}</Text>
        </View>

        {/* Placeholder for other details (e.g., source, updates, affected areas) */}
        {/* <View style={styles.detailSection}>
          <Text style={styles.detailSectionHeader}>Additional Details</Text>
          <Text style={styles.detailSectionContent}>
            Status Type: {crisis.level}
            {'\n'}Distance from NESCO, Mumbai: {crisis.distance} km
            {'\n'}Note: This is an anti-rumour feed, statuses are 'True', 'Rumour', 'Unverified', or 'Resolved'.
          </Text>
        </View> */}
      </ScrollView>
    </View>
  );
};

// --- Main Screen Component ---
export default function CrisisFeedScreen() {
  // Use 'null' for selectedCrisis to indicate the main feed view is active
  const [selectedCrisis, setSelectedCrisis] = useState(null);
  
  // Data is already sorted by distance (closest first)
  const sortedCrisisData = sortDataByLocation(CRISES_DATA);

  // Function to handle card press and switch to detail view
  const handleCardPress = useCallback((crisis) => {
    setSelectedCrisis(crisis);
  }, []);

  // Function to handle back button press and return to feed view
  const handleBackToFeed = useCallback(() => {
    setSelectedCrisis(null);
  }, []);

  // Function to render each item in the FlatList
  const renderItem = useCallback(
    ({ item }) => <CrisisCard item={item} onPress={handleCardPress} />,
    [handleCardPress]
  );

  if (selectedCrisis) {
    // Part 2: Display the detailed view
    return <CrisisDetail crisis={selectedCrisis} onBack={handleBackToFeed} />;
  }

  // Part 1: Display the main news feed (using FlatList)
  return (
    <View style={styles.feedContainer}>
      <Text style={styles.feedTitle}>Crisis Summary Feed</Text>
      {/* <Text style={styles.feedSubtitle}>
        Current Location: NESCO, Mumbai. Sorted by distance (closest first).
      </Text> */}
      <FlatList
        data={sortedCrisisData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        // Key optimization for performance with FlatList
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={10}
        contentContainerStyle={styles.flatListContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No recent crises reported near you.</Text>}
      />
    </View>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  // --- Global Container Styles ---
  feedContainer: {
    flex: 1,
    backgroundColor: '#F0F2F5', // Light background for the feed
    paddingTop: 50, // To avoid status bar
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 50, // To avoid status bar
  },
  flatListContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },

  // --- Feed Header Styles ---
  feedTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 15,
    marginBottom: 5, // Reduced margin
    textAlign: 'center',
  },
  feedSubtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 15,
    marginBottom: 15,
    textAlign: 'center', // Center-aligned subtitle
  },

  // --- Crisis Card Styles (Part 1) ---
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginTop: 5,
    marginBottom: 15,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1, // Allows text to take up most of the space
    paddingRight: 10,
    color: '#222',
  },
  cardLevel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    overflow: 'hidden', // Ensures borderRadius works on Android
  },
  cardBody: {
    marginBottom: 10,
  },
  cardSummary: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 8,
  },
  cardLocation: {
    fontSize: 12,
    color: '#888',
    flexShrink: 1,
  },
  cardTimestamp: {
    fontSize: 12,
    color: '#888',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },

  // --- Detail View Styles (Part 2) ---
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#007AFF',
  },
  detailScrollViewContent: {
    padding: 15,
  },
  detailHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#111',
  },
  detailMetaContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  detailMetaText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
  },
  detailSummaryBox: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  detailSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 5,
  },
  detailFullSummary: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
  },
  detailSection: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#F0F2F5',
    borderRadius: 8,
  },
  detailSectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  detailSectionContent: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
  },
});