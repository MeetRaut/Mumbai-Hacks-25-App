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

// --- Hardcoded Crisis Data (Simulating Backend Response) ---
// Note: 'location' would ideally be a pair of latitude/longitude coordinates.
// For this example, we use city names and a 'distance' property for sorting simulation.
const CRISES_DATA = [
  {
    id: '1',
    location: 'Mumbai, India',
    header: 'Flash Flooding in Coastal Areas',
    timestamp: '2 hours ago',
    level: 'High',
    distance: 5, // Simulating 5 km away
    summary:
      "Heavy, unseasonal rainfall has caused significant flash flooding across the low-lying coastal districts of Mumbai. Transportation services are severely disrupted, and authorities have issued a 'High' level advisory. Over 500 people have been evacuated. Essential services are being mobilized to affected areas. The local weather office predicts the rain will subside within the next 6 hours, but warns of potential landslides.",
  },
  {
    id: '2',
    location: 'Pune, India',
    header: 'Power Grid Outage',
    timestamp: '5 hours ago',
    level: 'Medium',
    distance: 180, // Simulating 180 km away
    summary:
      'A major substation failure has led to a widespread power outage in parts of Pune. Engineers are on-site, but restoration is expected to take up to 12 hours. Hospitals and critical infrastructure are running on backup generators...',
  },
  {
    id: '3',
    location: 'Chennai, India',
    header: 'Major Traffic Accident on ECR',
    timestamp: '1 day ago',
    level: 'Low',
    distance: 1200, // Simulating 1200 km away
    summary:
    'A multi-vehicle collision has shut down the East Coast Road (ECR) near Chennai. Injuries are minor, but the resulting traffic backlog is significant. Emergency services have cleared most of the debris, and traffic is slowly being rerouted...',
  },
  {
    id: '4',
    location: 'Delhi, India',
    header: 'Major Traffic Accident on ECR',
    timestamp: '1 day ago',
    level: 'Low',
    distance: 1200, // Simulating 1200 km away
    summary:
    'A multi-vehicle collision has shut down the East Coast Road (ECR) near Chennai. Injuries are minor, but the resulting traffic backlog is significant. Emergency services have cleared most of the debris, and traffic is slowly being rerouted...',
  },
];

// In a real application, this function would use the user's current Geo-location
// and the crisis data's lat/lng to calculate and sort by actual distance.
const sortDataByLocation = (data) => {
  // Sort the data based on the simulated 'distance' property
  return data.sort((a, b) => a.distance - b.distance);
};

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
    item.level === 'High'
      ? '#FF4500' // Orange-Red
      : item.level === 'Medium'
      ? '#FFD700' // Gold
      : '#3CB371'; // Medium Sea Green

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardHeaderTitle}>{item.header}</Text>
        <Text style={[styles.cardLevel, { backgroundColor: levelColor }]}>
          {item.level}
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
          <Ionicons name="time-outline" size={12} color="#888" /> {item.timestamp}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

// --- Part 2: Crisis Detail View Component ---
const CrisisDetail = ({ crisis, onBack }) => {
  const levelColor =
    crisis.level === 'High'
      ? '#FF4500'
      : crisis.level === 'Medium'
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
            <Ionicons name="time-outline" size={16} color="#444" /> Reported: {crisis.timestamp}
          </Text>
          <Text style={[styles.detailMetaText, { color: levelColor, fontWeight: 'bold' }]}>
            <Ionicons name="alert-circle" size={16} color={levelColor} /> Level: {crisis.level}
          </Text>
        </View>

        <View style={styles.detailSummaryBox}>
          <Text style={styles.detailSummaryTitle}>Full Crisis Summary:</Text>
          <Text style={styles.detailFullSummary}>{crisis.summary}</Text>
        </View>

        {/* Placeholder for other details (e.g., source, updates, affected areas) */}
        <View style={styles.detailSection}>
          <Text style={styles.detailSectionHeader}>Additional Details</Text>
          <Text style={styles.detailSectionContent}>
            Source: Local Emergency Services
            {'\n'}Affected Population: ~2,500 people
            {'\n'}Latest Update: Evacuation efforts are 80% complete.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

// --- Main Screen Component ---
export default function CrisisFeedScreen() {
  // Use 'null' for selectedCrisis to indicate the main feed view is active
  const [selectedCrisis, setSelectedCrisis] = useState(null);
  
  // Sort the hardcoded data once
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
        Sorted by distance from your current location (closest first)
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
    marginBottom: 15,
    textAlign: 'center',
  },
  feedSubtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 15,
    marginBottom: 15,
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