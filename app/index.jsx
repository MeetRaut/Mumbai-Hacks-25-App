// app/index.jsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TabNavigator from "./navigation/TabNavigation";
import VerifyClaimScreen from "./screens/verify/[id]";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Tabs"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen
          name="VerifyClaim"
          component={VerifyClaimScreen}
          options={{ headerShown: true, title: "Verify Claim" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
