import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import ChatScreen from "../screens/ChatScreen";
import ClaimScreen from "../screens/ClaimScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarStyle: {
          // position: "absolute",
          // bottom: 20, // margin from bottom
          left: 20, // margin from left
          right: 20, // margin from right
          // borderRadius: 20, // rounded corners
          height: 60,
          paddingBottom: 10, // adjust icon spacing
          paddingTop: 10,
          backgroundColor: "#000000ff",
        },
        tabBarIcon: ({ color, size }) => {
          let icon;

          if (route.name === "Home") icon = "home";
          else if (route.name === "Chat") icon = "chatbubbles";
          else if (route.name === "Claim") icon = "document-text";

          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Claim" component={ClaimScreen} />
    </Tab.Navigator>
  );
}
