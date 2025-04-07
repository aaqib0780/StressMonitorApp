import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

type StressData = number[];

const App: React.FC = () => {
  const [stressData, setStressData] = useState<StressData>([]);
  const [stressLevel, setStressLevel] = useState<string>("Normal");
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Simulated data generation
  useEffect(() => {
    const interval = setInterval(() => {
      const newStressValue = Math.floor(Math.random() * 100);
      setStressData((prevData) => [...prevData.slice(-9), newStressValue]);

      // Classify stress levels
      if (newStressValue > 70) setStressLevel("High");
      else if (newStressValue > 40) setStressLevel("Moderate");
      else setStressLevel("Normal");
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const connectToDevice = () => {
    setIsConnected(true);
    console.log("Connected to Device");
  };

  const openRelaxationHub = () => {
    console.log("Navigate to Relaxation Hub");
    // Add navigation logic here
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>IoT-Based Stress Monitor</Text>

      <View style={styles.buttonContainer}>
        <Button
          title={isConnected ? "Connected" : "Connect to Device"}
          onPress={connectToDevice}
        />
        <TouchableOpacity
          style={styles.relaxButton}
          onPress={openRelaxationHub}
        >
          <Text style={styles.relaxText}>Relaxation Hub</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dashboard}>
        <Text style={styles.stressLevel}>Stress Level: {stressLevel}</Text>
        <LineChart
          data={{
            labels: [
              "T-9",
              "T-8",
              "T-7",
              "T-6",
              "T-5",
              "T-4",
              "T-3",
              "T-2",
              "Now",
            ],
            datasets: [
              {
                data: stressData.length
                  ? stressData
                  : [0, 0, 0, 0, 0, 0, 0, 0, 0],
              },
            ],
          }}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#1E2923",
            backgroundGradientFrom: "#08130D",
            backgroundGradientTo: "#1E2923",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          style={styles.chart}
        />
      </View>

      {stressLevel === "High" && (
        <Text style={styles.suggestion}>
          Suggestion: Take a break and try deep breathing or meditation.
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
    width: "100%",
    paddingHorizontal: 20,
  },
  relaxButton: {
    backgroundColor: "#4caf50",
    borderRadius: 5,
    padding: 10,
  },
  relaxText: {
    color: "#fff",
    fontWeight: "bold",
  },
  dashboard: {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
    marginBottom: 20,
  },
  stressLevel: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  chart: {
    marginVertical: 10,
    borderRadius: 16,
  },
  suggestion: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginVertical: 20,
  },
});

export default App;
