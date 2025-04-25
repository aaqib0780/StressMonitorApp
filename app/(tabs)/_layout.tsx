import { Tabs } from "expo-router";
import React from "react";
import { Platform, ViewStyle } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute"
          },
          default: {}
        }) as ViewStyle
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
     <Tabs.Screen
        name="RelaxationHub"
        options={{
          title: "Relaxation Hub",
          tabBarIcon: ({ color }) => (
            <Ionicons name="leaf" size={24} color="white" /> // Relaxation Icon
          ),
        }}
      />
    </Tabs>
  );
}
