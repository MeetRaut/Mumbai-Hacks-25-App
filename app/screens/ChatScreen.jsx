import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, MaterialIcons, Feather } from "@expo/vector-icons";

// Destructure Dimensions for responsive height calculation
const { height } = Dimensions.get("window");

// --- Global Constants & Colors ---

// 🚨 IMPORTANT: You MUST update this IP address based on your setup:
// - Android Emulator: 'http://10.0.2.2:8000'
// - iOS Simulator/Physical Device (Host Machine): 'http://[YOUR_IP_ADDRESS]:8000'
const API_BASE_URL = "http://192.168.43.201:8000";

// Color codes based on sentiment/urgency
const COLOR_CODES = {
  High: "#FF4B4B", // Red (Crisis Alert)
  Medium: "#FF6D00", // Orange
  Low: "#00C853", // Green
  positive: "#00C853",
  negative: "#FF4B4B",
  neutral: "#BBBBBB",
  verified: "#00C853",
  unverified: "#FF6D00",
};

// Define the expected analysis response structure for initial state
const EmptyAnalysis = {
  user_input: "",
  bot_response: "",
  is_verified: false,
  verification_confidence: 0.0,
  official_sources_count: 0,
  sources: [],
  language: "en",
  language_full: "English",
  urgency: "Low",
  sentiment: "neutral",
  emotion: "neutral",
  emotion_confidence: 0.0,
};

// --- Local Component: MetricCard ---
/**
 * Reusable component for displaying one metric (Language, Urgency, Sentiment, etc.)
 */
const MetricCard = ({ title, value, color = "#E0E0E0" }) => {
  return (
    <View style={styles.metricContainer}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={[styles.metricValue, { color: color }]}>{value}</Text>
    </View>
  );
};

