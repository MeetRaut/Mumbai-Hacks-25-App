import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';

// --- Hardcoded Data ---
const INITIAL_RESOURCES = [
  { id: 'r1', type: 'offer', title: '5 Liters of Clean Water', location: 'Near Sector 14, Block C', contact: 'Ramesh S.' },
  { id: 'r2', type: 'offer', title: 'Medical First Aid Kit', location: 'Rajeshwari Colony', contact: 'Priya K.' },
  { id: 'r3', type: 'offer', title: 'Power Bank Charging', location: 'Community Center Shelter', contact: 'Akash D.' },
];

const INITIAL_NEEDS = [
  { id: 'n1', type: 'need', title: 'Urgent need for Infant Formula', location: 'Assam Disaster Camp 3', contact: 'Deepak L.' },
  { id: 'n2', type: 'need', title: 'Sanitary napkins', location: 'Panvel', contact: 'Sanjeeva Z.' },
];

// --- Resource Card ---
const ResourceCard = ({ item }) => {
  const isOffer = item.type === 'offer';
  return (
    <View style={[styles.resourceCard, isOffer ? styles.offerCard : styles.needCard]}>
      <View style={[styles.badge, isOffer ? styles.badgeOffer : styles.badgeNeed]}>
        <Text style={styles.badgeText}>{isOffer ? 'OFFER' : 'NEED'}</Text>
      </View>

      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardLocation}>
        <Ionicons name="location-sharp" size={14} color="#777" /> {item.location}
      </Text>
      <Text style={styles.cardContact}>Posted by: {item.contact}</Text>

      <TouchableOpacity
        style={styles.contactButton}
        onPress={() =>
          Alert.alert(
            `Contact ${item.contact}`,
            `You are reaching out regarding "${item.title}".`,
            [{ text: 'OK' }]
          )
        }
      >
        <Ionicons name="chatbubble-ellipses-outline" size={18} color="white" />
        <Text style={styles.contactButtonText}>
          {isOffer ? 'Request Resource' : 'Offer Help'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Main Screen ---
const P2PSwapScreen = () => {
  const [activeTab, setActiveTab] = useState('needs');
  const [isPostModalVisible, setPostModalVisible] = useState(false);

  const [postTitle, setPostTitle] = useState('');
  const [postLocation, setPostLocation] = useState('');
  const [postType, setPostType] = useState('need');

  const [resources, setResources] = useState([...INITIAL_RESOURCES, ...INITIAL_NEEDS]);

  const needsList = resources.filter(item => item.type === 'need');
  const offersList = resources.filter(item => item.type === 'offer');

  const handlePostSubmit = () => {
    if (!postTitle || !postLocation) {
      Alert.alert('Missing Info', 'Please provide a title and location.');
      return;
    }

    const newPost = {
      id: Date.now().toString(),
      type: postType,
      title: postTitle,
      location: postLocation,
      contact: 'You',
    };

    setResources([newPost, ...resources]);
    setPostTitle('');
    setPostLocation('');
    setPostModalVisible(false);
    setActiveTab(postType === 'need' ? 'needs' : 'offers');

    Alert.alert('Success!', 'Your post has been added.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.mainHeader}>Resource Exchange</Text>
        <Text style={styles.subHeader}>Share what you have or request what you need.</Text>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'needs' && styles.tabButtonActive]}
            onPress={() => setActiveTab('needs')}
          >
            <Text style={[styles.tabText, activeTab === 'needs' && styles.tabTextActive]}>
              Needs ({needsList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'offers' && styles.tabButtonActive]}
            onPress={() => setActiveTab('offers')}
          >
            <Text style={[styles.tabText, activeTab === 'offers' && styles.tabTextActive]}>
              Offers ({offersList.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lists */}
        {(activeTab === 'needs' ? needsList : offersList).map(item => (
          <ResourceCard key={item.id} item={item} />
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setPostModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Post Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={isPostModalVisible}
        onRequestClose={() => setPostModalVisible(false)}
      >
        <View style={styles.modalWrapper}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Create New Post</Text>

            {/* Type Selector */}
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  postType === 'need' && styles.typeButtonActiveNeed,
                ]}
                onPress={() => setPostType('need')}
              >
                <Ionicons
                  name="alert-circle"
                  size={16}
                  color={postType === 'need' ? 'white' : '#d2691e'}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    postType === 'need' && styles.typeButtonTextActive,
                  ]}
                >
                  Need
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  postType === 'offer' && styles.typeButtonActiveOffer,
                ]}
                onPress={() => setPostType('offer')}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={postType === 'offer' ? 'white' : '#0077cc'}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    postType === 'offer' && styles.typeButtonTextActive,
                  ]}
                >
                  Offer
                </Text>
              </TouchableOpacity>
            </View>

            {/* Inputs */}
            <TextInput
              style={styles.input}
              placeholder="Describe the resource or need"
              value={postTitle}
              onChangeText={setPostTitle}
            />

            <TextInput
              style={styles.input}
              placeholder="Your location"
              value={postLocation}
              onChangeText={setPostLocation}
            />

            {/* Buttons */}
            <View style={{ flexDirection: 'row', marginTop: 15, gap: 10 }}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#bbb' }]}
                onPress={() => setPostModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#4caf50' }]}
                onPress={handlePostSubmit}
              >
                <Text style={styles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// -------------- Styles --------------
const colors = {
  need: '#ff7043',
  offer: '#2196f3',
  background: '#f4f6f8',
  card: '#ffffff',
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16, paddingBottom: 80 },

  mainHeader: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 14,
    color: '#777',
    marginBottom: 20,
    textAlign: 'center',
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    marginBottom: 15,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#4caf50',
  },
  tabText: { fontSize: 15, fontWeight: '600', color: '#555' },
  tabTextActive: { color: 'white' },

  // Cards
  resourceCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 14,
    marginBottom: 15,
    elevation: 2,
  },
  offerCard: { borderLeftWidth: 4, borderLeftColor: colors.offer },
  needCard: { borderLeftWidth: 4, borderLeftColor: colors.need },

  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
    marginBottom: 8,
  },
  badgeOffer: { backgroundColor: colors.offer + '33' },
  badgeNeed: { backgroundColor: colors.need + '33' },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#333' },

  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  cardLocation: { fontSize: 14, color: '#666', marginBottom: 6 },
  cardContact: { fontSize: 12, color: '#999', marginBottom: 10 },

  contactButton: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#4caf50',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactButtonText: { color: 'white', fontWeight: '700' },

  // Floating Action Button
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#4caf50',
    width: 55,
    height: 55,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },

  // Modal
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
  },

  // Modal form
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f1f1f1',
  },
  typeButtonActiveNeed: {
    backgroundColor: colors.need,
  },
  typeButtonActiveOffer: {
    backgroundColor: colors.offer,
  },
  typeButtonText: {
    fontWeight: '600',
    color: '#444',
  },
  typeButtonTextActive: { color: 'white' },

  input: {
    height: 45,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 6,
  },

  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '700',
  },
});

export default P2PSwapScreen;