// --- Local Component: AnalysisReport ---
const AnalysisReport = ({ analysis }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Defensive check: allows both native boolean (safe) and string "true"/"false" (unsafe API result)
  const isVerified =
    analysis?.is_verified === true || analysis?.is_verified === "true";

  if (!analysis || typeof analysis.is_verified === "undefined") {
    return null;
  }

  const verificationColor = isVerified
    ? COLOR_CODES.verified
    : COLOR_CODES.unverified;
  const verificationIcon = isVerified ? "check-circle" : "warning";
  const verificationText = isVerified ? "VERIFIED" : "UNVERIFIED";

  const urgencyColor = COLOR_CODES[analysis.urgency] || COLOR_CODES.neutral;
  const sentimentColor =
    COLOR_CODES[analysis.sentiment.toLowerCase()] || COLOR_CODES.neutral;
  const confidenceValue = analysis.verification_confidence * 100;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.header}
        activeOpacity={0.8}
      >
        <View style={styles.titleContainer}>
          <Feather
            name="bar-chart-2"
            size={18}
            color={verificationColor}
            style={styles.iconStyle}
          />
          <Text style={styles.analysisTitle}>Analysis Report</Text>
        </View>
        <FontAwesome
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={14}
          color="#BBBBBB"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          <View style={styles.metricsRow}>
            {/* Column 1: Language & Urgency */}
            <View style={styles.metricsColumn}>
              <MetricCard title="Language" value={analysis.language_full} />
              <MetricCard
                title="Urgency"
                value={analysis.urgency}
                color={urgencyColor}
              />
            </View>

            {/* Column 2: Sentiment & Emotion */}
            <View style={styles.metricsColumn}>
              <MetricCard
                title="Sentiment"
                value={analysis.sentiment.toUpperCase()}
                color={sentimentColor}
              />
              <MetricCard
                title="Emotion"
                value={analysis.emotion.toUpperCase()}
              />
            </View>

            {/* Column 3: Verification & Confidence */}
            <View style={styles.metricsColumn}>
              <MetricCard
                title={verificationText}
                value={
                  <View style={styles.verificationBadgeInner}>
                    <MaterialIcons
                      name={verificationIcon}
                      size={18}
                      color={verificationColor}
                    />
                    <Text
                      style={[
                        styles.confidenceText,
                        { color: verificationColor },
                      ]}
                    >
                      {" "}
                      {verificationText}
                    </Text>
                  </View>
                }
                color={verificationColor}
              />
              <MetricCard
                title="Confidence"
                value={`${confidenceValue.toFixed(0)}%`}
                color={
                  confidenceValue > 70
                    ? COLOR_CODES.verified
                    : confidenceValue > 40
                    ? COLOR_CODES.unverified
                    : COLOR_CODES.negative
                }
              />
            </View>
          </View>

          {/* Sources Section */}
          <View style={styles.sourcesContainer}>
            <Text style={styles.sourcesHeader}>Sources Checked:</Text>
            {analysis.sources &&
              analysis.sources.slice(0, 3).map((source, index) => (
                <View key={index} style={styles.sourceItem}>
                  <Text style={styles.sourceTitle}>
                    {index + 1}. {source.title}
                  </Text>
                  <TouchableOpacity onPress={() => Linking.openURL(source.url)}>
                    <Text style={styles.sourceURL}>{source.source}</Text>
                  </TouchableOpacity>
                  <Text style={styles.sourceSnippet}>{source.snippet}...</Text>
                </View>
              ))}

            {/* Official Source Count Badge */}
            {analysis.official_sources_count > 0 && (
              <View style={styles.officialBadge}>
                <Text style={styles.officialBadgeText}>
                  <FontAwesome name="check-circle" size={12} color="#80CBC4" />{" "}
                  Verified by {analysis.official_sources_count} official source
                  {analysis.official_sources_count !== 1 && "s"}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

// --- Main Screen Component ---
const ChatScreen = () => {
  const [messages, setMessages] = useState([
    // FIX 1: Startup crash solved by removing analysis from the static message.
    {
      role: "assistant",
      content:
        "Welcome to the Agentic AI Crisis Communication System. Ask about any crisis situation, news, or fact.",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNewChatModalVisible, setIsNewChatModalVisible] = useState(false);
  const scrollViewRef = useRef();

  // Scrolls to the bottom of the chat view
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  /**
   * Calls the FastAPI backend with exponential backoff for resilience.
   */
  const callApiWithBackoff = async (input) => {
    const maxRetries = 3;
    const initialDelay = 1000; // 1 second

    console.log("Body sent to API:", { user_input: input });

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(`${API_BASE_URL}/analyze-and-respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_input: input }),
        });

        if (response.ok) {
          return await response.json();
        } else {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(
            `API returned status ${response.status}: ${
              errorBody.detail || "Unknown error"
            }`
          );
        }
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error.message);
        if (i === maxRetries - 1) {
          throw new Error(
            "Failed to connect to AI backend after multiple retries. Check API_BASE_URL."
          );
        }
        const delay = initialDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  const handleSendMessage = useCallback(async () => {
    if (inputText.trim() === "" || isLoading) return;

    const userMessage = inputText.trim();
    setInputText("");
    setIsLoading(true);

    // 1. Add user message to history
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, analysis: EmptyAnalysis },
    ]);
    scrollToBottom();

    let analysisResult = null;
    let botResponse = "";

    // --- START DYNAMIC API CALL LOGIC ---
    botResponse = // Initial error message in case of failure
      "Error: Could not connect to the AI backend. Please ensure your FastAPI server is running and accessible at " +
      API_BASE_URL;

    try {
      // 2. Call the backend API
      analysisResult = await callApiWithBackoff(userMessage);
      botResponse = analysisResult.bot_response;

      // FIX 2: Runtime crash solved by ensuring is_verified is a JS boolean
      if (analysisResult && typeof analysisResult.is_verified === "string") {
        analysisResult.is_verified =
          analysisResult.is_verified.toLowerCase() === "true";
      }
    } catch (error) {
      console.error("API Call Error:", error);
      // Fallback response with an error
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: botResponse, analysis: EmptyAnalysis },
      ]);
      Alert.alert("Connection Error", error.message);
      setIsLoading(false);
      return;
    }
    // --- END DYNAMIC API CALL LOGIC ---

    // 3. Add AI response (with analysis data) to history
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: botResponse, analysis: analysisResult },
    ]);
    setIsLoading(false);
    scrollToBottom();
  }, [inputText, isLoading]);

  const Header = () => (
    <View style={styles.headerContainer}>
      
      {/* Left Icon */}
      {/* <MaterialIcons name="security" size={24} color="#FF4B4B" /> */}

      {/* Center Title */}
      <View style={{ flex: 1, alignItems: "center" }}>
        <Text style={styles.headerTitle}>CRISIS AI Chat</Text>
      </View>

      {/* Right + Button */}
      <TouchableOpacity onPress={() => setIsNewChatModalVisible(true)}>
        <FontAwesome name="plus-circle" size={26} color="#ebeaeaff" />
      </TouchableOpacity>

    </View>
  );


  const renderMessage = ({ role, content, analysis }, index) => {
    const isUser = role === "user";
    // Has analysis will be false for the initial welcome message
    const hasAnalysis = analysis && typeof analysis.is_verified !== "undefined";

    // Safety check for rendering logic
    const isVerified =
      analysis?.is_verified === true || analysis?.is_verified === "true";

    const messageStyle = isUser ? styles.userMessage : styles.botMessage;
    const textStyle = isUser ? styles.userText : styles.botText;

    return (
      <View key={index} style={styles.messageContainer}>
        {/* Chat Bubble */}
        <View style={messageStyle}>
          <Text style={textStyle}>
            {/* Role Icon */}
            {isUser ? (
              <FontAwesome
                name="user-circle"
                size={16}
                color={styles.userText.color}
                style={{ marginRight: 5 }}
              />
            ) : (
              <MaterialIcons
                name="security"
                size={16}
                color={styles.botText.color}
                style={{ marginRight: 5 }}
              />
            )}
            <Text style={styles.roleText}>
              {isUser ? " You" : " Crisis AI"}:{" "}
            </Text>
            {content}
          </Text>
        </View>

        {/* Analysis Report (Only for AI messages and if data exists) */}
        {!isUser && hasAnalysis && <AnalysisReport analysis={analysis} />}

        {/* Verification Badge (Below the main response) */}
        {!isUser && hasAnalysis && (
          <View
            style={[
              styles.verificationBadgeOuter,
              // Dynamic background based on verification status
              {
                backgroundColor: isVerified
                  ? "#004D40"
                  : analysis.sources?.length > 0
                  ? "#4D3300"
                  : "#451D1D",
              },
            ]}
          >
            <Text style={styles.verificationText}>
              <FontAwesome
                name={
                  isVerified
                    ? "check-circle"
                    : analysis.sources?.length > 0
                    ? "warning"
                    : "times-circle"
                }
                size={14}
                color="#FFFFFF"
              />{" "}
              {/* Dynamic text based on verification results */}
              {isVerified
                ? `Verified by ${
                    analysis.official_sources_count
                  } official source${
                    analysis.official_sources_count !== 1 ? "s" : ""
                  }`
                : analysis.sources?.length > 0
                ? `Found ${analysis.sources.length} sources (Unverified)`
                : `No sources found to verify claim`}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom", "left", "right"]}
    >
      <Header />
      <KeyboardAvoidingView
        style={styles.container}
        // Adjust padding based on OS for keyboard visibility
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.chatHistory}
          onContentSizeChange={scrollToBottom}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map(renderMessage)}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FF4B4B" />
              <Text style={styles.loadingText}>Analyzing and verifying...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask about any crisis situation, news, or fact..."
            placeholderTextColor="#BBBBBB"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { opacity: isLoading || inputText.trim() === "" ? 0.5 : 1 },
            ]}
            onPress={handleSendMessage}
            disabled={isLoading || inputText.trim() === ""}
          >
            <FontAwesome name="send" size={20} color="#121212" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* New Chat Modal */}
      {isNewChatModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Start New Chat?</Text>
            <Text style={styles.modalSubtitle}>
              This will clear your current conversation.
            </Text>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.noButton]}
                onPress={() => setIsNewChatModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.yesButton]}
                onPress={() => {
                  setMessages([
                    {
                      role: "assistant",
                      content:
                        "New chat started. How can I help you with a crisis or fact verification?",
                    },
                  ]);
                  setIsNewChatModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

// --- Consolidated Styles ---
const styles = StyleSheet.create({
  // Main Layout
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: "#1C1C1C",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF4B4B", // Using the primary action/crisis color
    marginLeft: 10,
    marginRight: 10,
  },
  chatHistory: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
  },
  messageContainer: {
    marginBottom: 20,
    alignSelf: "stretch",
  },

  // Message Bubbles
  userMessage: {
    backgroundColor: "#3A3A3A",
    padding: 12,
    borderRadius: 12,
    borderBottomLeftRadius: 2,
    maxWidth: "95%",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  botMessage: {
    backgroundColor: "#252525",
    padding: 12,
    borderRadius: 12,
    borderBottomLeftRadius: 2,
    maxWidth: "95%",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  userText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 22,
  },
  botText: {
    color: "#E0E0E0",
    fontSize: 15,
    lineHeight: 22,
  },
  roleText: {
    fontWeight: "bold",
    marginRight: 4,
    color: "#FF4B4B",
  },

  // Input
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#1C1C1C",
    borderTopWidth: 1,
    borderTopColor: "#333333",
    // marginBottom: 25,
  },
  textInput: {
    flex: 1,
    height: 50,
    backgroundColor: "#3A3A3A",
    borderRadius: 25,
    paddingHorizontal: 20,
    color: "#FFFFFF",
    fontSize: 15,
    marginRight: 10,
    lineHeight: 20,
  },
  sendButton: {
    backgroundColor: "#FF4B4B",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  // Status & Loading
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    alignSelf: "flex-start",
    backgroundColor: "#252525",
    borderRadius: 8,
    marginBottom: 20,
  },
  loadingText: {
    color: "#FF4B4B",
    marginLeft: 8,
  },

  // MetricCard (from MetricCard.jsx)
  metricContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 10,
    minHeight: 80,
    justifyContent: "center",
  },
  metricTitle: {
    fontSize: 12,
    color: "#BBBBBB",
    fontWeight: "500",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: "bold",
  },

  // AnalysisReport (from AnalysisReport.jsx)
  card: {
    backgroundColor: "#1C1C1C",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#333333",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#252525",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconStyle: {
    marginRight: 8,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E0E0E0",
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  metricsColumn: {
    flex: 1,
    paddingHorizontal: 5,
  },
  verificationBadgeInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 4,
  },
  sourcesContainer: {
    marginTop: 10,
  },
  sourcesHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#BBBBBB",
    marginBottom: 8,
  },
  sourceItem: {
    marginBottom: 15,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#3A3A3A",
  },
  sourceTitle: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  sourceURL: {
    fontSize: 12,
    color: "#4B98FF",
    textDecorationLine: "underline",
    marginVertical: 2,
  },
  sourceSnippet: {
    fontSize: 11,
    color: "#AAAAAA",
  },
  officialBadge: {
    backgroundColor: "#004D40",
    padding: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  officialBadgeText: {
    color: "#80CBC4",
    fontSize: 12,
    fontWeight: "bold",
  },
  // Verification Badge (Below the main response)
  verificationBadgeOuter: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginLeft: 16,
    marginTop: 10,
  },
  verificationText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  // Modal
  modalOverlay: {
    position: "absolute",
    top: 50,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  modalContainer: {
    width: "80%",
    backgroundColor: "#1C1C1C",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF4B4B",
    textAlign: "center",
    marginBottom: 10,
  },

  modalSubtitle: {
    fontSize: 14,
    color: "#CCCCCC",
    textAlign: "center",
    marginBottom: 20,
  },

  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  modalButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: "center",
  },

  noButton: {
    backgroundColor: "#333",
  },

  yesButton: {
    backgroundColor: "#FF4B4B",
  },

  modalButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ChatScreen;
